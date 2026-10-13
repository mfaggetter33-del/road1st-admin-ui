# ROAD 1ST Fleet Reports — Print / Save as PDF review (12 October 2026)

## Implemented in isolated review branch
The existing report preview now has an **additional** Print / Save as PDF button alongside the original Download PDF and Download Original actions.

Print / Save as PDF uses the browser's native print/PDF facility, copying only the currently open authenticated report preview into a print-friendly document. It inherits labels and event names shown in the **fleet manager's selected portal language**, independently of the driver's Android language. Original report content, dates and driver event descriptions are not machine-translated. No new report upload or API endpoint is involved.

The button itself has translated labels for all **32 portal language selections**. Standard browser Unicode fonts can support scripts such as Greek and Cyrillic better than the existing jsPDF Helvetica export. Actual user/OS font availability, printed layout, long values, page breaks and full 32-language report content are **not yet visually verified**. The existing Download PDF remains English-only and unchanged.

## Tests and release gate
- [x] Optional print action added to report viewer on an isolated GitHub branch.
- [x] Existing jsPDF method and source download left unchanged.
- [x] New control follows the portal manager-language choice (32 labels).
- [x] Static source/JavaScript checks on GitHub Actions.
- [ ] Sign in as a real fleet manager and open a real fleet-associated report.
- [ ] On both mobile and desktop choose Print or Save as PDF; inspect A4 output and Unicode.
- [ ] Confirm translated titles/events/timeline for English, Gaeilge, German, French, Greek, Polish, Serbian and all other languages; fix untranslated display labels if necessary.
- [ ] Test multiple pages, long registration/driver notes, page margins, and system-browser popup/print blocking.
- [ ] Confirm source-of-record integrity, timestamp format, company ID, and cross-fleet access denial.
- [ ] Release decision; do not deploy this branch to customers before end-to-end authentication tests.

## How the fleet manager will use it once approved
1. Sign into ROAD 1ST and choose their preferred portal language.
2. Open a report with **View**.
3. Select **Print / Save as PDF**.
4. In the device's print screen select a printer, or **Save as PDF**.

This is a fleet journey summary, not an original statutory tachograph download, compliance certificate or full fleet handover archive.

**Status:** Implemented and source-checked in review branch only. It is not in the live website. No reports or permissions were changed.
