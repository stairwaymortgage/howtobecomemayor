/* How To Become Mayor — shared header + footer.
   Injects a ticker bar + nav into #nav-placeholder and the footer into
   #footer-placeholder, along with its own scoped styles. Load once per page:
   <script src="/js/components.js"></script> */
(function () {
  "use strict";

  var CSS = [
    /* ── Scrolling ticker bar ── */
    ".ticker-wrap { background: #c0392b; overflow: hidden; padding: 8px 0; }",
    ".ticker { display: flex; animation: ticker 30s linear infinite; white-space: nowrap; }",
    ".ticker span { padding: 0 40px; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: white; text-transform: uppercase; }",
    "@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }",

    /* ── Main nav bar ── */
    ".hbm-nav { background: #0a1628; border-bottom: 1px solid rgba(201,168,76,0.3); padding: 0 40px; display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 68px; font-family: 'DM Sans', sans-serif; }",
    ".hbm-brand { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700; color: #fff; text-decoration: none; line-height: 1.15; }",
    ".hbm-brand span { display: block; font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.18em; color: #c9a84c; text-transform: uppercase; margin-top: 3px; }",
    ".hbm-nav-right { display: flex; align-items: center; gap: 28px; }",
    ".hbm-link { font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s; white-space: nowrap; }",
    ".hbm-link:hover { color: #c9a84c; }",
    ".hbm-cta { background: #c9a84c; color: #0a1628; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 11px 22px; text-decoration: none; white-space: nowrap; transition: background 0.2s; }",
    ".hbm-cta:hover { background: #e8d5a3; }",

    /* ── Footer ── */
    ".hbm-footer { background: #0a1628; border-top: 1px solid rgba(201,168,76,0.3); padding: 48px 40px; font-family: 'DM Sans', sans-serif; }",
    ".hbm-footer-inner { max-width: 1040px; margin: 0 auto; }",
    ".hbm-footer-brand { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 10px; }",
    ".hbm-footer-tag { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.55); line-height: 1.7; max-width: 520px; margin-bottom: 20px; }",
    ".hbm-footer-links { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; font-size: 13px; color: rgba(255,255,255,0.4); }",
    ".hbm-footer-links a { color: #c9a84c; text-decoration: none; }",
    ".hbm-footer-links a:hover { text-decoration: underline; }",
    ".hbm-footer-sep { color: rgba(255,255,255,0.2); }",
    ".hbm-footer-copy { margin-top: 20px; font-size: 11px; color: rgba(255,255,255,0.25); line-height: 1.7; }",

    /* ── Responsive ── */
    "@media (max-width: 640px) {",
    "  .hbm-nav { padding: 0 16px; min-height: 60px; gap: 10px; }",
    "  .hbm-brand { font-size: 17px; }",
    "  .hbm-nav-right { gap: 16px; }",
    "  .hbm-link { font-size: 10px; letter-spacing: 0.08em; }",
    "  .hbm-cta { padding: 9px 14px; font-size: 10px; }",
    "  .ticker span { padding: 0 24px; }",
    "  .hbm-footer { padding: 36px 16px; }",
    "}",
    "@media (max-width: 460px) { .hbm-link { display: none; } }"
  ].join("\n");

  var CITIES = [
    "Austin, TX — Seat Claimed",
    "Nashville, TN — Seat Claimed",
    "Scottsdale, AZ — Seat Claimed",
    "Raleigh, NC — 1 on Waitlist",
    "Tampa, FL — Seat Claimed"
  ];

  function tickerInner() {
    // One "half" wide enough to span any viewport, then duplicated so the
    // -50% keyframe loops seamlessly.
    var half = "";
    for (var r = 0; r < 4; r++) {
      for (var i = 0; i < CITIES.length; i++) {
        half += "<span>" + CITIES[i] + "</span>";
      }
    }
    return half + half;
  }

  var HEADER =
    '<div class="ticker-wrap"><div class="ticker">' + tickerInner() + "</div></div>" +
    '<nav class="hbm-nav">' +
      '<a class="hbm-brand" href="/">How To Become Mayor<span>City Seat Application</span></a>' +
      '<div class="hbm-nav-right">' +
        '<a class="hbm-link" href="/apply">Student Application</a>' +
        '<a class="hbm-link" href="/blog">Blog</a>' +
        '<a class="hbm-cta" href="/apply">Check Your City →</a>' +
      "</div>" +
    "</nav>";

  var FOOTER =
    '<div class="hbm-footer"><div class="hbm-footer-inner">' +
      '<div class="hbm-footer-brand">How To Become Mayor</div>' +
      '<div class="hbm-footer-tag">The Only Coaching Community for Future Mayors in America. One exclusive seat per city.</div>' +
      '<div class="hbm-footer-links">' +
        '<a href="/">HowToBecomeMayor.com</a>' +
        '<span class="hbm-footer-sep">|</span>' +
        '<a href="https://fortlauderdalemayor.org" target="_blank" rel="noopener">FortLauderdaleMayor.org</a>' +
        '<span class="hbm-footer-sep">|</span>' +
        '<span>Character Branding® is a registered trademark of James J. Blackburn.</span>' +
      "</div>" +
      '<div class="hbm-footer-copy">&copy; ' + new Date().getFullYear() +
        ' How To Become Mayor. All rights reserved. One seat per incorporated municipality. Founded by Jim Blackburn · Fort Lauderdale Mayor Project 2026–2040.</div>' +
    "</div></div>";

  function inject() {
    if (!document.getElementById("hbm-components-css")) {
      var style = document.createElement("style");
      style.id = "hbm-components-css";
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    var nav = document.getElementById("nav-placeholder");
    if (nav) nav.innerHTML = HEADER;
    var footer = document.getElementById("footer-placeholder");
    if (footer) footer.innerHTML = FOOTER;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
