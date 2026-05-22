const fs = require('fs');
const slugs = ["how-to-become-mayor-with-no-experience","first-step-to-becoming-mayor","how-long-does-it-take-to-become-mayor","requirements-to-run-for-mayor","how-to-get-involved-in-local-government","what-does-a-mayor-do","how-to-run-for-mayor-with-no-money","how-to-start-a-political-career","difference-between-mayor-and-city-manager","is-it-too-late-to-become-mayor","how-to-build-credibility-to-run-for-office","how-to-become-known-in-your-community","civic-organizations-for-political-credibility","how-to-join-a-city-advisory-board","how-to-get-people-to-trust-you-as-a-candidate","personal-branding-for-politicians","how-politicians-build-trust-with-voters","how-to-become-a-community-leader","should-i-run-for-city-council-before-mayor","how-much-does-it-cost-to-run-for-mayor","how-to-fundraise-for-a-local-political-campaign","how-to-get-endorsements-for-a-local-election","how-to-win-a-local-election-with-no-name-recognition","how-to-get-your-name-on-the-ballot","how-to-knock-on-doors-for-a-campaign","how-to-campaign-for-mayor-on-a-small-budget","how-many-votes-to-win-a-mayoral-election","how-do-local-elections-work","what-issues-matter-most-in-a-mayoral-election","how-to-identify-important-issues-in-your-city","how-neighborhood-associations-influence-elections","most-important-people-to-know-in-local-politics","real-power-structure-in-a-city","how-to-build-a-political-coalition","how-to-become-mayor-as-a-political-outsider","can-a-businessperson-become-mayor","how-to-compete-against-a-career-politician","advantages-of-an-outsider-candidate","how-to-run-for-mayor-without-a-political-party","program-for-learning-how-to-become-mayor"];
function clean(s){return s.replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();}
const out=[];
slugs.forEach((slug,i)=>{
  const n=i+1;
  const f=`post-${n}-${slug}.html`;
  const h=fs.readFileSync(f,'utf8');
  const cat=(h.match(/article-eyebrow-text">([\s\S]*?)<\/div>/)||[])[1]||'';
  const title=(h.match(/<h1 class="article-title">([\s\S]*?)<\/h1>/)||[])[1]||'';
  const rt=(h.match(/meta-readtime">([\s\S]*?)<\/span>/)||[])[1]||'';
  const lede=(h.match(/class="article-lede">([\s\S]*?)<\/p>/)||[])[1]||'';
  out.push({n,slug,cat:clean(cat),title:clean(title),readtime:clean(rt).replace(/\s+/g,' '),excerpt:clean(lede)});
});
fs.writeFileSync('_meta.json',JSON.stringify(out,null,2));
console.log('Extracted '+out.length+' posts');
out.slice(0,3).forEach(p=>console.log(p.n,'|',p.cat,'|',p.title,'|',p.readtime));
