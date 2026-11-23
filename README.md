# Perinton Paving Inc. — website

Built by [Real Easy Sites](https://getrealeasysites.com). Node/Express + SQLite, with an estimate-request form and a password-protected lead dashboard at `/admin`.

## Run locally
```
npm install
ADMIN_PASSWORD=choose-one npm start
```
Open http://localhost:3000 and http://localhost:3000/admin.

## Render settings
- Build: `npm install` · Start: `npm start` · Node 20 (pinned in `.node-version`)
- Add a persistent disk and set `DB_DIR` to its mount path (e.g. `/var/data`) so leads survive redeploys.

## Environment variables
| Var | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Dashboard password (login is disabled until set) |
| `SESSION_SECRET` | Long random string for the admin cookie |
| `NOTIFY_EMAIL` | Inbox that gets new estimate requests |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Outgoing mail (e.g. Gmail app password) |
| `DB_DIR` | Folder for `leads.sqlite` (persistent disk) |
| `NODE_ENV` | `production` on Render (secure cookies) |

## Social links
Edit the `SOCIAL` object at the top of `public/js/site.js`. Empty entries stay hidden.
