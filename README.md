# opusjuris.com

The marketing site for Opus Juris. One static page, no framework, no build
step beyond `node build.js`, which embeds the mark and writes `dist/`.

- `page.html` is the page: styles at the top, then the content.
- `assets/mark-128.png` is the mark (from the application's icon).
- `build.js` writes `dist/index.html` (the file a host serves) and
  `dist/page.embedded.html` (the preview artifact form).

## Text pages

- legal/privacy.html, legal/terms.html, legal/security.html and legal/accessibility.html are the contents of the Privacy Policy, Terms of Use, Security and Accessibility pages; build.js wraps each in doc-page.html (same header and footer) and writes dist/privacy.html, dist/terms.html, dist/security.html.
- The footer on every page (entity, year, address, the four links, email and phone) is the FOOTER string in build.js. The entity name (ENTITY) and the business address (ADDRESS) are settings at the top of build.js; the entity name is a placeholder until the company is formed.

## Hosting

GitHub Pages, from the repository gacarkan/opusjuris-site, with the domain at GoDaddy:

- .github/workflows/pages.yml builds the site (node build.js) and publishes dist/ on every push to main. dist/ and unused/ are not committed.
- build.js writes dist/CNAME (opusjuris.com) and dist/.nojekyll.
- DNS at GoDaddy: four A records for @ to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153, and a CNAME for www to gacarkan.github.io. The custom domain is set in the repository's Pages settings; Enforce HTTPS goes on once GitHub has issued the certificate.
- The mailbox hello@opusjuris.com must exist (a GoDaddy mailbox or forwarding) before the site goes live; the demo form opens the visitor's mail app to it, or posts to a form service when data-endpoint is set in demo-page.html.

Rules carried over from the application: no em or en dashes anywhere, no
vendor names in the copy (the citation database, the library), nothing
invented as a statistic.


## Demo request page

- Source: demo-page.html (shares the landing page stylesheet at build time). Built to dist/demo.html by node build.js. Every "Request a demo" link on the landing page points at demo.html.
- Today the form has no form service: on submit it opens the visitor's mail app with the request pre-filled to hello@opusjuris.com (works on GitHub Pages with nothing to set up).
- To receive requests without the mail app: create a form endpoint (for example a Formspree form, free tier) and put its URL in the form's data-endpoint attribute in demo-page.html; the page then posts the fields as JSON and shows the thank-you state. Rebuild and publish.
- Fields: first name, last name, email, phone (optional), firm, firm size, where they file (optional).
