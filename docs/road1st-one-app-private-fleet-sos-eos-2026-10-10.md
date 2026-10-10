# ROAD 1ST — One app, Private / Fleet and SOS / EOS
Agreed direction: 10 October 2026. Status: approved DESIGN, not yet implemented or tested.

## Approved landing screen
Retain the complete approved landing artwork, logo, colours, font and layout. Change ONLY the long Ready to Drive button, dividing its existing footprint (same total position, width, height) into two equal halves: PRIVATE | FLEET. Do not move adjacent elements or create extra buttons. The current LandingHeroView.java displays a bitmap (opening_screen_final.jpg) with ONE invisible touch target; implementation requires an accurately aligned visual region and two corresponding touch zones. Preserve the original image as a reference; do not overwrite it.

## One app, isolated private and fleet modes
PRIVATE: personal Start Journey and End Journey, phone safety protection, no cloud storage or fleet reports of private journeys. FLEET: authorised company connection, SOS/EOS, walkaround, breaks, other work, rest, vehicle types, ferry mode, double manning, fleet reporting. Neither company enrolment nor Bluetooth/movement automatically starts a fleet shift. Fleet data is collected only during a verified active work session. Separate local queues and enforce work-only reporting server-side, not merely by UI switching. Private mode cannot open until EOS completes; work uploads queued before EOS may finish without collecting new private activity.

## Start of Shift (SOS)
For Fleet mode, the driver first selects their company, vehicle and presses SOS BEFORE beginning the walkaround. The deliberate SOS action opens the work shift; walkaround then records Other Work under that same shift, not a second SOS. For a private optional time-only shift, SOS is also explicitly started by the driver. Where tachograph regulations apply, the driver must correctly use their tachograph/card (including Other Work). ROAD 1ST SOS captures a shift boundary for its app, not a substitute statutory tachograph entry. Cars/other fleet vehicles with no walkaround start with explicit SOS. Starting another walkaround during a running shift does not create a second shift. Do NOT introduce a manual tachograph-time entry, backfill or editing screen. If a driver has an earlier start/correction to record, their employer's legally required recordkeeping/tachograph process is the authoritative route; ROAD 1ST must not invent a value.

## End of Shift (EOS)
Primary EOS is a driver action. It stops NEW fleet tracking, location monitoring, movement events and company-visible journey capture; preserve reports already created and allow authorised upload of those work-only records. Switching to Private after EOS cannot send private activity to a company, even on reboot/BT reconnection.
Tachograph-assisted EOS is FUTURE ONLY: when a real reliable integration supplies an authenticated end-of-daily-working-period event, it may provide a fallback for a forgotten EOS, with verification and an audit trail. Card withdrawal alone DOES NOT prove the shift ended (vehicle changes and other cases). Don't invent or silently enable a tacho link. Until integration is available, require the driver to press EOS and investigate an end-shift reminder/privacy failsafe. EOS is an app shift-control action, NOT manual editing of tachograph hours or work/rest records. ROAD 1ST currently does not import authoritative tachograph records; never describe that integration as live.

## Keep agreed features
Preserve walkaround 15-minute reminder, breaks, rest, other work, temporary stop, police stop, ferry offline uploads, co-driver changeover, start without Bluetooth, SOS/EOS timing and approved visual styling. Break/rest/journey end must never imply EOS. The modes are independent of car, van, Van + Tacho, truck, bus selection.

## Critical prerequisites before release
Implement actual app mode/shift state and consistent stop of background fleet services; verify no unlinked private data uploads in ReportUploader.java, FuelReceiptUploader.java and DefectPhotoUploader.java and corresponding server endpoints; separate acceptance and privacy notice for Private and Fleet usage; preserve employer GDPR responsibilities. Main pilot branch inspected: pilot-hardening-2.61. No APK built by this design note.

## Tests
1. Existing ready button precise same footprint as PRIVATE | FLEET; safe touch targets on Samsung A13.
2. Private drive produces no company/cloud journey records even after Wi-Fi, reboot, delayed queue.
3. Fleet driver explicitly presses SOS BEFORE the walkaround, which is then logged as Other Work within the same shift; no duplicate SOS during journey/break/changeover.
4. EOS stops NEW fleet collection; Private home drive not logged to fleet.
5. Driver forgets EOS / removes tacho card / changes vehicle: no false automatic EOS from card removal; privacy protection assessed.
6. Current screenshots and reference artwork unchanged outside specifically approved control.

## LANDING SCREEN CHANGE CONTROL
Do not modify original landing image or Ready to Drive button without showing exact scoped change on the approved reference and obtaining express sign-off first. Only the currently agreed split of the existing button footprint into PRIVATE and FLEET is in scope; no other changes. Implementation has not begun.

## Hard privacy boundary — approved requirement
1. ONE Android app with the two equal halves PRIVATE | FLEET on the existing long button (artwork not yet changed). Driver must choose deliberately.
2. FLEET route: choose authorised company account, choose Car/Van/Van + Tacho/Truck/Bus, press **Start of Shift (SOS)**, then perform the walkaround (Other Work) and other approved shift activities. Fleet recording can start only when both selected mode is FLEET and an authenticated fleet session is ACTIVE. An employer linking a personal phone to its account must not collect data before SOS or after EOS.
3. End of Shift (EOS) is an explicit sign-out. Revoke active capture permission in app runtime, cancel/stop fleet-specific background location and movement collection, and prevent any further fleet events until the next explicit authenticated SOS. Do not auto-resume when device reboots, Bluetooth reconnects, the vehicle moves, or the phone's owner selects Private.
4. PRIVATE route: use road-safety app-blocking and local movement/speed sensing only while the user chooses to use that safety feature. Neither ROAD 1ST's servers nor a fleet company receives private journey routes, locations, timings, speeds, personal tachograph data, or activity logs. No private-journey cloud archive. Any purely local temporary sensor readings necessary for safety are NOT fleet tracking and must not be retained as a route history.
5. Absolutely no collection, storage or sharing of text/SMS/WhatsApp/email message contents, call audio or call contents, personal contacts or unrelated phone content. Usage Access may disclose app package names to the safety feature; keep this on-device unless a specifically justified, disclosed exception is approved. Check all code, SDKs, server logs, analytics and permissions before making absolute claims.
6. Tachograph data: when a genuine, verified provider feed eventually exists, process it ONLY in an active Fleet shift for its authorised driver and company. No tachograph import, display or retention for the Private side. There is NO tachograph integration today. Driver remains responsible for legally required card/tachograph entries.
7. EOS and later Private travel do not delete PRE-EOS legitimate fleet records; their secure queued upload and lawful company retention remain possible, but no new private location or movement samples can be collected by that upload.
8. On the same phone, a fleet enrolment credential being present does not grant background tracking rights. Every telemetry/report upload must be explicitly scoped to fleet ID, driver ID, session ID and activity time inside SOS..EOS; enforce these server-side. No fallbacks that silently label unlinked reports as fleet reports.
9. On account logout or shift close, pending state must fail private: no implicit fleet tracking if current mode/session cannot be proven. Safety phone blocking should still be available by deliberate Private selection, without fleet reports.
10. Google Play requires prominent in-app disclosure for sensitive phone/location/usage-access handling in addition to a privacy policy and Data Safety form. Fleet managers need a separate agreement; drivers need a clear notice even on personally owned phones. Irish DPC guidance restricts general employer tracking of employees.

## Release-blocking privacy tests
- End EOS in truck, immediately drive personal car for 30+ minutes with same phone, GPS and Bluetooth enabled: ZERO post-EOS samples, reports, tachograph imports, map data or company-visible events.
- Choose Private while still linked to paid fleet account; restart phone, re-open app, connect to company vehicle Bluetooth, drive: ZERO fleet activation or uploads of PRIVATE events.
- Pending valid fleet files created BEFORE EOS may upload later, retaining their correct session IDs and original timestamps; no post-EOS GPS/motion collection to do so.
- Fleet session cannot start via app installation, enrolment, permission grant, Bluetooth, geofence, background restart, scheduler or provider callback; explicit fleet SOS is required.
- Test driver app-blocking in Private while offline; any movement sensing remains transient on the handset, and no private locations or private journey records are sent to cloud.
- Verify on Android manifests and code paths that message/call contents, contacts and private notifications are never read, logged or transmitted. Test reporting, photo queues, crash/debug logs and analytics.
- Test unknown/stale supplier events, vehicle changes and Double Manning card removal separately. Double Manning must not show the single-driver EOS question.
- Block commercial release until independent privacy audit, contract/DPA review and production server-side mode enforcement are complete.

## Suggested driver-facing notice — draft for legal review
“When you choose FLEET and start a shift, ROAD 1ST records authorised work activity for your fleet operator. Press End of Shift to stop new fleet reporting. Choosing PRIVATE provides driving-safety protection but does not send your private journeys to your employer. ROAD 1ST does not access the content of your text messages, calls, emails or private conversations. Your phone may use location or movement information locally while protecting you during Private journeys; these readings are not stored as fleet journey records.”

Evidence: Irish Data Protection Commission — https://dataprotection.ie/en/dpc-guidance/employer-vehicle-tracking ; Google Play — https://support.google.com/googleplay/android-developer/answer/10144311
