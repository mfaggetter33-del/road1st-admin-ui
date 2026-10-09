/* No external dependency. Validates the ROAD 1ST fleet portal language packs. */
"use strict";
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const context = { window: {} };
for (const source of ["portal-translations.js", "portal-explanations.js", "portal-report-translations.js"]) {
  vm.runInNewContext(fs.readFileSync(source, "utf8"), context, { filename: source });
}
const data = context.window.ROAD1ST_PORTAL_TEXT;
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
for (const name of ["portalLanguage", "portal-translations.js", "portal-explanations.js", "portal-report-translations.js", "portal-i18n.js"])
  assert.ok(html.includes(name), "missing portal integration " + name);
for (const policy of ["Recommended", "Strict"])
  assert.ok(html.includes('<option value="' + policy + '">' + policy + '</option>'),
    "fleet policy values must remain untranslated: " + policy);
assert.ok(html.indexOf("portal-translations.js") < html.indexOf("portal-explanations.js"));
assert.ok(html.indexOf("portal-explanations.js") < html.indexOf("portal-i18n.js"));
assert.ok(html.includes('F=P+"/functions/v1/road1st-fleet-admin-api"'), "original fleet API retained");
assert.ok(html.includes('A=P+"/functions/v1/road1st-admin-api"'), "original report API retained");
const text = html.slice(html.indexOf("<body>"), html.indexOf('<script src="portal-translations.js"'))
  .replace(/<img[^>]*>/g, "")
  .replace(/<[^>]+>/g, "|")
  .replace(/&amp;/g, "&")
  .split("|").map(x => x.trim()).filter(x => x.length > 1);
const coverage = new Set(data.keys.concat(data.more.keys, data.report.keys, [
  "ROAD 1ST ADMIN", "ROAD 1ST Server", "QR"
]));
const missing = [...new Set(text)].filter(x => !coverage.has(x));
assert.deepEqual(missing, [], "untranslated static portal labels");
console.log("PASS: 32 manager languages; " + (data.keys.length + data.more.keys.length + data.report.keys.length)
  + " phrases per translated locale; approved portal endpoints/policies retained.");
