const path = require('path');
const express = require('express');
const auth = require('../lib/auth');
const db = require('../lib/db');

const router = express.Router();
const page = name => path.join(__dirname, '..', 'admin', name);

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

router.get('/', (req, res) => {
  if (!auth.isAuthed(req)) return res.sendFile(page('login.html'));
  res.sendFile(page('dashboard.html'));
});

router.get('/status', (req, res) => {
  res.json({ configured: auth.passwordConfigured(), authed: auth.isAuthed(req) });
});

router.post('/login', (req, res) => {
  if (!auth.passwordConfigured()) {
    return res.status(503).json({ ok: false, error: 'Admin login is not set up yet (ADMIN_PASSWORD missing).' });
  }
  if (auth.tooManyAttempts(req.ip)) {
    return res.status(429).json({ ok: false, error: 'Too many attempts. Try again in 15 minutes.' });
  }
  if (!auth.checkPassword((req.body || {}).password)) {
    return res.status(401).json({ ok: false, error: 'Wrong password.' });
  }
  auth.issueCookie(res);
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  auth.clearCookie(res);
  res.json({ ok: true });
});

// Everything below requires the password.
router.use('/api', (req, res, next) => {
  if (!auth.isAuthed(req)) return res.status(401).json({ ok: false, error: 'Not signed in.' });
  next();
});

router.get('/api/quotes', (req, res) => {
  res.json({ ok: true, statuses: db.STATUSES, quotes: db.listQuotes() });
});

router.patch('/api/quotes/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status, notes } = req.body || {};
  if (status !== undefined && !db.STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, error: 'Unknown status.' });
  }
  const ok = db.updateQuote(id, {
    status,
    notes: typeof notes === 'string' ? notes.slice(0, 2000) : undefined
  });
  if (!ok) return res.status(404).json({ ok: false, error: 'Not found.' });
  res.json({ ok: true });
});

router.delete('/api/quotes/:id', (req, res) => {
  const ok = db.deleteQuote(Number(req.params.id));
  if (!ok) return res.status(404).json({ ok: false, error: 'Not found.' });
  res.json({ ok: true });
});

module.exports = router;
