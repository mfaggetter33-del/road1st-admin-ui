# ROAD 1ST — Google Play submission checklist / handover (10 October 2026)

**13 OCTOBER 2026 STATUS UPDATE:** The signed ROAD 1ST pilot is now **2.99.25-pilot** (versionCode 124; targetSdk 36), not 2.99.4. This older checklist is retained for history; Play release is **not yet approved**. Engineering status, open safety/privacy gates and today's verified security results are in the [private master checkpoint](https://github.com/mfaggetter33-del/driver-safety/blob/main/docs/ROAD1ST_SECURITY_GDPR_CHECKPOINT_2026-10-13.md). Do not treat the 10 October 'not yet deployed' statements as a current live-system audit.

---

Status: practical draft and evidence tracker. Not submitted to Google Play.

## Product version to describe
**One Android app, two modes**: PRIVATE road-safety protection without employer reports; FLEET company-linked SOS/EOS, walkaround, work records and authorised delayed Wi-Fi upload. Driver deliberately selects mode in a setup-screen control during testing, pending owner sign-off on dividing the existing long Ready to Drive button. Do NOT publish landing art changes yet. Tachograph integration is FUTURE ONLY; no statutory compliance claims.

## Draft store listing (English master)
App title: ROAD 1ST
Short description: Safer driving with fewer phone distractions — for private and fleet use.

Long description (review):
ROAD 1ST helps drivers reduce distracting phone use while driving. Choose Private for personal journeys or Fleet for authorised work journeys. The app recognises driving movement and can restrict selected distracting apps while allowing configured essentials, navigation and emergency controls. Private driving protection is distinct from employer fleet reporting.

Fleet drivers may begin a shift with SOS, complete walkaround checks, use Other Work and Break/Rest controls, and close their shift with EOS. Authorised work reports and optional inspection/fuel evidence can upload over Wi-Fi whenever it becomes available, including after the driver goes home. Your employer must not receive Private journey history.

Features may require location, Bluetooth/nearby-device, Usage Access, notification and display-over-apps permission. Some functions depend on phone and Android system settings. ROAD 1ST does not read private text-message or call contents and does not replace a tachograph or legally required driving/work recordkeeping. Ferry mode is pilot-only, manually controlled and not yet field-tested. Do not advertise tachograph integration as active.

**Wording must be checked against the FINAL signed app and deployed upload/backend behaviour, not the current isolated prototype.**

## Submission work: completed or prepared
- Default Android package: com.mick.driversafety. Current stable pilot 2.99.4, target SDK 36, versionCode 103. Isolated private/fleet test branch uses 2.99.5-privacy-test/versionCode 104 and existing pilot test signing.
- 31 locale-specific Android resources plus English = 32 configured. Verify all newly added mode, legal and permission strings and screenshots before advertising 32 fully complete translations.
- Pilot APK signed and builds via GitHub Actions. No signed production AAB built or uploaded as of this report. Maintain distinct Play upload key and Google Play App Signing records.
- Android manifest includes FGS location and specialUse, Usage Access, overlay, Bluetooth, camera, notification. Reviewer demonstration videos and Console declarations remain required.
- Draft descriptions, reviewer instructions, Data Safety worksheet and permission audits were already prepared on the work-play-store-submission-pack-20261009 branch.
- Draft Privacy Notice and GDPR driver identity review stored in this admin repository's docs folder.
- Company public Privacy Policy URL and in-app link, signed-off legal identity, deletion requests and retention enforcement remain outstanding.
- Server-side authentication and session records must reject old private/unscoped uploads BEFORE public claims about Private privacy; staged functions exist on private/fleet feature branch, not deployed.

## Specific actions that remain before a Play Console submission
1. Finalise, deploy and test Android Private/Fleet mode + SOS/EOS + server event/session authorisation; no Private archives or post-EOS fleet tracking on Wi-Fi, home or work.
2. Obtain legal entity name, address, privacy email, support email, Google Play developer account status, responsible publisher, countries/price. Complete actual contracts, DPA and retention/deletion controls.
3. Publish the accurate versioned Privacy Policy on a stable public URL and link it inside the app. Display prominent mode-specific privacy and special-permission notices; record versioned acceptance as appropriate. Translate legally approved copy.
4. Verify all data captured/off-device and complete Play Data Safety and App Content forms accurately, including any SDKs and account-deletion routes. Do not mark 'no data collected' if work data uploads occur.
5. Record real-device videos demonstrating FGS location and specialUse, how a user starts/stops monitoring and grants permissions, and accessibility of emergency controls.
6. Build a signed release Android App Bundle .aab using the intended Play upload key (not merely the pilot APK). Verify appId, versionCode and signature, archive certificate fingerprints; use a staged test track.
7. Capture authentic screenshots in the actual approved UI. Avoid mockups falsely implying verified behaviour or an active tachograph provider.
8. Provide protected reviewer instructions and a throwaway fleet review account/QR token through Play Console only, not public GitHub.
9. Confirm Play Console account type. New personal accounts created after 13 Nov 2023 generally need 12 testers opted in continuously for 14 days before applying for production.
10. Carry out phone smoke tests (Private, Fleet SOS/EOS, Wi-Fi delayed upload, Bluetooth reconnection, app restart, blocked-app protection, emergency, double manning, ferry). Save results and resolve bugs before rollout.

## Google official sources
- Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- FGS declarations and video: https://support.google.com/googleplay/android-developer/answer/13392821
- App testing requirements: https://support.google.com/googleplay/android-developer/answer/14151465
- Permission declarations: https://support.google.com/googleplay/android-developer/answer/9214102
- Publish app bundles: https://support.google.com/googleplay/android-developer/answer/9844679

## Current deliverables
- Branch: https://github.com/mfaggetter33-del/driver-safety/tree/feature/private-fleet-wifi-boundary-20261010
- Latest pilot is untouched: https://github.com/mfaggetter33-del/driver-safety/releases/tag/pilot-latest
- Test build workflow creates a separate preview release after successful compile/signing; not a public Play release.

This handover must be revised once Android/server tests, legal review and Play Console details are actually confirmed.
