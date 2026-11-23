// Password-only admin auth. No username. Login is disabled until ADMIN_PASSWORD is set.
const crypto = require('crypto');

const COOKIE = 'pp_admin';
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function passwordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function checkPassword(input) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof input !== 'string') return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

function issueCookie(res) {
  const expires = String(Date.now() + MAX_AGE_MS);
  const token = `${expires}.${sign(expires)}`;
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
    path: '/admin'
  });
}

function clearCookie(res) {
  res.clearCookie(COOKIE, { path: '/admin' });
}

function readCookie(req) {
  const raw = req.headers.cookie || '';
  const hit = raw.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='));
  return hit ? decodeURIComponent(hit.slice(COOKIE.length + 1)) : null;
}

function isAuthed(req) {
  const token = readCookie(req);
  if (!token) return false;
  const [expires, sig] = token.split('.');
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  const good = sign(expires);
  if (sig.length !== good.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}

// Simple in-memory brute-force limiter: 8 tries per 15 min per IP.
const attempts = new Map();
function tooManyAttempts(ip) {
  const now = Date.now();
  const rec = attempts.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (now > rec.reset) { rec.count = 0; rec.reset = now + 15 * 60 * 1000; }
  rec.count += 1;
  attempts.set(ip, rec);
  return rec.count > 8;
}

module.exports = { passwordConfigured, checkPassword, issueCookie, clearCookie, isAuthed, tooManyAttempts };
