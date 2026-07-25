# GoHighLevel Setup — Membership Application
### HowToBecomeMayor.com → GHL Integration Spec

**Version 1.0**
**For:** Whoever administers the GoHighLevel account
**Purpose:** Every application submitted on the website must land in GoHighLevel as a contact with the full application mapped to custom fields, tagged so automations can fire. This document is the exact setup: field names, field keys, types, and the connection steps.

---

## Part 1 — Create the custom fields (do this first, exactly as written)

In GHL: **Settings → Custom Fields → Add Field**. Create the following nine fields, all under the **Contact** object. Create a folder/group called **"Mayor Application"** and put all nine in it.

**The "Unique Key" column matters most.** GHL auto-generates a key from the field name — edit it to match this table exactly (lowercase, underscores). The website's integration maps by these keys; if a key is different, that answer silently won't sync.

| # | Field Name | Type | Unique Key |
|---|---|---|---|
| 1 | Application — City to Serve | Single Line | `application_city` |
| 2 | Application — Target Year | Single Line | `application_target_year` |
| 3 | Application — Current Roles | Single Line | `application_current_roles` |
| 4 | Application — Q6 Life & Family Vision | Multi Line | `application_q6_life_vision` |
| 5 | Application — Q7 City Vision | Multi Line | `application_q7_city_vision` |
| 6 | Application — Q8 Larger Frame | Multi Line | `application_q8_frame` |
| 7 | Application — Q9 Long Horizon & Weekly Work | Multi Line | `application_q9_work` |
| 8 | Application — Q10 Public Setback | Multi Line | `application_q10_setback` |
| 9 | Application — Q11 Disclosure | Multi Line | `application_q11_disclosure` |

Name and email do **not** need custom fields — they map to the contact's native First Name / Last Name / Email.

---

## Part 2 — The tag

Create one tag: **`mayor-application`**

Every synced application contact receives this tag. Build your automations off it — e.g., a workflow triggered by the tag that notifies the Review Panel, starts a 30-day decision timer, or adds the contact to a "Pending Review" pipeline stage.

**Recommended (optional) pipeline:** a "Membership Applications" pipeline with stages matching the Charter's outcomes — `Received → Under Review → Admitted / Not This Year / Not a Fit`. The website doesn't manage this; it just delivers contacts into the top.

---

## Part 3 — Connect the website (Option A: API sync — currently built)

The website's serverless function pushes each application into GHL automatically. To connect it:

**3.1 — Create a Private Integration token.**
GHL: **Settings → Private Integrations → Create**. Name it "HowToBecomeMayor Website." Scopes required: **View Contacts, Edit Contacts** (`contacts.readonly`, `contacts.write`). Copy the token (starts with `pit-`).

**3.2 — Find your Location ID.**
GHL: **Settings → Business Profile** — the Location ID is shown there (a ~20-character string).

**3.3 — Add two environment variables in Vercel.**
Vercel → project → **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `GHL_PIT_TOKEN` | the Private Integration token from 3.1 |
| `GHL_LOCATION_ID` | the Location ID from 3.2 |

**3.4 — Redeploy, then test.**
Submit a test application on the site. Within seconds, a contact should appear in GHL with the `mayor-application` tag and all nine custom fields populated. Also check the email inbox — email delivery runs in parallel as the fail-safe.

**Behavior to know:**
- The sync **upserts** by email — if the same person applies twice, their existing contact is updated, not duplicated.
- Email delivery is the primary record. If GHL is ever unreachable, the application still arrives by email and the site still shows the applicant a success message. GHL sync failures are logged in Vercel's function logs, never shown to the applicant, and never lose an application.
- The contact `source` is set to `howtobecomemayor.com`.

---

## Part 4 — Option B (alternative): native GHL Survey embed

If instead you'd rather the application live natively in GHL as a **Survey** (GHL's multi-step form product):

1. Build the survey in GHL: **Sites → Surveys → New**, one slide per question, in the exact order and wording of Application v1.1 (all eleven questions — do not paraphrase them; the wording is deliberate).
2. Map each survey question to the custom fields from Part 1 (GHL does this in the question settings — choose the custom field each answer saves to).
3. Add the `mayor-application` tag on submission (survey settings).
4. Copy the survey's **embed code** and send it to the website editor — the apply page's form section gets swapped for the embed.

**Honest tradeoff:** the survey will render in GHL's styling inside an iframe, not the site's editorial design, and the site-side spam honeypot and email fail-safe no longer apply (GHL handles its own). You gain GHL's multi-step UX and native everything. Pick one path — running both would create duplicate intake.

---

## Part 5 — Privacy note (applies to both options)

Q11 asks applicants to disclose sensitive history. Once applications sync to GHL, **everyone with access to Contacts in that GHL location can read those answers.** Before going live:

- Review GHL team permissions. Restrict Contacts access to only the people who genuinely need it (Jim + whoever administers review).
- Do not pipe the application custom fields into any broadcast, export, or shared report.
- The Charter promises applicants privacy; the CRM configuration is where that promise is either kept or quietly broken.

---

*End of GHL Setup Spec, Version 1.0.*
