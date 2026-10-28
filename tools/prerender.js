#!/usr/bin/env node
/* Optional helper. GitHub Pages does NOT need it to run.

   Writes the project list into index.html as plain HTML, so search engines and
   visitors without JavaScript can read it:
     1. the first project cards (same ones the page shows before "Show more")
     2. a collapsed "full client list" with every project name, sector and link
     3. the project count and the list of industries

   Run it after you change assets/js/works-data.js:
       node tools/prerender.js
   Then commit index.html together with works-data.js.                          */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

const sandbox = { window: {} };
vm.runInNewContext(read("assets/js/works-data.js"), sandbox);
const works = sandbox.window.WORKS || [];
const WC = require(path.join(root, "assets/js/work-card.js"));
const MIN_FIRST = +(read("assets/js/main.js").match(/var MIN_FIRST\s*=\s*(\d+)/) || [])[1] || 6;

const featured = works.filter((w) => w.featured);
const items = featured.concat(works.filter((w) => !w.featured));
const first = Math.min(Math.max(featured.length, MIN_FIRST), items.length);
const esc = WC.esc;

const cards = items.slice(0, first)
  .map((w) => `<li class="${WC.className(w, false)}">${WC.inner(w)}</li>`)
  .join("\n");

const listItems = items.map((w) => {
  const kind = WC.KIND_LONG[w.category] || "Website";
  const meta = [w.sector, kind].filter(Boolean).join(" · ");
  return `<li><a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.name)}<span class="sr"> (opens the website in a new tab)</span></a>` +
    `<span class="allclients__meta">${esc(meta)}</span>` +
    (w.description ? `<span class="allclients__desc">${esc(w.description)}</span>` : "") + "</li>";
}).join("\n");

const details = `<details class="allclients" id="all-clients">
<summary>Full client list (${works.length} websites)</summary>
<ul class="allclients__list">
${listItems}
</ul>
</details>`;

const sectors = [];
works.forEach((w) => { if (w.sector && sectors.indexOf(w.sector) < 0) sectors.push(w.sector); });

let html = read("index.html");
function swap(name, body) {
  const re = new RegExp(`(<!-- prerender:${name} -->)[\\s\\S]*?(<!-- /prerender:${name} -->)`);
  if (!re.test(html)) throw new Error(`Marker prerender:${name} not found in index.html`);
  html = html.replace(re, (_, a, b) => `${a}\n${body}\n${b}`);
}
swap("works", cards);
swap("clients", details);
html = html.replace(/(<span data-works-count>)[^<]*(<\/span>)/g, `$1${works.length}$2`);
html = html.replace(/(<span id="sectors">)[^<]*(<\/span>)/, (_, a, b) => `${a}${esc(sectors.join(", "))}${b}`);
html = html.replace(/(<p class="more__status" id="workStatus" role="status">)[^<]*(<\/p>)/,
  `$1Showing ${first} of ${items.length} websites$2`);
fs.writeFileSync(path.join(root, "index.html"), html);
console.log(`Pre-rendered ${first} cards, ${works.length} list entries, ${sectors.length} industries.`);
