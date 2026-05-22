const fs = require('fs');
const slugs = ["how-to-become-mayor-with-no-experience","first-step-to-becoming-mayor","how-long-does-it-take-to-become-mayor","requirements-to-run-for-mayor","how-to-get-involved-in-local-government","what-does-a-mayor-do","how-to-run-for-mayor-with-no-money","how-to-start-a-political-career","difference-between-mayor-and-city-manager","is-it-too-late-to-become-mayor","how-to-build-credibility-to-run-for-office","how-to-become-known-in-your-community","civic-organizations-for-political-credibility","how-to-join-a-city-advisory-board","how-to-get-people-to-trust-you-as-a-candidate","personal-branding-for-politicians","how-politicians-build-trust-with-voters","how-to-become-a-community-leader","should-i-run-for-city-council-before-mayor","how-much-does-it-cost-to-run-for-mayor","how-to-fundraise-for-a-local-political-campaign","how-to-get-endorsements-for-a-local-election","how-to-win-a-local-election-with-no-name-recognition","how-to-get-your-name-on-the-ballot","how-to-knock-on-doors-for-a-campaign","how-to-campaign-for-mayor-on-a-small-budget","how-many-votes-to-win-a-mayoral-election","how-do-local-elections-work","what-issues-matter-most-in-a-mayoral-election","how-to-identify-important-issues-in-your-city","how-neighborhood-associations-influence-elections","most-important-people-to-know-in-local-politics","real-power-structure-in-a-city","how-to-build-a-political-coalition","how-to-become-mayor-as-a-political-outsider","can-a-businessperson-become-mayor","how-to-compete-against-a-career-politician","advantages-of-an-outsider-candidate","how-to-run-for-mayor-without-a-political-party","program-for-learning-how-to-become-mayor"];

// 1) Rename post-N-slug.html -> slug.html
let renamed = 0, missing = [];
slugs.forEach((slug,i) => {
  const src = `post-${i+1}-${slug}.html`;
  const dst = `${slug}.html`;
  if (fs.existsSync(src)) { fs.renameSync(src, dst); renamed++; }
  else if (!fs.existsSync(dst)) missing.push(src);
});
console.log('Renamed: ' + renamed + (missing.length ? ' MISSING: '+missing.join(',') : ''));

// 2) Build vercel.json
const rewrites = [
  { source: "/", destination: "/index.html" },
  { source: "/blog", destination: "/blog.html" },
  { source: "/apply", destination: "/application.html" },
  ...slugs.map(s => ({ source: "/" + s, destination: "/" + s + ".html" }))
];
const vercel = { cleanUrls: true, trailingSlash: false, rewrites };
fs.writeFileSync('vercel.json', JSON.stringify(vercel, null, 2) + '\n');
console.log('vercel.json written with ' + rewrites.length + ' rewrites');

// 3) Verify all destination files exist
const bad = rewrites.filter(r => { const f = r.destination.replace(/^\//,''); return !fs.existsSync(f); });
console.log(bad.length ? 'MISSING DEST FILES: ' + bad.map(b=>b.destination).join(', ') : 'All destination files present.');
