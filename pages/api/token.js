import path from 'path';
import fs from 'fs';
import connectDB from '../../lib/mongodb';
import Download from '../../models/Download';

/**
 * GET /download/[token]
 *
 * Validates the token then streams the file directly.
 * File never exposed from /public — served through Node only.
 */
export default async function handler(req, res) {
  const { token } = req.query;

  if (!token || typeof token !== 'string' || token.length < 32) {
    return res.status(400).send('Invalid link.');
  }

  await connectDB();

  const record = await Download.findOne({ token });

  // ── Validations ───────────────────────────────────────────────
  if (!record) {
    return res.status(404).send(errorPage('Link not found', 'This download link does not exist or has already expired.'));
  }

  if (new Date() > record.expiresAt) {
    return res.status(410).send(errorPage('Link expired', 'This download link has expired. Contact support if you need help.'));
  }

  if (record.downloadCount >= record.maxDownloads) {
    return res.status(410).send(errorPage('Download limit reached', 'This link has been used the maximum number of times.'));
  }

  // ── Update usage count ────────────────────────────────────────
  record.downloadCount += 1;
  if (!record.usedAt) record.usedAt = new Date();
  await record.save();

  // ── Serve file ────────────────────────────────────────────────
  const privateDir = path.join(process.cwd(), 'private-files');
  const filePath = path.join(privateDir, record.filePath);

  // Security: prevent path traversal
  if (!filePath.startsWith(privateDir)) {
    return res.status(403).send('Forbidden.');
  }

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return res.status(404).send(errorPage(
      'File not ready',
      'Your file is being prepared. Please contact support at fenntel@gmail.com.'
    ));
  }

  const stat = fs.statSync(filePath);
  const filename = encodeURIComponent(record.productTitle || 'fenntel-book') + '.pdf';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

function errorPage(title, message) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FENNTEL — ${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0A0A0A;
      color: #999;
      font-family: 'Georgia', serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      max-width: 440px;
      width: 100%;
      background: #111;
      border: 1px solid #D4AF3730;
      padding: 48px 40px;
      text-align: center;
    }
    .logo { font-size: 24px; letter-spacing: 0.2em; color: #D4AF37; margin-bottom: 24px; }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h1 { color: #E8E8E8; font-size: 20px; font-weight: normal; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
    a {
      color: #D4AF37;
      font-size: 13px;
      text-decoration: none;
      font-family: monospace;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">FENNTEL</div>
    <div class="icon">⚠️</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">← Back to store</a>
  </div>
</body>
</html>`;
}

// Use Node.js runtime (not Edge) for file system access
export const config = { api: { responseLimit: false } };
