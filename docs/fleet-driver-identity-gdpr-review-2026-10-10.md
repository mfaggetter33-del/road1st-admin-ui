# ROAD 1ST — Fleet Driver Identity / Tachograph GDPR Review
Created 10 October 2026. Status: legal and engineering specification only — NOT a legal opinion, no new storage or provider integration activated.

## Business rule
ONE app with Private and Fleet modes. A driver may use a personally owned phone enrolled with a fleet, but an employer must never receive their private journey history. Deliberate Fleet SOS starts a fleet shift BEFORE walkaround; walkaround time is Other Work. Explicit EOS stops NEW Fleet recording. After EOS, Private driving protection can operate with transient local sensing, not a ROAD 1ST cloud journey archive. Do not conflate the continuing retention of lawful PRE-EOS work records with new tracking after EOS.

## Personal data needed for Fleet compliance — proposed minimum
- Fleet-scoped internal driver ID, driver name, authenticated company membership. Driver's tachograph card identifier/number ONLY if supplier matching and the company's lawful compliance purpose actually require it (and potentially a pseudonymous provider ID in preference to full number).
- Work session ID, SOS/EOS timestamps, work activity periods, relevant vehicle/unit registration, fleet ID, and provider event ID/source for auditability.
- Authentic tachograph data/derived working-time details only to the extent the fleet operator is authorised and needs it. A provider feed may include historical data or other employers' shifts; filter by appropriate authorised controller/period and do not blindly replicate the entire card. Don't mistake asynchronous sync after EOS for permission to collect PRIVATE journeys.
- Keep employer lawfully required original raw tachograph downloads only if explicitly in the contracted scope. ROAD 1ST currently has NO live tachograph API and must not promise that it preserves legally sufficient source evidence.
- No personal driving history, private phone route traces, personal-call/message contents, contacts, private photos, or general unrelated app use to fleet.

## Who controls the personal data?
- Fleet operator will normally be controller of its employees' operational driving/working-time data: defines purpose, sets retention and authorised viewers.
- ROAD 1ST will normally act as processor for hosting/reporting that fleet data on documented instructions, subject to a GDPR Article 28 data processing agreement (DPA). ROAD 1ST may separately act as a controller for its own billing, accounts, support/security obligations: identify these separately in notices, do not assume all processing is processor-only.
- Data source/provider may be a separate processor/subprocessor/controller; obtain written roles, data flows, subprocessors, host regions, API retention and breach process BEFORE integration.
- Employee sign-in/acceptance documents that they have received notices and app terms; it should not be claimed that employment monitoring is lawful just because the driver ticks a consent box. Fleet employer must select and document a valid GDPR Article 6 lawful basis for each processing purpose. Statutory tachograph duties and proportionate legitimate interests may be relevant, but require scope-specific assessment.

## Required legal documents and operational safeguards
1. Privacy notice for Private mode and specific Fleet Driver Privacy Notice, listing exact categories (including card numbers if collected), purposes, controller contact, lawful bases, rights, recipients, source, cross-border transfers, retention, SOS/EOS scope, and employer's access boundaries.
2. Fleet Customer Agreement + Data Processing Agreement between operator and ROAD 1ST (GDPR Article 28), detailing instructions, subprocessor approvals, confidentiality, access security, breach handling, data subject requests, retention, export and end-of-contract verified deletion. Terms alone do not replace the DPA.
3. Controller-led data protection impact assessment (DPIA) of employee tracking BEFORE scaled fleet use; include phone personal-use and location/service offboarding tests.
4. Protect driver/card identifiers as personal data: access scoped to correct fleet/driver, role-based permissions, encryption in transit/at rest, audit access, don't put full identifiers in client logs/support views or URLs, least-privilege, breach response. Merely hashing an identifier doesn't necessarily remove GDPR applicability.
5. Record acceptance of versioned app terms and notices; driver must be informed, but no blanket waiver of rights.
6. Driver privacy switch: no Fleet SOS = no fleet collection. EOS terminates fresh fleet capture and monitoring. No Bluetooth, restart, movement, fleet enrollment or backend sync may silently reopen an ended Fleet shift. Pending PRE-EOS valid work records may upload later with original shift metadata only; never mix new Private events.
7. Apply retention per DATA CATEGORY and fleet controller instruction. RSA says driver card / vehicle unit raw downloads retained at least 12 months by operator; Irish working-time records may require 3 years, whereas ROAD 1ST business tax records have a separate retention period. End-of-contract handover cannot extinguish ROAD 1ST's independent applicable statutory and GDPR responsibilities.
8. Need explicit record boundary and filtering for agency drivers working for multiple companies, plus provider data that may contain historical activity outside the fleet's legitimate scope.

## Provider questions for Monday
- Which identity fields are actually provided: driver full name, tachograph-card number, driver country, card expiry, driver licence number, vehicle ID, company ID? What is REQUIRED for matching as opposed to optional?
- Does API return card downloads and historical data for unrelated operators? Can the feed be restricted to one fleet's authorised period?
- Can card-in/card-out be linked to verified driver/vehicle in near real time? Latency, duplicates, missed events and relevant timestamps?
- Does an API client have to store full card numbers? Is a stable provider-side pseudonymous identifier available?
- What provider roles, DPA, subprocessor list, data retention, legal access restrictions and hosting region apply?
- Will ROAD 1ST be allowed to display/export original legally admissible raw tachograph files and would the fleet still need its separate source-system archive?
- Cost per driver/company/vehicle and pilot access.

## Primary official references (check latest before commercial rollout)
- DPC Employer Vehicle Tracking: https://dataprotection.ie/en/dpc-guidance/employer-vehicle-tracking
- DPC Controller-Processor Relationships: https://dataprotection.ie/en/organisations/know-your-obligations/controller-and-processor-relationships
- DPC Data Minimisation and purpose limitation: https://dataprotection.ie/en/organisations/data-protection-basics/principles-data-protection
- DPC DPIAs: https://www.dataprotection.ie/en/organisations/know-your-obligations/data-protection-impact-assessments
- RSA Driver Cards: https://www.rsa.ie/services/professional-drivers/tachographs-information/driver-tachograph
- EU Tachograph Regulation 165/2014: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0165

## Release gates
Privacy claims about zero private-cloud journey data must be technically verified in Android uploaders, backends, app analytics and queued uploads BEFORE publication. Driver identity data model and retention/deletion flow require Irish GDPR legal review before commercial fleet release. No production database fields or driver card numbers added by this document.
