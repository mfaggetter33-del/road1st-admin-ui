# ROAD 1ST — Agency Driver Auto-Assignment and Double Manning Separation
Date: 11 October 2026. **PROPOSED DESIGN — NOT IMPLEMENTED.** No production data or code was changed by this document.

## Core privacy guarantee
A driver identity belongs to the driver, not permanently to a transport company. A company's ability to receive ROAD 1ST work events depends on a *time-limited, verified, explicit assignment* and individual Fleet SOS/EOS work shifts. Previous company enrolment must never follow a driver into a job for another company. Private journeys remain private, including on a fleet-enrolled phone.

## Current architecture / gap (verified against read-only database schema 11 October)
Existing Supabase tables include road1st_fleets, road1st_fleet_vehicles (fleet_id, registration, active), road1st_fleet_drivers (fleet_id, app_driver_id, active), road1st_fleet_devices (fleet_id, driver_id, install_id, device_secret_hash, revoked_at), and road1st_fleet_events. Existing upload endpoints have resolved fleet ownership by the installation ID. This is appropriate for a basic first pilot but **not** reliable cross-company agency employment or scoped SOS/EOS authorisation.

## Proposed booking model
- **Driver identity:** stable personal ROAD 1ST profile, separate from any company's access. Minimise tachograph card identifiers; only use where lawful and required.
- **Fleet assignment:** server-authorised ID, fleet/company ID, driver ID, optional agency booking reference, date range, status (pending/accepted/active/expired/revoked), approved vehicles or vehicle pool, who authorised, and revocation history.
- **Shift:** unique server-issued SOS/EOS session, assignment ID, fleet ID, driver ID, actual selected vehicle/registration, starting/ending timestamps and double-manning participants/roles. Each record retains immutable ownership by its particular authorised shift.
- **Vehicle:** match registration to fleet vehicle table *and* time-valid operator authorisation. A registration alone is not identity, not proof of employment and not a valid permission to transfer records; vehicle hire/change of operator needs date-effective fleet assignment.
- **Crew:** Double Manning has two independent driver identities, role changeovers and potentially two separately linked devices, but one agreed operating-fleet job. An agency member exiting the crew ends only their own assignment/shift. Co-driver card withdrawal does NOT trigger automatic EOS.
- **Fleet-side access:** an authenticated transport manager may add, extend, revoke or remove an agency driver in bulk. They may create a booking for 1 day or multiple weeks. Driver joins once per assignment, ideally by a one-time QR/deep link, rather than manager re-enrolling each day.

## Driver workflow
1. Company A manager issues an agency booking for 14 days (date window illustrative). Driver accepts QR link on their own phone.
2. Driver selects Fleet Company A and the authorised truck, presses explicit SOS, completes walkaround, drives. No automatic fleet capture just because Bluetooth or tachograph recognises the vehicle.
3. During booking, each new day begins with deliberate SOS; EOS ends that day's company capture. Work records generated inside the session can upload later via any normal Wi-Fi, including after the booking expires.
4. Booking expiry blocks new Company A Fleet shifts. Revoke/expire company access; do not delete legitimate previous work reports. Give safe warning before expiry/overrun and seek renewed authorisation, without unilaterally backdating records.
5. When the driver next joins Company B, the app requires a *different* authorised assignment, and offers a separate explicit SOS. Company A must have no access to Company B reports or the driver's Private journeys. If no valid assignment, remain Private.
6. If the manager revokes assignment early, end future Company A capture and prevent silent reactivation. Handle ongoing journeys safely: do not distract the moving driver; postpone UI prompt until stopped and fail closed for further fleet data collection.

## Automation tiers
- **Now:** manager makes one time-limited invitation/QR per booking; automatic expiry or manual revocation; use existing vehicle registration list for confirming operator; driver SOS each shift. Provide a simple 'Agency Drivers' view and bulk import if needed.
- **Later with provider API:** verified card number/card-in/out, vehicle unit/registration, company-card rights and event timestamps could suggest correct assignment. Supplier must prove reliable near-real-time availability and role-specific identities before any automatic matching. User explicitly accepts Fleet SOS; never activate by movement/card alone.
- **Possible vehicle convenience:** company-provisioned cab QR or approved Bluetooth device can help select a vehicle, but must never replace assignment authorisation or enable surveillance by itself.

## Upload contract required for production
An immutable fleet report/receipt/photo includes authorised assignment ID, shift ID, driver ID and fleet owner at creation; server validates identity and shift/assignment time, device credentials, record creation bounds and vehicle-company mapping before accepting. Support legitimate delayed Wi-Fi uploads after EOS/booking expiry. Use revocable, fleet-scoped credentials; an install ID alone is not authority. Reject any private, unclassified or cross-company data rather than attributing it to last employer. Check mixed-agency crew and vehicle reassignment cases. Server must never expose records across fleet IDs.

## Tachograph legal/GDPR distinction
The actual card and vehicle unit can contain records relating to previous work/operators. Do NOT import/upload a whole historical driver-card file to whatever company owns the currently selected truck. Scope records by operator and contractual responsibilities. Professional tachograph download obligations remain with the responsible undertakings; ROAD 1ST is not currently an approved substitute. Controller/processor arrangements, agency relationships, cross-company driver rights and data retention need legal review.

References: CVRT https://www.cvrt.ie/en-US/Operator-Driver-Obligations/Driver-and-company-cards/ ; Irish DPC https://dataprotection.ie/en/dpc-guidance/employer-vehicle-tracking

## Preconditions and release tests
- Two companies enrol same agency driver sequentially; verify earlier fleet has zero access to later records, even with old link or same phone and Wi-Fi.
- Company A driver works paired in Double Manning; role changes/co-driver phone disconnect never transfer work to Company B or trigger false shift EOS.
- Vehicle reg moves from A to B or hired to B; require date-effective operator authorisation; never route by registration alone.
- Agency booking expires with pending reports: upload existing work-only records to A later, but create no new A events.
- Driver can enter Private after EOS and keep phone blocking without company uploads; reinstall/reboot/BT reconnect cannot reopen a fleet shift.
- Revocation mid-trip must not present distracting UI; protected fail-closed behavior and server enforcement.
- Audit with test-only data and review privacy notices, manager rights and application consent before production.

**Decision required before implementation:** approve time-limited assignment as the source of company access and confirm manager workflow. Existing Android pilot 2.99.4, Private/Fleet test 2.99.5, live Edge Functions and approved landing artwork remain unchanged by this design note.
