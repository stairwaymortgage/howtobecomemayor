const fs = require('fs');
const posts = JSON.parse(fs.readFileSync('_meta.json','utf8'));
function esc(s){return s.replace(/&(?!#?\w+;)/g,'&amp;');} // leave existing entities
const cards = posts.map(p => {
  const num = String(p.n).padStart(2,'0');
  return `      <a class="post-card" href="/${p.slug}">
        <div class="post-card-top">
          <span class="post-card-num">${num}</span>
          <span class="post-card-cat">${p.cat}</span>
        </div>
        <h2 class="post-card-title">${p.title}</h2>
        <p class="post-card-excerpt">${p.excerpt}</p>
        <div class="post-card-meta">
          <span class="post-card-time">${p.readtime}</span>
          <span class="post-card-arrow">Read →</span>
        </div>
      </a>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Blog — How To Become Mayor</title>
<meta name="description" content="Honest, complete answers to every question about becoming mayor — from your first commission meeting to your winning campaign. ${posts.length} in-depth guides built on the Character Branding system.">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --navy: #0a1628; --navy-mid: #1a2d4a; --navy-light: #243d5c;
  --gold: #c9a84c; --gold-light: #e8d5a3;
  --white: #ffffff; --border: rgba(201,168,76,0.3);
}
body { font-family: 'DM Sans', sans-serif; background: var(--navy); color: var(--white); }

/* HERO */
.blog-hero { background: var(--navy); padding: 72px 40px 52px; position: relative; overflow: hidden; }
.blog-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px); background-size: 60px 60px; }
.blog-hero-inner { position: relative; z-index: 1; max-width: 1040px; margin: 0 auto; }
.blog-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.blog-eyebrow-line { width: 40px; height: 1px; background: var(--gold); }
.blog-eyebrow-text { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); }
.blog-hero h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(38px, 6vw, 64px); font-weight: 700; line-height: 1.05; color: var(--white); margin-bottom: 22px; }
.blog-hero h1 em { color: var(--gold); font-style: italic; }
.blog-hero-sub { font-size: 17px; color: rgba(255,255,255,0.6); line-height: 1.75; max-width: 600px; font-weight: 300; }

/* GRID */
.blog-wrap { background: var(--navy); padding: 8px 40px 88px; }
.blog-grid { max-width: 1040px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.post-card { background: var(--navy-mid); border: 1px solid var(--border); padding: 28px 26px; text-decoration: none; display: flex; flex-direction: column; transition: border-color 0.2s, background 0.2s, transform 0.2s; }
.post-card:hover { border-color: var(--gold); background: var(--navy-light); transform: translateY(-3px); }
.post-card-top { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; margin-bottom: 18px; }
.post-card-num { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 700; color: var(--gold); opacity: 0.45; line-height: 1; }
.post-card-cat { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); text-align: right; }
.post-card-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: var(--white); line-height: 1.25; margin-bottom: 14px; }
.post-card-excerpt { font-size: 13.5px; color: rgba(255,255,255,0.5); line-height: 1.7; font-weight: 300; margin-bottom: 22px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
.post-card-meta { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(201,168,76,0.15); }
.post-card-time { font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 0.04em; }
.post-card-arrow { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); }

@media (max-width: 900px) {
  .blog-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .blog-hero { padding: 52px 20px 40px; }
  .blog-wrap { padding: 8px 20px 64px; }
  .blog-grid { grid-template-columns: 1fr; gap: 16px; }
  .post-card { padding: 24px 22px; }
}
</style>
</head>
<body>

<div id="nav-placeholder"></div>

<div class="blog-hero">
  <div class="blog-hero-grid"></div>
  <div class="blog-hero-inner">
    <div class="blog-eyebrow">
      <div class="blog-eyebrow-line"></div>
      <div class="blog-eyebrow-text">The How To Become Mayor Blog</div>
    </div>
    <h1>Every question about<br>becoming mayor — <em>answered.</em></h1>
    <p class="blog-hero-sub">${posts.length} in-depth guides covering the complete journey from engaged citizen to elected mayor. Built on the Character Branding® system. No spin — just the honest, complete answers most political books never give you.</p>
  </div>
</div>

<div class="blog-wrap">
  <div class="blog-grid">
${cards}
  </div>
</div>

<div id="footer-placeholder"></div>

<script src="/js/components.js"></script>
</body>
</html>
`;
fs.writeFileSync('blog.html', html);
console.log('Wrote blog.html with '+posts.length+' cards, '+html.length+' bytes');
