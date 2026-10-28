(function () {
  "use strict";

  /* ---------- Settings you may want to change ---------- */
  var MIN_FIRST = 6;   // how many works show before "Show more" (or all featured works, if more)
  var STEP = 9;        // how many more appear each time "Show more" is pressed

  var WC = window.WorkCard;
  var works = (window.WORKS || []).slice();
  var list = document.getElementById("works");
  var btnMore = document.getElementById("showMore");
  var btnLess = document.getElementById("showLess");
  var status = document.getElementById("workStatus");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var filter = "all";
  var shown = 0;

  // a work matches a tab by its category (shopify, wordpress, frontend)
  // or by a technology tag (e.g. "Backend", "API"), so one work can appear under several tabs
  function matches(w) {
    if (filter === "all" || w.category === filter) return true;
    return (w.tags || []).some(function (t) { return WC.techKey(t) === filter; });
  }

  function current() {
    // featured first (keeping the order in works-data.js), then the rest
    var f = works.filter(matches);
    return f.filter(function (w) { return w.featured; }).concat(f.filter(function (w) { return !w.featured; }));
  }

  function firstCount(items) {
    var feat = items.filter(function (w) { return w.featured; }).length;
    return Math.max(feat, MIN_FIRST);
  }

  // a cover image that is missing is replaced by a coloured card with the client's initials;
  // a logo file that is missing is simply hidden
  function bind(li, w) {
    var cv = li.querySelector("img.work__cover");
    if (cv) cv.addEventListener("error", function () {
      var t = document.createElement("div");
      t.innerHTML = WC.placeholder(w);
      cv.replaceWith(t.firstChild);
    });
    var lg = li.querySelector("img.work__logo");
    if (lg) lg.addEventListener("error", function () { lg.remove(); });
  }

  function card(w, i, animate) {
    var li = document.createElement("li");
    li.className = WC.className(w, animate);
    if (animate) li.style.setProperty("--n", i);
    li.innerHTML = WC.inner(w);
    bind(li, w);
    return li;
  }

  function update(total) {
    var first = firstCount(current());
    status.textContent = "Showing " + Math.min(shown, total) + " of " + total + (total === 1 ? " website" : " websites");
    btnMore.hidden = shown >= total;
    btnLess.hidden = !(shown >= total && total > first);
  }

  function render() {
    var items = current();
    list.innerHTML = "";
    shown = Math.min(firstCount(items), items.length);
    items.slice(0, shown).forEach(function (w, i) { list.appendChild(card(w, i, false)); });
    if (!items.length) list.innerHTML = '<li class="empty">No websites in this category yet.</li>';
    update(items.length);
  }

  // The first cards are already in the HTML (written by tools/prerender.js) so search
  // engines and visitors without JavaScript can read them. When they match the data,
  // keep them as they are instead of drawing them again.
  function hydrate() {
    var items = current();
    var existing = Array.prototype.slice.call(list.querySelectorAll(":scope > li.work"));
    var want = Math.min(firstCount(items), items.length);
    var same = existing.length === want && existing.every(function (li, i) {
      var a = li.querySelector(".work__name a");
      return a && a.getAttribute("href") === items[i].url;
    });
    if (!same) { render(); return; }
    existing.forEach(function (li, i) { bind(li, items[i]); });
    shown = want;
    update(items.length);
  }

  function showMore() {
    var items = current();
    var next = Math.min(shown + STEP, items.length);
    items.slice(shown, next).forEach(function (w, i) { list.appendChild(card(w, i, true)); });
    shown = next;
    update(items.length);
  }

  function showLess() {
    render();
    document.getElementById("work").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      filter = c.getAttribute("data-filter");
      chips.forEach(function (x) {
        var on = x === c;
        x.classList.toggle("is-on", on);
        x.setAttribute("aria-pressed", on ? "true" : "false");
      });
      render();
    });
  });
  btnMore.addEventListener("click", showMore);
  btnLess.addEventListener("click", showLess);

  if (list) { if (list.hasAttribute("data-prerendered")) hydrate(); else render(); }

  // industries served, built from the sector field
  var secs = []; works.forEach(function (w) { if (w.sector && secs.indexOf(w.sector) < 0) secs.push(w.sector); });
  var sl = document.getElementById("sectors"); if (sl) sl.textContent = secs.join(", ");
  Array.prototype.forEach.call(document.querySelectorAll("[data-sector-count]"), function (el) { el.textContent = secs.length + "+"; });

  // project count anywhere on the page
  Array.prototype.forEach.call(document.querySelectorAll("[data-works-count]"), function (el) {
    el.textContent = works.length;
  });

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.textContent = open ? "Close" : "Menu";
  }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); burger.focus(); }
  });

  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
