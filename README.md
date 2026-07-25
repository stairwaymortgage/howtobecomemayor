# How to Become Mayor — Website

A multi-file static site, ready to deploy on **Vercel** with clean URLs (no `.html` in the address bar).

---

## File structure

```
.
├── index.html          → /
├── about.html          → /about
├── blog.html           → /blog
├── apply.html          → /apply
├── contact.html        → /contact
├── privacy.html        → /privacy
├── vercel.json         (clean-URL rewrites + redirects; the retired form URL 301s to /apply)
├── README.md
├── api/
│   └── submit.js       (serverless function — email delivery + GHL CRM sync)
├── GHL-SETUP.md        (GoHighLevel field spec + connection walkthrough)
├── css/
│   └── style.css       (all styles, single file)
└── js/
    ├── components.js   (shared header + footer — single source of truth)
    └── main.js         (page interactions, forms, scroll effects)
```

**Pages live in the root.** No subfolders for pages, by design.

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
cd /path/to/this/folder
vercel            # follow prompts to link/create the project
vercel --prod     # promote to production
```

### Option B — Vercel Dashboard (drag and drop)

1. Visit **vercel.com/new**.
2. Drag the entire project folder onto the upload area (or connect the Git repo).
3. Framework Preset: **Other** (Vercel will auto-detect it as static).
4. Build Command: leave blank.
5. Output Directory: leave blank (root of the project).
6. Click **Deploy**.

### Option C — Git (recommended for ongoing edits)

1. Push this folder to a GitHub / GitLab / Bitbucket repo.
2. In Vercel, click **Add New → Project** and import the repo.
3. Accept the defaults. Vercel will deploy `main` on every push.

After the first deploy, set your custom domain in **Project → Settings → Domains**.

---

## Clean URLs

`vercel.json` does two things:

1. **`cleanUrls: true`** — Vercel will silently serve `/about.html` when the visitor requests `/about`.
2. **Explicit `rewrites`** for every page — belt-and-suspenders, so the behavior is predictable even if the global flag is changed later.
3. **`redirects`** from the `.html` form to the clean form — anyone landing on `/about.html` is permanently redirected to `/about`.

Every internal link in the HTML uses the clean form (`/about`, `/contact`, `/apply`, etc.). **Never write `href="about.html"` in any page** — always use the clean path.

---

## How the shared header & footer work

Every page contains exactly two placeholder divs:

```html
<div id="nav-placeholder"></div>
…page content…
<div id="footer-placeholder"></div>
```

And loads two scripts at the bottom of `<body>`:

```html
<script src="/js/components.js"></script>
<script src="/js/main.js"></script>
```

`components.js` runs on `DOMContentLoaded`, injects the header HTML into `#nav-placeholder` and the footer HTML into `#footer-placeholder`, then marks the active nav link by matching `window.location.pathname`.

### To change the navigation or footer site-wide

Open **`js/components.js`** and edit:

- `navHTML` — the entire header markup (logo, nav links, mobile toggle).
- `footerHTML` — the entire footer markup (columns, copy, links).

Save the file. **Every page updates immediately** the next time it is loaded. You do not need to touch any HTML file.

### To add a new page

1. Duplicate any existing page (e.g. `about.html`) and rename it (e.g. `events.html`).
2. Change the `<title>`, `<meta name="description">`, and the inner content.
3. Make sure it still has `<div id="nav-placeholder"></div>` and `<div id="footer-placeholder"></div>` and loads `components.js` + `main.js` at the bottom.
4. Add a clean-URL rewrite + redirect in `vercel.json`:
   ```json
   { "source": "/events", "destination": "/events.html" }
   ```
   …and the corresponding redirect from `/events.html` → `/events`.
5. Add the link to `navHTML` and/or `footerHTML` inside `components.js`.

That is the entire flow.

---

## Local preview

Any static server works. Two easy options:

```bash
# Python (built-in)
python3 -m http.server 8000
# then open http://localhost:8000

# Vercel CLI (closest to production — honors vercel.json)
vercel dev
# then open http://localhost:3000
```

`vercel dev` is preferred because it applies the `cleanUrls` and rewrites from `vercel.json`, which `python3 -m http.server` does not.

---

## Forms — LIVE (one 5-minute setup step required)

Both forms (`/apply` and `/contact`) submit for real to a Vercel serverless function at `api/submit.js`, which delivers each submission to your private inbox by email via [Resend](https://resend.com). Applications arrive fully formatted, with **Reply-To set to the applicant** so you can respond with one click.

### Setup (once, ~5 minutes)

1. Create a free account at **resend.com** (free plan: 3,000 emails/month — far more than enough).
2. In Resend, create an **API key** (starts with `re_`).
3. In Vercel → your project → **Settings → Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | your Resend key |
   | `SUBMISSIONS_EMAIL` | the private inbox that receives applications — **must be the same email you signed up to Resend with** (until you verify a domain, Resend only delivers to the account owner's address) |

4. Redeploy. Done — submit a test application and check your inbox.

### Later (optional, recommended): send from your own domain

Verify `howtobecomemayor.com` in Resend (Settings → Domains, add the DNS records they show). Then add a third environment variable:

   | Name | Value |
   |---|---|
   | `FROM_EMAIL` | `applications@howtobecomemayor.com` |

After domain verification, `SUBMISSIONS_EMAIL` can be **any** inbox, not just the Resend account owner's.

### Privacy note

Application answers — including the Q11 disclosure — travel: visitor's browser → your Vercel function → Resend → your inbox. Nothing is stored on the website itself, and nothing is written to any database. If you ever want submissions stored somewhere in addition to email, that's a deliberate decision to make later, not a default.

### GoHighLevel CRM sync (optional, recommended)

When two more environment variables are set, every **application** is also upserted into GoHighLevel as a contact — custom fields populated, tagged `mayor-application` so workflows can trigger:

   | Name | Value |
   |---|---|
   | `GHL_PIT_TOKEN` | Private Integration token (Settings → Private Integrations; scopes: View/Edit Contacts) |
   | `GHL_LOCATION_ID` | Settings → Business Profile |

**The nine custom fields must be created in GHL first, with exact keys — see `GHL-SETUP.md` in this folder for the field table and full walkthrough.** Upserts match by email (no duplicates on reapplication). Email remains the primary delivery: if GHL is down or misconfigured, the application still arrives in the inbox, the applicant still sees success, and the error is logged in Vercel's function logs. Contact-form messages go to email only, not the CRM.

### Spam protection

Both forms carry an invisible honeypot field. Bots that fill it get a fake success response and no email is ever sent. No CAPTCHA needed at this traffic level.

## Browser support

Modern evergreen browsers. The CSS uses CSS variables, grid, and `backdrop-filter`; the JS uses standard ES2017 plus `IntersectionObserver` (with a graceful fallback).
