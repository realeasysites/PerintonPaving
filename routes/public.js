const express = require('express');
const db = require('../lib/db');
const { scoreLead } = require('../lib/score');
const { notifyNewQuote } = require('../lib/mailer');

const router = express.Router();

const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Light per-IP throttle on the public form.
const hits = new Map();
function throttled(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 6;
}

router.post('/quote', async (req, res) => {
  const b = req.body || {};
  if (clean(b.website)) return res.json({ ok: true }); // honeypot: bots fill this
  if (throttled(req.ip)) return res.status(429).json({ ok: false, error: 'Too many requests. Please call us at 585-388-1090.' });

  const q = {
    name: clean(b.name, 120),
    phone: clean(b.phone, 40),
    email: clean(b.email, 160),
    address: clean(b.address, 200),
    town: clean(b.town, 80),
    service: clean(b.service, 80),
    size: clean(b.size, 80),
    timing: clean(b.timing, 80),
    message: clean(b.message, 2000),
    client_type: clean(b.client_type, 80),
    grade: clean(b.grade, 80),
    access: clean(b.access, 80),
    surface: clean(b.surface, 80),
    budget: clean(b.budget, 80)
  };

  if (!q.name || !q.phone) {
    return res.status(400).json({ ok: false, error: 'Please add your name and phone number.' });
  }
  if (q.phone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ ok: false, error: 'Please double-check your phone number.' });
  }
  if (q.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.email)) {
    return res.status(400).json({ ok: false, error: 'That email address looks off.' });
  }
  if (!q.town) {
    return res.status(400).json({ ok: false, error: 'Please pick the town the job is in.' });
  }

  const s = scoreLead(q);
  q.tier = s.tier;
  q.zone = s.zone;
  q.reasons = s.reasons.join(' · ');
  q.flags = s.flags.join(', ');

  db.addQuote(q);
  // Only priority and close-to-home requests email the owner. Small jobs far away
  // are still saved in the dashboard, just quietly.
  if (q.tier !== 'low') notifyNewQuote(q);
  res.json({ ok: true });
});

module.exports = router;
