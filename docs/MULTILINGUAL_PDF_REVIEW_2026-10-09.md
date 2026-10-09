# ROAD 1ST fleet portal — multilingual PDF support review
Reviewed 9 October 2026, source `index.html`, jsPDF 2.5.2, report viewer and export functions. Code review only; no downloaded PDF samples were available for visual QA.

## Current behaviour
- The **web report viewer** has 32 language choices and now translates many dynamic display labels, events, controls, grouping and empty states. Original uploaded report text/data is preserved.
- The **PDF download** calls `new jsPDF({ unit:"mm", format:"a4" })` and consistently selects standard `helvetica` normal/bold fonts. Its output labels (for example `Journey overview`, `Started`, `Event timeline`) are still hardcoded English.
- Standard PDF fonts in jsPDF are not suitable for every Unicode script. Without embedding a font with the necessary glyphs, Cyrillic and Greek and some other European characters may display as missing/garbled text if translated labels are written into the PDF.
- Existing `pair()` lays labels and values in fixed columns (value begins at 80 mm) and does not wrap **labels**; many translated terms would overlap the value column. `paragraph()` wraps body text but needs page break tests in longer languages.
- The PDF writes report-derived data and dates; translation should affect only the **presentation labels**, never underlying uploaded records, audit timestamps, original files or fleet identifiers.
- Current exported PDF should be described as **English-language report** until font embedding and full locale testing are complete. The localized browser preview is not evidence that PDF localization works.

## Recommended implementation when approved
1. Choose properly licensed redistributable Unicode fonts with Latin Extended, Greek and Cyrillic coverage (including Irish accents, Polish, Turkish and Romanian). Test Montenegrin/Serbian Cyrillic and the complete 32-language character set. Do not distribute or expose private font assets.
2. Bundle the font locally or otherwise load it reliably, call jsPDF `addFileToVFS` and `addFont`, and select it before any localized text. Do **not** depend on downloading fonts at PDF-generation time while a fleet manager is offline.
3. Add a PDF-only, approved dictionary for headings, labels, section descriptions, page/footer text and exact error messages. Preserve original report data; do not auto-translate driver notes or records.
4. Replace fixed label positions with measured-width columns and wrapping; account for multi-line translated labels, values and page breaks.
5. Export golden test PDFs from sample data for English, German, French, Irish, Polish, Greek, Bulgarian, Serbian, Turkish, and other supported languages. Inspect rendered pages, copied text, searchable Unicode characters, page breaks and text overlap.
6. Decide and document the expected output language: **manager's chosen portal language**, independent of each driver's Android app language. Include explicit locale in PDF metadata/footer, while preserving official original report downloads separately.
7. Keep the existing export unchanged unless and until the Unicode-and-layout tests pass. Obtain user approval before a redesign of official exported report formatting.

## Review outcome
**Not yet multilingual-PDF ready.** The browser translation work and the PDF export pipeline are separate. This document is an implementation gate, not a claim of a completed feature.

Source: https://parallax.github.io/jsPDF/docs/index.html (Unicode and font embedding guidance).
