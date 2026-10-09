/* ROAD 1ST fleet manager language preference: isolated from driver app / fleet data. */
(function () {
  "use strict";
  var data = window.ROAD1ST_PORTAL_TEXT;
  if (!data || !data.keys || !data.names || !data.rows) return;
  var storageKey = "road1st_portal_display_language";
  var locale = "en", texts = new WeakMap(), observer;
  var dictionary = {};
  Object.keys(data.rows).forEach(function (code) {
    var row = data.rows[code], map = {};
    if (row.length !== data.keys.length) { console.warn("ROAD 1ST portal locale incomplete:", code); return; }
    data.keys.forEach(function (word, i) { map[word] = row[i]; });
    dictionary[code] = map;
  });

  function valid(code) { return Object.prototype.hasOwnProperty.call(data.names, code); }
  function label(source) {
    var translated = dictionary[locale] && dictionary[locale][source];
    return translated || source;
  }
  function skip(node) {
    var el = node.parentElement;
    if (!el) return true;
    if (el.closest("script,style,noscript,svg,code,pre,#fleetSelect")) return true;
    if (el.closest("#recordsTable td:not(:has(button))")) return true;
    if (el.closest("#deviceList .device,#fleetAlerts .reviewitem,#reviewList .reviewitem,#qrMeta,#viewerFile,#imagePreviewMeta")) return true;
    if (el.closest("#viewerContent .viewer-row strong,#viewerContent .viewer-kpi b,#viewerContent .timeline-detail,#viewerContent .timeline-time,#viewerContent .timeline-event")) return true;
    return false;
  }
  function translateNode(node) {
    if (!node || node.nodeType !== 3 || skip(node)) return;
    var current = node.nodeValue || "", old = texts.get(node);
    var original = old && current === old.last ? old.original : current;
    var match = /^(\s*)([\s\S]*?)(\s*)$/.exec(original);
    if (!match || !match[2]) return;
    var next = match[1] + label(match[2]) + match[3];
    texts.set(node, { original: original, last: next });
    if (current !== next) node.nodeValue = next;
  }
  function translateAttrs(root) {
    if (!root || !root.querySelectorAll) return;
    var controls = [];
    if (root.nodeType === 1 && root.matches("input[placeholder],textarea[placeholder],*[data-portal-i18n-title]")) controls.push(root);
    root.querySelectorAll("input[placeholder],textarea[placeholder],*[data-portal-i18n-title]").forEach(function(el){controls.push(el)});
    controls.forEach(function (el) {
      if (el.hasAttribute("placeholder")) {
        var original = el.getAttribute("data-portal-original-placeholder") || el.getAttribute("placeholder");
        el.setAttribute("data-portal-original-placeholder", original);
        var next = label(original);
        if (el.getAttribute("placeholder") !== next) el.setAttribute("placeholder", next);
      }
      if (el.hasAttribute("data-portal-i18n-title")) el.setAttribute("title", label(el.getAttribute("data-portal-i18n-title")));
    });
  }
  function apply(root) {
    if (!root) return;
    if (root.nodeType === 3) { translateNode(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1 && root.matches("script,style,noscript,svg")) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var textNodes = [], node;
    while ((node = walker.nextNode())) textNodes.push(node);
    textNodes.forEach(translateNode);
    translateAttrs(root);
  }
  function setLanguage(next) {
    if (!valid(next)) next = "en";
    locale = next;
    document.documentElement.lang = next;
    var select = document.getElementById("portalLanguage");
    if (select && select.value !== next) select.value = next;
    try { localStorage.setItem(storageKey, next); } catch (e) {}
    apply(document.body);
    document.dispatchEvent(new CustomEvent("road1st-portal-language-change", { detail: { language: next } }));
  }
  function init() {
    var select = document.getElementById("portalLanguage");
    if (!select) return;
    Object.keys(data.names).forEach(function (code) {
      var option = document.createElement("option");
      option.value = code;
      option.textContent = data.names[code];
      select.appendChild(option);
    });
    var stored = "en";
    try { stored = localStorage.getItem(storageKey) || "en"; } catch (e) {}
    select.onchange = function () { setLanguage(select.value); };
    setLanguage(valid(stored) ? stored : "en");
    observer = new MutationObserver(function (changes) {
      changes.forEach(function (change) {
        if (change.type === "characterData") translateNode(change.target);
        else if (change.type === "childList") change.addedNodes.forEach(apply);
      });
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  }
  window.ROAD1ST_PORTAL_LANGUAGE = { get: function () { return locale; }, set: setLanguage, translate: label };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
