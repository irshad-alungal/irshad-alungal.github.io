/* Shared by the browser (main.js) and by tools/prerender.js (Node).
   Builds the HTML of one project card, so the pre-rendered cards that search
   engines read and the cards drawn by JavaScript are always identical. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.WorkCard = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var KIND = { shopify: "Online store", wordpress: "Company website", frontend: "Custom website" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // a work matches a tab by its category (shopify, wordpress, frontend)
  // or by a technology tag (e.g. "Backend", "API"), so one work can appear under several tabs
  function matches(w) {
    if (filter === "all" || w.category === filter) return true;
    return (w.tags || []).some(function (t) { return techKey(t) === filter; });
  }

  var KIND_LONG = { shopify: "Shopify online store", wordpress: "WordPress company website", frontend: "Custom-coded website" };
  var TONES = ["#0E2238", "#8A5D12", "#1F5C4A", "#5B3A7A", "#9A3B2E", "#2C5A8C"];

  function initials(name) {
    var w = String(name).replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
    return ((w[0] || "?")[0] + (w.length > 1 ? w[1][0] : "")).toUpperCase();
  }
  function tone(name) {
    var h = 0; for (var k = 0; k < name.length; k++) h = (h * 31 + name.charCodeAt(k)) >>> 0;
    return TONES[h % TONES.length];
  }
  /* ---------- Technology icons (shown in .work__tech) ---------- */
  var SH = '<path d="M4 3l1.6 17L12 22l6.4-2L20 3z" fill="currentColor"/>';
  function glyphText(t, size) { return '<text x="12" y="' + (size > 11 ? 16.5 : 16) + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="' + size + '" fill="#fff">' + t + "</text>"; }
  var TECH = {
    html5:      { label: "HTML5",      cls: "html",      svg: SH + glyphText("5", 12) },
    css3:       { label: "CSS3",       cls: "css",       svg: SH + glyphText("3", 12) },
    javascript: { label: "JavaScript", cls: "js",        svg: '<text x="12" y="17" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="13" fill="currentColor">JS</text>' },
    bootstrap:  { label: "Bootstrap",  cls: "bootstrap", svg: '<text x="12" y="18" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="17" fill="currentColor">B</text>' },
    tailwind:   { label: "Tailwind",   cls: "tailwind",  svg: '<path fill="currentColor" d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35C13.39 10.85 14.52 12 17 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C15.61 7.15 14.48 6 12 6zM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35C8.39 16.85 9.52 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C10.61 13.15 9.48 12 7 12z"/>' },
    wordpress:  { label: "WordPress",  cls: "wp",        svg: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="12" y="16.2" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="11.5" fill="currentColor">W</text>' },
    shopify:    { label: "Shopify",    cls: "shopify",   svg: '<path d="M6 8.5h12l-1 11.5H7z" fill="currentColor"/><path d="M9 8.5V7.4a3 3 0 0 1 6 0v1.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },
    api:        { label: "API",        cls: "api",       svg: '<path d="M9 7l-5 5 5 5M15 7l5 5-5 5M13.5 5.5l-3 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
    backend:    { label: "Backend",    cls: "backend",   svg: '<rect x="4" y="4.5" width="16" height="6" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="13.5" width="16" height="6" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="7.6" cy="7.5" r="1" fill="currentColor"/><circle cx="7.6" cy="16.5" r="1" fill="currentColor"/>' }
  };
  var TECH_ALIAS = { html: "html5", css: "css3", js: "javascript", javascriptes6: "javascript", tailwindcss: "tailwind", wp: "wordpress", rest: "api", restapi: "api", apiintegration: "api", php: "backend", node: "backend", nodejs: "backend" };
  var TECH_ORDER = ["wordpress", "shopify", "html5", "css3", "javascript", "bootstrap", "tailwind", "api", "backend"];

  function techKey(t) {
    var k = String(t).toLowerCase().replace(/[^a-z0-9]/g, "");
    return TECH_ALIAS[k] || k;
  }
  function techChips(tags) {
    var seen = {}, items = [];
    (tags || []).forEach(function (t) {
      var k = techKey(t);
      if (seen[k]) return; seen[k] = 1;
      items.push({ k: k, raw: t });
    });
    items.sort(function (a, b) {
      var ia = TECH_ORDER.indexOf(a.k), ib = TECH_ORDER.indexOf(b.k);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return items.map(function (it) {
      var d = TECH[it.k];
      if (!d) return '<li class="tech__item"><span class="tech__ic tech__ic--plain" aria-hidden="true">' + esc(String(it.raw).charAt(0).toUpperCase()) + "</span>" + esc(it.raw) + "</li>";
      return '<li class="tech__item" title="' + d.label + '"><span class="tech__ic tech__ic--' + d.cls + '" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">' + d.svg + "</svg></span>" + d.label + "</li>";
    }).join("");
  }

  /* Placeholder tile with the client's initials (used when a cover image is missing) */
  function placeholder(w) {
    return '<div class="work__ph" style="--tone:' + tone(w.name) + '"><span>' + esc(initials(w.name)) + "</span></div>";
  }

  function mark(w) {
    // client logo image, set with "logo" (and optional "logoAlt") in works-data.js
    if (!w.logo) return "";
    return '<img class="work__logo work__logo--mono" src="' + esc(encodeURI(w.logo)) + '" alt="' + esc(w.logoAlt || (w.name + " logo")) + '" width="44" height="44" loading="lazy" decoding="async">';
  }

  function cover(w) {
    // no "image" in works-data.js = initials tile, no broken request
    if (!w.image) return placeholder(w);
    return '<img class="work__cover" src="' + esc(encodeURI(w.image)) + '" alt="Screenshot of the ' + esc(w.name) + ' website" width="800" height="500" loading="lazy" decoding="async">';
  }

  function className(w, animate) {
    return "work work--" + esc(w.category) + (animate ? " is-new" : "");
  }

  function inner(w) {
    var tech = techChips(w.tags);
    return (
      '<div class="work__stage">' +
        '<span class="work__badge">' + esc(KIND[w.category] || w.category) + "</span>" + cover(w) +
      "</div>" +
      '<div class="work__body">' +
        '<div class="work__brand">' + mark(w) +
          '<div><h3 class="work__name"><a href="' + esc(w.url) + '" target="_blank" rel="noopener">' + esc(w.name) +
          '<span class="sr"> (opens the website in a new tab)</span></a></h3>' +
          (w.sector ? '<p class="work__sector">' + esc(w.sector) + "</p>" : "") + "</div></div>" +
        (tech ? '<div class="work__tech"><span class="work__tech-label">Built with</span><ul class="tech">' + tech + "</ul></div>" : "") +
        '<p class="work__go" aria-hidden="true"><span>View project</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></p>' +
      "</div>"
    );
  }

  return { esc: esc, KIND: KIND, KIND_LONG: KIND_LONG, techKey: techKey, inner: inner, className: className, placeholder: placeholder };
});
