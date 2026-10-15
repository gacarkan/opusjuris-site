// One-off edit: the two pages get a shared footer placeholder (__FOOTER__)
// and the footer styles, and build.js learns to fill the footer and to build
// the text pages in legal/ through doc-page.html. Run once:
//   node tools/apply-footer-and-docs.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const write = (f, s) => fs.writeFileSync(path.join(root, f), s);
const rep = (s, a, b, name) => { if (!s.includes(a)) { console.error("MISSING in " + name + ": " + a.slice(0, 80)); process.exit(1); } return s.replace(a, b); };

// page.html: footer markup becomes the placeholder; footer styles gain the link row.
let p = read("page.html");
p = rep(p, `  <div class="edge">
    <footer><span>Opus Juris. Lawyer Driven, AI Assisted.</span><span>Jersey City, New Jersey.</span></footer>
  </div>
</main>`, `</main>

__FOOTER__`, "page.html");
p = rep(p, `footer { border-top: 1px solid var(--rule); padding-block: 26px; font-size: 0.85rem; color: var(--ink-2); display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }`,
`footer { border-top: 1px solid var(--rule); padding-block: 26px; font-size: 0.85rem; color: var(--ink-2); display: flex; justify-content: space-between; align-items: center; gap: 12px 24px; flex-wrap: wrap; }
/* The footer's links: the legal pages, then the ways to reach us. */
footer nav { display: flex; gap: 6px 20px; flex-wrap: wrap; }
footer a { text-decoration: none; color: inherit; font-weight: 600; }
footer a:hover { color: var(--accent); }`, "page.html");
write("page.html", p);

// demo-page.html: same placeholder.
let d = read("demo-page.html");
d = rep(d, `<div class="edge">
  <footer><span>Opus Juris. Jersey City, New Jersey.</span><a href="index.html" style="text-decoration:none;font-weight:600;">Back to the site</a></footer>
</div>`, `__FOOTER__`, "demo-page.html");
write("demo-page.html", d);

// build.js: the footer, filled into every page, and the text pages.
let b = read("build.js");
b = rep(b, `const page = fill(fs.readFileSync(path.join(here, "page.html"), "utf8"));`,
`// The footer every page shares: the entity and the year, the legal pages, the ways to reach us.
const YEAR = new Date().getFullYear();
const FOOTER = \`<div class="edge">
  <footer>
    <span>\\u00a9 \${YEAR} Opus Juris, LLC. Jersey City, New Jersey.</span>
    <nav aria-label="Site"><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="security.html">Security</a><a href="mailto:hello@opusjuris.com">hello@opusjuris.com</a><a href="tel:+12019041020">+1 (201) 904-1020</a></nav>
  </footer>
</div>\`;
const page = fill(fs.readFileSync(path.join(here, "page.html"), "utf8")).replace("__FOOTER__", FOOTER);`, "build.js");
b = rep(b, `const demo = fill(fs.readFileSync(path.join(here, "demo-page.html"), "utf8")).replace("__SHARED_CSS__", sharedCss);`,
`const demo = fill(fs.readFileSync(path.join(here, "demo-page.html"), "utf8")).replace("__SHARED_CSS__", sharedCss).replace("__FOOTER__", FOOTER);
// The text pages: each file in legal/ is the content of one page built through doc-page.html.
const docTemplate = fill(fs.readFileSync(path.join(here, "doc-page.html"), "utf8")).replace("__SHARED_CSS__", sharedCss).replace("__FOOTER__", FOOTER);
const docs = fs.readdirSync(path.join(here, "legal")).filter((f) => f.endsWith(".html")).map((f) => {
  const content = fs.readFileSync(path.join(here, "legal", f), "utf8").trim();
  const title = (content.match(/<h1>([^<]+)<\\/h1>/) || [, f])[1];
  return { name: f, title, html: docTemplate.replace("__TITLE__", title + " | Opus Juris").replace("__CONTENT__", content) };
});`, "build.js");
b = rep(b, `fs.writeFileSync(path.join(here, "dist", "demo.html"), demoDoc);
console.log(`, `fs.writeFileSync(path.join(here, "dist", "demo.html"), demoDoc);
for (const doc of docs) fs.writeFileSync(path.join(here, "dist", doc.name), wrap(doc.html, doc.title + " for opusjuris.com, the website of Opus Juris, LLC."));
console.log("built " + docs.map((d) => "dist/" + d.name).join(", "));
console.log(`, "build.js");
write("build.js", b);

// README: the new pages.
let r = read("README.md");
if (!r.includes("legal/")) {
  r = r.replace(/\n## /, `\n## Text pages\n\n- legal/privacy.html, legal/terms.html and legal/security.html are the contents of the Privacy Policy, Terms of Use and Security pages; build.js wraps each in doc-page.html (same header and footer) and writes dist/privacy.html, dist/terms.html, dist/security.html.\n- The footer on every page (entity, year, the three links, email and phone) is the FOOTER string in build.js. The entity name is a placeholder until the company is formed.\n\n## `);
  write("README.md", r);
}
console.log("applied; __FOOTER__ placeholders:", (p.match(/__FOOTER__/g) || []).length + (d.match(/__FOOTER__/g) || []).length);
