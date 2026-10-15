// One-off edit: replaces the demo form's native selects and date picker with
// the page's own dropdown control (markup, styles and behavior). Run once:
//   node tools/apply-dropdowns.js
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "demo-page.html");
let p = fs.readFileSync(file, "utf8");
const rep = (a, b) => { if (!p.includes(a)) { console.error("MISSING: " + a.slice(0, 70)); process.exit(1); } p = p.replace(a, b); };
const CHEV = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
const sel = (name, label, opts, small, extra) =>
  '<label>' + label + (small ? ' <small>optional</small>' : '') +
  '<div class="sel" data-name="' + name + '"' + (extra || '') + '><button type="button" class="sel-btn" aria-haspopup="listbox" aria-expanded="false"><span class="sel-val">' + opts[0] + '</span>' + CHEV + '</button>' +
  '<ul class="sel-list" role="listbox" hidden>' + opts.map((o, i) => '<li role="option" data-value="' + (i === 0 ? '' : o) + '"' + (i === 0 ? ' class="on"' : '') + '>' + o + '</li>').join('') + '</ul>' +
  '<input type="hidden" name="' + name + '" value=""></div></label>';

rep('<label>Role<select name="role"><option value="">Choose</option><option>Partner</option><option>Associate</option><option>Paralegal</option><option>Office manager</option><option>Other</option></select></label>',
  sel('role', 'Role', ['Choose', 'Partner', 'Associate', 'Paralegal', 'Office manager', 'Other']));
rep('<label>Firm size<select name="size"><option value="">Choose</option><option>1 to 5 people</option><option>6 to 20 people</option><option>21 to 50 people</option><option>More than 50 people</option></select></label>',
  sel('size', 'Firm size', ['Choose', '1 to 5 people', '6 to 20 people', '21 to 50 people', 'More than 50 people']));
rep('<label>Where you file<select name="practice"><option value="">Choose</option><option>NJ</option><option>NY</option><option>FL</option><option>Other</option></select></label>',
  sel('practice', 'Where you file', ['Choose', 'NJ', 'NY', 'FL', 'Other']));
rep('<label>Preferred date <small>optional</small><input name="date" type="date"></label>',
  sel('date', 'Preferred date', ['Any day'], true, ' data-days="10"'));
rep('<label>Preferred time <small>optional</small><select name="time"><option value="">Any time</option><option>Morning</option><option>Afternoon</option></select></label>',
  sel('time', 'Preferred time', ['Any time', 'Morning', 'Afternoon'], true));

rep('textarea { min-height: 96px; resize: vertical; }', `textarea { min-height: 96px; resize: vertical; }
/* The page's own dropdown: a button that opens a list, styled like the inputs. */
.sel { position: relative; }
.sel-btn { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; font: inherit; font-size: 1rem; color: var(--ink); background: var(--bg); border: 1px solid #cfd3dc; border-radius: 10px; padding: 11px 13px; cursor: pointer; text-align: left; }
.sel-btn:focus-visible, .sel.open .sel-btn { outline: none; border-color: var(--ink); box-shadow: 0 0 0 3px rgba(22,33,58,0.12); }
.sel-btn svg { flex: 0 0 auto; color: var(--ink-2); transition: transform .15s ease; }
.sel.open .sel-btn svg { transform: rotate(180deg); }
.sel-val.empty { color: var(--ink-2); }
.sel-list { position: absolute; left: 0; right: 0; top: calc(100% + 6px); margin: 0; padding: 6px; list-style: none; background: var(--bg); border: 1px solid var(--rule); border-radius: 12px; box-shadow: 0 16px 40px rgba(16,24,48,0.16), 0 2px 6px rgba(16,24,48,0.06); z-index: 20; max-height: 280px; overflow-y: auto; }
.sel-list li { padding: 9px 11px; border-radius: 8px; cursor: pointer; font-size: 0.98rem; color: var(--ink); display: flex; align-items: center; justify-content: space-between; }
.sel-list li:hover, .sel-list li.hl { background: var(--panel); }
.sel-list li.on { font-weight: 600; }
.sel-list li.on::after { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }`);

rep('  form.addEventListener("input", function (e) { if (e.target && e.target.style) e.target.style.borderColor = ""; });\n})();', `  form.addEventListener("input", function (e) { if (e.target && e.target.style) e.target.style.borderColor = ""; });

  // Dropdowns: open on click, pick with the mouse or the arrow keys, close on Escape or a click elsewhere.
  var open = null;
  function close() { if (!open) return; open.classList.remove("open"); open.querySelector(".sel-list").hidden = true; open.querySelector(".sel-btn").setAttribute("aria-expanded", "false"); open = null; }
  function pick(sel, li) {
    var val = li.getAttribute("data-value") || "";
    sel.querySelector("input[type=hidden]").value = val;
    var v = sel.querySelector(".sel-val"); v.textContent = li.textContent; v.classList.toggle("empty", !val);
    sel.querySelectorAll("li").forEach(function (x) { x.classList.toggle("on", x === li); x.classList.remove("hl"); });
    close(); sel.querySelector(".sel-btn").focus();
  }
  document.querySelectorAll(".sel").forEach(function (sel) {
    var btn = sel.querySelector(".sel-btn"), list = sel.querySelector(".sel-list");
    var days = parseInt(sel.getAttribute("data-days") || "0", 10);
    if (days) {
      var d = new Date(); d.setDate(d.getDate() + 1); var n = 0;
      while (n < days) {
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          var li = document.createElement("li"); li.setAttribute("role", "option");
          li.setAttribute("data-value", d.toISOString().slice(0, 10));
          li.textContent = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
          list.appendChild(li); n++;
        }
        d.setDate(d.getDate() + 1);
      }
    }
    sel.querySelector(".sel-val").classList.add("empty");
    btn.addEventListener("click", function () { if (open === sel) { close(); return; } close(); open = sel; sel.classList.add("open"); list.hidden = false; btn.setAttribute("aria-expanded", "true"); });
    list.addEventListener("click", function (e) { var li = e.target.closest("li"); if (li) pick(sel, li); });
    btn.addEventListener("keydown", function (e) {
      var items = Array.prototype.slice.call(list.querySelectorAll("li"));
      var cur = items.findIndex(function (x) { return x.classList.contains("hl"); });
      if (cur < 0) cur = items.findIndex(function (x) { return x.classList.contains("on"); });
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (open !== sel) btn.click();
        var next = e.key === "ArrowDown" ? Math.min(items.length - 1, cur + 1) : Math.max(0, cur - 1);
        items.forEach(function (x, i) { x.classList.toggle("hl", i === next); }); items[next].scrollIntoView({ block: "nearest" });
      } else if ((e.key === "Enter" || e.key === " ") && open === sel) {
        e.preventDefault(); var hl = items.find(function (x) { return x.classList.contains("hl"); }); if (hl) pick(sel, hl); else close();
      } else if (e.key === "Escape") { close(); }
    });
  });
  document.addEventListener("mousedown", function (e) { if (open && !open.contains(e.target)) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
})();`);
fs.writeFileSync(file, p);
console.log("dropdowns applied; native selects left:", (p.match(/<select/g) || []).length);
