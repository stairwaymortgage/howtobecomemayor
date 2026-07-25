/* =========================================================================
   api/submit.js — Vercel Serverless Function
   Receives submissions from the Application form and the Contact form,
   and delivers them by email via Resend (https://resend.com).

   Required environment variables (set in Vercel → Project → Settings →
   Environment Variables):

     RESEND_API_KEY     — your Resend API key (starts with "re_")
     SUBMISSIONS_EMAIL  — the inbox that receives submissions (Jim's private inbox)

   Optional:

     FROM_EMAIL         — the sender address. Until you verify your domain
                          with Resend, leave this unset and the default
                          "onboarding@resend.dev" is used (Resend allows this
                          sender to deliver to the account owner's email).
                          After domain verification, set it to e.g.
                          "applications@howtobecomemayor.com".

     GHL_PIT_TOKEN      — GoHighLevel Private Integration token (pit-…).
     GHL_LOCATION_ID    — GoHighLevel Location ID.
                          When BOTH are set, every application is also
                          upserted into GHL as a contact with custom fields
                          (see GHL-SETUP.md) and the "mayor-application" tag.
                          Email remains the primary, fail-safe delivery:
                          a GHL outage never loses an application.
   ========================================================================= */

/* ---- GoHighLevel sync (best-effort; never blocks the applicant) ---- */
async function syncToGHL(body) {
  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) return { skipped: true };

  const name = String(body.name || '').trim();
  const firstName = name.split(/\s+/)[0] || name;
  const lastName = name.split(/\s+/).slice(1).join(' ') || '';

  const customFields = [
    { key: 'application_city',            field_value: String(body.city || '').trim() },
    { key: 'application_target_year',     field_value: String(body.targetYear || '').trim() },
    { key: 'application_current_roles',   field_value: String(body.roles || '').trim() },
    { key: 'application_q6_life_vision',  field_value: String(body.q6_life || '').trim() },
    { key: 'application_q7_city_vision',  field_value: String(body.q7_city || '').trim() },
    { key: 'application_q8_frame',        field_value: String(body.q8_frame || '').trim() },
    { key: 'application_q9_work',         field_value: String(body.q9_work || '').trim() },
    { key: 'application_q10_setback',     field_value: String(body.q10_setback || '').trim() },
    { key: 'application_q11_disclosure',  field_value: String(body.q11_disclosure || '').trim() },
  ];

  const r = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId,
      firstName,
      lastName,
      email: String(body.email || '').trim(),
      tags: ['mayor-application'],
      source: 'howtobecomemayor.com',
      customFields,
    }),
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`GHL upsert failed: ${r.status} ${detail.slice(0, 300)}`);
  }
  return { skipped: false };
}

export default async function handler(req, res) {
  // Same-origin form posts only.
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.SUBMISSIONS_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey || !toEmail) {
    // Configuration missing — tell the client clearly so it can show a useful message.
    return res.status(500).json({
      ok: false,
      error: 'Form is not configured yet. RESEND_API_KEY and SUBMISSIONS_EMAIL must be set in Vercel environment variables.',
    });
  }

  const body = req.body || {};

  // Honeypot: real users never fill this hidden field. Bots do.
  if (body.website) {
    // Pretend success so bots learn nothing.
    return res.status(200).json({ ok: true });
  }

  const formType = body.formType === 'application' ? 'application' : 'contact';

  // Basic validation.
  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim();
  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'A valid name and email are required.' });
  }

  let subject, text;

  if (formType === 'application') {
    const field = (k) => String(body[k] || '').trim();
    const required = ['city', 'targetYear', 'roles', 'q6_life', 'q7_city', 'q8_frame', 'q9_work', 'q10_setback', 'q11_disclosure'];
    for (const k of required) {
      if (!field(k)) {
        return res.status(400).json({ ok: false, error: 'All questions are required.' });
      }
    }

    subject = `New Membership Application — ${name} (${field('city')})`;
    text = [
      'NEW MEMBERSHIP APPLICATION',
      '='.repeat(60),
      '',
      'THE ESSENTIALS',
      '-'.repeat(60),
      `Q1  Name:            ${name}`,
      `Q2  Email:           ${email}`,
      `Q3  City:            ${field('city')}`,
      `Q4  Target year:     ${field('targetYear')}`,
      `Q5  Current roles:   ${field('roles')}`,
      '',
      'THE SUBSTANCE',
      '-'.repeat(60),
      '',
      'Q6 — How they see their own life and family a decade from now:',
      field('q6_life'),
      '',
      'Q7 — How they see the city they intend to serve a decade from now:',
      field('q7_city'),
      '',
      'Q8 — The frame that makes the commitment mean something beyond politics:',
      field('q8_frame'),
      '',
      'Q9 — The long horizon, and the small consistent work already underway:',
      field('q9_work'),
      '',
      'Q10 — Public responsibility that did not go the way they hoped:',
      field('q10_setback'),
      '',
      'Q11 — Asked plainly (disclosure):',
      field('q11_disclosure'),
      '',
      '='.repeat(60),
      `Submitted: ${new Date().toISOString()}`,
      'Reply directly to this email to reach the applicant.',
    ].join('\n');
  } else {
    const msg = String(body.message || '').trim();
    const subj = String(body.subject || '').trim();
    if (!msg) {
      return res.status(400).json({ ok: false, error: 'A message is required.' });
    }
    subject = `Contact — ${subj || name}`;
    text = [
      'CONTACT FORM MESSAGE',
      '='.repeat(60),
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Subject: ${subj}`,
      '',
      msg,
      '',
      '='.repeat(60),
      `Submitted: ${new Date().toISOString()}`,
      'Reply directly to this email to reach the sender.',
    ].join('\n');
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `How to Become Mayor <${fromEmail}>`,
        to: [toEmail],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('Resend error:', r.status, detail);
      return res.status(502).json({ ok: false, error: 'Delivery failed. Please try again shortly.' });
    }

    // Email delivered — for applications, also sync to GoHighLevel (best-effort).
    if (formType === 'application') {
      try {
        await syncToGHL(body);
      } catch (ghlErr) {
        // Logged for the operator; never surfaced to the applicant.
        // The application is already safely delivered by email.
        console.error(String(ghlErr));
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ ok: false, error: 'Delivery failed. Please try again shortly.' });
  }
}
