"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const handover=fs.readFileSync("handover.html","utf8");
const owner=fs.readFileSync("owner.html","utf8");
const fleet=fs.readFileSync("index.html","utf8");
const inline=handover.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(inline,"handover includes its interactive source");
new vm.Script(inline[1],{filename:"handover.html"});
for(const id of ["prepare","download","ack","approve","complete","ackCheck","retentionCheck",
 "contractCheck","approveExpected","completeExpected","packageHash","fleetHeading"]){
 assert.ok(handover.includes('id="'+id+'"'),"missing handover step "+id);
}
assert.match(handover,/crypto\.subtle\.digest\("SHA-256",buffer\)/);
assert.match(handover,/if\(!h\|\|digest!==h\.package_sha256\)/);
assert.match(handover,/!downloadVerified\|\|!el\("ackCheck"\)\.checked/);
assert.match(handover,/!el\("retentionCheck"\)\.checked\|\|!el\("contractCheck"\)\.checked/);
assert.match(handover,/action:"download"|request\("download"/);
assert.match(handover,/request\("acknowledge"/);
assert.match(handover,/request\("approve_close"/);
assert.match(handover,/request\("complete_close"/);
assert.match(owner,/id="ownerFleetHandoverLink"/);
assert.match(owner,/encodeURIComponent\(f\.id\)/);
assert.match(fleet,/id="fleetHandoverLink"/);
assert.match(fleet,/encodeURIComponent\(selected\.value\)/);
assert.ok(!/\bconfirm\(/.test(handover),"native confirmation not permitted");
assert.ok(!/service.role|service_role|SUPABASE_SECRET/.test(handover),"no server secret in public handover UI");
console.log("PASS: staged owner/customer handover controls; SHA-256 verification; portal links; no exposed secrets.");
