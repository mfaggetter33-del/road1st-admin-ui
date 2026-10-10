# ROAD 1ST — One app, Private / Fleet and SOS / EOS
Agreed direction: 10 October 2026. Status: approved DESIGN, not yet implemented or tested.

## Approved landing screen
Retain the complete approved landing artwork, logo, colours, font and layout. Change ONLY the long Ready to Drive button, dividing its existing footprint (same total position, width, height) into two equal halves: PRIVATE | FLEET. Do not move adjacent elements or create extra buttons. The current LandingHeroView.java displays a bitmap (opening_screen_final.jpg) with ONE invisible touch target; implementation requires an accurately aligned visual region and two corresponding touch zones. Preserve the original image as a reference; do not overwrite it.

## One app, isolated private and fleet modes
PRIVATE: personal Start Journey and End Journey, phone safety protection, no cloud storage or fleet reports of private journeys. FLEET: authorised company connection, SOS/EOS, walkaround, breaks, other work, rest, vehicle types, ferry mode, double manning, fleet reporting. Neither company enrolment nor Bluetooth/movement automatically starts a fleet shift. Fleet data is collected only during a verified active work session. Separate local queues and enforce work-only reporting server-side, not merely by UI switching. Private mode cannot open until EOS completes; work uploads queued before EOS may finish without collecting new private activity.

## Start of Shift (SOS)
For vehicles with a required walkaround: shift starts at the moment driver STARTS the walkaround, not first driving movement or walkaround completion. Where tachograph regulations apply, the driver must correctly use their tachograph/card (including Other Work). ROAD 1ST SOS captures a shift boundary for its app, not a substitute statutory tachograph entry. Cars/other fleet vehicles with no walkaround start with explicit SOS. Starting another walkaround during a running shift does not create a second shift. Do NOT introduce a manual tachograph-time entry, backfill or editing screen. If a driver has an earlier start/correction to record, their employer's legally required recordkeeping/tachograph process is the authoritative route; ROAD 1ST must not invent a value.

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
3. SOS at start of fleet walkaround records Other Work; no duplicate SOS during journey/break/changeover.
4. EOS stops NEW fleet collection; Private home drive not logged to fleet.
5. Driver forgets EOS / removes tacho card / changes vehicle: no false automatic EOS from card removal; privacy protection assessed.
6. Current screenshots and reference artwork unchanged outside specifically approved control.

## LANDING SCREEN CHANGE CONTROL
Do not modify original landing image or Ready to Drive button without showing exact scoped change on the approved reference and obtaining express sign-off first. Only the currently agreed split of the existing button footprint into PRIVATE and FLEET is in scope; no other changes. Implementation has not begun.
