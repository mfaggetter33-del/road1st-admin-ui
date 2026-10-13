# ROAD 1ST — Fleet handover and retention policy (implementation specification)

**13 OCTOBER 2026 STATUS UPDATE:** Offboarding, cloud retention schedule approvals, storage-object deletion and data-subject request handling are **not signed off as operational**. All six internal retention categories are still under review and historical unassigned test files await owner-approved, verified cleanup. See [current security/GDPR master checkpoint](https://github.com/mfaggetter33-del/driver-safety/blob/main/docs/ROAD1ST_SECURITY_GDPR_CHECKPOINT_2026-10-13.md).

---

Date: 2026-10-10
Status: REVIEW / NOT YET PRODUCTION-READY

## Commercial rule
A free trial, or a one-month paid subscription, does not include 3 years of ROAD 1ST-hosted storage merely because the fleet operator has statutory record-retention duties. The fleet operator must receive and safely preserve its records for the required time after leaving. ROAD 1ST acts as processor of fleet operational personal data when acting on the fleet customer's instructions; assess other controller roles separately.

## Irish operator legal retention — initial verification
- In-scope mobile road-transport working-time records: 3 years, S.I. 36/2012 Regulation 12 as amended by S.I. 49/2015. https://www.irishstatutebook.ie/eli/2015/si/49/made/en/print
- Tachograph original driver card and vehicle unit records: at least 12 months, RSA guidance; raw tachograph data must remain available. https://www.rsa.ie/services/professional-drivers/tachographs-information/driver-tachograph
- Commercial vehicle inspection, maintenance and repair records: at least two years from creation, RSA / S.I. 348/2013. https://www.rsa.ie/help-support/online-support-centre/details/commercial-operators-tachographs-and-driver%27s-hours/commercial-vehicle-maintenance/what-records-do-i-need-to-keep-and-for-how-long
- ROAD 1ST's own Irish tax/accounting records: generally six years; distinguish our invoices from fleet operational records. https://www.revenue.ie/en/starting-a-business/starting-a-business/keeping-records.aspx
- UK and other EU countries require country-specific retention review before commercial rollout.

## GDPR
The fleet contract/DPA must specify controller and processor roles, instructions, record categories, security, subprocessors, return/deletion at the controller's choice, legal hold exceptions and treatment of backups. After transfer, ROAD 1ST's processor and independent-controller obligations do not simply disappear retroactively. https://dataprotection.ie/en/organisations/know-your-obligations/controller-and-processor-relationships

## Required end-of-service process
1. Identify customer by immutable fleet ID, NOT just a company display name.
2. Suspend paid fleet-management permissions, but preserve ROAD 1ST driving protection and grant a narrowly scoped offboarding view.
3. Gather all scoped records and supporting ORIGINAL files: app reports, journeys, working time logs, receipts/photos, defect reports/photos, fleet events, vehicles, drivers, and policy settings. Never imply that ROAD 1ST-generated logs replace raw tachograph records. Include a manifest of counts and SHA-256 hashes.
4. Fail a handover as INCOMPLETE if attachments are missing, unmatched, or an export-size cap is exceeded.
5. Deliver a complete secure package, or indexed multipart packages, solely to a verified authorised representative of that fleet; customer verifies package checksums.
6. Capture the authenticated customer representative's name/account, time, export identifier/digest, and affirmative statement that the data has been downloaded, checked and securely stored.
7. Permit OWNER-ONLY deletion authorisation after checking no fresh records, ongoing services, disputes, legal holds or other lawful obligations. Implement actual deletion only after end-to-end technical validation; a consent click alone does not delete data.
8. Delete scoped rows and storage objects, including relevant backup copies when due under a documented schedule. Preserve only the minimum legally necessary evidence of handover, audit, payment and applicable legal holds, with separate retention rules.
9. Verify deletion completion and issue a certificate distinguishing live-data deletion, backup expiry and any exceptions. Never mark 'deleted' until verified.

## Existing system observations / boundaries
- We currently have a private Supabase table: public.road1st_fleet_handovers, with RLS enabled and no direct public row policies. It provides a future audit state, not a finished export or purge.
- Older pilot uploads may be unlinked to a fleet ID; exclude historical pilot uploads from initial customer handover testing only. New commercial uploads MUST link fleet ID reliably.
- Existing fleet suspension must never be presented as deletion.
- The offboarding exporter, customer receipt experience, verified file purge and backup deletion are NOT IMPLEMENTED yet.
- Do not run deletion against the current pilot or customer data as part of development.

## Required acceptance tests
- 1 customer, 2 customer datasets: A's export contains none of B's IDs/records/files.
- Existing suspended customers can access only their own handover, no ordinary fleet management.
- Export includes all attachments, raw records, structured data and validation manifest.
- Missing file, count change, legal hold, unsigned/unacknowledged receipt or pending upload: deletion blocked.
- Customer sign-in verifies receipt; ROAD 1ST owner cannot impersonate customer acknowledgement.
- Verified purge removes only the one fleet's records and storage files, handles retries/idempotency, confirms backup policy.
- Owner dashboard shows stage PREPARED > DOWNLOADED > RECEIVED > DELETION-APPROVED > DELETED; never conflate status.
- GDPR/controller-processor agreement and standard customer offboarding language reviewed by Irish counsel before publication.
