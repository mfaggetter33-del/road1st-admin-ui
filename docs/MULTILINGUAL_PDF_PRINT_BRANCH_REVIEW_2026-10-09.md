# ROAD 1ST fleet portal — multilingual print/save-PDF pilot
**Date:** 9 October 2026 | **Branch:** `work-multilingual-pdf-print-20261009` | **Status:** REVIEW BRANCH ONLY — no production deployment

## What was changed
- Kept the existing `Download PDF report` jsPDF code and existing original-file download intact.
- Added a separate `Print / Save PDF` button beside the current buttons in the report viewer; its text is translated into all 32 manager languages.
- Added `portal-pdf-print.js`: a local browser print document with A4 print CSS and a top `Print / Save as PDF` control. The manager selects **Save as PDF** in their own print dialog. This is **not** a one-click direct-download PDF.
- Uses the manager's selected portal language, independently of the driver's original report language.
- Reuses already approved display-label translations, journey-event labels and rendered event details. Keeps the original timestamps, notes, record values, file name and report objects unchanged. **Never auto-translates driver free-text or underlying audit records.**
- Uses browser Unicode text rendering and font fallback rather than jsPDF's limited built-in Helvetica. Does not fetch font files or send report data to another service.
- Long translated labels wrap separately from values; events avoid page breaks when they fit.

## Verification done
1. JavaScript parse checks passed for `portal-pdf-print.js`, `portal-pdf-action-locales.js`, updated `portal-i18n.js` and the portal `index.html` inline script.
2. Dictionary check: 32 languages supported (English + 31 translations), all 26 relevant print headings/actions/labels present for 31 non-English languages.
3. Isolated synthetic report tests in English, Irish, Greek and Serbian: source report remained byte-equivalent when serialised; Unicode and untrusted string values were inserted with DOM `textContent`; button triggered `window.print()` in a simulated popup.
4. Representative eight-page A4 **synthetic HTML-to-PDF** fixture was rendered using an independent CSS renderer (not Chrome). Irish, Greek, Serbian and Polish labels survived text extraction, including accents and Cyrillic. Rendered page 1 and page 5 inspected for legibility.
5. **Browser-specific PDF smoke test is pending:** headless Chromium PDF creation in the test environment hung, so we cannot certify Chrome/Edge print output here. The rendered synthetic fixture tests layout only; it is not a signed-off fleet report export.

## Release gate / browser tests with user
- Do not deploy the branch to the live portal until approved.
- In fleet portal, choose languages Irish, German, Greek, Serbian, Polish, Turkish, Romanian and an additional Cyrillic locale. Open a synthetic report and click `Print / Save PDF`. Confirm a separate preview opens, click print, set destination `Save as PDF`.
- For each language: check accented/Cyrillic/Greek glyphs, long label wraps, A4 pagination, no clipped notes, readable search/copy, correct file name and manager language. Compare to unchanged original export and underlying log.
- Check desktop Chrome/Edge, Android Chrome, popup-blocker handling and 'cancel print' without unintended report closure. For a particularly long report check page breaks.
- Confirm no external font/CDN dependencies are introduced in the print path. Old jsPDF exporter still requires its own existing script to load.
- Owner to decide whether to retain separate Print/Save and English PDF buttons or later replace the old exporter after field QA. Any change to approved export behaviour requires approval.

## Known limitations
- Browser printing opens a **save/print dialog**; cannot silently download a completed PDF to a chosen path.
- Actual PDF font coverage depends on browser/OS fonts. The 32 labels are present but native speaker/real-browser quality sign-off is still required.
- Existing technical report detail values (original free-text/identifiers) are deliberately not translated.
- Original jsPDF export remains English, exactly as before.
- Neither the live fleet portal nor Supabase records have been changed.

## Print documentation
- Browser print dialog: https://developer.mozilla.org/en-US/docs/Web/API/Window/print
- Print page size and margins: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@page
