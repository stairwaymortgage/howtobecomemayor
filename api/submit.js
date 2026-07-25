/* =========================================================================
   api/submit.js — Vercel Serverless Function
   Receives submissions from the Application form and the Contact form,
   and delivers them into GoHighLevel as contacts.

   GoHighLevel is the ONLY delivery destination. There is no email fallback:
   if the upsert fails, the submitter is told so and asked to retry, rather
   than being shown a success message for a submission that went nowhere.
   Email notifications are handled inside GHL by a workflow triggered on the
   "mayor-application" tag.

   Required environment variables (set in Vercel → Project → Settings →
   Environment Variables):

     GHL_PIT_TOKEN      — GoHighLevel Private Integration token (pit-…).
     GHL_LOCATION_ID    — GoHighLevel Location ID.

   Applications are tagged "mayor-application" and populate the nine
   application custom fields; contact-form messages are tagged
   "contact-form-message" and populate contact_subject / contact_message.
   See GHL-SETUP.md for the field table and the connection walkthrough.
   ========================================================================= */

/* ---- GoHighLevel upsert (the only delivery path) ---- */
async function syncToGHL(body, formType) {
  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  const name = String(body.name || '').trim();
  const firstName = name.split(/\s+/)[0] || name;
  const lastName = name.split(/\s+/).slice(1).join(' ') || '';

  const customFields =
    formType === 'application'
      ? [
          { key: 'application_city',            field_value: String(body.city || '').trim() },
          { key: 'application_target_year',     field_value: String(body.targetYear || '').trim() },
          { key: 'application_current_roles',   field_value: String(body.roles || '').trim() },
          { key: 'application_q6_life_vision',  field_value: String(body.q6_life || '').trim() },
          { key: 'application_q7_city_vision',  field_value: String(body.q7_city || '').trim() },
          { key: 'application_q8_frame',        field_value: String(body.q8_frame || '').trim() },
          { key: 'application_q9_work',         field_value: String(body.q9_work || '').trim() },
          { key: 'application_q10_setback',     field_value: String(body.q10_setback || '').trim() },
          { key: 'application_q11_disclosure',  field_value: String(body.q11_disclosure || '').trim() },
        ]
      : [
          { key: 'contact_subject', field_value: String(body.subject || '').trim() },
          { key: 'contact_message', field_value: String(body.message || '').trim() },
        ];

  const tag = formType === 'application' ? 'mayor-application' : 'contact-form-message';

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
      tags: [tag],
      source: 'howtobecomemayor.com',
      customFields,
    }),
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`GHL upsert failed: ${r.status} ${detail.slice(0, 300)}`);
  }
}

export default async function handler(req, res) {
  // Same-origin form posts only.
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!process.env.GHL_PIT_TOKEN || !process.env.GHL_LOCATION_ID) {
    // Configuration missing — tell the client clearly so it can show a useful message.
    return res.status(500).json({
      ok: false,
      error: 'Form is not configured yet. GHL_PIT_TOKEN and GHL_LOCATION_ID must be set in Vercel environment variables.',
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

  if (formType === 'application') {
    const field = (k) => String(body[k] || '').trim();
    const required = ['city', 'targetYear', 'roles', 'q6_life', 'q7_city', 'q8_frame', 'q9_work', 'q10_setback', 'q11_disclosure'];
    for (const k of required) {
      if (!field(k)) {
        return res.status(400).json({ ok: false, error: 'All questions are required.' });
      }
    }
  } else {
    if (!String(body.message || '').trim()) {
      return res.status(400).json({ ok: false, error: 'A message is required.' });
    }
  }

  try {
    await syncToGHL(body, formType);
    return res.status(200).json({ ok: true });
  } catch (err) {
    // GHL is the only record — a failed upsert is a failed submission.
    console.error('GHL delivery error:', err);
    return res.status(502).json({ ok: false, error: 'Delivery failed. Please try again shortly.' });
  }
}
