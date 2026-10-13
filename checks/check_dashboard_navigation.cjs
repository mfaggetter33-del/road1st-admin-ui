/* ROAD 1ST navigation regression: sections are independent and toggled by their top buttons. */
"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const html=fs.readFileSync("index.html","utf8");
const inline=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(inline,"fleet portal inline script present");
new vm.Script(inline[1],{filename:"index.html"});
function panel(id){
  const start=html.indexOf('<section id="'+id+'"');
  assert.ok(start>=0,"missing "+id);
  const end=html.indexOf("</section>",start);
  assert.ok(end>start,"unclosed "+id);
  return html.slice(start,end);
}
const qr=panel("fleetPanel"),records=panel("fleetRecordsPanel"),journeys=panel("journeysPanel");
assert.ok(!qr.includes('id="fleetRecords"'),"enrolment must not contain records");
assert.ok(records.includes('id="fleetRecords"'),"records need an independent panel");
for(const id of ["fleetRecordsFleet","fleetRecordSearch","fleetRecordBody","fleetRecordCount"])
  assert.ok(records.includes('id="'+id+'"'),"missing record control "+id);
assert.ok(journeys.includes('id="journeysSearch"'),"journeys independent");
assert.match(html,/if\(C===k\)\{closeDashboardSection\(\);return\}/,"same button closes panel");
assert.match(html,/function hideDashboardViews\(\)/);
assert.match(html,/fleetRecordsPanel","customersPanel","journeysPanel","reportFilters"/);
assert.match(html,/\+\+navigationSequence;/);
assert.match(html,/toggleDashboardSection\(button\.dataset\.kind\)/);
assert.match(html,/if\(\["reports","fuel","defects"\]\.includes\(k\)\)/);
assert.ok(!html.includes('await load("fleet");'),"records may not redirect to enrolment");
assert.match(html,/params\.set\("fleet_id",document\.getElementById\("fleetRecordsFleet"\)\.value\)/);
assert.match(html,/result\.fleet_id!==fleetId/,"only accept selected fleet response");
assert.match(html,/action:"view_fleet_report",fleet_id:item\.fleet_id\|\|/);
assert.match(html,/action:"fleet_file_url",fleet_id:item\.fleet_id\|\|/);
console.log("PASS: dashboard toggle, independent records, fleet-scoped search and file access.");
