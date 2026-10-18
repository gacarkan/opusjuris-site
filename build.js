// Builds the site from page.html (the landing page) and demo-page.html (the
// demo request page): embeds the mark and the logo as data URIs, shares the
// landing page's stylesheet with the demo page, copies img/, and writes
// dist/index.html + dist/demo.html (full documents for hosting) plus
// dist/page.embedded.html (what the preview artifact publishes as its page).
const fs = require("fs");
const path = require("path");
const here = __dirname;
const mark = fs.readFileSync(path.join(here, "assets", "mark-128.png")).toString("base64");
const logo = fs.readFileSync(path.join(here, "assets", "logo.png")).toString("base64");
const fill = (s) => s.replace(/__MARK__/g, mark).replace(/__LOGO__/g, logo);
// The footer every page shares: the entity and the year, the legal pages, the ways to reach us.
// The legal entity, one setting: a placeholder until the company is formed.
const ENTITY = "Opus Juris, LLC";
// The business address, one setting, one line per array entry.
const ADDRESS = ["185 Hudson Street, Suite 2940", "Jersey City, NJ 07311"];
const YEAR = new Date().getFullYear();
const FOOTER = `<div class="edge">
  <footer>
    <span>\u00a9 ${YEAR} ${ENTITY}. ${ADDRESS.join(", ")}.</span>
    <nav aria-label="Site"><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="security.html">Security</a><a href="accessibility.html">Accessibility</a><a href="mailto:info@opusjuris.com">info@opusjuris.com</a><a href="tel:+15513510500">+1 (551) 351-0500</a></nav>
  </footer>
</div>`;
const page = fill(fs.readFileSync(path.join(here, "page.html"), "utf8")).replace("__FOOTER__", FOOTER);
const sharedCss = (page.match(/<style>[\s\S]*?<\/style>/) || [""])[0];
const demo = fill(fs.readFileSync(path.join(here, "demo-page.html"), "utf8")).replace("__SHARED_CSS__", sharedCss).replace("__FOOTER__", FOOTER);
// The text pages: each file in legal/ is the content of one page built through doc-page.html.
const docTemplate = fill(fs.readFileSync(path.join(here, "doc-page.html"), "utf8")).replace("__SHARED_CSS__", sharedCss).replace("__FOOTER__", FOOTER);
const docs = fs.readdirSync(path.join(here, "legal")).filter((f) => f.endsWith(".html")).map((f) => {
  const content = fs.readFileSync(path.join(here, "legal", f), "utf8").trim();
  const title = (content.match(/<h1>([^<]+)<\/h1>/) || [, f])[1];
  return { name: f, title, html: docTemplate.replace("__TITLE__", title + " | Opus Juris").replace("__CONTENT__", content).replace(/__ENTITY__/g, ENTITY).replace(/__ADDRESS__/g, ADDRESS.join("<br>")) };
});
fs.mkdirSync(path.join(here, "dist", "img"), { recursive: true });
for (const f of fs.readdirSync(path.join(here, "img"))) fs.copyFileSync(path.join(here, "img", f), path.join(here, "dist", "img", f));
// The embedded form (what the artifact wraps itself).
fs.writeFileSync(path.join(here, "dist", "page.embedded.html"), page);
// Hosted pages link to clean addresses: GitHub Pages serves demo.html at /demo,
// so the links say /demo, and the home page is /. The sources keep the file
// names so the embedded preview copy, which has no server, still works.
const CLEAN = { "index.html": "/", "demo.html": "/demo", "privacy.html": "/privacy", "terms.html": "/terms", "security.html": "/security", "accessibility.html": "/accessibility" };
const cleanLinks = (html) => html.replace(/href="([a-z]+\.html)"/g, (m, f) => (CLEAN[f] ? 'href="' + CLEAN[f] + '"' : m));
// A full document for hosting: head parts first, then the rest in the body.
const wrap = (src, description) => {
  src = cleanLinks(src);
  const headEnd = src.indexOf("<header");
  const headPart = src.slice(0, headEnd);
  const bodyPart = src.slice(headEnd);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${description}">
<link rel="icon" href="data:image/png;base64,${mark}">
${headPart}
</head>
<body>
${bodyPart}
</body>
</html>
`;
};
const indexDoc = wrap(page, "AI powered court drafting software. Lawyer driven, AI assisted: court filings drafted from court-ready templates, every citation checked against a full law library.");
const demoDoc = wrap(demo, "Request a demo of Opus Juris: a walkthrough of the app on a real motion.");
fs.writeFileSync(path.join(here, "dist", "index.html"), indexDoc);
// GitHub Pages: the custom domain, and no Jekyll pass over the output.
fs.writeFileSync(path.join(here, "dist", "CNAME"), "opusjuris.com\n");
fs.writeFileSync(path.join(here, "dist", ".nojekyll"), "");
fs.writeFileSync(path.join(here, "dist", "demo.html"), demoDoc);
for (const doc of docs) fs.writeFileSync(path.join(here, "dist", doc.name), wrap(doc.html, doc.title + " for opusjuris.com, the website of " + ENTITY + "."));
console.log("built " + docs.map((d) => "dist/" + d.name).join(", "));
console.log("built dist/index.html (" + Math.round(indexDoc.length / 1024) + " KB), dist/demo.html (" + Math.round(demoDoc.length / 1024) + " KB) and dist/page.embedded.html");
