# ROAD 1ST — Fleet Data Processing Agreement (DPA) working draft
**Status:** Not executed or published. Requires Irish legal review and actual ROAD 1ST legal entity, address, registered business contacts and verified subprocessors.

## Parties
- **Controller:** [fleet operator legal name, registered address, privacy representative]
- **Processor:** [ROAD 1ST contracting legal entity, registered address, privacy contact]
- **Effective date / contract / governing law:** [to be completed]

## Processing instructions and purposes
ROAD 1ST provides a road-safety and fleet work-record service on the fleet operator's documented instructions. Its operational processing includes driver/vehicle association, fleet shift and work activity, journeys, walkaround defects, photographs, fuel receipts, access and security events, scheduled uploads and authorised reports. Information from the driver's Private mode must remain separate from fleet records; drivers' messages, calls and personal conversations must not be collected as content.

Use of work data for general personnel surveillance, unapproved tracking outside shifts, or unrelated commercial purposes is prohibited without a separate lawful basis and instructions. This agreement cannot itself supply the fleet's legal basis for employment monitoring.

## Data subjects and categories
- Drivers and other approved fleet users; transport managers/administrators.
- Identifiers: fleet/driver/device/vehicle IDs and names, registration, work timestamps.
- Work data: journey events, location/speed diagnostics where configured, breaks, walkaround checklists, notes and photos, fuel data.
- Access/audit: permitted manager actions, login/session and device assignment/revocation logs.
- ROAD 1ST's own platform billing/security records may be independently controlled; document and segregate those separately.

## Processor commitments
1. Act only on written controller instructions, except where law requires otherwise; notify controller where legally permitted.
2. Ensure confidentiality of personnel, least privilege, per-company segregation, private media buckets, TLS, credential protection and relevant logs.
3. Use documented, approved subprocessors under protective terms; maintain an accurate up-to-date list of provider, purpose, processing location, international transfers and safeguards. Current Supabase project region is **eu-west-1 (Ireland)**; this does not establish where every subprocessor or backup may process data.
4. Notify the controller without undue delay upon becoming aware of a personal-data breach; record investigation, incident date, affected categories and response contacts.
5. Assist with access, rectification, deletion, restriction, portability, objections and DPIA/incident enquiries to the extent appropriate to the processing.
6. Offer proportionate audit evidence to the controller while protecting other customers' data and secret credentials.
7. At termination, follow the authorised **return or deletion** option required under GDPR Article 28(3)(g), subject to law and contract. Export with manifest and secure authorised acceptance; hold/restrict, and erase only after documented instruction and verification. Do not imply all backups disappear immediately.

## Company responsibilities
- Select and document a lawful basis under Article 6 for every purpose, conduct DPIA screening, notify staff before monitoring and ensure proportionality and accuracy.
- Set driver access permissions and grant only required fleet records.
- Document local retention rules for the category and geography, decide lawful hold/restrictions and preserve original tachograph/maintenance evidence outside ROAD 1ST where law requires.
- Provide a direct point of contact for rights requests, disputes, correction and breach coordination.

## Appendix A — subject matter and data flow
- **Start:** driver enrols explicitly to company; enters Fleet and starts the authorised shift.
- **During work:** ROAD 1ST holds approved events/receipts/defects locally, and queues attachments for Wi-Fi upload.
- **After EOS:** no new employer-work monitoring; earlier authorised files may upload later on approved Wi-Fi.
- **Management:** authorised fleet manager sees only assigned fleet's records, previews and exports via short-lived private URLs.
- **Offboarding:** export, verify receipt, legal-hold check, authorise deletion and confirm actual object/database/backup lifecycle.

## Appendix B — retention categories (requires specific lawful validation)
- Applicable Irish mobile-road-transport working-time records: intended minimum **three years** in accordance with relevant transport rules, subject to verifying exact scope.
- Tachograph originals, maintenance files, finance records, fuel receipts, driver account data and diagnostic logs: **separately determine** their statutory/contractual periods. Do not apply blanket three-year deletion or retention to every field.
- Driver's Private-mode transient movement safety signals: do not convert into a company-upload archive.
- Pilot/test records: never automatically assign historic unscoped records to a fleet or delete without a review.

## Appendix C — release and signature checklist
- [ ] Confirm legal parties, registered addresses, country scope, contact, breach notifications.
- [ ] Attach accurate technical and organisational measures (TOMs).
- [ ] Complete subprocessor register with contractual terms, locations, transfer mechanism and notification process.
- [ ] Approve data inventory, legal bases, retention categories and tested deletion/export instructions.
- [ ] Test owner/manager role isolation, driver credentials, Wi-Fi delayed upload, post-EOS/private separation, signed links.
- [ ] Obtain qualified legal review and authorised signatures.

**Never describe this unexecuted draft as a signed DPA or a GDPR certificate.**

Sources: GDPR Article 28; Irish Data Protection Commission Controller/Processor Relationships and Employer Vehicle Tracking guidance.
