// Perinton Paving Inc. — thin entry point.
const path = require('path');
const express = require('express');

const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// Admin first, so /admin always asks for the password before anything else.
app.use('/admin', adminRoutes);
app.use('/api', publicRoutes);

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  maxAge: '7d',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Perinton Paving site running on :${PORT}`));
