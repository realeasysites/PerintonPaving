// Emails new quote requests to NOTIFY_EMAIL when SMTP is configured; otherwise just logs.
const nodemailer = require('nodemailer');

let transport = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_PORT || 465) === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function notifyNewQuote(q) {
  const to = process.env.NOTIFY_EMAIL;
  const lines = [
    `Name: ${q.name}`,
    `Phone: ${q.phone}`,
    `Email: ${q.email || '-'}`,
    `Address: ${[q.address, q.town].filter(Boolean).join(', ') || '-'}`,
    `Service: ${q.service || '-'}`,
    `Size: ${q.size || '-'}`,
    `Timing: ${q.timing || '-'}`,
    '',
    q.message || ''
  ].join('\n');

  if (!transport || !to) {
    console.log('[new quote request]\n' + lines);
    return;
  }
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      replyTo: q.email || undefined,
      subject: `New estimate request — ${q.name}${q.town ? ' (' + q.town + ')' : ''}`,
      text: lines + '\n\nView all requests: /admin'
    });
  } catch (err) {
    console.error('Email notify failed:', err.message);
  }
}

module.exports = { notifyNewQuote };
