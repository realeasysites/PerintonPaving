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

const TIER_LABEL = { priority: 'PRIORITY', standard: 'Close to Fairport', low: 'Small + far' };

async function notifyNewQuote(q) {
  const to = process.env.NOTIFY_EMAIL;
  const lines = [
    `${TIER_LABEL[q.tier] || ''}${q.reasons ? ' — ' + q.reasons : ''}`,
    q.flags ? `Heads up: ${q.flags}` : '',
    '',
    `Name: ${q.name}`,
    `Phone: ${q.phone}`,
    `Email: ${q.email || '-'}`,
    `Address: ${[q.address, q.town].filter(Boolean).join(', ') || '-'}`,
    `Who: ${q.client_type || '-'}`,
    `Job: ${q.service || '-'}`,
    `Length: ${q.size || '-'}`,
    `Slope: ${q.grade || '-'}`,
    `Access: ${q.access || '-'}`,
    `Current surface: ${q.surface || '-'}`,
    `Budget: ${q.budget || '-'}`,
    `Timing: ${q.timing || '-'}`,
    '',
    q.message || ''
  ].filter((l, i) => l !== '' || i > 2).join('\n');

  if (!transport || !to) {
    console.log('[new quote request]\n' + lines);
    return;
  }
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      replyTo: q.email || undefined,
      subject: `${q.tier === 'priority' ? '★ PRIORITY: ' : ''}Estimate request — ${q.name}${q.town ? ' (' + q.town + ')' : ''}`,
      text: lines + '\n\nView all requests: /admin'
    });
  } catch (err) {
    console.error('Email notify failed:', err.message);
  }
}

module.exports = { notifyNewQuote };
