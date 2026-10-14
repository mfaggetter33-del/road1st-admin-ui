# ROAD 1ST — Handover & Close Account (14 October 2026)

## Implementation
- **Frontend:** `handover.html` linked from the existing `owner.html` company details and `index.html` fleet enrolment section.
- **Backend:** Supabase Edge Function `road1st-fleet-handover-api`, source in `index.ts` (deployed version 3). JWT verification enabled, then independent Supabase Auth `getUser()`, per-fleet manager membership or separate ROAD 1ST platform-owner role.
- **Audit ledger:** private RLS-backed `public.road1st_fleet_handovers` table. One unfinished handover per fleet. The live migration `road1st_fleet_handover_secure_workflow_20261014` adds export and approval columns, private `road1st-handover-packages` Storage bucket, and service-role-only `road1st_handover_blockers(uuid)` RPC.
- **Asset publication:** GitHub Pages deploy workflow includes `handover.html`, portal language/link regression and static workflow checks.
- **Mode:** staged, no automatic deletion, no unauthenticated export or delete endpoint.

## Workflow / authority
1. **Status:** owner or authorised fleet manager reads only their company's handover progress.
2. **Prepare:** platform owner only; collects complete fleet-scoped source rows and original Storage files; computes per-file SHA-256 and a package ZIP hash; aborts on missing/corrupt files, row-count, raw-size or ZIP-size limit. Package is stored in a private bucket, not a publicly shared URL.
3. **Download:** manager or owner fetches private package via authenticated Edge Function. The browser calculates the SHA-256 and refuses a mismatched download. Export served-at time is recorded; this alone is *not* a customer acknowledgement.
4. **Acknowledge:** an actual authorised fleet manager who is **not** the platform owner must supply name, package hash and explicit saved-and-checked confirmation. The owner's session cannot impersonate this step.
5. **Approve close:** platform owner only, exact fleet-name confirmation, documented contract/retention review, customer acknowledgement, no legal holds, open privacy requests or unapproved fleet retention categories, and no changes to the fleet snapshot. Freezes fleet management access, revokes device credentials and pending enrolment tokens.
6. **Complete close:** owner-only second exact-company confirmation. Checks legal blockers again; confirms all devices revoked and no new/unrecognised records; uses Supabase **Storage API** to remove each scoped object, verifies it cannot be downloaded, then deletes the corresponding database row. Removes the private handover ZIP, then company work events, driver/device, fuel-card, vehicle and fleet-management tables. Checks zero live scoped rows and changes fleet status to `closed`. Minimal evidence retained in private ledger and closed-fleet account stub. Owner can download a JSON closure record including original checksum, customer acknowledgement, verified result and backup limitation.

## Customer protection
- Different fleet IDs mean different customer exports and deletion targets; object removal uses only manifest-listed fleet-scoped source rows. `road1st_report_registrations` indexes cascade on source report removal.
- Credentials, QR tokens and permanent device secrets **are not included** in the exported ZIP. Secrets remain inaccessible to the frontend.
- No customer deletion happens when a fleet is merely suspended, or when an export is prepared/downloaded.
- The function **cannot** finalise while retention policy or a legal hold/privacy request remains unresolved. As of initial deployment, the live RPC confirms 3 unapproved fleet retention categories, so final deletion is correctly blocked.
- ZIP is not itself password-encrypted. Protection is by private Storage and authenticated access over HTTPS; fleet manager must securely save their downloaded ZIP. Don't describe it as encrypted at rest without separate provider evidence.
- Export currently capped at **400 rows per category, 22MB uncompressed and 30MB ZIP**; oversized customers require complete indexed multipart delivery **before production rollout**, not a truncated export.
- An account stub, application records, handover ledger, payment/legal audit and provider-managed backups may still retain limited data. This is not a claim that *all* personal data disappears instantly. Supply a proper privacy notice, Article 28 agreement and backup-retention schedule.

## Verification status (initial deployment)
- **PASS:** schema migration applied; private bucket configured; service-role-only blockers RPC returns `0` holds, `0` open privacy requests, `3` unapproved fleet retention categories in Kerry live test; portal static language/navigation checks and GitHub Pages deployment passed.
- **NOT YET END-TO-END TESTED:** real authenticated company export and binary ZIP integrity, distinct company-manager download/acknowledgement, owner freezes, multi-tenant isolation under concurrent uploads, and final live company deletion. No live customer records or accounts were modified as part of deployment.
- **RELEASE GATES:** written customer agreement/DPA, approved per-category retention, larger-fleet multipart export, device/offboarding tests, completed package + attachments verification and live export/ack on a dedicated test tenant before using this for a real customer.

## Developer notes
- Deployed Edge Function source must be versioned in this directory; do not replace with an outdated copy.
- Verify ZIP manifest completeness and linked file hashes before acknowledging a customer handover.
- Never delete `storage.objects` by SQL; use Supabase Storage API.
- On mid-purge error, report incomplete and investigate. Reruns must verify remaining original manifest paths, never delete records belonging to a new fleet.
- Do not run `approve_close` or `complete_close` against Kerry/Pilot/MMM testing accounts without a fresh owner-directed test and customer receipt.
