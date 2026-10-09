/* ROAD 1ST — local, Unicode-capable translated report print view.
 * Independent of legacy jsPDF export. Does not mutate report records, read network,
 * use cloud fonts, or alter the original download.
 * Browser print dialog -> user selects "Save as PDF".
 */
(function () {
  "use strict";
  function clean(value) { return value == null || value === "" ? "—" : String(value); }
  function openReport(options) {
    var report = options.report, t = options.translate || function (s) { return s; };
    if (!report) throw new Error("No report selected.");
    var lang = options.locale || "en", win = window.open("", "_blank");
    if (!win) { throw new Error("Allow pop-ups to preview and save a translated PDF."); }
    var d = win.document;
    d.open();
    d.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ROAD 1ST Fleet report</title>'+
      '<style>'+
      '@page{size:A4;margin:15mm}*{box-sizing:border-box}html{background:#e8ebef}body{font-family:Arial,"Noto Sans",sans-serif;color:#19202b;background:#fff;margin:0}'+
      '.toolbar{padding:12px 24px;background:#17202b;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:12px}button{background:#2dd4bf;border:0;border-radius:8px;padding:8px 15px;font-weight:700;cursor:pointer}'+
      'main{max-width:210mm;margin:0 auto;background:#fff;padding:10mm 0 4mm}'+
      '.brand{background:#0a0e14;color:#fff;padding:12px 16px;border-left:5px solid #2dd4bf;break-inside:avoid}'+
      '.brand strong{font-size:18px;letter-spacing:1px} .brand p{margin:6px 0 0;font-size:11px;color:#bdd4da;overflow-wrap:anywhere}'+
      'h2{font-size:15px;color:#7c3aed;margin:22px 0 10px;border-bottom:1px solid #dce2e8;padding-bottom:6px;break-after:avoid}'+
      '.pairs{margin:0}.pair{display:grid;grid-template-columns:minmax(0,42%) minmax(0,58%);gap:12px;padding:6px 0;border-bottom:1px solid #eef0f4;break-inside:avoid}'+
      '.pair dt{color:#626e7c;font-size:11px;overflow-wrap:anywhere}.pair dd{margin:0;font-weight:600;font-size:11px;overflow-wrap:anywhere;white-space:pre-wrap}'+
      '.event{padding:8px 0;border-bottom:1px solid #edf0f3;break-inside:avoid} .event time{font-size:10px;color:#576477;display:block} .event b{font-size:11px} .event p{font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere;margin:3px 0;line-height:1.4}'+
      '.note{font-size:10px;color:#526171;overflow-wrap:anywhere;white-space:pre-wrap}.foot{font-size:9px;color:#6b7785;margin-top:24px;border-top:1px solid #dce2e8;padding-top:9px;overflow-wrap:anywhere}'+
      '@media print{html,body{background:#fff}.toolbar{display:none}main{padding:0;max-width:none}.brand{-webkit-print-color-adjust:exact;print-color-adjust:exact}h2{margin-top:16px}}'+
      '</style></head><body><div class="toolbar"><strong>ROAD 1ST · '+String(lang).replace(/[^a-zA-Z-]/g,"")+'</strong><button id="printbtn" type="button">Print / Save as PDF</button></div><main id="report"></main></body></html>');
    d.close();
    d.documentElement.lang = lang === "cnr" ? "sr-Latn" : lang;
    d.title = "ROAD1ST-Report-" + lang;
    d.getElementById("printbtn").onclick = function () { win.focus(); win.print(); };
    var main = d.getElementById("report");
    function el(tag, cls, text, parent) {
      var n = d.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = clean(text);
      (parent || main).appendChild(n);
      return n;
    }
    function section(name) { return el("h2", "", t(name)); }
    function pair(parent, label, value) {
      var dl = el("dl", "pairs", null, parent), item=el("div", "pair", null, dl);
      el("dt", "", t(label), item);el("dd", "", value, item);
    }
    function date(value) {
      if (!value) return "—";
      try { var dateObj = new Date(value); return Number.isNaN(dateObj.getTime()) ? clean(value) : dateObj.toLocaleString(lang); }
      catch (e) { return clean(value); }
    }
    var brand = el("div", "brand");
    el("strong", "", "ROAD 1ST FLEET", brand);
    el("p", "", report.report_type === "setup_wizard" ? t("Setup reports") : t("Journey overview"), brand);
    el("p", "", clean(options.filename), brand);

    section("Journey overview");
    var summary=el("div", "overview");
    pair(summary,"Duration",options.duration(report.duration_seconds));
    pair(summary,"Maximum speed",report.max_speed_kmh==null?"—":report.max_speed_kmh+" km/h");
    pair(summary,"Driving Mode",report.driving_activations ? report.driving_activations+"x" : t("Not activated"));
    pair(summary,"GPS usable",report.gps_samples ? report.usable_gps_samples+" / "+report.gps_samples : "—");

    section("Journey summary");
    var details=el("div", "summary");
    [
      ["Started",date(report.start_utc)],["Finished",date(report.end_utc)],
      ["App version",report.version],["Vehicle",options.words(report.vehicle_type)],
      ["Journey mode",report.journey_mode],["Start mode",options.words(report.start_mode)],
      ["End reason",options.words(report.end_reason)],["Automatic resumes",report.auto_resumes],
      ["Bluetooth connected events",report.bluetooth_connected_events],
      ["Bluetooth disconnected events",report.bluetooth_disconnected_events],
      ["Cloud checkpoints",report.checkpoints],["Blocked apps",report.blocked_app_count]
    ].forEach(function (x) { pair(details,x[0],x[1]); });
    var counts=report.controls||{};
    var keys=Object.keys(counts).filter(function (k) { return k !== "auto_resume_on_movement"; });
    if (keys.length) {
      section("Stops, breaks and controls");
      var controls=el("div", "controls");
      keys.forEach(function (k) { pair(controls,options.controlName(k),counts[k]); });
    }

    section("Warnings / errors");
    if (report.issues && report.issues.length) report.issues.forEach(function (x) {
      var row=el("div", "event");el("time", "", date(x.utc),row);
      el("b", "", options.eventName(x),row);el("p", "", clean(x.detail),row);
    });
    else el("p","note",t("No recorded failures or GPS-disable events."));

    section("Event timeline");
    if (report.timeline && report.timeline.length) report.timeline.forEach(function (x) {
      var row=el("div","event");el("time","",date(x.utc),row);
      el("b","",options.eventName(x),row);
      el("p","",options.eventDetail(x),row);
    });
    else el("p","note",t("No timeline events available."));

    var foot=el("div","foot");
    // ISO generation timestamp is audit-stable; locale is a display choice, not report-data transformation.
    foot.textContent = "ROAD 1ST Fleet · "+new Date().toISOString()+" · "+lang+" · "+clean(options.filename);
    win.focus();
    return win;
  }
  window.ROAD1ST_TRANSLATED_PDF = { openReport: openReport };
})();
