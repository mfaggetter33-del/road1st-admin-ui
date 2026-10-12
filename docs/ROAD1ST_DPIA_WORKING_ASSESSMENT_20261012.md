# ROAD 1ST — Data Protection Impact Assessment (DPIA), working assessment
**12 October 2026 | Internal confidential draft | Not approved or signed**

## Scope and screening decision
ROAD 1ST aims to prevent driver distraction through a phone-based driving lock, and optionally provides fleet work records including journey events, shift start/end, walkaround evidence, fuel photos, device identifiers and location/speed diagnostics. Private mode is intended to remain separate from fleet work records. Fleets may be employers and drivers may not freely consent to monitoring. **Treat deployment of fleet location/work-activity features as a DPIA-required/high-risk project until a qualified controller review concludes otherwise.** The Irish DPC's Employer Vehicle Tracking guidance specifically describes high interference risks and recommends a DPIA where location monitoring is intended.

## Controller/processor responsibility
Fleet employer: typically controller for identifiable employee fleet events; must document Article 6 lawful basis, necessity/proportionality, fair processing, purpose limits, staff notice and rights arrangements. ROAD 1ST: generally processor for work records under Article 28 instructions and may be a separate controller for its own accounts, platform security and billing. Private-mode safety data requires its own verified data-flow and controller determination, not automatic fleet-controller attribution.

## Processing inventory (needs final data-flow instrumentation)
| Flow | Input | Recipients | Retention and uncertainty |
|---|---|---|---|
| Private safety lock | On-device movement/location, selected apps, foreground usage indicators, Bluetooth state, driver interactions | Driver device only **intended** | Confirm actual diagnostic capture and SDK/logging; never assume no data merely because fleet upload is disabled |
| Fleet shift | Fleet/device/driver/vehicle IDs, SOS/EOS, activity clocks, journey/GPS events and metadata | Authorised fleet managers and ROAD 1ST limited operations | Employer-approved working-time policy as applicable; may need statutory originals separately |
| Walkaround and defect | Registration, mileage, inspection choices, defect notes/images | Authorised fleet records | Determine maintenance/claim/legal hold category independently |
| Fuel | Registration, litres, odometer, card label and photograph | Authorised fleet records | Finance/tax retention rules to be approved; no Private recording in current target APK |
| Access/security | Emails, authentication, logs, IP/device identifiers, session and audit events | ROAD 1ST operational contacts, approved vendors | Purpose and category period to be set |
| Web interest and enquiries | Contacts and enquiry details | ROAD 1ST only and communications vendor | Disclose lead collection and define response/deletion |
| Device and cloud backups | Potential copies of local queue and hosted objects | OS/backup and approved provider | Verify backup availability, expiry and restore testing |

## Risk assessment (initial, not owner acceptance)
Use H=high, M=medium, L=low to prioritise. Ratings are qualitative engineering estimates, not a legal risk certificate.

| Risk | Inherent | Current or staged safeguard | Residual / gate |
|---|---|---|---|
| Driver tracked after EOS or in Private mode | H | Fleet record ledger and selected-mode checks in Android 2.99.23; staged device-credential uploads | **H/open** until phone, delayed queue, logs and server-side genuine shift proof pass |
| Different company accesses another company's records | H | Tenant-filtered fleet API, private object storage, staging synthetic upload isolation | **H/open** until two genuine Fleet Portal logins and signed-url/revocation negative tests |
| Employee tracking reused for general performance monitoring | H | Intended safety/work limitation and draft privacy wording | **H/open** until controller legitimate-basis assessment, staff notice, manager policies and contracts |
| Long-term location or images over-retained | H | Internal staging category preview, holds and rights register; no active purge | **H/open** until periods approved, tested storage/backup erasure implemented and monitored |
| Lost/stolen phone exposes queued images or identity | H | Encrypted device credentials, PIN and restricted queue scope in reviewed source | **M–H/open** until Android backup, filesystem/lock-screen and recovery tests |
| Misleading speed/work-time evidence | H | Original report kept; GPS not described as certified tachograph | **M–H/open** until clock accuracy, timezones, labels and source exports validated |
| Compromised manager session or phishing | H | Supabase authentication, owner/fleet role checks in server source | **M–H/open** until MFA/session revocation/reset/permissions tested; compromised-password screening deferred by budget |
| Third-country transfer or undeclared subprocessor | H | Live and staging Supabase region verified eu-west-1 | **M–H/open** until email/CDN/backup/analytics/payment subprocessor contracts and transfers recorded |
| Exposure through downloads/printed PDFs | H | Short-lived signed URLs in API code; staging printable clone removes external resources | **M–H/open** until actual two-account access, screen/PDF print, link expiry and local download controls verified |
| Accident/incident evidence deleted in error | H | Staged legal holds block eligibility in dry-run | **M/open** until authorised live release and deletion audit workflow established |

## Necessity and proportionality gates
- The app must prove that navigation/emergency handling can coexist with safety restriction without unnecessary GPS retention.
- No default fleet visibility into Private journeys; avoid persistent personal journey data collection.
- Only capture photos for declared defects/fuel transactions, with users in control of these actions and clear notices.
- Minimise driver metadata, remove content fields that are not demonstrably necessary and restrict managers by company.
- Respect work/non-work boundaries and retain employer statutory records only for an approved, classified purpose, never a blanket period.
- Offer employee notices before rollout and rights routes for inaccurate events, accessible reporting and justified legal hold.

## Legal basis and balance assessment (controller to complete)
- Each fleet employer must select and document Article 6 legal basis separately for safety, mandatory driving/working-time records, maintenance/defects, finance/fuel and any GPS history. Do not treat employee consent as a default lawful basis because of employment power imbalance.
- Where legitimate interests are selected, complete a necessity/balancing assessment and record less intrusive alternatives.
- Record whether special-category/child data could appear incidentally in images or notes and mitigate immediately.

## Residual-risk decision
**Decision: NOT READY FOR CUSTOMER DEPLOYMENT.**
Prior to launch: confirm legal contracting entity/contact; fleet DPIA and staff notices; signed controller–processor terms; server-authorised shift proof; independent fleet-account isolation; category retention/backup erasure; live phone tests; cookie/SDK audit and valid privacy policy.
Owner/controller signatures, review dates, purpose-specific lawful bases and actual supervisory-authority consultation where necessary remain blank by design.

Sources:
- https://dataprotection.ie/en/dpc-guidance/employer-vehicle-tracking
- https://www.dataprotection.ie/en/organisations/know-your-obligations/data-protection-impact-assessments
- https://dataprotection.ie/en/organisations/know-your-obligations/controller-and-processor-relationships
