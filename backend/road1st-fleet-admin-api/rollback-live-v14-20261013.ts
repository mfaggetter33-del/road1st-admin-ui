import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import QRCode from "npm:qrcode@1.5.4";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function resolveKeyMap(envName: string, fallbackEnvName?: string) {
  try {
    const raw = Deno.env.get(envName);
    if (raw) {
      const parsed = JSON.parse(raw);
      const value = parsed?.default;
      if (typeof value === "string" && value) return Deno.env.get(value) ?? value;
    }
  } catch {}
  return fallbackEnvName ? (Deno.env.get(fallbackEnvName) ?? "") : "";
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomBase64Url(bytesCount = 32) {
  const bytes = new Uint8Array(bytesCount);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function randomHex(bytesCount = 6) {
  const bytes = new Uint8Array(bytesCount);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function cleanText(value: unknown, max: number, required = false) {
  const valueText = String(value ?? "").trim();
  if (!valueText && required) throw new Error("required");
  if (valueText.length > max) throw new Error("too_long");
  return valueText || null;
}

function isFleetManagerRole(role: string) {
  return role === "fleet_owner" || role === "senior_admin" || role === "transport_manager";
}

function reportCategory(text: string): string {
  let first: Record<string, unknown> = {};
  try { first = JSON.parse(text.split(/\r?\n/, 1)[0] || "{}"); } catch {}
  if (first.report_kind === "setup_wizard") return "Setup";
  if (first.record_kind === "unit" || first.record_kind === "vehicle" || first.event === "walkaround_check") return "Walkaround";
  if (first.test_type === "static_app_blocking") return "App blocking";
  if (/"(?:event|control|reason)"\s*:\s*"ferry[_a-z]*"/i.test(text)) return "Ferry mode";
  if (first.event === "session_start") return "Journeys";
  return "Other";
}


function reportView(text: string) {
  const records: any[] = [];
  let invalidLines = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    try {
      const item = JSON.parse(line);
      if (item && typeof item === "object") records.push(item);
      else invalidLines++;
    } catch {
      invalidLines++;
    }
  }
  if (!records.length) throw new Error("empty_report");

  const first = records[0];
  const last = records[records.length - 1];
  const sessionStart = records.find((r) => r.event === "session_start") ?? null;
  const sessionEnd = [...records].reverse().find((r) => r.event === "session_end") ?? null;
  const setupWizard = records.some((r) => r.report_kind === "setup_wizard");

  const firstElapsed = Number(first.elapsed_ms);
  const lastElapsed = Number(last.elapsed_ms);
  let durationSeconds: number | null = null;
  if (Number.isFinite(firstElapsed) && Number.isFinite(lastElapsed) && lastElapsed >= firstElapsed) {
    durationSeconds = Math.round((lastElapsed - firstElapsed) / 1000);
  } else {
    const a = Date.parse(String(first.utc ?? ""));
    const b = Date.parse(String(last.utc ?? ""));
    if (Number.isFinite(a) && Number.isFinite(b) && b >= a) durationSeconds = Math.round((b - a) / 1000);
  }

  let gpsSamples = 0;
  let usableGpsSamples = 0;
  let drivingGpsSamples = 0;
  let maxSpeedKmh: number | null = null;
  let drivingActivations = 0;
  let autoResumes = 0;
  let checkpoints = 0;
  let bluetoothConnected = 0;
  let bluetoothDisconnected = 0;
  let gpsDisabled = 0;
  const controls: Record<string, number> = {};
  const issues: { utc?: string; event: string; detail: string }[] = [];

  for (const r of records) {
    const event = String(r.event ?? "");
    if (event === "gps_sample") {
      gpsSamples++;
      if (r.quality === "usable") usableGpsSamples++;
      if (r.driving_mode === true) drivingGpsSamples++;
      const mps = Number(r.speed_mps);
      if (Number.isFinite(mps) && mps >= 0) {
        const kmh = mps * 3.6;
        if (maxSpeedKmh === null || kmh > maxSpeedKmh) maxSpeedKmh = kmh;
      }
    } else if (event === "driving_activated") {
      drivingActivations++;
    } else if (event === "trip_control") {
      const control = String(r.control ?? "unknown");
      controls[control] = (controls[control] ?? 0) + 1;
      if (control === "auto_resume_on_movement") autoResumes++;
    } else if (event === "cloud_checkpoint") {
      checkpoints++;
    } else if (event === "bluetooth_changed") {
      if (r.state === "connected") bluetoothConnected++;
      if (r.state === "disconnected") bluetoothDisconnected++;
    } else if (event === "gps_disabled") {
      gpsDisabled++;
      issues.push({ utc: r.utc, event, detail: "GPS was disabled" });
    }

    if (event.includes("failed") || r.error) {
      issues.push({
        utc: r.utc,
        event: event || "error",
        detail: String(r.error ?? r.reason ?? "Failure recorded"),
      });
    }
  }

  if (sessionEnd && ["recording_error", "start_failed", "permission_removed"].includes(String(sessionEnd.reason ?? ""))) {
    issues.push({
      utc: sessionEnd.utc,
      event: "session_end",
      detail: String(sessionEnd.reason),
    });
  }

  const quiet = new Set(["gps_sample", "heartbeat", "resource_sample", "resource_start", "resource_end"]);
  const timeline = records
    .filter((r) => !quiet.has(String(r.event ?? "")))
    .slice(-400)
    .map((r) => {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(r)) {
        if (k === "elapsed_ms") continue;
        out[k] = v;
      }
      return out;
    });

  return {
    report_type: setupWizard ? "setup_wizard" : sessionStart ? "journey" : "general",
    start_utc: first.utc ?? null,
    end_utc: last.utc ?? null,
    duration_seconds: durationSeconds,
    line_count: records.length,
    invalid_line_count: invalidLines,
    version: sessionStart?.version ?? null,
    start_mode: sessionStart?.start_mode ?? null,
    vehicle_type: sessionStart?.vehicle_type ?? null,
    journey_mode: sessionStart?.journey_mode ?? null,
    active_driver_id: sessionStart?.active_driver_id ?? null,
    second_phone_status: sessionStart?.second_phone_status ?? null,
    app_blocking: sessionStart?.app_blocking ?? null,
    blocking_preset: sessionStart?.blocking_preset ?? null,
    blocked_app_count: sessionStart?.blocked_app_count ?? null,
    end_reason: sessionEnd?.reason ?? null,
    gps_samples: gpsSamples,
    usable_gps_samples: usableGpsSamples,
    driving_gps_samples: drivingGpsSamples,
    max_speed_kmh: maxSpeedKmh === null ? null : Math.round(maxSpeedKmh * 10) / 10,
    driving_activations: drivingActivations,
    auto_resumes: autoResumes,
    checkpoints,
    bluetooth_connected_events: bluetoothConnected,
    bluetooth_disconnected_events: bluetoothDisconnected,
    gps_disabled_events: gpsDisabled,
    controls,
    issues: issues.slice(0, 100),
    timeline,
  };
}


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const publishableKey = resolveKeyMap("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
  const secretKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    resolveKeyMap("SUPABASE_SECRET_KEYS");
  if (!supabaseUrl || !publishableKey || !secretKey) return json({ error: "server_config" }, 500);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);
  const token = authHeader.slice(7);

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) return json({ error: "unauthorized" }, 401);

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [{ data: platformAccess }, { data: memberships, error: membershipError }] = await Promise.all([
    admin.from("road1st_admin_users")
      .select("role,enabled")
      .eq("user_id", user.id)
      .eq("enabled", true)
      .maybeSingle(),
    admin.from("road1st_fleet_users")
      .select("fleet_id,role,enabled")
      .eq("user_id", user.id)
      .eq("enabled", true),
  ]);
  if (membershipError) return json({ error: "access_check_failed" }, 500);

  const platformOwner = platformAccess?.role === "owner";
  const memberRows = memberships ?? [];
  if (!platformOwner && memberRows.length === 0) return json({ error: "forbidden" }, 403);

  async function fleetRole(fleetId: string) {
    if (platformOwner) return "platform_owner";
    return memberRows.find((m: any) => m.fleet_id === fleetId)?.role ?? "";
  }

  async function canSeeFleet(fleetId: string) {
    if (platformOwner) return true;
    if (!memberRows.some((m: any) => m.fleet_id === fleetId)) return false;
    const { data: fleet, error } = await admin.from("road1st_fleets")
      .select("status").eq("id", fleetId).maybeSingle();
    // Suspension blocks manager actions and browsing, not existing device reporting.
    return !error && fleet?.status === "active";
  }

  if (req.method === "GET") {
    const params=new URL(req.url).searchParams;
    const requestedFleet = String(params.get("fleet_id") ?? "");
    if(params.get("kind")==="journeys"){
      // Search is always bound to the authenticated manager's fleet.
      if(!/^[0-9a-f-]{36}$/i.test(requestedFleet)||!(await canSeeFleet(requestedFleet)))
        return json({error:"forbidden"},403);
      const mode=String(params.get("mode")??"all");
      const vehicleType=String(params.get("vehicle_type")??"all");
      const userReg=String(params.get("registration")??"").trim();
      const registration=userReg.toUpperCase().replace(/[^A-Z0-9]/g,"");
      const after=String(params.get("after")??"");
      const before=String(params.get("before")??"");
      if(!["all","Single Driver","Double Manning"].includes(mode)||
        !["all","Car / Van","Van + Tacho","Truck","Bus"].includes(vehicleType)||
        (userReg&&(registration.length<2||registration.length>32))||
        (after&&!Number.isFinite(Date.parse(after)))||
        (before&&!Number.isFinite(Date.parse(before)))||
        (after&&before&&Date.parse(after)>=Date.parse(before)))
        return json({error:"invalid_journey_filter"},400);
      const cap=500;
      const cols="id,created_at,client_created_at,original_filename,app_version,device_install_id,report_content,"+
        (registration?"road1st_report_registrations!inner(registration_normalized)":
          "road1st_report_registrations(registration_normalized)");
      let q=admin.from("road1st_reports").select(cols,{count:"exact"}).eq("fleet_id",requestedFleet);
      if(registration)q=q.eq("road1st_report_registrations.registration_normalized",registration);
      if(after)q=q.gte("client_created_at",after);
      if(before)q=q.lt("client_created_at",before);
      const {data,error,count}=await q.order("client_created_at",{ascending:false}).limit(cap);
      if(error)return json({error:"fleet_journeys_failed"},500);
      const records=new Map<string,any>();
      for(const item of data??[]){
        let first:any;
        try{first=JSON.parse(String(item.report_content??"").split(/\r?\n/,1)[0]||"{}")}
        catch{continue}
        if(first?.event!=="session_start"||
          !["Single Driver","Double Manning"].includes(first.journey_mode))continue;
        const rawType=String(first.vehicle_type??"").toLowerCase().replace(/\s+/g," ").trim();
        const type=rawType==="truck"?"Truck":rawType==="bus"?"Bus":
          rawType==="van + tacho"?"Van + Tacho":
          (rawType==="car / van"||rawType==="car"||rawType==="van")?"Car / Van":"Unknown";
        if(mode!=="all"&&first.journey_mode!==mode)continue;
        if(vehicleType!=="all"&&type!==vehicleType)continue;
        const regs=(item.road1st_report_registrations??[])
          .map((x:any)=>String(x.registration_normalized??""));
        const started=String(first.utc??"");
        // A checkpoint and the completed report from the SAME phone share
        // their recorded session start. Do not infer a cross-phone journey ID.
        const key=String(item.device_install_id??"")+":"+started;
        const isCheckpoint=String(item.original_filename??"").startsWith("Checkpoint-");
        const existing=records.get(key);
        const record={
          id:item.id,
          mode:first.journey_mode,
          vehicle_type:type,
          registration:regs.join(", ")||null,
          started_at:started||item.client_created_at||item.created_at,
          reported_at:item.client_created_at||item.created_at,
          original_filename:item.original_filename,
          app_version:item.app_version,
          linked_at_start:String(first.second_phone_status??"").startsWith("linked:"),
          phone_role_at_start:first.local_driver===true?"Driver":first.local_driver===false?"Co-driver":"Unknown",
          report_status:isCheckpoint?"Checkpoint":"Report",
          checkpoint_count:isCheckpoint?1:0,
          report_files:1
        };
        if(!existing){records.set(key,record);continue}
        existing.report_files++;
        existing.checkpoint_count+=isCheckpoint?1:0;
        if(!isCheckpoint&&existing.report_status==="Checkpoint"){
          const n=existing.report_files,c=existing.checkpoint_count;
          Object.assign(existing,record);
          existing.report_files=n;existing.checkpoint_count=c;
        }
      }
      const journeys=Array.from(records.values()).sort(
        (a:any,b:any)=>Date.parse(b.started_at)-Date.parse(a.started_at));
      return json({kind:"journeys",fleet_id:requestedFleet,items:journeys,
        returned:journeys.length,files_checked:(data??[]).length,
        limited:(count??0)>cap});
    }
    if(params.get("kind")==="records"){
      if(!/^[0-9a-f-]{36}$/i.test(requestedFleet)||!(await canSeeFleet(requestedFleet)))
        return json({error:"forbidden"},403);
      const userReg=String(params.get("registration")??"").trim();
      const reg=userReg.toUpperCase().replace(/[^A-Z0-9]/g,"");
      const after=String(params.get("after")??"");
      const before=String(params.get("before")??"");
      const category=String(params.get("category")??"all");
      const categories=["all","Journeys","Walkaround","App blocking","Setup","Ferry mode","Other","Fuel receipts","Defect photos"];
      if(!categories.includes(category)||
        (userReg&&(reg.length<2||reg.length>32))||
        (after&&!Number.isFinite(Date.parse(after)))||
        (before&&!Number.isFinite(Date.parse(before)))||
        (after&&before&&Date.parse(after)>=Date.parse(before)))
        return json({error:"invalid_record_search"},400);

      const cap=250;const results:any[]=[];let limited=false;
      function time(q:any){
        if(after)q=q.gte("client_created_at",after);
        if(before)q=q.lt("client_created_at",before);
        return q;
      }
      if(!["Fuel receipts","Defect photos"].includes(category)){
        const cols="id,created_at,client_created_at,original_filename,app_version,report_content,"+
          (reg?"road1st_report_registrations!inner(registration_normalized)":
            "road1st_report_registrations(registration_normalized)");
        let query=admin.from("road1st_reports").select(cols,{count:"exact"}).eq("fleet_id",requestedFleet);
        if(reg)query=query.eq("road1st_report_registrations.registration_normalized",reg);
        const {data,error,count}=await time(query).order("client_created_at",{ascending:false}).limit(cap);
        if(error)return json({error:"fleet_report_search_failed"},500);
        if((count??0)>cap)limited=true;
        for(const item of data??[]){
          const text=String(item.report_content??"");
          const kind=reportCategory(text);
          if(category!=="all"&&category!==kind)continue;
          const regs=(item.road1st_report_registrations??[]).map((x:any)=>x.registration_normalized);
          results.push({
            id:item.id,kind:"reports",category:kind,
            date:item.client_created_at||item.created_at,
            registration:regs.join(", ")||null,
            app_version:item.app_version,description:item.original_filename,
          });
        }
      }
      if(["all","Fuel receipts"].includes(category)){
        let query=admin.from("road1st_fuel_receipts")
          .select("id,created_at,client_created_at,registration,odometer,litres,fuel_card",{count:"exact"})
          .eq("fleet_id",requestedFleet);
        if(reg)query=query.eq("registration_normalized",reg);
        const {data,error,count}=await time(query).order("client_created_at",{ascending:false}).limit(cap);
        if(error)return json({error:"fleet_fuel_search_failed"},500);
        if((count??0)>cap)limited=true;
        for(const item of data??[])results.push({
          id:item.id,kind:"fuel",category:"Fuel receipts",
          date:item.client_created_at||item.created_at,
          registration:item.registration,
          description:[item.litres+" L",item.fuel_card||"",item.odometer?"Odo "+item.odometer:""].filter(Boolean).join(" · "),
        });
      }
      if(["all","Defect photos"].includes(category)){
        let query=admin.from("road1st_defect_photos")
          .select("id,created_at,client_created_at,registration,vehicle_type,defect_label",{count:"exact"})
          .eq("fleet_id",requestedFleet);
        if(reg)query=query.eq("registration_normalized",reg);
        const {data,error,count}=await time(query).order("client_created_at",{ascending:false}).limit(cap);
        if(error)return json({error:"fleet_defect_search_failed"},500);
        if((count??0)>cap)limited=true;
        for(const item of data??[])results.push({
          id:item.id,kind:"defects",category:"Defect photos",
          date:item.client_created_at||item.created_at,
          registration:item.registration,
          description:[item.vehicle_type,item.defect_label].filter(Boolean).join(" · "),
        });
      }
      results.sort((a:any,b:any)=>Date.parse(b.date)-Date.parse(a.date));
      return json({status:"ok",fleet_id:requestedFleet,records:results.slice(0,500),
        limited:limited||results.length>500,returned:Math.min(results.length,500)});
    }
    let fleetQuery = admin.from("road1st_fleets")
      .select("id,name,status,blocking_preset,walkaround_required,created_at,updated_at")
      .order("name");
    if (!platformOwner) {
      const ids = memberRows.map((m: any) => m.fleet_id);
      fleetQuery = fleetQuery.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]).eq("status","active");
    }
    const { data: fleets, error: fleetsError } = await fleetQuery;
    if (fleetsError) return json({ error: "fleet_list_failed" }, 500);

    const fleetId = requestedFleet || fleets?.[0]?.id || "";
    if (!fleetId) return json({ fleets: fleets ?? [], fleet: null, drivers: [], devices: [] });
    if (!(await canSeeFleet(fleetId))) return json({ error: "forbidden" }, 403);

    const fleet = (fleets ?? []).find((f: any) => f.id === fleetId)
      ?? (await admin.from("road1st_fleets")
          .select("id,name,status,blocking_preset,walkaround_required,created_at,updated_at")
          .eq("id", fleetId).maybeSingle()).data;
    if (!fleet) return json({ error: "fleet_not_found" }, 404);

    const [{ data: drivers, error: driversError }, { data: devices, error: devicesError }, { data: events, error: eventsError }] = await Promise.all([
      admin.from("road1st_fleet_drivers")
        .select("id,display_name,app_driver_id,active,created_at")
        .eq("fleet_id", fleetId)
        .order("display_name"),
      admin.from("road1st_fleet_devices")
        .select("id,driver_id,install_id,app_version,device_model,enrolled_at,last_seen_at,revoked_at")
        .eq("fleet_id", fleetId)
        .order("enrolled_at", { ascending: false }),
      admin.from("road1st_fleet_events")
        .select("id,device_id,driver_id,event_type,verification_method,client_created_at,created_at")
        .eq("fleet_id", fleetId)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);
    if (driversError || devicesError || eventsError) return json({ error: "fleet_detail_failed" }, 500);
    const { data: fuelCards, error: fuelCardError } = await admin
      .from("road1st_fleet_fuel_cards")
      .select("id,label,active,created_at")
      .eq("fleet_id",fleetId)
      .order("label");
    if (fuelCardError) return json({ error: "fuel_card_list_failed" },500);
    const { data: vehicles, error: vehiclesError }=await admin
      .from("road1st_fleet_vehicles")
      .select("id,registration,vehicle_type,unit_number,active,created_at")
      .eq("fleet_id",fleetId).order("registration");
    if (vehiclesError) return json({error:"vehicle_list_failed"},500);

    return json({
      fleets: fleets ?? [],
      fleet,
      role: await fleetRole(fleetId),
      drivers: drivers ?? [],
      devices: devices ?? [],
      events: events ?? [],
      fuel_cards: fuelCards ?? [],
      vehicles: vehicles ?? [],
    });
  }

  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const action = String(body?.action ?? "");

  if (action === "create_fleet") {
    if (!platformOwner) return json({ error: "platform_owner_required" }, 403);
    let name: string;
    try {
      name = cleanText(body?.name, 160, true) as string;
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "invalid_name" }, 400);
    }
    const { data: fleet, error } = await admin.from("road1st_fleets")
      .insert({ name, created_by: user.id })
      .select("id,name,status,blocking_preset,walkaround_required,created_at")
      .single();
    if (error || !fleet) return json({ error: "fleet_create_failed" }, 500);
    await admin.from("road1st_fleet_users").insert({
      fleet_id: fleet.id, user_id: user.id, role: "fleet_owner", enabled: true,
    });
    return json({ status: "created", fleet }, 201);
  }

  const fleetId = String(body?.fleet_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(fleetId) || !(await canSeeFleet(fleetId))) {
    return json({ error: "forbidden" }, 403);
  }
  const role = await fleetRole(fleetId);

  if (action === "create_enrolment") {
    if (!platformOwner && !isFleetManagerRole(role)) return json({ error: "manager_required" }, 403);

    let driverId = String(body?.driver_id ?? "");
    let driver: any = null;
    if (driverId) {
      if (!/^[0-9a-f-]{36}$/i.test(driverId)) return json({ error: "invalid_driver" }, 400);
      const result = await admin.from("road1st_fleet_drivers")
        .select("id,display_name,app_driver_id,active")
        .eq("id", driverId)
        .eq("fleet_id", fleetId)
        .maybeSingle();
      if (result.error || !result.data || result.data.active !== true) return json({ error: "driver_not_found" }, 404);
      driver = result.data;
    } else {
      let driverName: string;
      try {
        driverName = cleanText(body?.driver_name, 160, true) as string;
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "invalid_driver_name" }, 400);
      }

      let created: any = null;
      for (let attempt = 0; attempt < 4 && !created; attempt++) {
        const appDriverId = randomHex(6);
        const result = await admin.from("road1st_fleet_drivers")
          .insert({ fleet_id: fleetId, display_name: driverName, app_driver_id: appDriverId, created_by: user.id })
          .select("id,display_name,app_driver_id,active")
          .single();
        if (!result.error) created = result.data;
      }
      if (!created) return json({ error: "driver_create_failed" }, 500);
      driver = created;
      driverId = driver.id;
    }

    await admin.from("road1st_fleet_enrolment_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("driver_id", driverId)
      .is("used_at", null)
      .is("revoked_at", null);

    const rawToken = randomBase64Url(32);
    const tokenHash = await sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const { data: enrolment, error: enrolError } = await admin
      .from("road1st_fleet_enrolment_tokens")
      .insert({
        fleet_id: fleetId,
        driver_id: driverId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_by: user.id,
      })
      .select("id,expires_at")
      .single();
    if (enrolError || !enrolment) return json({ error: "enrolment_create_failed" }, 500);

    const enrolmentUri = "road1st://enrol?token=" + encodeURIComponent(rawToken);
    let qrSvg = "";
    try {
      qrSvg = await QRCode.toString(enrolmentUri, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
      });
    } catch {
      return json({ error: "qr_generation_failed" }, 500);
    }

    return json({
      status: "created",
      enrolment_id: enrolment.id,
      driver,
      expires_at: enrolment.expires_at,
      enrolment_uri: enrolmentUri,
      qr_svg: qrSvg,
    }, 201);
  }

  if (action === "revoke_device") {
    if (!platformOwner && !isFleetManagerRole(role)) return json({ error: "manager_required" }, 403);
    const deviceId = String(body?.device_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(deviceId)) return json({ error: "invalid_device" }, 400);
    const { data, error } = await admin.from("road1st_fleet_devices")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", deviceId)
      .eq("fleet_id", fleetId)
      .is("revoked_at", null)
      .select("id")
      .maybeSingle();
    if (error) return json({ error: "device_revoke_failed" }, 500);
    if (!data) return json({ error: "device_not_found_or_already_revoked" }, 404);
    return json({ status: "revoked", device_id: deviceId });
  }

  if(action==="view_fleet_report"||action==="fleet_file_url"){
    if(!(await canSeeFleet(fleetId)))return json({error:"forbidden"},403);
    const id=String(body?.record_id??"");
    const kind=String(body?.record_kind??"");
    if(!/^[0-9a-f-]{36}$/i.test(id)||!["reports","fuel","defects"].includes(kind))
      return json({error:"invalid_record"},400);
    if(action==="view_fleet_report"&&kind!=="reports")return json({error:"invalid_record"},400);
    const table=kind==="reports"?"road1st_reports":kind==="fuel"?"road1st_fuel_receipts":"road1st_defect_photos";
    const field=kind==="reports"?"storage_path":"image_storage_path";
    const bucketName=kind==="reports"?"road1st-reports":kind==="fuel"?"road1st-fuel-receipts":"road1st-defect-photos";
    const selectFields=kind==="reports"?"storage_path,original_filename":field+",registration,created_at";
    const {data,error}=await admin.from(table).select(selectFields)
      .eq("id",id).eq("fleet_id",fleetId).maybeSingle();
    if(error)return json({error:"record_lookup_failed"},500);
    if(!data)return json({error:"record_not_found"},404);
    if(action==="view_fleet_report"){
      const {data:blob,error:readError}=await admin.storage.from(bucketName).download(data.storage_path);
      if(readError||!blob)return json({error:"record_read_failed"},500);
      try{return json({report:reportView(await blob.text()),filename:data.original_filename})}
      catch{return json({error:"record_parse_failed"},500)}
    }
    const {data:signed,error:signError}=await admin.storage.from(bucketName).createSignedUrl(data[field],120);
    if(signError||!signed?.signedUrl)return json({error:"record_link_failed"},500);
    return json({url:signed.signedUrl,filename:kind==="reports"?data.original_filename:kind+"-"+(data.registration||"receipt")+".jpg"});
  }
  if (action === "edit_vehicle") {
    if (!platformOwner && !isFleetManagerRole(role)) return json({error:"manager_required"},403);
    const id=String(body?.vehicle_id ?? "");
    const registration=String(body?.registration ?? "").trim().toUpperCase().replace(/\s+/g," ");
    const regKey=registration.replace(/[^A-Z0-9]/g,"");
    const type=String(body?.vehicle_type ?? "");
    const unit=String(body?.unit_number ?? "").trim();
    if(!/^[0-9a-f-]{36}$/i.test(id)||
      !/^[A-Z0-9 -]{2,32}$/.test(registration)||regKey.length<2||
      !["Car / Van","Van + Tacho","Truck","Bus"].includes(type)||unit.length>80)
      return json({error:"invalid_vehicle_details"},400);
    const {data:old,error:oldError}=await admin.from("road1st_fleet_vehicles")
      .select("id,registration,registration_normalized,active")
      .eq("id",id).eq("fleet_id",fleetId).maybeSingle();
    if(oldError)return json({error:"vehicle_lookup_failed"},500);
    if(!old || !old.active)return json({error:"vehicle_not_found"},404);
    const {data:duplicate,error:duplicateError}=await admin.from("road1st_fleet_vehicles")
      .select("id").eq("fleet_id",fleetId).eq("registration_normalized",regKey).maybeSingle();
    if(duplicateError)return json({error:"vehicle_lookup_failed"},500);
    if(duplicate && duplicate.id!==id)return json({error:"registration_already_used"},409);
    const {data,error}=await admin.from("road1st_fleet_vehicles")
      .update({registration,registration_normalized:regKey,vehicle_type:type,
        unit_number:unit||null,updated_at:new Date().toISOString()})
      .eq("id",id).eq("fleet_id",fleetId).eq("active",true)
      .select("id,registration,vehicle_type,unit_number,active").maybeSingle();
    if(error || !data)return json({error:"vehicle_update_failed"},500);
    return json({status:"updated",vehicle:data});
  }

  if (action === "remove_vehicle") {
    if (!platformOwner && !isFleetManagerRole(role))return json({error:"manager_required"},403);
    const id=String(body?.vehicle_id ?? "");
    if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:"invalid_vehicle"},400);
    // A vehicle-register row is independent of journey reports, fuel receipts and
    // defect photos. Remove only this row and never alter historical evidence.
    const {data,error}=await admin.from("road1st_fleet_vehicles")
      .delete().eq("id",id).eq("fleet_id",fleetId)
      .select("id,registration").maybeSingle();
    if(error)return json({error:"vehicle_remove_failed"},500);
    if(!data)return json({error:"vehicle_not_found"},404);
    return json({status:"removed",vehicle:data});
  }

  if (action === "add_vehicle") {
    if (!platformOwner && !isFleetManagerRole(role)) return json({error:"manager_required"},403);
    const registration=String(body?.registration ?? "").trim().toUpperCase().replace(/\\s+/g," ");
    const regKey=registration.replace(/[^A-Z0-9]/g,"");
    const type=String(body?.vehicle_type ?? "");
    const unit=String(body?.unit_number ?? "").trim();
    if(!/^[A-Z0-9 -]{2,32}$/.test(registration)||regKey.length<2||
      !["Car / Van","Van + Tacho","Truck","Bus"].includes(type)||
      unit.length>80)return json({error:"invalid_vehicle_details"},400);
    const {data:old,error:oldErr}=await admin.from("road1st_fleet_vehicles")
      .select("id,active").eq("fleet_id",fleetId).eq("registration_normalized",regKey).maybeSingle();
    if(oldErr)return json({error:"vehicle_lookup_failed"},500);
    let result:any;
    if(old){
      if(old.active)return json({error:"vehicle_already_registered"},409);
      result=await admin.from("road1st_fleet_vehicles")
        .update({registration,vehicle_type:type,unit_number:unit||null,active:true,updated_at:new Date().toISOString()})
        .eq("id",old.id).eq("fleet_id",fleetId)
        .select("id,registration,vehicle_type,unit_number,active").single();
    }else{
      result=await admin.from("road1st_fleet_vehicles")
        .insert({fleet_id:fleetId,registration,registration_normalized:regKey,
          vehicle_type:type,unit_number:unit||null,created_by:user.id})
        .select("id,registration,vehicle_type,unit_number,active").single();
    }
    if(result.error||!result.data)return json({error:"vehicle_save_failed"},500);
    return json({status:"saved",vehicle:result.data},old?200:201);
  }
  if (action === "archive_vehicle") {
    if (!platformOwner && !isFleetManagerRole(role))return json({error:"manager_required"},403);
    const id=String(body?.vehicle_id ?? "");
    if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:"invalid_vehicle"},400);
    const {data,error}=await admin.from("road1st_fleet_vehicles")
      .update({active:false,updated_at:new Date().toISOString()})
      .eq("id",id).eq("fleet_id",fleetId)
      .select("id,registration,active").maybeSingle();
    if(error)return json({error:"vehicle_update_failed"},500);
    if(!data)return json({error:"vehicle_not_found"},404);
    return json({status:"archived",vehicle:data});
  }
  if (action === "add_fuel_card") {
    if (!platformOwner && !isFleetManagerRole(role)) return json({ error:"manager_required" },403);
    const raw=String(body?.label ?? "").trim().replace(/\s+/g," ");
    if (!/^[\p{L}\p{N} &.,+()'-]{2,80}$/u.test(raw) || !/[\p{L}]/u.test(raw))
      return json({error:"invalid_fuel_card_name"},400);
    const normalized=raw.toLocaleUpperCase("en").replace(/\s+/g," ");
    const { data: existing, error: existingError }=await admin
      .from("road1st_fleet_fuel_cards")
      .select("id,active,label").eq("fleet_id",fleetId)
      .eq("label_normalized",normalized).maybeSingle();
    if(existingError)return json({error:"fuel_card_lookup_failed"},500);
    let result:any;
    if(existing){
      if(existing.active)return json({error:"fuel_card_already_exists"},409);
      result=await admin.from("road1st_fleet_fuel_cards")
        .update({active:true,label:raw,updated_at:new Date().toISOString()})
        .eq("id",existing.id).eq("fleet_id",fleetId)
        .select("id,label,active").single();
    }else{
      result=await admin.from("road1st_fleet_fuel_cards")
        .insert({fleet_id:fleetId,label:raw,label_normalized:normalized,created_by:user.id})
        .select("id,label,active").single();
    }
    if(result.error||!result.data)return json({error:"fuel_card_save_failed"},500);
    return json({status:"saved",fuel_card:result.data},existing?200:201);
  }
  if (action === "archive_fuel_card") {
    if (!platformOwner && !isFleetManagerRole(role)) return json({error:"manager_required"},403);
    const cardId=String(body?.fuel_card_id ?? "");
    if(!/^[0-9a-f-]{36}$/i.test(cardId))return json({error:"invalid_fuel_card"},400);
    const { data,error }=await admin.from("road1st_fleet_fuel_cards")
      .update({active:false,updated_at:new Date().toISOString()})
      .eq("id",cardId).eq("fleet_id",fleetId)
      .select("id,label,active").maybeSingle();
    if(error)return json({error:"fuel_card_update_failed"},500);
    if(!data)return json({error:"fuel_card_not_found"},404);
    return json({status:"archived",fuel_card:data});
  }

  if (action === "set_walkaround_requirement") {
    if (!platformOwner && !isFleetManagerRole(role)) return json({ error: "manager_required" }, 403);
    if (typeof body?.walkaround_required !== "boolean") return json({ error: "invalid_walkaround_setting" }, 400);
    const { data, error } = await admin.from("road1st_fleets")
      .update({walkaround_required: body.walkaround_required, updated_at: new Date().toISOString()})
      .eq("id",fleetId)
      .select("id,name,walkaround_required,updated_at")
      .single();
    if (error || !data) return json({ error: "fleet_update_failed" }, 500);
    return json({ status: "updated", fleet: data });
  }

  if (action === "set_fleet_preset") {
    if (!platformOwner && !isFleetManagerRole(role)) return json({ error: "manager_required" }, 403);
    const preset = String(body?.blocking_preset ?? "");
    if (!["Recommended", "Strict"].includes(preset)) return json({ error: "invalid_preset" }, 400);
    const { data, error } = await admin.from("road1st_fleets")
      .update({ blocking_preset: preset, updated_at: new Date().toISOString() })
      .eq("id", fleetId)
      .select("id,name,blocking_preset,updated_at")
      .single();
    if (error || !data) return json({ error: "fleet_update_failed" }, 500);
    return json({ status: "updated", fleet: data });
  }

  return json({ error: "invalid_action" }, 400);
});
