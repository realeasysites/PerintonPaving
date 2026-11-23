const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dir = process.env.DB_DIR || path.join(__dirname, '..', 'db');
fs.mkdirSync(dir, { recursive: true });

const db = new Database(path.join(dir, 'leads.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    phone       TEXT NOT NULL,
    email       TEXT,
    address     TEXT,
    town        TEXT,
    service     TEXT,
    size        TEXT,
    timing      TEXT,
    message     TEXT,
    status      TEXT NOT NULL DEFAULT 'new',
    notes       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const STATUSES = ['new', 'contacted', 'estimate scheduled', 'quoted', 'won', 'lost'];

module.exports = {
  STATUSES,
  addQuote(q) {
    const info = db.prepare(`
      INSERT INTO quotes (name, phone, email, address, town, service, size, timing, message)
      VALUES (@name, @phone, @email, @address, @town, @service, @size, @timing, @message)
    `).run(q);
    return info.lastInsertRowid;
  },
  listQuotes() {
    return db.prepare('SELECT * FROM quotes ORDER BY id DESC').all();
  },
  updateQuote(id, { status, notes }) {
    const row = db.prepare('SELECT id FROM quotes WHERE id = ?').get(id);
    if (!row) return false;
    if (status !== undefined) db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(status, id);
    if (notes !== undefined) db.prepare('UPDATE quotes SET notes = ? WHERE id = ?').run(notes, id);
    return true;
  },
  deleteQuote(id) {
    return db.prepare('DELETE FROM quotes WHERE id = ?').run(id).changes > 0;
  }
};
