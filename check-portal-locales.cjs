/* No external dependency. Validates the ROAD 1ST fleet portal language packs. */
"use strict";
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const context = { window: {} };
for (const source of ["portal-translations.js", "portal-explanations.js", "portal-report-translations.js", "portal-messages.js", "portal-event-locales.js", "portal-generated-report-locales.js", "portal-timeline-locales.js"]) {
  vm.runInNewContext(fs.readFileSync(source, "utf8"), context, { filename: source });
}
const data = context.window.ROAD1ST_PORTAL_TEXT;
for (const key of ["events", "generatedReports", "timeline"]) {
  assert.ok(data[key] && data[key].rows, key + " pack present");
  assert.equal(Object.keys(data[key].rows).length, 31, key + " has all translations");
  assert.equal(new Set(data[key].keys).size, data[key].keys.length, key + " labels unique");
  for (const code of Object.keys(data.names).filter(x => x !== "en")) {
    assert.equal(data[key].rows[code].length, data[key].keys.length, key + " label count: " + code);
    assert.ok(data[key].rows[code].every(x => typeof x === "string" && x.trim()), key + " blanks: " + code);
  }
}
assert.ok(data.messages, "portal sign-in and QR messages present");
assert.equal(new Set(data.messages.keys).size, data.messages.keys.length);
assert.equal(Object.keys(data.messages.rows).length, 31, "all 31 translated dynamic message packs");
for(const code of Object.keys(data.names).filter(x=>x!=="en")){
  const messages=data.messages.rows[code];
  assert.ok(messages && messages.length===data.messages.keys.length, code+" messages complete");
  assert.ok(messages.every(x=>typeof x==="string"&&x.trim()),code+" has empty messages");
}
assert.ok(data && data.report, "report language resources present");
assert.equal(new Set(data.report.keys).size, data.report.keys.length, "report detail labels unique");
assert.equal(Object.keys(data.report.rows).length, 31, "all report languages");
for (const code of Object.keys(data.names).filter(x => x !== "en")) {
  assert.equal(data.report.rows[code].length, data.report.keys.length, code + " report label count");
  assert.ok(data.report.rows[code].every(x => typeof x === "string" && x.trim()), code + " missing report translation");
}
assert.ok(data && data.more);
const codes = Object.keys(data.names);
assert.equal(codes.length, 32, "32 manager languages (including English)");
assert.equal(Object.keys(data.rows).length, 31, "all 31 non-English main packs");
assert.equal(Object.keys(data.more.rows).length, 31, "all 31 non-English guidance packs");
assert.equal(new Set(data.keys).size, data.keys.length, "main labels unique");
assert.equal(new Set(data.more.keys).size, data.more.keys.length, "guidance labels unique");
for (const code of codes.filter(x => x !== "en")) {
  const main = data.rows[code], more = data.more.rows[code];
  assert.ok(main && more, "missing language " + code);
  assert.equal(main.length, data.keys.length, code + " main label count");
  assert.equal(more.length, data.more.keys.length, code + " guidance label count");
  for (const s of main.concat(more)) assert.ok(typeof s === "string" && s.trim(), code + " empty text");
}
const html = fs.readFileSync("index.html", "utf8");
for (const name of ["portalLanguage", "portal-translations.js", "portal-explanations.js", "portal-report-translations.js", "portal-messages.js", "portal-event-locales.js", "portal-generated-report-locales.js", "portal-timeline-locales.js", "portal-i18n.js"])
  assert.ok(html.includes(name), "missing portal integration " + name);
for (const policy of ["Recommended", "Strict"])
  assert.ok(html.includes('<option value="' + policy + '">' + policy + '</option>'),
    "fleet policy values must remain untranslated: " + policy);
assert.ok(html.indexOf("portal-translations.js") < html.indexOf("portal-explanations.js"));
assert.ok(html.indexOf("portal-explanations.js") < html.indexOf("portal-i18n.js"));
assert.ok(html.includes("ROAD1ST_PORTAL_LANGUAGE.translate(\"Revoke this phone from the fleet?\")"), "revocation confirmation is translated");
assert.ok(html.includes('reportT("No reports in this category.")'), "report empty state translated");
assert.ok(html.includes('return reportT(m[e]||words(e))'), "event code mapped to translated label");
assert.ok(html.includes('return reportT(m[v]||words(v))'), "control code mapped to translated label");
assert.ok(html.includes('F=P+"/functions/v1/road1st-fleet-admin-api"'), "original fleet API retained");
assert.ok(html.includes('A=P+"/functions/v1/road1st-admin-api"'), "original report API retained");
const inlineScript=html.split("<script>")[1]?.split("</script>")[0] ?? "";
assert.ok(inlineScript.trim(), "portal inline script exists");
new vm.Script(inlineScript, { filename: "ROAD1ST Admin inline script" });
const text = html.slice(html.indexOf("<body>"), html.indexOf('<script src="portal-translations.js"'))
  .replace(/<img[^>]*>/g, "")
  .replace(/<[^>]+>/g, "|")
  .replace(/&amp;/g, "&")
  .split("|").map(x => x.trim()).filter(x => x.length > 1);
const coverage = new Set(data.keys.concat(data.more.keys, data.report.keys, data.messages.keys, data.events.keys, data.generatedReports.keys, data.timeline.keys, [
  "ROAD 1ST ADMIN", "ROAD 1ST Server", "QR"
]));
const missing = [...new Set(text)].filter(x => !coverage.has(x));
assert.deepEqual(missing, [], "untranslated static portal labels");
console.log("PASS: 32 manager languages; " + (data.keys.length + data.more.keys.length + data.report.keys.length + data.messages.keys.length + data.events.keys.length + data.generatedReports.keys.length + data.timeline.keys.length)
  + " phrases per translated locale; approved portal endpoints/policies retained.");
