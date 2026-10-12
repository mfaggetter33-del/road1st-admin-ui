# ROAD 1ST privacy notice review — 12 October 2026 addendum
**Internal accuracy corrections only. NOT a published privacy notice.**

This note supplements, rather than overwrites, `road1st-private-fleet-privacy-notice-REVIEW-2026-10-10.md`.

### Private Fuel Receipt behaviour
In the signed Android 2.99.23 source, the Private-mode Fuel Receipt button is visible to explain that fleet-only recording is available for fleet customers. Private mode cannot proceed to the fuel camera, create a new private receipt queue item or upload it to the fleet account. Earlier pilot versions had different behaviour and historical unassigned pilot files remain in the database until independently reviewed. The Private-mode button is an information feature, not an opt-in to store fuel data.

### Verified region, remaining transfer assessment
ROAD 1ST's live and staging Supabase projects both report **eu-west-1 (Ireland)**. Uploaded report/receipt/defect object buckets are private. Project region does NOT establish the locations of email delivery, payment, domain/CDN, debugging, backups or all other subprocessors: inventory and contract/transfer checks still required.

### Legal and technical dependencies
The user has no paying fleet customers yet, and both existing fleets are owner-controlled pilots. That does not remove privacy obligations relating to test drivers or location data. Staff notices, publisher entity/contact, Data Processing Agreement, DPIA screening, lawful basis, rights handling and tested retention/deletion remain open.

### Storage retention and official records
The owner has selected three-year hosting of applicable fleet work records as the intended service design, but no automatic verified retention/erase job is yet running in the live database. Applicable mandatory retention periods differ across driver working time, raw tachograph originals, vehicle maintenance records, tax/finance information and incident/legal-hold material; do not auto-purge on a single date.

### Publishing gate
Do not publish this addendum as a warranty that every active device/build and Edge Function already complies. Confirm that live uploads authenticate the enrolled device and the actual company shift, then test Private/Fleet and EOS behaviour, customer tenant isolation and deletion before approving legal copy.

Related internal drafts:
- `ROAD1ST_GDPR_RELEASE_PACK_2026-10-12.md`
- `ROAD1ST_FLEET_DPA_WORKING_DRAFT_2026-10-12.md`
- `fleet-offboarding-retention-2026-10.md`
