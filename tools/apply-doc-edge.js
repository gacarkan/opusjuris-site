// One-off edit: text pages align with the header's left edge (the .edge
// gutter) instead of the centered content column, and the unused wide
// layout from the contact experiment is removed. Run once:
//   node tools/apply-doc-edge.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const write = (f, s) => fs.writeFileSync(path.join(root, f), s);
const rep = (s, a, b, name) => { if (!s.includes(a)) { console.error("MISSING in " + name + ": " + a.slice(0, 80)); process.exit(1); } return s.replace(a, b); };

let t = read("doc-page.html");
t = rep(t, `/* A text page (privacy, terms, security): one readable column under the same header and footer. */`,
  `/* A text page (contact, privacy, terms, security): one readable column that starts at the header's left edge, under the same header and footer. */`, "doc-page.html");
t = rep(t, `  <div class="wrap">
    <div class="doc">`, `  <div class="edge">
    <div class="doc">`, "doc-page.html");
t = rep(t, `
/* The contact page: the details in a row of blocks across the page, not one thin column. */
.doc.wide { max-width: none; }
.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px clamp(24px, 4vw, 64px); margin-top: 18px; }
.cards > div { border-top: 2px solid var(--accent); padding-top: 16px; display: grid; gap: 6px; align-content: start; }
.cards h2 { margin-top: 0; font-size: 1.1rem; }
.cards p { margin: 0; }
@media (max-width: 820px) { .cards { grid-template-columns: 1fr; gap: 24px; } }`, ``, "doc-page.html");
write("doc-page.html", t);

let b = read("build.js");
b = rep(b, `  let content = fs.readFileSync(path.join(here, "legal", f), "utf8").trim();
  // A page that opens with <!-- wide --> uses the full content width (the contact page).
  const wide = content.startsWith("<!-- wide -->");
  if (wide) content = content.slice("<!-- wide -->".length).trim();`,
  `  const content = fs.readFileSync(path.join(here, "legal", f), "utf8").trim();`, "build.js");
b = rep(b, `html: docTemplate.replace('<div class="doc">', wide ? '<div class="doc wide">' : '<div class="doc">').replace("__TITLE__",`,
  `html: docTemplate.replace("__TITLE__",`, "build.js");
write("build.js", b);
console.log("text pages at the edge gutter");
