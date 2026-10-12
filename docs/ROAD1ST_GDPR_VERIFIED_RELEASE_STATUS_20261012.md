# ROAD 1ST — GDPR completion and security gate
**12 October 2026 | Owner-controlled test fleets only | Technical progress and sign-off boundary**

## Verified now
- Live database review: 20 ROAD 1ST tables checked; no direct anonymous SELECT access to them and no authenticated TRUNCATE permissions. Privileged ROAD 1ST public SQL functions are not executable directly by anon/authenticated; no public SQL views found in review.
- Earlier transactional production fix removed excess report-table permissions. Data counts remain **219 reports, 10 fuel receipts and 6 defect photos**.
- Uploaded fleet report, receipt and defect storage buckets are private. Live and staging Supabase projects identify the Ireland region (eu-west-1).
- All three **staging** upload APIs passed synthetic enrolled-fleet creation/retry, wrong-secret, unregistered device and cross-fleet ID misuse tests; not yet the deployed live versions.
- Restricted staging GDPR review includes six separate record categories and a non-deleting age preview. Added and transaction-tested rights-request/audit and per-record legal hold/release controls. After rollbacks **zero** requests, holds or approved deletion rules remained and synthetic files were preserved.
- Existing signed Android 2.99.23 manifests declare disabled OS backup and cleartext transport, foreground-location and explicit usage/overlay permissions. Source scope checks prevent private/unscoped records being sent to fleet uploads. Actual handset behaviour is not yet reverified.

## Documents prepared and saved
1. `ROAD1ST_DPIA_WORKING_ASSESSMENT_20261012.md` — project-specific risks and mitigations; controllers must review.
2. `ROAD1ST_RECORD_OF_PROCESSING_ACTIVITIES_20261012.md` — controller/processor data inventory (Article 30).
3. `ROAD1ST_PRIVACY_RIGHTS_BREACH_OPERATING_PROCEDURE_20261012.md` — rights request/deletion/legal-hold/incident SOP.
4. `ROAD1ST_FLEET_DPA_WORKING_DRAFT_2026-10-12.md` — Article 28-style company processing terms awaiting contracting identity and legal review.
5. `ROAD1ST_GDPR_RELEASE_PACK_2026-10-12.md` — GDPR release checklist.
6. `ROAD1ST_PRIVACY_NOTICE_ADDENDUM_20261012.md` — accurate Private Fuel Receipt/hosting-region note.
7. `ROAD1ST_FLEET_REPORTS_MANAGER_GUIDE.md` — reporting/export user guidance.
8. Driver-safety GitHub PRs #17 and #18 — tested retention review, rights and hold SQL.
9. `ROAD1ST_ANDROID_LOCAL_PRIVACY_AUDIT_20261012.md` — reviewed device permissions and local unscoped queue risk.

## Remaining gates that prevent an honest GDPR sign-off
**Legal and account:** ROAD 1ST Owner Portal compliance profile has an organisation label but owner email, privacy contact email, compliance contact email, technical email and Play Console contact email are unfilled. Confirm actual contracting entity and postal address, complete lawful-basis and staff transparency assessments, obtain fleet-controller DPIA and DPA sign-offs, review vendors/subprocessors and transfers.

**Technical:** Stage-only verified upload authentication must be coordinated into live with an offline-compatible *genuine fleet shift* attestation; two separately authenticated manager accounts must prove cross-fleet denial and manager revocation; live images and signed links must be tested. Implement approved category-specific retention and coordinated Storage-API/database/backup deletion with holds. A rights register and read-only preview are **not yet operational erasure**.

**Mobile:** Review stored unscoped/legacy private report, fuel and defect files, which are protected from fleet upload but can persist locally without time-based cleanup. Verify no private GPS or app-use reports leak via logs, on-device queue, permission prompts, Wi-Fi or diagnostics. Complete final Android hardware and Google Play privacy/permission testing.

**Breach and records:** Establish and test a real notification inbox and incident escalations. Run an authorised real-world subject access request, correction, approved export/deletion or justified retention case. Confirm source-of-record classifications and backups.

**Budget-deferred risk:** Supabase compromised-password screening remains disabled by the owner's conscious budget choice until customer funding; do not falsely mark it enabled. Independently review normal reset, MFA, session revocation and rate limits.

## Release decision
**Technical groundwork and drafts substantially advanced; ROAD 1ST is NOT GDPR-certified, not complete for paying-customer rollout, and no legal sign-off has been issued.**
The Android and portal production deployments remain unchanged by the latest GDPR rights/hold work; only the previously verified live table-permission fix was made.

Sources:
- Irish DPC employer vehicle tracking: https://dataprotection.ie/en/dpc-guidance/employer-vehicle-tracking
- Irish DPC DPIA: https://www.dataprotection.ie/en/organisations/know-your-obligations/data-protection-impact-assessments
- Irish DPC controller/processor: https://dataprotection.ie/en/organisations/know-your-obligations/controller-and-processor-relationships
- Irish DPC transparency: https://www.dataprotection.ie/en/organisations/know-your-obligations/transparency
- Supabase Storage deletion: https://supabase.com/docs/guides/storage/management/delete-objects
