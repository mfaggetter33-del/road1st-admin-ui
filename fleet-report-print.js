/* ROAD 1ST fleet report printing: existing viewer only; no server upload. */
(function(){
"use strict";
var label={en:"Print / Save as PDF",de:"Drucken / Als PDF speichern",es:"Imprimir / Guardar como PDF",fr:"Imprimer / Enregistrer en PDF",ga:"Priontáil / Sábháil mar PDF",hr:"Ispiši / Spremi kao PDF",hu:"Nyomtatás / Mentés PDF-ként",sk:"Tlačiť / Uložiť ako PDF",cnr:"Štampaj / Sačuvaj kao PDF",bg:"Печат / Запазване като PDF",bs:"Štampaj / Sačuvaj kao PDF",cs:"Tisk / Uložit jako PDF",da:"Udskriv / Gem som PDF",el:"Εκτύπωση / Αποθήκευση ως PDF",et:"Prindi / Salvesta PDF-ina",fi:"Tulosta / Tallenna PDF:nä",is:"Prenta / Vista sem PDF",it:"Stampa / Salva come PDF",lt:"Spausdinti / Išsaugoti kaip PDF",lv:"Drukāt / Saglabāt kā PDF",mk:"Печати / Зачувај како PDF",nl:"Afdrukken / Opslaan als PDF",no:"Skriv ut / Lagre som PDF",pl:"Drukuj / Zapisz jako PDF",pt:"Imprimir / Guardar como PDF",ro:"Imprimă / Salvează ca PDF",sl:"Natisni / Shrani kot PDF",sq:"Printo / Ruaj si PDF",sr:"Штампај / Сачувај као PDF",sv:"Skriv ut / Spara som PDF",tr:"Yazdır / PDF olarak kaydet",uk:"Друк / Зберегти як PDF"};
function open(source,title,file,lang){
 if(!source)throw Error("Open a report first.");
 var w=window.open("","_blank");if(!w)throw Error("Allow the print window.");
 w.opener=null;
 var d=w.document;d.documentElement.lang=lang||"en";
 var meta=d.createElement("meta");meta.setAttribute("charset","utf-8");d.head.appendChild(meta);
 var st=d.createElement("style");st.textContent="@page{size:A4;margin:17mm}body{font:12px/1.5 system-ui,Arial,sans-serif;color:#1a2532}h2,h3{color:#6439ad}header{border-bottom:3px solid #7c3aed;margin-bottom:16px;padding-bottom:12px}.viewer-summary,.viewer-grid{display:flex;flex-wrap:wrap;gap:12px}.viewer-kpi{border:1px solid #ddd;padding:10px}.viewer-kpi b{display:block}.viewer-row{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #eee;padding:5px 0}.viewer-row span,.viewer-row strong{flex:1}.viewer-row strong{text-align:right;overflow-wrap:anywhere}.timeline-item{border-left:2px solid #7c3aed;padding:6px 12px;margin:7px 0;break-inside:avoid}.viewer-section,h3{break-inside:avoid}.sub{color:#657080}";
 d.head.appendChild(st);
 var header=d.createElement("header");var h=d.createElement("h2");h.textContent="ROAD 1ST — "+title;header.appendChild(h);
 var p=d.createElement("p");p.textContent=[file,(lang||"en").toUpperCase(),new Date().toLocaleString(lang||"en")].filter(Boolean).join(" • ");header.appendChild(p);d.body.appendChild(header);
 var view=source.cloneNode(true);
 view.querySelectorAll("button,a,iframe,script,form").forEach(function(e){e.remove()});
 d.body.appendChild(view);w.focus();w.print();
}
window.ROAD1ST_FLEET_PRINT={label:function(lang){return label[lang]||label.en},open:open,languages:Object.keys(label)};
})();
