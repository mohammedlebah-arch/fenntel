/**
 * Brevo (Sendinblue) Email Helper
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@fenntel.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Yassine from Fenntel';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fenntel.com';

/**
 * Core send function
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!BREVO_API_KEY) {
    console.warn('⚠️  BREVO_API_KEY not set — email skipped');
    return null;
  }

  const body = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text,
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Brevo send error:', err);
    throw new Error(`Email failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Email: Purchase confirmation + download link
 */
export async function sendDownloadEmail({ to, productTitle, downloadUrl, expiresIn = 24 }) {
  const subject = `Your book is ready 📚`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #0A0A0A; font-family: 'Georgia', serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #111111; border: 1px solid #D4AF3730; padding: 40px; border-radius: 2px; }
    .logo { font-size: 28px; letter-spacing: 0.2em; color: #D4AF37; margin-bottom: 8px; }
    .divider { width: 40px; height: 1px; background: #D4AF37; margin: 20px 0; opacity: 0.4; }
    h2 { color: #E8E8E8; font-size: 22px; font-weight: normal; margin: 0 0 16px; }
    p { color: #999; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .product { color: #D4AF37; font-style: italic; }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #D4AF37, #E8C84A);
      color: #0A0A0A;
      text-decoration: none;
      padding: 14px 32px;
      font-family: sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border-radius: 1px;
      margin: 20px 0;
    }
    .note { font-size: 12px; color: #555; font-family: monospace; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #222; }
    .footer p { font-size: 11px; color: #444; font-family: monospace; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">FENNTEL</div>
      <div class="divider"></div>

      <h2>Hey — your book is waiting for you.</h2>

      <p>
        You got <span class="product">"${productTitle}"</span>. 
        Good move. This one hits different.
      </p>

      <p>
        Click the button below to download it. 
        Don't overthink it — just read chapter one tonight.
      </p>

      <a href="${downloadUrl}" class="btn">Download Your Book</a>

      <p class="note">
        ⏳ Link expires in ${expiresIn} hours.<br>
        🔒 One-time use only — save the file after downloading.
      </p>

      <div class="footer">
        <p>FENNTEL · Self-Mastery Books</p>
        <p>If you didn't make this purchase, ignore this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hey — your book is ready.

You got "${productTitle}". Good move.

Download it here:
${downloadUrl}

Link expires in ${expiresIn} hours. One-time use only — save the file after downloading.

— Yassine from Fenntel
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Email: Day 1 follow-up
 */
export async function sendDay1FollowUp({ to, productTitle }) {
  const subject = `Did you start reading yet?`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #0A0A0A; font-family: 'Georgia', serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #111111; border: 1px solid #D4AF3730; padding: 40px; }
    .logo { font-size: 24px; letter-spacing: 0.2em; color: #D4AF37; margin-bottom: 20px; }
    p { color: #999; font-size: 15px; line-height: 1.8; margin: 0 0 16px; }
    .highlight { color: #D4AF37; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #1a1a1a; }
    .footer p { font-size: 11px; color: #444; font-family: monospace; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">FENNTEL</div>
      <p>It's been a day.</p>
      <p>
        Most people download a book, tell themselves they'll read it "soon",
        and then forget about it completely.
      </p>
      <p>Don't be that person.</p>
      <p>
        <span class="highlight">"${productTitle}"</span> has one job — 
        to make you think differently. But only if you open it.
      </p>
      <p>Even 10 pages tonight is enough to shift something.</p>
      <p>— Yassine</p>
      <div class="footer">
        <p>FENNTEL · You're receiving this because you purchased from us.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to, subject, html, text: `Did you start reading "${productTitle}" yet? Even 10 pages tonight. — Yassine` });
}

/**
 * Email: Day 3 follow-up
 */
export async function sendDay3FollowUp({ to, productTitle }) {
  const subject = `3 days in — how's it going?`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #0A0A0A; font-family: 'Georgia', serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #111111; border: 1px solid #D4AF3730; padding: 40px; }
    .logo { font-size: 24px; letter-spacing: 0.2em; color: #D4AF37; margin-bottom: 20px; }
    p { color: #999; font-size: 15px; line-height: 1.8; margin: 0 0 16px; }
    .highlight { color: #D4AF37; }
    .store-link { color: #D4AF37; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #1a1a1a; }
    .footer p { font-size: 11px; color: #444; font-family: monospace; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">FENNTEL</div>
      <p>3 days since you got <span class="highlight">"${productTitle}"</span>.</p>
      <p>
        I'm curious — what hit you hardest so far? 
        The part about breaking old patterns usually gets people.
      </p>
      <p>
        If you haven't started yet, no judgment. Just open it today. 
        First chapter, that's all I'm asking.
      </p>
      <p>
        And if you've finished it — there's a second volume waiting for you at 
        <a href="${APP_URL}" class="store-link">fenntel.com</a>. 
        The two books are designed to work together.
      </p>
      <p>— Yassine</p>
      <div class="footer">
        <p>FENNTEL · You're receiving this because you purchased from us.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to, subject, html, text: `3 days in — opened "${productTitle}" yet? Volume 2 is at ${APP_URL}. — Yassine` });
}
