# ROAD 1ST — Record of Processing Activities (ROPA), controller/processor working register
**12 October 2026 | Internal preparation | Article 30 mapping, not legally approved**

Maintained separately per capacity: ROAD 1ST is typically processor for a fleet's work records and may be controller for account security, user enquiries and its own website/billing functions. Never collapse controller and processor obligations into a single generic statement.

| Processing activity | Purpose & lawful basis to verify | Person/data categories | Roles and recipients | Retention & status |
|---|---|---|---|---|
| Fleet onboarding | Allow fleets to enrol transport managers/drivers and authorise devices; fleet contract and ROAD 1ST controller account basis to confirm | Contact identifiers, fleet/company, vehicle and driver IDs, device-install/secret hash, application status | ROAD 1ST, approved fleet contacts, Supabase | Controller/processor split and exact account life cycle open |
| Fleet reports | Vehicle safety/work activity and approved compliance reports; employer Article 6 assessment | Journey/work clocks, GPS/speed diagnostics, reg, driver/device metadata, events | Employer controller / ROAD 1ST processor; manager only within fleet | Appropriate statutory/contract category, currently unapproved; staging isolation validated, live shift attestation open |
| Defect and maintenance images | Inspection and safety issues | Registration, odometer, defects, potentially incidental personal content/photos | Fleet controller, assigned managers | Legal/maintenance/incident-hold period to approve; private buckets |
| Fuel receipts | Fleet fuel/expense reporting | Registration, litres, odometer, fuel-card label, receipt images | Fleet controller and assigned staff | Finance/tax period to approve; only Private informational button |
| Private road safety | On-device distraction prevention independent of employer shift | Motion/location/Bluetooth/installed app/package indicators and interactions | Driver and ROAD 1ST depending on verified logs | Data minimisation and verification of private upload/logging pending |
| Support/security | Respond to support, account safety, diagnostics, incident investigations | Accounts, login, device, IP logs, support content | ROAD 1ST platform controller, service providers | Define shortest useful period, access and deletion |
| Website enquiries/marketing | Respond to opt-in fleet enquiries; measure interest only as disclosed | Names/emails/messages and event analytics when used | ROAD 1ST, email/hosting vendor | Separate retention, consent/legitimate basis and cookie assessment |
| Payments and subscriptions | Invoicing and account management | Billing contact, company, invoice/payment token metadata | ROAD 1ST, future payment processor | Contract/tax period, integration not yet completed |
| Backups and archives | Resilience and evidential retention | Protected copies of above categories | Hosted provider with authorised operational staff | Backups expiry/recovery and object deletion proof pending |

## Technical and organisational measures
- Hosted production and staging Supabase regions verified Ireland (eu-west-1), but all vendor locations/transfers unconfirmed.
- Row-level security and restricted table privileges observed; no public direct access to fleet data; manager API cross-fleet tests still required.
- Private storage buckets for uploaded reports/fuel/defect and server-generated short-lived links in reviewed code; confirm on genuine logins.
- Restricted per-device credentials validated for all three synthetic staging upload types; live server versions not promoted.
- Storage retention preview and legal hold/rights registers in restricted staging schema, not operational erasure.

## Register completeness checklist
- [ ] Final ROAD 1ST contracting legal identity, postal address, privacy contact and DPO assessment.
- [ ] Final categories of data subjects and all locations where data could be copied.
- [ ] Purpose-specific lawful basis and legitimate-interest assessment where used.
- [ ] Recipient/subprocessor list, countries and transfer mechanism.
- [ ] Controller-approved record retention schedule and backup expiry.
- [ ] Access controls, breach escalation and response ownership.
- [ ] Date of last review, approving individual and next review.

Guidance: https://www.dataprotection.ie/en/organisations/know-your-obligations/transparency
