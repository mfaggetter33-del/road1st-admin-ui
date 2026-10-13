const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const code=fs.readFileSync("fleet-report-print.js","utf8");

class Element {
  constructor(tag){this.tag=tag;this.children=[];this.parent=null;this.value="";this.attrs={};}
  set textContent(s){this.value=String(s);this.children=[];}
  get textContent(){return this.value+this.children.map(c=>c.textContent).join("");}
  setAttribute(k,v){this.attrs[k]=v;}
  appendChild(c){this.children.push(c);c.parent=this;return c;}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
  querySelectorAll(selectors){
    const names=new Set(selectors.split(",").map(x=>x.toLowerCase().trim()));
    const found=[];function walk(e){for(const c of e.children){if(names.has(c.tag))found.push(c);walk(c);}}walk(this);return found;
  }
  cloneNode(deep){const n=new Element(this.tag);n.value=this.value;n.attrs={...this.attrs};if(deep)for(const child of this.children)n.appendChild(child.cloneNode(true));return n;}
}
const events=[];
function mockWindow(){
  const document={documentElement:{lang:""},head:new Element("head"),body:new Element("body"),createElement:tag=>new Element(tag),close:()=>events.push("document-close")};
  return {document,opener:"previous",focus:()=>events.push("focus"),print:()=>events.push("print")};
}
let printedWindow;
const host={open(){printedWindow=mockWindow();return printedWindow;}};
vm.runInNewContext(code,{window:host,Date,Error});
const printer=host.ROAD1ST_FLEET_PRINT;
assert.equal(printer.languages.length,32);
assert.equal(printer.label("ga"),"Priontáil / Sábháil mar PDF");
assert.equal(printer.label("el"),"Εκτύπωση / Αποθήκευση ως PDF");
assert.equal(printer.label("uk"),"Друк / Зберегти як PDF");
assert.equal(printer.label("not-a-language"),printer.label("en"));

const source=new Element("div");
const report=source.appendChild(new Element("p"));
report.textContent="Αναφορά διαδρομής — original driver data";
const image=source.appendChild(new Element("img"));
image.setAttribute("src","https://example.invalid/track");
const script=source.appendChild(new Element("script"));
script.textContent="dangerous script";
printer.open(source,"Journey Report","pilot-001.jsonl","el","Fleet A");
assert.deepEqual(events,["document-close","focus","print"],"document must be closed before print");
assert.equal(printedWindow.document.documentElement.lang,"el");
assert.equal(printedWindow.opener,null);
assert.match(printedWindow.document.body.textContent,/Fleet A/);
assert.match(printedWindow.document.body.textContent,/pilot-001.jsonl/);
assert.match(printedWindow.document.body.textContent,/Αναφορά διαδρομής/);
assert.equal(printedWindow.document.body.querySelectorAll("img").length,0,"print must not request external media");
assert.equal(printedWindow.document.body.querySelectorAll("script").length,0,"print must not execute copied scripts");
assert.equal(source.querySelectorAll("img").length,1,"source report must remain unchanged");
host.open=()=>null;
assert.throws(()=>printer.open(source,"Report","x.jsonl","en",""),/Allow the print window/);
console.log("PASS: 32 language labels, Unicode/source preservation, company heading, closed before print, external media removed, popup feedback");
