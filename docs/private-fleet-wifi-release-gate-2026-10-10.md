# ROAD 1ST — Private/Fleet Wi-Fi boundary release gate
Checked: 10 October 2026. This is an engineering status record, not approval to publish.

## Built on isolated test branch
Android branch: feature/private-fleet-wifi-boundary-20261010, based on the local SOS/EOS experiment. Android source compilation and SOS/EOS unit tests passed. A signed 2.99.5 preview APK was generated at release tag private-fleet-test-20261010. The stable pilot remains version 2.99.4 and was NOT replaced.

Current Android changes:
- Deliberate Fleet selection and SOS; default Private.
- EOS closes the fleet shift; car journeys in Private should not create fleet reports.
- Report, fuel receipt and defect-photo upload queues use a scope captured at record creation, not upload time. Wi-Fi at home is fully allowed to upload authorised pre-EOS work records.
- Previously queued, unclassified reports must not automatically become fleet reports or be silently deleted.
- Private movement sensors still support phone safety, but shouldn't persist private journey files.
- Approved original landing art is untouched. Temporary mode controls are on the app's setup screen and need owner sign-off before final landing design.

## CRITICAL: NOT COMMERCIALLY PRIVACY READY
Read-only review of LIVE Supabase Edge Functions upload-report v7, upload-fuel-receipt v5 and upload-defect-photo v4 on 10 October found:
- Public-invokable endpoints use a publishable API key, identify installation by client-supplied install ID and associate upload with an enrolled fleet device.
- No verified, server-maintained Fleet SOS/EOS session is enforced for each uploaded report, receipt or defect photo.
- Client-supplied x-road1st-fleet-id, x-road1st-shift-id and x-road1st-driver-id headers alone are NOT authoritative. They can be forged and do not prove when a record was created.
- A prior isolated security branch security/fleet-device-upload-auth-20261008 has device-secret checks staged but not deployed in these live endpoints. This is useful groundwork, but device-secret authentication alone still does not prove the record was captured DURING an active fleet session.
- The Android preview and live server are NOT an end-to-end verified data boundary. The current build should not be presented to public Play Store or fleet pilots with an absolute privacy guarantee.
- DO NOT deploy new Edge Functions or schema changes over live pilot records until coordinated rollout, backward compatibility and privacy tests.

## Next implementation gates
1. Create server-verified Fleet shift start/end records with authenticated device credentials, driver and fleet binding, unique immutable shift ID, and trusted server SOS/EOS timestamps. No client can invent a fleet association.
2. When upload arrives (including long after EOS), validate record's fleet, authorised driver, shift and original work-time range against stored server session. Reject records outside the shift, unverified identities, or after a revocation or fleet handover as appropriate. Use a secure idempotent upload token/record receipt mechanism so client-side clock tampering is not the only evidence.
3. Complete matching constraints for report/fuel/defect, support offline work and delayed Wi-Fi uploads without treating home Wi-Fi as private tracking. Preserve valid pre-EOS reports and their legal retention, and avoid orphan leakage.
4. Test Private while still enrolled to a paid fleet, old pending pilot data, multiple shifts/drivers/companies, device reboot, late Wi-Fi, Double Manning, changeovers, ferry mode, failed EOS, server token expiry and lost signal.
5. Approve final exact landing button split before changing source artwork; capture real handset screenshots and run Google Play permission/policy reviews.
6. Update privacy policy, in-app disclosures, contracts/DPA, data safety worksheet, account deletion and retention before Play Store submission.

## Release management
- Public pilot-latest tag remains untouched.
- Private test APK exists but must be used only for controlled non-production tests after explicitly accepting these limitations, ideally on spare Samsung; it must not be relied upon for privacy-critical company workloads.
- No actual tachograph integration is enabled. Manual SOS/EOS is a provisional driver working-day boundary only.
