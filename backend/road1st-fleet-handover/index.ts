import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { zipSync, strToU8 } from "npm:fflate@0.8.2";

const HEADERS: Record<string,string>={
 "Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",
 "X-Content-Type-Options":"nosniff","Access-Control-Allow-Origin":"https://mfaggetter33-del.github.io",
 "Access-Control-Allow-Headers":"authorization, apikey, content-type",
 "Access-Control-Allow-Methods":"GET, POST, OPTIONS"
};
const BAG="road1st-handover-packages";
const LIMIT_ROWS=400;
const LIMIT_BYTES=22*1024*1024;
const MEDIA=[
 {table:"road1st_reports",bucket:"road1st-reports",path:"storage_path",folder:"journeys",sha:"sha256"},
 {table:"road1st_fuel_receipts",bucket:"road1st-fuel-receipts",path:"image_storage_path",folder:"fuel-receipts",sha:"image_sha256"},
 {table:"road1st_defect_photos",bucket:"road1st-defect-photos",path:"image_storage_path",folder:"defect-photos",sha:"image_sha256"}
];
const DETAIL=[
 {table:"road1st_fleet_drivers",fields:"id,fleet_id,display_name,app_driver_id,active,created_at"},
 {table:"road1st_fleet_devices",fields:"id,fleet_id,driver_id,app_version,device_model,enrolled_at,last_seen_at,revoked_at"},
 {table:"road1st_fleet_vehicles",fields:"id,fleet_id,registration,vehicle_type,unit_number,active,created_at,updated_at"},
 {table:"road1st_fleet_events",fields:"id,fleet_id,driver_id,device_id,event_type,created_at,client_created_at,details"},
 {table:"road1st_fleet_fuel_cards",fields:"id,fleet_id,label,active,created_at"},
 {table:"road1st_fleet_users",fields:"fleet_id,user_id,role,enabled,created_at"}
];
type Row = Record<string,any>;
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:HEADERS});
const isUuid=(s:string)=>/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(s);
function resolveKeyMap(name:string,legacy:string){
 try{const val=Deno.env.get(name);if(val){const obj=JSON.parse(val);const key=obj?.default;if(typeof key==="string")return Deno.env.get(key)||key;}}catch{}
 return Deno.env.get(legacy)||"";
}
async function sha256(buf:Uint8Array|ArrayBuffer) {
 const array=buf instanceof Uint8Array?buf:new Uint8Array(buf);
 const bytes=await crypto.subtle.digest("SHA-256",array);
 return Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,"0")).join("");
}
async function table(admin:any,tableName:string,fleet:string,fields="*"){
 const {data,error}=await admin.from(tableName).select(fields).eq("fleet_id",fleet).limit(LIMIT_ROWS+1);
 if(error)throw Error("read_failed_"+tableName);
 if(data.length>LIMIT_ROWS)throw Error("export_size_limit_"+tableName);
 return data as Row[];
}
async function collection(admin:any,fleet:string){
 const media=await Promise.all(MEDIA.map(async t=>({...t,rows:await table(admin,t.table,fleet)})));
 const detail=await Promise.all(DETAIL.map(async t=>({...t,rows:await table(admin,t.table,fleet,t.fields)})));
 const metadata=media.map(group=>({
   table:group.table,
   entries:group.rows.map(row=>({id:row.id,path:row[group.path],sha:row[group.sha],size:row.image_size_bytes??row.size_bytes??null}))
     .sort((a,b)=>String(a.id).localeCompare(String(b.id)))
 }));
 const details=detail.map(group=>({table:group.table,
   entries:group.rows.map(row=>({id:row.id??row.user_id??row.fleet_id,
     hash:JSON.stringify(row)})).sort((a,b)=>String(a.id).localeCompare(String(b.id)))}));
 return {media,detail,metadata,details,manifest_digest:await sha256(
   strToU8(JSON.stringify({metadata,details})))};
}
async function blockers(admin:any,fleet:string){
 const {data,error}=await admin.rpc("road1st_handover_blockers",{p_fleet:fleet});
 if(error||!data)throw Error("legal_hold_check_unavailable");
 return data as {active_holds:number;open_privacy_requests:number;unapproved_retention_categories:number};
}
async function safety(admin:any,fleet:string){
 const b=await blockers(admin,fleet);
 if(Object.values(b).some(x=>Number(x)!==0))throw Error(
 "legal_review_required: holds="+b.active_holds+
 ", open_requests="+b.open_privacy_requests+
 ", retention_categories="+b.unapproved_retention_categories);
 return b;
}
function fileName(row:Row,t:(typeof MEDIA)[number]){
 if(typeof row[t.path]!=="string"||!row[t.path]||
    row[t.path].startsWith("/")||row[t.path].includes("..")||row[t.path].includes("\\"))
   throw Error("invalid_storage_path");
 const extension=t.bucket==="road1st-reports"?".jsonl":".jpg";
 return t.folder+"/"+row.id+extension;
}
async function getHandover(admin:any,fleet:string){
 const {data,error}=await admin.from("road1st_fleet_handovers")
  .select("*").eq("fleet_id",fleet).order("prepared_at",{ascending:false}).limit(1).maybeSingle();
 if(error)throw Error("handover_lookup_failed");
 return data;
}
function publicHandover(h:Row|null,forOwner:boolean){
 if(!h)return null;
 const obj:any={id:h.id,state:h.state,prepared_at:h.prepared_at,exported_at:h.exported_at,
 acknowledged_at:h.acknowledged_at,owner_approved_at:h.owner_approved_at,
 completed_at:h.completed_at,package_sha256:h.package_sha256,
 package_size_bytes:h.package_size_bytes,record_inventory:h.record_inventory,
 acknowledged_name:h.acknowledged_name,legal_hold:h.legal_hold,
 backup_retention_note:h.backup_retention_note,final_inventory:h.final_inventory};
 if(forOwner)obj.last_error=h.last_error;
 return obj;
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:HEADERS});
 if(req.method!=="GET"&&req.method!=="POST")return json({error:"method_not_allowed"},405);
 const auth=req.headers.get("Authorization")||"";
 if(!auth.startsWith("Bearer "))return json({error:"sign_in_required"},401);
 const supabaseUrl=Deno.env.get("SUPABASE_URL")||"";
 const publishable=resolveKeyMap("SUPABASE_PUBLISHABLE_KEYS","SUPABASE_ANON_KEY");
 const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||resolveKeyMap("SUPABASE_SECRET_KEYS","SUPABASE_SERVICE_ROLE_KEY");
 if(!supabaseUrl||!publishable||!secret)return json({error:"server_configuration_missing"},500);
 const userClient=createClient(supabaseUrl,publishable,{auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:auth}}});
 const {data:userData,error:userError}=await userClient.auth.getUser(auth.slice(7));
 const user=userData?.user;
 if(userError||!user)return json({error:"invalid_session"},401);
 const admin=createClient(supabaseUrl,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const [{data:owner},{data:member,error:memberError}]=await Promise.all([
  admin.from("road1st_admin_users").select("role").eq("user_id",user.id).eq("enabled",true).maybeSingle(),
  admin.from("road1st_fleet_users").select("fleet_id,role").eq("user_id",user.id).eq("enabled",true)
 ]);
 if(memberError)return json({error:"permissions_unavailable"},503);
 const platformOwner=owner?.role==="owner";
 const url=new URL(req.url);
 let body:Row={};
 if(req.method==="POST"){try{body=await req.json()}catch{return json({error:"bad_json"},400)}}
 const action=req.method==="GET"?(url.searchParams.get("action")||"status"):String(body.action||"");
 const fleet=String(req.method==="GET"?url.searchParams.get("fleet_id")||"":body.fleet_id||"");
 if(!isUuid(fleet))return json({error:"invalid_fleet"},400);
 const membership=(member||[]).find((m:any)=>m.fleet_id===fleet);
 const manager=membership&&["fleet_owner","senior_admin","transport_manager"].includes(membership.role);
 if(!platformOwner&&!manager)return json({error:"fleet_access_denied"},403);
 const {data:fleetRow,error:fleetError}=await admin.from("road1st_fleets").select("*").eq("id",fleet).maybeSingle();
 if(fleetError||!fleetRow)return json({error:"unknown_fleet"},404);
 try{
  if(action==="status"){
   const h=await getHandover(admin,fleet);
   const b=platformOwner?await blockers(admin,fleet):undefined;
   return json({fleet:{id:fleet,name:fleetRow.name,status:fleetRow.status},
     handover:publicHandover(h,platformOwner),is_owner:platformOwner,
     is_fleet_manager:!!manager,blockers:b,
     export_limit:"400 rows/category; 22 MB total per package"});
  }
  if(action==="prepare"){
   if(!platformOwner)return json({error:"owner_required"},403);
   if(fleetRow.status==="closed")return json({error:"fleet_closed"},409);
   const existing=await getHandover(admin,fleet);
   if(existing&&existing.state!=="completed")return json({error:"handover_already_exists"},409);
   const all=await collection(admin,fleet);
   const manifest:Record<string,any>={format:"ROAD 1ST customer handover 1.0",
      created_at:new Date().toISOString(),fleet:{id:fleet,name:fleetRow.name},
      record_counts:{},files:[],sha256_algorithm:"SHA-256",
      notice:"Does not replace original statutory tachograph files; driver/device secrets deliberately excluded."};
   const zipFiles:Record<string,Uint8Array>={};
   let totalRaw=0;
   const append=(name:string,bytes:Uint8Array,expected?:string|null)=>{
     if(zipFiles[name])throw Error("duplicate_archive_path");
     totalRaw+=bytes.length;
     if(totalRaw>LIMIT_BYTES)throw Error("export_too_large_split_required");
     zipFiles[name]=bytes;
     return sha256(bytes).then(actual=>{
       if(expected&&actual.toLowerCase()!==String(expected).toLowerCase())throw Error("file_checksum_mismatch");
       manifest.files.push({name,bytes:bytes.length,sha256:actual});
     });
   };
   for(const group of all.media){
     manifest.record_counts[group.table]=group.rows.length;
     await append("metadata/"+group.table+".json",strToU8(JSON.stringify(group.rows,null,2)));
     for(const row of group.rows){
       const path=row[group.path];
       const {data:blob,error}=await admin.storage.from(group.bucket).download(path);
       if(error||!blob)throw Error("missing_original_file_"+group.table);
       await append("files/"+fileName(row,group),new Uint8Array(await blob.arrayBuffer()),row[group.sha]);
     }
   }
   for(const group of all.detail){
     manifest.record_counts[group.table]=group.rows.length;
     await append("metadata/"+group.table+".json",strToU8(JSON.stringify(group.rows,null,2)));
   }
   // Full current fleet settings, without account secrets.
   await append("metadata/fleet_settings.json",strToU8(JSON.stringify({
      id:fleetRow.id,name:fleetRow.name,status:fleetRow.status,
      blocking_preset:fleetRow.blocking_preset,walkaround_required:fleetRow.walkaround_required,
      created_at:fleetRow.created_at
   },null,2)));
   manifest.files.sort((a:Row,b:Row)=>a.name.localeCompare(b.name));
   await append("MANIFEST.json",strToU8(JSON.stringify(manifest,null,2)));
   const zip=zipSync(zipFiles,{level:2});
   if(zip.length>30*1024*1024)throw Error("zip_too_large");
   const hash=await sha256(zip);
   const storagePath=fleet+"/"+crypto.randomUUID()+".zip";
   const {error:uploadError}=await admin.storage.from(BAG).upload(storagePath,zip,
      {contentType:"application/zip",upsert:false});
   if(uploadError)throw Error("export_upload_failed");
   const {data:created,error:saveError}=await admin.from("road1st_fleet_handovers")
       .insert({fleet_id:fleet,state:"prepared",prepared_by:user.id,
        record_inventory:{counts:manifest.record_counts,media:all.metadata,
          details:all.details,digest:all.manifest_digest},
        package_sha256:hash,package_size_bytes:zip.byteLength,
        package_storage_path:storagePath,manifest_sha256:await sha256(strToU8(JSON.stringify(manifest))),
        export_expires_at:new Date(Date.now()+30*86400000).toISOString()})
       .select("id").single();
   if(saveError){
     await admin.storage.from(BAG).remove([storagePath]);
     throw Error("handover_record_failed");
   }
   return json({status:"prepared",id:created.id,package_sha256:hash,files:manifest.files.length,
       bytes:zip.length,record_counts:manifest.record_counts});
  }
  const h=await getHandover(admin,fleet);
  if(!h)return json({error:"prepare_handover_first"},409);
  if(action==="download"){
   if(!["prepared","exported","acknowledged","deletion_requested"].includes(h.state))
       return json({error:"handover_unavailable"},409);
   const {data:blob,error}=await admin.storage.from(BAG).download(h.package_storage_path);
   if(error||!blob)return json({error:"package_missing"},503);
   const data=new Uint8Array(await blob.arrayBuffer());
   if(await sha256(data)!==h.package_sha256)return json({error:"package_integrity_failure"},503);
   if(!h.exported_at){
     const {error:mark}=await admin.from("road1st_fleet_handovers").update({
        exported_at:new Date().toISOString(),state:"exported",updated_at:new Date().toISOString()
      }).eq("id",h.id).eq("state","prepared");
     if(mark)return json({error:"download_status_unavailable"},503);
   }
   const headers={...HEADERS,"Content-Type":"application/zip",
      "Content-Disposition":'attachment; filename="ROAD1ST-HANDOVER-'+fleet+'.zip"',
      "Content-Length":String(data.byteLength)};
   return new Response(data,{status:200,headers});
  }
  if(action==="acknowledge"){
    // Actual independent company manager; not owner acting on customer's behalf.
    if(platformOwner||!manager)return json({error:"customer_manager_only"},403);
    if(h.state!=="exported")return json({error:"package_must_be_downloaded_first"},409);
    const name=String(body.name||"").trim();
    if(name.length<2||name.length>160||body.confirmed!==true||
       body.package_sha256!==h.package_sha256)
       return json({error:"confirm_verified_package_hash_and_name"},400);
    const {data:ok,error}=await admin.from("road1st_fleet_handovers").update({
       state:"acknowledged",acknowledged_by:user.id,acknowledged_name:name,
       acknowledged_at:new Date().toISOString(),updated_at:new Date().toISOString()
    }).eq("id",h.id).eq("state","exported").select("id").maybeSingle();
    if(error||!ok)return json({error:"acknowledgement_failed"},409);
    return json({status:"acknowledged",id:h.id});
  }
  if(action==="approve_close"){
    if(!platformOwner)return json({error:"owner_only"},403);
    if(h.state!=="acknowledged")return json({error:"customer_acknowledgement_required"},409);
    if(String(body.confirmation||"")!=="CLOSE "+fleetRow.name)
       return json({error:"type_exact_close_confirmation"},400);
    if(body.retention_reviewed!==true||body.customer_contract_ended!==true)
       return json({error:"retention_and_contract_checks_required"},400);
    await safety(admin,fleet);
    const now=await collection(admin,fleet);
    if(now.manifest_digest!==h.record_inventory?.digest)
      return json({error:"fleet_records_changed_reprepare_required"},409);
    // Freeze further device uploads and fleet membership before any deletion attempt.
    const stamp=new Date().toISOString();
    const {error:suspendError}=await admin.from("road1st_fleets")
       .update({status:"suspended",suspension_reason:"Verified customer handover: pending closing deletion",
         suspended_at:stamp,updated_at:stamp}).eq("id",fleet).neq("status","closed");
    if(suspendError)throw Error("freeze_fleet_failed");
    const {error:revokeError}=await admin.from("road1st_fleet_devices").update({revoked_at:stamp})
       .eq("fleet_id",fleet).is("revoked_at",null);
    if(revokeError)throw Error("revoke_devices_failed_manual_review");
    const {error:tokensError}=await admin.from("road1st_fleet_enrolment_tokens")
       .update({revoked_at:stamp}).eq("fleet_id",fleet).is("used_at",null).is("revoked_at",null);
    if(tokensError)throw Error("revoke_tokens_failed_manual_review");
    const {error:saveError}=await admin.from("road1st_fleet_handovers").update({
       state:"deletion_requested",deletion_requested_at:stamp,owner_approved_at:stamp,
       owner_approved_by:user.id,updated_at:stamp
    }).eq("id",h.id).eq("state","acknowledged");
    if(saveError)throw Error("approval_logging_failed_manual_review");
    return json({status:"deletion_requested",message:"Fleet suspended and phones revoked. Owner may now complete verified close."});
  }
  if(action==="complete_close"){
    if(!platformOwner)return json({error:"owner_only"},403);
    if(h.state!=="deletion_requested"||!h.owner_approved_at||!h.acknowledged_at)
      return json({error:"handover_not_approved"},409);
    if(String(body.confirmation||"")!=="DELETE "+fleetRow.name)
      return json({error:"exact_delete_confirmation_required"},400);
    await safety(admin,fleet);
    if(fleetRow.status!=="suspended")return json({error:"fleet_must_be_frozen"},409);
    const {data:activeDevices,error:activeError}=await admin.from("road1st_fleet_devices")
       .select("id").eq("fleet_id",fleet).is("revoked_at",null).limit(1);
    if(activeError||activeDevices?.length)return json({error:"active_device_blocks_closure"},409);
    const current=await collection(admin,fleet);
    // On retry, only a subset of the exact approved originals may remain.
    for(const group of current.media){
      const original=(h.record_inventory?.media||[]).find((p:Row)=>p.table===group.table);
      if(!original)throw Error("missing_original_manifest");
      const originalPaths=new Map((original.entries||[]).map((e:Row)=>[e.id,e.path]));
      for(const row of group.rows)if(originalPaths.get(row.id)!==row[group.path])
        throw Error("unapproved_new_or_modified_fleet_data");
    }
    for(const group of current.detail){
      const original=(h.record_inventory?.details||[]).find((p:Row)=>p.table===group.table);
      if(!original)throw Error("missing_original_details");
      const originalIds=new Set((original.entries||[]).map((e:Row)=>String(e.id)));
      for(const row of group.rows){
        const id=String(row.id??row.user_id??row.fleet_id);
        if(!originalIds.has(id))throw Error("new_customer_metadata_since_export");
      }
    }
    const deleted:Record<string,number>={};
    for(const group of current.media){
      let n=0;
      for(const row of group.rows){
        const path=row[group.path];
        // Strict Storage API delete: SQL deletion of storage.objects is forbidden.
        const {error:removal}=await admin.storage.from(group.bucket).remove([path]);
        if(removal)throw Error("storage_delete_failed_"+group.table);
        const {data:stillThere,error:verifyFileError}=await admin.storage.from(group.bucket).download(path);
        if(!verifyFileError||stillThere)throw Error("storage_file_still_exists_"+group.table);
        const {data:removed,error:rowError}=await admin.from(group.table)
           .delete().eq("id",row.id).eq("fleet_id",fleet).select("id");
        if(rowError||removed?.length!==1)throw Error("record_delete_failed_"+group.table);
        n++;
      }
      deleted[group.table]=n;
    }
    // Handover package itself must not remain as another copy of company records.
    if(h.package_storage_path){
      const {error:removePackage}=await admin.storage.from(BAG).remove([h.package_storage_path]);
      if(removePackage)throw Error("package_delete_failed");
      const {data:stillPackage,error:verifyPackageError}=await admin.storage.from(BAG).download(h.package_storage_path);
      if(!verifyPackageError||stillPackage)throw Error("handover_package_still_exists");
    }
    for(const t of ["road1st_fleet_events","road1st_fleet_fuel_cards",
       "road1st_fleet_enrolment_tokens","road1st_fleet_devices",
       "road1st_fleet_drivers","road1st_fleet_vehicles","road1st_fleet_users"]){
       const {error}=await admin.from(t).delete().eq("fleet_id",fleet);
       if(error)throw Error("company_metadata_close_failed_"+t);
    }
    const after=await collection(admin,fleet);
    if(after.media.some((v)=>v.rows.length>0)||after.detail.some(v=>v.rows.length>0))
      throw Error("live_rows_not_zero");
    // Immutable minimal customer closure stub allows fraud/finance and GDPR audit.
    const completed=new Date().toISOString();
    const {error:closeError}=await admin.from("road1st_fleets")
      .update({status:"closed",suspension_reason:"Handover completed",updated_at:completed})
      .eq("id",fleet);
    if(closeError)throw Error("close_status_failed");
    const {error:finishError}=await admin.from("road1st_fleet_handovers")
      .update({state:"completed",completed_at:completed,updated_at:completed,
        final_inventory:{live_deleted:deleted,live_remaining:0},
        backup_retention_note:"Live database and Storage checked empty. Supabase backups expire separately under provider retention policy.",
        package_storage_path:null})
      .eq("id",h.id).eq("state","deletion_requested");
    if(finishError)throw Error("completion_audit_failed");
    return json({status:"completed",deleted,live_remaining:0,
      backup_status:"provider_backup_retention_pending",fleet_status:"closed"});
  }
  return json({error:"invalid_action"},400);
 }catch(e){
  const message=e instanceof Error?e.message:"operation_failed";
  return json({error:message},409);
 }
});