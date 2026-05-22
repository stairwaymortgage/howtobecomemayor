const fs = require('fs');

function matchDiv(html, openTag) {
  const start = html.indexOf(openTag);
  if (start === -1) return null;
  const re = /<div\b|<\/div>/g; re.lastIndex = start;
  let depth = 0, m, end = -1;
  while ((m = re.exec(html))) {
    if (m[0] === '</div>') { depth--; if (depth===0){ end = re.lastIndex; break; } } else depth++;
  }
  if (end === -1) return null;
  return [start, end];
}
function replaceDiv(html, openTag, replacement) {
  const r = matchDiv(html, openTag);
  if (!r) return { html, ok:false };
  return { html: html.slice(0,r[0]) + replacement + html.slice(r[1]), ok:true };
}

/* ---------- index.html ---------- */
let idx = fs.readFileSync('index.html','utf8');
let r1 = replaceDiv(idx, '<div class="fomo-bar">', '<div id="nav-placeholder"></div>');
idx = r1.html;
let r2 = replaceDiv(idx, '<div class="footer">', '<div id="footer-placeholder"></div>');
idx = r2.html;
const padBefore = idx.includes('padding-top: 44px;');
idx = idx.replace('padding-top: 44px;', 'padding-top: 0;');
if (!idx.includes('/js/components.js')) idx = idx.replace(/<\/body>/i, '<script src="/js/components.js"></script>\n</body>');
fs.writeFileSync('index.html', idx);
console.log('index.html: fomo->nav='+r1.ok+' footer='+r2.ok+' padFixed='+padBefore +
  ' navPh='+(idx.match(/id="nav-placeholder"/g)||[]).length +
  ' footPh='+(idx.match(/id="footer-placeholder"/g)||[]).length +
  ' oldFomo='+(idx.match(/class="fomo-bar"/g)||[]).length +
  ' oldFooter='+(idx.match(/<div class="footer">/g)||[]).length +
  ' script='+(idx.match(/\/js\/components\.js/g)||[]).length);

/* ---------- application.html ---------- */
let app = fs.readFileSync('application.html','utf8');
// remove the thin topbar announcement
app = app.replace(/<div class="topbar">[\s\S]*?<\/div>\s*/, '');
// replace the custom header (logo) with the shared nav placeholder
let a1 = replaceDiv(app, '<div class="header">', '<div id="nav-placeholder"></div>');
app = a1.html;
let a2 = replaceDiv(app, '<div class="footer">', '<div id="footer-placeholder"></div>');
app = a2.html;
if (!app.includes('/js/components.js')) app = app.replace(/<\/body>/i, '<script src="/js/components.js"></script>\n</body>');
fs.writeFileSync('application.html', app);
console.log('application.html: header->nav='+a1.ok+' footer='+a2.ok +
  ' topbar='+(app.match(/class="topbar"/g)||[]).length +
  ' navPh='+(app.match(/id="nav-placeholder"/g)||[]).length +
  ' footPh='+(app.match(/id="footer-placeholder"/g)||[]).length +
  ' oldHeader='+(app.match(/<div class="header">/g)||[]).length +
  ' script='+(app.match(/\/js\/components\.js/g)||[]).length);
