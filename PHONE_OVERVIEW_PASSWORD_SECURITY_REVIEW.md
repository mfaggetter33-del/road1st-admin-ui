# ROAD 1ST — Laptop management / phone overview / account password change
**17 October 2026 — staged only, NOT LIVE.**

## Agreed operational design
- **Laptop:** Owner Portal and Fleet Portal retain full management actions. Do not remove them.
- **Phone:** a separate mobile-friendly **read-only** `owner-overview.html` page with approved owner sign-in, list of test fleets, fleet status and report/fuel/defect totals. Its code uses GET requests only for fleet/admin information; POST requests are solely to the Supabase Auth login/refresh endpoints. No upload, release-publish, fleet edits, revocation or deletion controls.
- **Driver app:** remains as-is, no Owner Portal button/shortcut, no QR re-enrolment, no app build changed.
- **Important:** this is **interface separation, not device-enforced access control**. An owner who knows the full Owner Portal URL and has valid owner credentials could still access owner operations from any supported browser. True laptop-only authorization would require separate trusted-device policy and server-side enforcement, not hiding buttons by screen size.

## Account password policy — staged UI, backend required
- Intended new account password: **8+ characters**, with at least one ASCII letter, at least one digit and at least one recognised symbol. Spaces may exist in a long passphrase but do not count as the required symbol.
- Shared `password-policy.js` validator is used for **new Fleet Portal account registration**. It does NOT reject existing-account sign-in and does not change the 5-digit local driver PIN.
- The current production web signup still allows 8 characters until this preview branch is reviewed/merged.
- **This client-side check is not an enforceable security boundary.** Users could call Supabase Auth signup or reset directly. Before rollout, configure the Supabase project Auth password **minimum length 12** and appropriate **required character classes**, verify exact supported combination and match every create/reset UI to the server response.
- Official guidance: https://supabase.com/docs/guides/auth/password-security
- Existing users/passwords should not be reset automatically. Check sign-in and weak-password warnings with the existing test owner and a disposable test fleet user after any live Auth config change.
- Supabase leaked-password/HaveIBeenPwned protection is a **separate paid option deliberately deferred** until first paying customer. Do not enable it or incur cost now.
- Later: owner TOTP MFA / passkey if required, session expiry and lost phone response. No phone trust enrollment requested now.

## Release gates
1. Preview CI `ROAD 1ST phone overview and account password review` succeeds.
2. Owner reviews the phone overview layout (no management controls). Only then merge/deploy.
3. Select and test Supabase server Auth required-character settings with a disposable signup and reset. Update the client validator if Supabase requires both uppercase and lowercase.
4. Confirm Owner Portal login and laptop fleet management still work, as does phone view. Verify cross-fleet authorization remains unchanged.
5. No Google Play application creation/publishing is part of this change.
