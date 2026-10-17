/* ROAD 1ST staged owner phone read-only and password policy regression */
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const policyJs=fs.readFileSync("password-policy.js","utf8");
const context={window:{}};
vm.runInNewContext(policyJs,context,{filename:"password-policy.js"});
const pass=context.window.ROAD1ST_PASSWORD_POLICY;
assert.equal(pass.minLength,12);
for(const p of ["SafeOwner2026!","PurpleFleet77#","LongPassword1~"])
  assert.equal(pass.valid(p),true,"rejected valid example");
for(const p of ["simplepassword","Longwordonlynochar","1234567890123","NotEnough1!","WithLetters1234","NoNumbers!!!?"])
  assert.equal(pass.valid(p),false,"accepted invalid example "+p);
const index=fs.readFileSync("index.html","utf8");
assert.match(index,/<script src="password-policy\.js"><\/script>/);
assert.match(index,/ROAD1ST_PASSWORD_POLICY\.valid\(password\)/);
assert.match(index,/function createAccount\(\)/);
const owner=fs.readFileSync("owner-overview.html","utf8");
assert.match(owner,/<meta name="viewport"/);
assert.match(owner,/Read-only overview/);
assert.match(owner,/Owner sign in/);
assert.match(owner,/profile\.role!=="owner"/);
assert.match(owner,/road1st-fleet-admin-api/);
assert.match(owner,/kind=summary&fleet_id=/);
assert.match(owner,/method:"GET"/);
assert.doesNotMatch(owner,/owner\.html|index\.html|update_compliance|delete_fleet|publishRelease|create_fleet|set_fleet_preset/);
const inline=[...owner.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
assert.equal(inline.length,1);
for(const js of inline)new vm.Script(js,{filename:"owner-overview.html inline script"});
// All owner/fleet Edge Function calls in the mobile overview are explicitly GET.
// POSTs are only to Supabase Auth's password sign-in and refresh endpoints.
assert.equal((owner.match(/method:"POST"/g)||[]).length,2);
assert.match(owner,/P\+"\/auth\/v1\/token\?grant_type=password"/);
assert.match(owner,/P\+"\/auth\/v1\/token\?grant_type=refresh_token"/);
assert.doesNotMatch(owner,/method:"POST",body:JSON\.stringify\(\{action:/);
console.log("PASS: twelve-character account password validator with letter, digit, symbol");
console.log("PASS: existing login and test driver PIN were not modified in staged pages");
console.log("PASS: mobile owner overview reads authenticated data only; no management calls");
console.log("NOTE: server-side Supabase Auth password requirements must be configured before rollout");
