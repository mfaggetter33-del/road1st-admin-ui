# ROAD 1ST — Separate Private and Fleet Android apps
Status: approved product direction from discussion 10 October 2026; IMPLEMENTATION NOT COMPLETE.

## Product boundary
Two separate installed Android applications on a personally owned or work phone:
- ROAD 1ST Private (free): road-safety driving protection for private journeys. No ROAD 1ST cloud archive of personal journey reports, location history, fuel or defects; user may retain local information if explicitly offered and may use the phone without being enrolled with any fleet.
- ROAD 1ST Fleet: company-linked app, requiring a fleet invitation and fleet agreements. Only authorised fleet work sessions generate fleet-linked operational records. The driver's own phone ownership does not exempt ACTIVE fleet sessions from the fleet terms, but does not grant the company access to the Private app.

Use distinct Android applicationId values and isolated app-private data stores. Keep the existing ROAD 1ST branding. Reuse safety engine code when appropriate; do not mutate or replace the approved current build while developing the second app.

## Work / personal switch
- A driver can install both apps side by side, each with its own distinct icon/name and independent storage.
- Fleet app displays company name and a prominent WORK/FLEET ACTIVE status only during an active, authorised duty/shift. Fleet capture starts only upon deliberately starting a fleet duty session, not merely because phone moves, Bluetooth connects, the app is installed, or the user opens Private.
- Fleet duty ends with an explicit **End Fleet Duty** action; journey end, rest, temporary stop, double-manning changeover and ferry mode have independent meanings and MUST NOT silently end a lawful work recording or restart private tracking.
- Once duty ends, stop fleet-side location/movement monitoring, reporting, fleet-identifying logs and new fleet record capture; stop foreground services and scheduled work appropriate to that duty. Fleet app must not auto-restart location monitoring during personal travel.
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
3. Start fleet duty, exercise walkaround/report/photo, end duty: only fleet work records go to correct fleet; any delayed upload contains only prior work files.
4. After End Fleet Duty, drive privately immediately, including background app/BT auto-connect/reboot: no fleet tracking, messages, or new records; core protection works through Private.
5. Shift/break/ferry/double-manning transitions still follow approved ROAD 1ST behaviours.
6. Two phones/two drivers/two fleets: no cross-fleet/private data leakage; managers cannot retrieve Private activity.
7. All relevant privacy notices, separate terms and fleet agreement acceptance logged server-side with version/time.
8. Switching or suspension never falsely marks records as deleted; fleet handover remains separately auditable.
