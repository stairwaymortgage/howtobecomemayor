const fs = require('fs');
const files = fs.readdirSync('.').filter(f => /^post-\d+-.*\.html$/.test(f));
let okCount = 0;
const problems = [];

function replaceMatchedDiv(html, openTag) {
  const start = html.indexOf(openTag);
  if (start === -1) return null;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  let depth = 0, m, end = -1;
  while ((m = re.exec(html))) {
    if (m[0] === '</div>') { depth--; if (depth === 0) { end = re.lastIndex; break; } }
    else depth++;
  }
  if (end === -1) return null;
  return { before: html.slice(0, start), block: html.slice(start, end), after: html.slice(end) };
}

files.forEach(f => {
  let html = fs.readFileSync(f, 'utf8');
  const issues = [];

  // 1) Replace inline <nav class="nav">...</nav>
  const navRe = /<nav class="nav">[\s\S]*?<\/nav>/;
  if (navRe.test(html)) {
    html = html.replace(navRe, '<div id="nav-placeholder"></div>');
  } else issues.push('no nav matched');

  // 2) Replace footer div (depth-matched)
  const fr = replaceMatchedDiv(html, '<div class="footer">');
  if (fr) {
    html = fr.before + '<div id="footer-placeholder"></div>' + fr.after;
  } else issues.push('no footer matched');

  // 3) Insert components.js script before </body> (once)
  if (!html.includes('/js/components.js')) {
    html = html.replace(/<\/body>/i, '<script src="/js/components.js"></script>\n</body>');
  }

  // Verify
  const navPh = (html.match(/id="nav-placeholder"/g) || []).length;
  const footPh = (html.match(/id="footer-placeholder"/g) || []).length;
  const oldNav = (html.match(/<nav class="nav">/g) || []).length;
  const oldFoot = (html.match(/<div class="footer">/g) || []).length;
  const scriptN = (html.match(/\/js\/components\.js/g) || []).length;
  if (navPh!==1||footPh!==1||oldNav!==0||oldFoot!==0||scriptN!==1) {
    issues.push(`counts navPh=${navPh} footPh=${footPh} oldNav=${oldNav} oldFoot=${oldFoot} script=${scriptN}`);
  }

  if (issues.length) { problems.push(f + ': ' + issues.join('; ')); }
  else { fs.writeFileSync(f, html); okCount++; }
});

console.log('Transformed OK: ' + okCount + '/' + files.length);
if (problems.length) { console.log('PROBLEMS:'); problems.forEach(p => console.log('  ' + p)); }
