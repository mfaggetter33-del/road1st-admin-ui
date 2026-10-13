const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
const backend=fs.readFileSync("backend/road1st-fleet-admin-api/index.ts","utf8");
const inline=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(inline,"Fleet Portal script present");
new vm.Script(inline[1],{filename:"index.html inline"});
assert.match(html,/<select id="fleetPreset"><option value="Recommended">Recommended<\/option><option value="Strict">Strict<\/option><option value="Custom">Custom<\/option><\/select>/);
for(const key of ["fleetCustomAppsArea","fleetCustomApps","fleetCustomAdd","fleetInstallApk","pilotReleaseMeta"]){
 assert.equal((html.match(new RegExp('id="'+key+'"','g'))||[]).length,1,key);
}
assert.match(html,/action:"set_fleet_custom_apps"/);
assert.match(html,/fleetCustomCompanyId/);
assert.match(html,/!\["Recommended","Strict","Custom"\]\.includes\(preset\)/);
assert.match(html,/showDeviceUpdate\(null,"New phone"\)/);
assert.match(html,/var response=await api\(F\+"\?kind=summary&fleet_id="\+encodeURIComponent\(fleetId\)\)/);
assert.match(html,/if\(sequence!==fleetCounterRequest/);
assert.match(html,/value=k==="fuel"\?"Fuel receipts":k==="defects"\?"Defect photos":"Reports"/);
assert.match(html,/<option value="Reports">All fleet reports<\/option>/);
assert.ok(!/async function counts\(\)\{await Promise\.all/.test(html),"not global API totals");
assert.match(backend,/params\.get\("kind"\)==="summary"/);
assert.match(backend,/if\(!\/\^\[0-9a-f-\]\{36\}\$\/i\.test\(requestedFleet\)\|\|!\(await canSeeFleet\(requestedFleet\)\)\)/);
for(const tbl of ["road1st_reports","road1st_fuel_receipts","road1st_defect_photos"]){
 assert.match(backend,new RegExp('admin\\.from\\("'+tbl+'"\\)\\.select\\("id"'));
}
assert.match(backend,/action === "set_fleet_custom_apps"/);
assert.match(backend,/emergency_caller_cannot_be_blocked/);
assert.match(backend,/\["Recommended", "Strict"\]\.includes\(preset\)/);
assert.match(backend,/custom_blocked_packages/);
assert.match(backend,/category!=="Reports"/);
console.log("PASS: fleet-specific summary routing, role guard, owner-approved APK button and 3-mode Custom editor.");
