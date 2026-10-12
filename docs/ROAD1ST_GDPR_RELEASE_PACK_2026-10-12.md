# ROAD 1ST — Fleet and Private Driver GDPR Release Pack
**Prepared 12 October 2026. Technical evidence + publication checklist. DRAFT: not approved legal advice.**

## Current position
The two currently registered fleet accounts belong to the ROAD 1ST owner and are pilot/test environments, not paying customers. Test status reduces deployment impact; it does **not** make driver identity, vehicle registration, location, images, installed-app details, or account emails non-personal data.

The Android product has Private and Fleet modes. In current 2.99.23 source, the Private-mode Fuel Receipt button is for information only and cannot save a new private fuel receipt. The fleet function requires an authorised fleet shift. Never infer every earlier APK behaves the same; historical pilot report, fuel and defect rows exist without fleet IDs.

## Data inventory to disclose and verify

| Purpose | Possible data | Owner/controller analysis | Storage and safeguards | Status |
|---|---|---|---|---|
| Private road-safety lock | Temporary movement/speed, foreground app/package identifier, Android permissions, Bluetooth state | ROAD 1ST determines the product safety purpose; define controller purposes if any account/diagnostic data remains | On-device processing intended; verify private-mode upload and logging in full end-to-end tests | Not signed off |
| Fleet work reporting | Fleet ID, driver/vehicle, work/journey events, shift and break times, location/speed diagnostics, GPS quality, timestamps | Fleet operator normally controller for employment/work data; ROAD 1ST generally processor acting on their documented instructions | Fleet-scoped storage, restricted access, client identity/shift verification required | Cross-fleet and upload validation open |
| Fleet receipts and defects | Registration, odometer, litres, fuel-card label, notes, photographs and metadata | Fleet operator typically controller | Private storage buckets; signed view/download access; on-device queue removed on acknowledged upload | Real fleet-scoped examples and signed-link tests open |
| Platform security and billing | Account, email, authentication, sessions, device ID, payment, access/audit records, support requests | ROAD 1ST may be separate controller for some purposes; specify roles | User-bound access, time limits, audit and deletion/retention by category | Final inventory and retention checks open |

No private message/call contents should be accessed or uploaded. This is an intended feature boundary that must be verified on released phone builds and server logs before publication.

## Driver-facing Private/Fleet explanation — approved wording still needed

**PRIVATE** is for personal journeys. ROAD 1ST may use location/motion and app-usage signals on your phone to help reduce driver distraction. Selecting Private must not give a fleet manager your private journey history. The Fuel Receipt button can show fleet features but does not create a personal receipt record in Private mode.

**FLEET** is for authorised company work. Selecting Fleet and deliberately starting the company shift allows work-related reporting and permitted evidence for that company. If the journey/report is queued until Wi-Fi, it may upload after the driver has gone home, but it remains a prior authorised fleet record. Ending the shift must stop collecting new company work records. The employer must not gain private-journey access.

Avoid absolute claims such as “no personal data collected” or “GDPR compliant” until real-device, upload, deletion and contracts are verified.

## Irish GDPR/legal release checks
- [ ] Identify the actual registered legal entity, registered business address, published privacy contact inbox and support contact.
- [ ] Agree fleet controller / ROAD 1ST processor terms, including Article 28 GDPR data-processing agreements, subprocessors, geographic storage/transfers, breach reporting and security measures.
- [ ] Fleet employer provides advance employee notices specifying exactly what vehicle location/work data is tracked, when, why, access rights and retention. Do not present GPS as blanket staff-performance surveillance.
- [ ] Fleet operator completes a DPIA screening, with full DPIA where likely high risk. Document proportionality, Private mode, access, rights, revocation, device replacement, inaccurate speed records and account compromise.
- [ ] Legal review retention category by category. Irish mobile-road-transport working-time records covered by amended S.I. 36/2012 Regulation 12(e) must be kept **at least three years**; different obligations apply to tachograph/maintenance/accounting and other records. Do not assume all data must be held for three years.
- [ ] Implement and verify real retention/deletion, backup handling, a test access request, correction, export, authorised handover, legal holds and incident escalation; documents alone are not the implementation.
- [ ] Confirm account recovery/confirmation, password policy, organisation and individual MFA, session revocation; paid breached-password screening remains deferred by owner budget decision.
- [ ] Complete current Google Play Data Safety declarations and special-permission justifications from actual phone+server flows.
- [ ] Translate the legally approved master notices carefully, and version them. A portal UI translation is not approval of legal language.

## Technical evidence — 12 October
- Live database has RLS enabled across ROAD 1ST tables; server-only tables intentionally lack client policies. Report, fuel and defect buckets are private.
- Database permission fix `road1st_reports_revoke_excess_authenticated_privileges_20261012` verified: 219 report rows unchanged, SELECT/INSERT retained for authenticated users, UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES revoked.
- Live data snapshot: 219 reports, 19 fleet-scoped; 10 fuel receipts and 6 defect photographs were pilot/unassigned. No 12 October report had been received at inspection time.
- Live upload functions still need proven per-device credentials and authorised shift binding; authorised fleet isolation tests must use independent test users/companies.
- Live automatic database/store/backup retention purge not yet verified.

## Fleet-manager document and report release checks
- [ ] Authenticated report preview and original download under one fleet; deny another fleet's records.
- [ ] Validate fuel/defect photo preview using future fleet-scoped sample data.
- [ ] Existing jsPDF export is English-only. Optional browser-native Print / Save as PDF in fleet manager language has source CI validation but remains review-only, requiring print visual checks.
- [ ] Never claim ROAD 1ST GPS speeds are legally certified tachograph readings.
- [ ] Export original documents, audit trail and attachment hash manifest during an authorised customer handover.

## External primary sources
Irish Data Protection Commission employer vehicle tracking: https://dataprotection.ie/en/dpc-guidance/employer-vehicle-tracking
Irish road transport retention amendment: https://www.irishstatutebook.ie/eli/2015/si/49/made/en/print
Supabase database security: https://supabase.com/docs/guides/database/postgres/row-level-security
GDPR controller/processor guidance: https://www.dataprotection.ie/en/organisations/know-your-obligations/controller-and-processor-relationships

**Release gate:** owner legal/contact details, independent legal review as appropriate, verified upload auth, retention jobs, role isolation, signed report delivery, and device/privacy tests. This document is a detailed preparation pack, not a GDPR certificate.
