# Adding a client or project

Only one file needs editing: `assets/js/works-data.js`

1. Save the screenshot in `assets/img/work/` (landscape, about 800 x 420 px, .webp or .jpg).
2. Open `assets/js/works-data.js`, copy one block and paste it into the list:

```js
{
  "name": "Client name",
  "category": "frontend",          // "shopify", "wordpress" or "frontend"
  "sector": "Logistics",           // optional, "" to hide
  "tags": ["HTML5", "CSS3", "JavaScript"],
  "image": "assets/img/work/client-name.webp",   // image 1: cover, shown as is (16:10, about 800 x 500)
  "logo": "assets/img/logos/client-name.png",         // image 2: square 1:1 client logo. Add "logoAlt" for a custom alt text
  "description": "One or two sentences about the project.", // optional, else one is generated
  "url": "https://client-site.com/",
  "featured": false                // true = shown first, before "Show more clients"
},
```

3. Save. The grid, filters, "Showing X of Y" and the "N websites" figure in the
   page header all update automatically.

## Settings (top of `assets/js/main.js`)
- `MIN_FIRST = 6`  how many works show before "Show more clients"
  (if you mark more than 6 as featured, all featured ones show first)
- `STEP = 9`       how many more appear per click

## Adding a new category
Use a new word as `category` in the data, then add one button in `index.html`:
`<button class="chip" data-filter="yourword" aria-pressed="false">Label</button>`
and add `yourword: "Label"` to the `KIND` list in `main.js`.

## Client card images
Each card has two images:
- `image` - the cover (work__stage). Shown exactly as you supply it, no laptop or phone frame. Use 16:10, about 800 x 500 px.
- `logo` - the square 1:1 client logo (work__logo). It renders as `<img class="work__logo work__logo--mono" src="..." alt="...">`. If empty, no logo is shown.


## Card text and technology icons (v7)
- `description` - the sentence shown in `.work__desc`. Keep it to one or two sentences (about 120 characters); the card shows 4 lines at most.
- `tags` - drawn as icon chips in `.work__tech`. Recognised names: `HTML5`, `CSS3`, `JavaScript`, `Bootstrap`, `Tailwind`, `WordPress`, `Shopify`, `API`, `Backend`.
  Any other tag still shows, as a plain chip with its first letter. To add a new icon, add one line to `TECH` in `main.js` and one `.tech__ic--yourclass` colour in `style.css`.
- If a cover image file is missing, the card shows a coloured tile with the client's initials instead of a broken image.


## Filter tabs (v9)
Tabs: All, Shopify, WordPress, FrontEnd (all HTML), Backend, API.
- Shopify, WordPress and FrontEnd match the `category` field.
- Backend and API match the `tags` field, so tag a work `"Backend"` or `"API"` and it appears under that tab
  (and still under its own category tab). `PHP`, `Node` count as Backend; `REST` counts as API.


## After editing works-data.js (v10)
Run `node tools/prerender.js` (Node.js is the only requirement). It writes the first project cards and a
collapsed "Full client list" into `index.html` as plain HTML, so Google and visitors without JavaScript
can read every project. The page still works if you skip this, but new projects will not be visible to
search engines until you run it.

- Screenshots: save as `.webp` (about 800 px wide) in `assets/img/work/`. Large PNG files slow the page down.
- A work with no `image` line shows a coloured tile with the client's initials (no broken image).
- A work with no `logo` line shows no logo.
- Keep file names lower case, with no spaces, because GitHub Pages is case-sensitive.
