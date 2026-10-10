# ROAD 1ST — One app, Private / Fleet and SOS / EOS
Agreed direction: 10 October 2026. Status: approved DESIGN, not yet implemented or tested.

## Approved landing screen
Retain the complete approved landing artwork, logo, colours, font and layout. Change ONLY the long Ready to Drive button, dividing its existing footprint (same total position, width, height) into two equal halves: PRIVATE | FLEET. Do not move adjacent elements or create extra buttons. The current LandingHeroView.java displays a bitmap (opening_screen_final.jpg) with ONE invisible touch target; implementation requires an accurately aligned visual region and two corresponding touch zones. Preserve the original image as a reference; do not overwrite it.

## One app, isolated private and fleet modes
PRIVATE: personal Start Journey and End Journey, phone safety protection, no cloud storage or fleet reports of private journeys. FLEET: authorised company connection, SOS/EOS, walkaround, breaks, other work, rest, vehicle types, ferry mode, double manning, fleet reporting. Neither company enrolment nor Bluetooth/movement automatically starts a fleet shift. Fleet data is collected only during a verified active work session. Separate local queues and enforce work-only reporting server-side, not merely by UI switching. Private mode cannot open until EOS completes; work uploads queued before EOS may finish without collecting new private activity.

## Start of Shift (SOS)
For vehicles with a required walkaround: shift starts at the moment driver STARTS the walkaround, not first driving movement or walkaround completion. Where tachograph regulations apply, card inserted and mode set to Other Work before walkaround; timestamp SOS as Other Work. If driver was already doing paid work before the walkaround (loading, paperwork, etc.), permit intentional SOS earlier to avoid omissions. Cars/other fleet vehicles with no walkaround start at an explicit SOS. Starting another walkaround during a running shift does not create a second shift.

## End of Shift (EOS)
Primary EOS is a driver action. It stops NEW fleet tracking, location monitoring, movement events and company-visible journey capture; preserve reports already created and allow authorised upload of those work-only records. Switching to Private after EOS cannot send private activity to a company, even on reboot/BT reconnection.
Tachograph-assisted EOS is FUTURE ONLY: when a real reliable integration supplies an authenticated end-of-daily-working-period event, it may provide a fallback for a forgotten EOS, with verification and correction trail. Card withdrawal alone DOES NOT prove the shift ended (vehicle changes and other cases). Don't invent or silently enable a tacho link. Until integration is available, require manual EOS and investigate an explicit end-shift reminder/privacy failsafe.

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
