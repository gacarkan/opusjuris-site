// One-off edit: the Contact page goes away; the full business address moves
// into the footer line and into the contact sections of the privacy and
// terms pages. Run once:
//   node tools/apply-drop-contact.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const write = (f, s) => fs.writeFileSync(path.join(root, f), s);
const rep = (s, a, b, name) => { if (!s.includes(a)) { console.error("MISSING in " + name + ": " + a.slice(0, 80)); process.exit(1); } return s.replace(a, b); };

let b = read("build.js");
b = rep(b, "<span>\\u00a9 ${YEAR} ${ENTITY}. Jersey City, New Jersey.</span>", "<span>\\u00a9 ${YEAR} ${ENTITY}. ${ADDRESS.join(\", \")}.</span>", "build.js");
b = rep(b, `<nav aria-label="Site"><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a>`, `<nav aria-label="Site"><a href="privacy.html">Privacy</a>`, "build.js");
write("build.js", b);

for (const f of ["legal/privacy.html", "legal/terms.html"]) {
  let s = read(f);
  s = rep(s, `<p>__ENTITY__, Jersey City, New Jersey. <a href="mailto:hello@opusjuris.com">hello@opusjuris.com</a>, <a href="tel:+12019041020">+1 (201) 904-1020</a>.</p>`,
    `<p>__ENTITY__<br>__ADDRESS__<br><a href="mailto:hello@opusjuris.com">hello@opusjuris.com</a><br><a href="tel:+12019041020">+1 (201) 904-1020</a></p>`, f);
  write(f, s);
}

fs.unlinkSync(path.join(root, "legal", "contact.html"));
try { fs.unlinkSync(path.join(root, "dist", "contact.html")); } catch (e) {}

let r = read("README.md");
r = r.replace("legal/contact.html, legal/privacy.html, legal/terms.html and legal/security.html are the contents of the Contact, Privacy Policy, Terms of Use and Security pages;",
  "legal/privacy.html, legal/terms.html and legal/security.html are the contents of the Privacy Policy, Terms of Use and Security pages;");
r = r.replace("The footer on every page (entity, year, the three links, email and phone)", "The footer on every page (entity, year, address, the three links, email and phone)");
write("README.md", r);
console.log("contact page removed; address in the footer");
