# ROAD 1ST — Private / Fleet Driver Privacy Notice
**DRAFT FOR IRISH LEGAL AND TECHNICAL VERIFICATION — DO NOT PUBLISH AS A LIVE PROMISE**
Prepared: 10 October 2026. Proposed effective version: pending approval.

**Publisher / contact:** [REGISTERED ROAD 1ST LEGAL ENTITY], [BUSINESS ADDRESS], [PRIVACY EMAIL]. These are essential placeholders requiring confirmation before public release.

## Plain-language overview
ROAD 1ST is a road-safety application with separate PRIVATE and FLEET modes in one Android app. Using a phone that is enrolled with a fleet does not give the employer access to its owner's private driving. A driver chooses Fleet explicitly, selects the company and vehicle, presses SOS (Start of Shift) before the walkaround, then records company work. After EOS (End of Shift), new fleet collection must stop. Fleet reports from before EOS may subsequently upload when any suitable Wi-Fi becomes available, including at home. Upload location does not start tracking or alter report ownership.

Private journeys may use on-device location/motion sensing, app-usage identification and an overlay to restrict distracting apps. That is NOT employer tracking. The app must not collect, store or share the contents of personal SMS, WhatsApp, email, calls or private conversations.

**Important:** These are intended production behaviours. As of 10 October, isolated Android feature-branch work exists, but the signed public app and production upload endpoints have NOT completed privacy verification. This draft is not evidence that production already satisfies every statement.

## 1. PRIVATE mode
- No company-visible route, speed history, GPS coordinates, journey event archive, personal tachograph record or live location tracking should be created or transmitted.
- Temporary local movement and speed signals may be used to provide driver-safety protection; app restrictions may need local foreground-package identification using Android Usage Access. The app should not read message or call content.
- Personal optional SOS/EOS stopwatch may retain its start and end times locally on the handset, only if explicitly used. It is not a regulated tachograph or employer timesheet.
- No private journey records may enter ROAD 1ST's work-report upload queues. Legacy pilot records are preserved pending separate review, not automatically reclassified as fleet.
- Depending on voluntarily enabled features, locally captured vehicle/fuel/inspection details may be held on the device; these must not be uploaded as fleet records.
- ROAD 1ST may still hold limited account, security, support, billing and terms-acknowledgement information where necessary and disclosed. Do NOT claim the provider holds absolutely no personal data without audit.

## 2. FLEET mode
- The driver's fleet operator is normally the controller of work-related records. ROAD 1ST usually processes fleet operational records on that company's instructions under a Data Processing Agreement; the supplier may independently control its own billing/security records.
- When the driver selects FLEET and confirms SOS, the work session begins, including pre-departure walkaround as Other Work. The app may record driver ID and name, approved vehicle registration, SOS/EOS timestamps, work events, walkaround checklist/defect evidence, breaks, receipts, technical diagnostics and permitted device/app status during the authorised shift.
- A tachograph driver-card identifier and statutory activity data would only be used if a contractual tachograph provider integration is subsequently approved and a lawful need is established. This is NOT live in the current product.
- Fleet tracking must NOT resume from vehicle Bluetooth pairing, location movement, reboot, or a personal journey after EOS. At EOS, cease all new work-specific recording. Pre-EOS work files can securely upload after EOS, on Wi-Fi at home or at work.
- Employers only access records for their own authorised fleet and personnel. Company connections on a personally owned phone never expose its private journeys or personal messages.

## 3. Legal basis and staff notices
The relevant fleet operator must document its Article 6 GDPR lawful basis for each processing purpose, provide a transparent employee driver notice and conduct a DPIA where legally required; employee consent alone is generally unsuitable for monitoring where free choice is impaired. ROAD 1ST must document its own distinct controller purposes, if any. Drivers may exercise legal rights through [PRIVACY CONTACT], subject to the appropriate controller and statutory exemptions.

## 4. Data transfers, access and security
ROAD 1ST anticipates using [APPROVED HOSTING PROVIDER, LOCATION, SUBPROCESSOR LIST—VERIFY] for permitted fleet uploads. Actual provider region, backups, any international transfers and Article 28 terms must be confirmed. Design controls include per-company access restriction, server-side authenticated device/driver/shift validation, secure encrypted transport, limited employee access and audit trails. Source and retention claims require independent testing.

## 5. Retention and deletion
- Fleet reports and original legally required records are subject to the operator's regulatory and contractual retention requirements. A simple uniform 14-day deletion period cannot be promised.
- Confirm category-specific database rows, duplicated report text, object storage, receipt/defect images, logs and backups before declaring deletion schedules.
- Road-safety transient PRIVATE sensing must not become private cloud history.
- Account requests, lawful subject-access/deletion requests, fleet handover and controller/processor termination process need a verified published contact and workflow.

## 6. Android permissions / user control
Prominently explain why precise location, Bluetooth/nearby-device, app-usage access, overlay, camera and notifications are requested. Require any Play-mandated affirmative disclosures before permission prompts. Show a reliable ongoing driving-protection indicator and controls for private protection and ending fleet shifts. Rejection of a permission may reduce safety functionality; it must not silently change data collection scope.

## 7. User rights and complaints
Drivers can contact the relevant fleet controller or ROAD 1ST privacy contact for access, correction, restriction, portability where applicable, objection and erasure where legally allowed. EU/Irish users may complain to the Data Protection Commission (dataprotection.ie). Provide retention details and controller contacts before release.

## RELEASE BLOCKERS
1. Verify and deploy actual Android PRIVATE/FLEET capture and upload separation, server-side shift authentication, post-EOS no-new-data tests, and any legacy upload policy.
2. Confirm legal entity, address and inbox; contracts, DPA, controller/processor roles, lawful bases, hosting region, retention/deletion routes.
3. Publish versioned notice and separate fleet transparency text with accessible in-app links and appropriate acknowledgement/records.
4. Complete Google Play Data Safety questionnaire using verified on-device and off-device data.
5. Translate approved wording appropriately for planned markets.

Related design: docs/road1st-one-app-private-fleet-sos-eos-2026-10-10.md.
