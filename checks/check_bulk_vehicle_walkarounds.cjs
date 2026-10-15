#!/usr/bin/env node
'use strict';
// Regression test for ROAD 1ST Fleet Portal bulk vehicle registration intake.
// Does not authenticate, alter any fleets, or modify historical reports.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi)];
const inline=scripts.map(x=>x[1]).filter(x=>x.trim());
assert.equal(inline.length,1,'Expected one inline portal script');
for(const script of inline)new vm.Script(script,{filename:'portal-inline.js'});
for(const id of ['bulkFleetVehicleBox','bulkVehicleType','bulkVehicleRegistrations',
   'bulkVehiclePreview','bulkVehicleAdd','bulkVehicleFeedback'])
  assert.ok(html.includes('id="'+id+'"'),id);
const start=html.indexOf('function normaliseFleetRegistration(');
const end=html.indexOf('function bulkFleetVehiclePreview(',start);
assert.ok(start>0&&end>start);
const parse=new Function(html.slice(start,end)+
    '\\nreturn {normaliseFleetRegistration,parseBulkFleetRegistrations};')();
let item=parse.parseBulkFleetRegistrations('Registration\\n241-D-12345\\n252 KY 1234\\nAB12 CDE');
assert.equal(item.entries.length,3,'Spreadsheet column must paste');
item=parse.parseBulkFleetRegistrations('241 D12345\\n241-D-12345\\n24&123\\n253KY77');
assert.equal(item.entries.length,2,'Duplicate must be skipped within paste');
assert.equal(item.repeated.length,1);
assert.equal(item.invalid.length,1);
assert.equal(parse.normaliseFleetRegistration('241 D 12345'),
    parse.normaliseFleetRegistration('241-D12345'));
assert.equal(parse.parseBulkFleetRegistrations('AB12,CD34\\tEF56;GH78').entries.length,4);
assert.ok(html.includes('parsed.entries.length>200'),'Batch must be capped');
assert.ok(html.includes('fleetData.role==="viewer"'),'Viewers may not import');
assert.ok(html.includes('fleetSelect.disabled=true'),'Fleet switch blocked during import');
assert.ok(html.includes('action:"add_vehicle",fleet_id:plan.fleetId'),
    'Every insert must include captured fleet ID');
assert.ok(!html.includes('action:"bulk_reassign_reports"'),'Never move historical evidence');
assert.ok(html.includes('document.getElementById("fleetRecordCategory").value="Walkaround"'));
assert.ok(html.includes('document.getElementById("fleetRecordsFleet").value=fleetId'));
assert.ok(html.includes('normaliseFleetRegistration(v.registration)==='));
assert.ok(html.includes('walkarounds.onclick=function(){openFleetVehicleWalkarounds(v)'));
console.log('PASS: portal inline JavaScript syntax, bulk registration validation and duplicate handling');
console.log('PASS: fleet-scoped inserts, per-vehicle walkaround view, no historical report writes');
