// One-off edit: the business address becomes a build setting, the text pages
// can use __ADDRESS__, and the footer gains a Contact link. Run once:
//   node tools/apply-contact.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const write = (f, s) => fs.writeFileSync(path.join(root, f), s);
const rep = (s, a, b, name) => { if (!s.includes(a)) { console.error("MISSING in " + name + ": " + a.slice(0, 80)); process.exit(1); } return s.replace(a, b); };

let b = read("build.js");
b = rep(b, `const ENTITY = "Opus Juris, LLC";`, `const ENTITY = "Opus Juris, LLC";
// The business address, one setting, one line per array entry.
const ADDRESS = ["185 Hudson Street, Suite 2940", "Jersey City, NJ 07311"];`, "build.js");
b = rep(b, `.replace("__CONTENT__", content).replace(/__ENTITY__/g, ENTITY) };`,
  `.replace("__CONTENT__", content).replace(/__ENTITY__/g, ENTITY).replace(/__ADDRESS__/g, ADDRESS.join("<br>")) };`, "build.js");
b = rep(b, `<nav aria-label="Site"><a href="privacy.html">Privacy</a>`, `<nav aria-label="Site"><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a>`, "build.js");
write("build.js", b);

// The doc page: a button inside a text page keeps the button's own look.
let t = read("doc-page.html");
t = rep(t, `.doc a:hover { color: var(--accent-2); }`, `.doc a:hover { color: var(--accent-2); }
.doc a.btn { color: #fff; }
.doc a.btn:hover { color: #fff; }`, "doc-page.html");
write("doc-page.html", t);

let r = read("README.md");
r = r.replace("legal/privacy.html, legal/terms.html and legal/security.html are the contents of the Privacy Policy, Terms of Use and Security pages;",
  "legal/contact.html, legal/privacy.html, legal/terms.html and legal/security.html are the contents of the Contact, Privacy Policy, Terms of Use and Security pages;");
r = r.replace("The entity name is a placeholder until the company is formed.", "The entity name (ENTITY) and the business address (ADDRESS) are settings at the top of build.js; the entity name is a placeholder until the company is formed.");
write("README.md", r);
console.log("contact applied");
