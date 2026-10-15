// One-off edit: the hosted pages link to clean addresses (/demo, /privacy,
// the home page as /) instead of file names. The sources keep the file
// names, and build.js rewrites them for dist/; the embedded preview copy is
// left as it was. Run once:
//   node tools/apply-clean-links.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const write = (f, s) => fs.writeFileSync(path.join(root, f), s);
const rep = (s, a, b, name) => { if (!s.includes(a)) { console.error("MISSING in " + name + ": " + a.slice(0, 80)); process.exit(1); } return s.replace(a, b); };

let b = read("build.js");
b = rep(b, `// A full document for hosting: head parts first, then the rest in the body.
const wrap = (src, description) => {`,
`// Hosted pages link to clean addresses: GitHub Pages serves demo.html at /demo,
// so the links say /demo, and the home page is /. The sources keep the file
// names so the embedded preview copy, which has no server, still works.
const CLEAN = { "index.html": "/", "demo.html": "/demo", "privacy.html": "/privacy", "terms.html": "/terms", "security.html": "/security", "accessibility.html": "/accessibility" };
const cleanLinks = (html) => html.replace(/href="([a-z]+\\.html)"/g, (m, f) => (CLEAN[f] ? 'href="' + CLEAN[f] + '"' : m));
// A full document for hosting: head parts first, then the rest in the body.
const wrap = (src, description) => {`, "build.js");
b = rep(b, `  const headEnd = src.indexOf("<header");`, `  src = cleanLinks(src);
  const headEnd = src.indexOf("<header");`, "build.js");
write("build.js", b);

let r = read("README.md");
r = r.replace("- build.js writes dist/CNAME (opusjuris.com) and dist/.nojekyll.",
  "- build.js writes dist/CNAME (opusjuris.com) and dist/.nojekyll, and rewrites page links to clean addresses (/demo, /privacy; the home page is /) because GitHub Pages serves demo.html at /demo. The sources keep the file names.");
write("README.md", r);
console.log("clean links applied");
