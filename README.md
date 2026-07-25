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
│   └── submit.js       (serverless function — GoHighLevel delivery)
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

Both forms (`/apply` and `/contact`) submit for real to a Vercel serverless function at `api/submit.js`, which delivers every submission into **GoHighLevel** as a contact. GHL is the only destination — the site sends no email itself.

### Setup (once, ~5 minutes)

1. Create the custom fields and tags in GHL **first** — see `GHL-SETUP.md` for the exact field table. If a key doesn't match, that answer silently won't sync.
2. In Vercel → your project → **Settings → Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `GHL_PIT_TOKEN` | Private Integration token (Settings → Private Integrations; scopes: View/Edit Contacts) |
   | `GHL_LOCATION_ID` | Settings → Business Profile |

3. Redeploy. Done — submit a test application and check that the contact appears in GHL.

If either variable is missing, both forms return a clear "not configured yet" error rather than pretending to succeed.

### What lands where

| Form | Tag | Custom fields |
|---|---|---|
| `/apply` | `mayor-application` | the nine `application_*` fields |
| `/contact` | `contact-form-message` | `contact_subject`, `contact_message` |

Both upsert by email, so a repeat submission updates the existing contact instead of duplicating it. The contact `source` is set to `howtobecomemayor.com`.

### Email notifications

Handled inside GoHighLevel, not by this site. Build a workflow triggered on the **`mayor-application`** tag to notify the Review Panel (and, if you want them, a second workflow on `contact-form-message`). Changing who gets notified is a GHL change, not a code change or a redeploy.

### If GHL is unreachable

The submitter sees **"Delivery failed. Please try again shortly."** and the form stays filled in so they can retry. This is deliberate: GHL is the only record, so a failed upsert is a failed submission and must not be reported as success. The underlying error is logged in Vercel's function logs.

### Privacy note

Application answers — including the Q11 disclosure — travel: visitor's browser → your Vercel function → GoHighLevel. Nothing is stored on the website itself, and nothing is written to any other database. Everyone with Contacts access in that GHL location can read those answers — see Part 5 of `GHL-SETUP.md`.

### Spam protection

Both forms carry an invisible honeypot field. Bots that fill it get a fake success response and no email is ever sent. No CAPTCHA needed at this traffic level.

## Browser support

Modern evergreen browsers. The CSS uses CSS variables, grid, and `backdrop-filter`; the JS uses standard ES2017 plus `IntersectionObserver` (with a graceful fallback).
