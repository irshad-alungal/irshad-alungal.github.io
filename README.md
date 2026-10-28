# Muhammed Irshad K, portfolio

Static site (HTML, CSS, JavaScript). No build step. Live at https://irshad-alungal.github.io/

## Deploy (GitHub Pages)
1. Commit everything in this folder to the `main` branch of `irshad-alungal.github.io` (index.html must be in the repository root).
2. Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.
3. Wait 1–3 minutes, then open https://irshad-alungal.github.io/

## Update the client list
Edit `assets/js/works-data.js` (see HOW-TO-ADD-WORKS.md), then run once:

    node tools/prerender.js

This refreshes the crawlable HTML copy of the list inside `index.html`. Commit both files.

## Files
- `.nojekyll` tells GitHub Pages to serve the files as they are.
- `404.html` is shown for unknown addresses.
- `robots.txt`, `sitemap.xml` are for search engines. Update `lastmod` in `sitemap.xml` when the page content changes in a meaningful way.
