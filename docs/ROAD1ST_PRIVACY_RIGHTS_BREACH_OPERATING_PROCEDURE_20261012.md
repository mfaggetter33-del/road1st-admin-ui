# ROAD 1ST — Privacy Rights, Erasure and Breach SOP
**12 October 2026 | Internal operating draft; processor/controller roles require final agreement**

## Receive a rights request
1. Record a case reference, received timestamp, request kind (access, correction, erasure, restriction, portability, objection), affected fleet and a one-way pseudonymised subject reference. Do not put full identity documents or sensitive messages into general GitHub issues, debug logs or public dashboards.
2. Verify requester identity through an appropriate secure channel, without overcollecting documents. Determine the correct controller: usually fleet employer for fleet records; ROAD 1ST for its own accounts/personal processing.
3. Where ROAD 1ST is processor, route to the controller and act on its documented instruction. Where ROAD 1ST is controller, assess legal basis and exceptions. Track the usual **one-month response deadline**, including any lawful extension and notice of extension.
4. Identify authorised scope by fleet, driver/device, record category and time range; check whether historical files are unassigned pilots. Never guess their fleet.
5. Review original reports and associated images. Preserve data accuracy, include creation vs receipt timestamp and note estimated GPS readings. Produce an accessible verified export or reasoned refusal, approved by authorised staff.

## Correction, restriction, erasure and legal hold
1. Check statutory working-time, tachograph, maintenance, finance and legal-hold exceptions before deleting; correction may require an additional linked record while leaving legally required originals intact.
2. A **legal hold** must stop erasure review for that individual record; document purpose, reviewer and release authority. Prevent silent release.
3. Perform staged dry-run: select scope and records, count DB rows and Storage objects, compute hash/manifest and record backup identifiers. Obtain separate controller authorisation where required.
4. The production deletion executor must remove Storage objects using the **Supabase Storage API**, not SQL DELETE on `storage.objects`; verify successful object deletion before finalising metadata removal, and be able to retry partial failures without losing audit state.
5. Confirm only records permitted by the approved retention/category schedule and not held are eligible. **Do not run any cleanup now**: current production is neither fully classified nor approved.
6. After approved deletion, verify absence in authorised APIs and expiry from backups according to documented schedule. Keep a minimal legal non-personal audit trail of request, authorisation, execution and confirmation; avoid copying deleted personal data into the audit.
7. Provide controller/requester confirmation where appropriate and close the case with signed authorised resolution.

## Security incident and suspected personal-data breach
1. Record incident clock immediately and preserve relevant evidence; restrict compromised access (device revocation, session invalidation, rotate credentials), taking care not to delete evidence before triage.
2. Identify categories of people and data, service and tenant boundaries, time period, whether data was actually exposed or altered, and containment actions.
3. Notify affected controller without undue delay if ROAD 1ST acts as processor; contract should specify the escalation channel and service level. Controllers assess GDPR Articles 33/34 notification duties, including possible **72-hour authority reporting** where required.
4. Revoke affected keys/tokens and short-lived links, re-test fleet isolation and device upload security, restore safely from verified backups where needed.
5. Track investigation, decision to notify or not, remediation, lessons learned, and management review. Avoid promising the incident is resolved based on a database query alone.

## Periodic governance
- At least quarterly: review admin memberships, suspended fleet access, old tokens, private buckets, RLS, signing and data exports.
- Each release: verify Private/Fleet/EOS/ferry queue boundaries, Android privacy permissions, target App Bundle permissions, portal/print download behavior and authorised sharing.
- Each retention policy revision: validate categories, exceptions, legal holds and backup erasure in staging before live enablement.
- Any unapproved high-risk processing blocks customer go-live until DPIA/controller decision.

## Required missing business entries
A compliance-profile presence-only check on 12 October found an organisation label, **but no owner email, privacy contact email, compliance email, technical email or Play Console email** populated. Verify identity/contacts privately in Owner Portal. No email value was copied to this document.

Primary references:
https://dataprotection.ie/en/organisations/know-your-obligations/controller-and-processor-relationships
https://www.dataprotection.ie/en/organisations/know-your-obligations/transparency
https://supabase.com/docs/guides/storage/management/delete-objects
