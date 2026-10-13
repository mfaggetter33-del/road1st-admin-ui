#!/usr/bin/env node
"use strict";
// Zero-dependency structural and interaction regression checks for owner-summary dropdowns.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const src=fs.readFileSync("owner.html","utf8");
const single=(pattern,label)=>assert.equal((src.match(pattern)||[]).length,1,label);
for(const id of ["customerSummary","pilotSummary","applicationSummary","customerGroups","pilotGroups","applicationGroups","companies","pilotFleets","applications","reviewedApplications","companyDetail","ownerEmailReadiness","companyCount","activeCount","pendingCount"]){
 single(new RegExp('id="'+id+'"',"g"),"unique DOM ID: "+id);
}
for(const [button,group] of Object.entries({customerSummary:"customerGroups",pilotSummary:"pilotGroups",applicationSummary:"applicationGroups"})){
 assert.match(src,new RegExp('<button[^>]*id="'+button+'"[^>]*aria-controls="'+group+'"[^>]*aria-expanded="false"'));
 assert.match(src,new RegExp('<section[^>]*id="'+group+'"[^>]*class=|<section[^>]*id="'+group+'"')); // accessible section retained
}
assert.match(src,/id="approvedVersion"/);
assert.match(src,/id="releasePublish"/);
assert.match(src,/id="toggleFleetStatus"/);
assert.match(src,/id="refresh"/);
assert.match(src,/id="approvedQr"/);
assert.match(src,/id="ownerEmailReadiness"/);
assert.match(src,/function showCompany\(f\)/);
assert.match(src,/function ownerDecision\(a,action,b\)/);
assert.match(src,/var target=a\.status==="pending"\?area:reviewed;/);
assert.match(src,/target\.appendChild\(item\)/);
assert.match(src,/el\("companyCount"\)\.textContent=customers\.length/);
assert.match(src,/el\("activeCount"\)\.textContent=pilots\.length/);
assert.match(src,/el\("pendingCount"\)\.textContent=pend/);
assert.match(src,/return !isPilot\(f\)/);
assert.match(src,/O\+"\?kind=fleets"/);
assert.match(src,/O\+"\?kind=applications"/);
const match=src.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match,"inline owner script");
new vm.Script(match[1],{filename:"owner-inline.js"});
// Execute only the new isolated, pure view-toggle code under a DOM stub.
// No credentials, authentication or network calls are evaluated.
const start=match[1].indexOf("var ownerCategories=");
const end=match[1].indexOf('el("loginForm").addEventListener',start);
assert.ok(start>=0 && end>start,"isolated toggle block");
const ids=["customerSummary","pilotSummary","applicationSummary"];
const panels=["customerGroups","pilotGroups","applicationGroups"];
const els=new Map();
for(const id of [...ids,...panels,"companyDetail"]){
 const classes=new Set(panels.includes(id)||id==="companyDetail"?["hidden"]:[]);
 els.set(id,{
  classes,
  attributes:{"aria-expanded":"false"},
  handlers:{},
  classList:{
   contains(name){return classes.has(name)},
   add(name){classes.add(name)},
   toggle(name,force){if(force===undefined)force=!classes.has(name);if(force)classes.add(name);else classes.delete(name)}
  },
  setAttribute(name,value){this.attributes[name]=value},
  addEventListener(event,handler){this.handlers[event]=handler}
 });
}
vm.runInNewContext(match[1].slice(start,end),{el:id=>{assert.ok(els.has(id),"unexpected test DOM access "+id);return els.get(id)}});
for(const id of ids){
 els.get(id).handlers.click();
 const target=ids.indexOf(id);
 for(let n=0;n<3;n++){
  assert.equal(els.get(panels[n]).classes.has("hidden"),target!==n,"only selected panel opens");
  assert.equal(els.get(ids[n]).attributes["aria-expanded"],n===target?"true":"false");
 }
 els.get(id).handlers.click();
 assert.equal(panels.every(p=>els.get(p).classes.has("hidden")),true,"second click closes dropdown");
}
console.log("PASS: owner summary cards show exactly one dropdown, close on repeat, preserve server controls and history.");
