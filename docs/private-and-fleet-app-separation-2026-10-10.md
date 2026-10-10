# ROAD 1ST — Separate Private and Fleet Android apps
Status: approved product direction from discussion 10 October 2026; IMPLEMENTATION NOT COMPLETE.

## Product boundary
Two separate installed Android applications on a personally owned or work phone:
- ROAD 1ST Private (free): road-safety driving protection for private journeys. No ROAD 1ST cloud archive of personal journey reports, location history, fuel or defects; user may retain local information if explicitly offered and may use the phone without being enrolled with any fleet.
- ROAD 1ST Fleet: company-linked app, requiring a fleet invitation and fleet agreements. Only authorised fleet work sessions generate fleet-linked operational records. The driver's own phone ownership does not exempt ACTIVE fleet sessions from the fleet terms, but does not grant the company access to the Private app.

Use distinct Android applicationId values and isolated app-private data stores. Keep the existing ROAD 1ST branding. Reuse safety engine code when appropriate; do not mutate or replace the approved current build while developing the second app.

## Work / personal switch
- A driver can install both apps side by side, each with its own distinct icon/name and independent storage.
- **SOS — Start of Shift:** explicit driver action inside ROAD 1ST Fleet starts the fleet duty session and its authorised work recording. Show company name, SOS timestamp and a prominent FLEET SHIFT ACTIVE indicator. SOS is not triggered by motion, Bluetooth, phone startup, launching the personal app, or entering a vehicle.
- **EOS — End of Shift:** explicit driver action inside ROAD 1ST Fleet records the EOS timestamp and closes the fleet duty session. At EOS, immediately cease NEW fleet-side collection of location, movement, journey checkpoints, fleet activity logs and work telemetry; stop the related location/monitoring foreground services and scheduling. Do not resume fleet tracking until the driver explicitly starts another SOS.
- SOS/EOS denote the **whole work shift**, not the beginning/end of each journey. Driving breaks, rest, Temporary Stop, Police Stop, ferry mode, walkaround and double-manning driver changes must not silently start or end an SOS/EOS session.
- When EOS completes, show **FLEET SHIFT ENDED — NOT TRACKING**. ROAD 1ST Fleet must neither monitor nor upload NEW personal activity after EOS, including on Bluetooth connection, phone reboot, app closing or background restart. Pending records created strictly between SOS and EOS may upload afterward (subject to Ferry Mode's no-upload rule) with their original work timestamps and fleet identifiers; this does not authorise any further personal tracking.
- ROAD 1ST Private remains a completely separate application/identity and must never transmit a private journey into the Fleet account, regardless of whether both apps are installed. Start a personal journey only in Private; SOS cannot be initiated from the Private app.
- Keep an obvious ongoing shift indicator and End of Shift action to reduce accidental after-hours tracking if the driver forgets EOS. Add nonintrusive reminders when appropriate; never silently extend tracking indefinitely without clear driver awareness. Ensure SOS/EOS work offline and are queued for later fleet reporting as timestamp-only transition records, without continuing location monitoring after EOS.
- Upload of ALREADY collected work records after duty may complete under a disclosed policy (and not while Ferry Mode blocks uploads); it must not gather new private movement or location data. Display pending work upload count if needed.
- Private app must not include fleet enrolment credentials, report upload queue, or identity linkage to a fleet. No private driver data appears in the fleet dashboard.
- Driving protection must remain reliable if driver elects to use Private on a personal journey. When Fleet duty is active, prevent the two apps from fighting over overlay/blocking/monitor services. Test handoff of protection without gaps.
- Fleet owner may suspend a fleet account for non-payment, but should not disable the core road-safety protection on an already installed phone. After suspension, any authorised customer-record handover can still be accessed securely.

## Legal and consent requirements
Separate acceptance logs for ROAD 1ST Private app terms/privacy and ROAD 1ST Fleet driver notice/privacy; fleet contract + data processing agreement + terms accepted by authorised fleet manager. Record accepted policy versions and timestamps. Inform driver plainly when fleet recording starts/stops, who receives it, the categories of data, lawfulness and rights. Employer's GDPR basis cannot ordinarily be based solely on employee consent due to power imbalance. Fleet terms do not apply to personal use outside an active fleet duty, except narrowly applicable provisions e.g. account data/contract-related obligations.
Separate Google Play package/listing and review of location, usage/overlay, background services, device disclosure and Data Safety declarations. Explain collection before sensitive permissions.
Customer records require authenticated fleet isolation in backend, plus customer export/acknowledgement/deletion process already separately specified.

## Gaps identified in 2026-10-10 audit
Current pilot branch pilot-hardening-2.61 contains ONE applicationId `com.mick.driversafety` and combined fleet enrolment and private reports/upload capabilities. Existing ReportUploader, FuelReceiptUploader and DefectPhotoUploader can upload queued files; their upload pathways need hard checks for fleet-only scope and test validation before the 'no private reports are retained in the cloud' claim can be published.
Existing TestDriveService has stopWithTask=false; closing the UI does not prove monitoring stopped. Explicit service teardown is required.
The split is a new, significant app/build and Play Store product task; no APK or second app has been built as part of this decision.

## Acceptance tests before pilot or Play Store
1. Same Samsung phone, both apps installed, unique launcher icons, no shared account/stored data.
2. Drive Private: no fleet reports/positions arrive in cloud, even with Wi-Fi mid-trip, after trip, on reboot, or when Fleet app isn't open.
3. Tap SOS, exercise walkaround/report/photo and a break or double-manning transition, tap EOS: only work records between SOS and EOS go to the correct fleet; delayed upload includes only pre-EOS work files.
4. Tap EOS, then drive privately immediately, including background app/BT auto-connect/reboot: no fleet tracking or new personal records on the fleet account; core protection works through Private. Verify queued pre-EOS work uploads remain correctly attributed.
5. Shift/break/ferry/double-manning transitions still follow approved ROAD 1ST behaviours.
6. Two phones/two drivers/two fleets: no cross-fleet/private data leakage; managers cannot retrieve Private activity.
7. All relevant privacy notices, separate terms and fleet agreement acceptance logged server-side with version/time.
8. Switching or suspension never falsely marks records as deleted; fleet handover remains separately auditable.
