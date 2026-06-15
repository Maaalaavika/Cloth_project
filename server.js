require('dotenv').config();
const express   = require('express');
const path      = require('path');
const cors      = require('cors');
const mongoose  = require('mongoose');

const authRoutes          = require('./routes/auth');
const userRoutes          = require('./routes/users');
const notificationRoutes  = require('./routes/notificationRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// ─── MongoDB (non-blocking — server works without it) ──────────
let dbConnected = false;

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => { dbConnected = true; console.log('✅ MongoDB connected'); })
    .catch((err) => console.warn('⚠️  MongoDB unavailable — API routes will not work, but static pages are served.\n   Reason:', err.message));
} else {
  console.warn('⚠️  MONGO_URI not set — skipping database connection.');
}

// ─── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: dbConnected ? 'connected' : 'disconnected' });
});

// ─── API routes ────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);

// Style Exchange — primary app entry
app.get('/style-exchange', (req, res) => {
  res.sendFile(path.join(__dirname, 'style-exchange.html'));
});

// ─── Default app entry ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── Project hub (specs & legacy demos) ────────────────────────
app.get('/hub', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SwapMarket — Project Hub</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',system-ui,sans-serif;background:#0e0f11;color:#e8e9eb;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px}
    .hub{max-width:640px;width:100%}
    .hub h1{font-size:28px;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:10px}
    .hub h1 span{color:#1ec98a}
    .hub p.sub{color:#7a7f8e;font-size:14px;margin-bottom:32px}
    .status{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:4px 12px;border-radius:20px;margin-bottom:24px;font-weight:500}
    .status.ok{background:rgba(30,201,138,.12);color:#1ec98a;border:1px solid rgba(30,201,138,.25)}
    .status.warn{background:rgba(245,166,35,.12);color:#f5a623;border:1px solid rgba(245,166,35,.25)}
    .cards{display:flex;flex-direction:column;gap:12px}
    .card{background:#16181c;border:1px solid #2a2d35;border-radius:14px;padding:20px 24px;text-decoration:none;color:inherit;transition:all .2s}
    .card:hover{border-color:#1ec98a;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3)}
    .card h2{font-size:16px;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:8px}
    .card h2 .emoji{font-size:20px}
    .card p{font-size:13px;color:#7a7f8e;line-height:1.5}
    .card .tag{display:inline-block;font-size:11px;padding:2px 8px;border-radius:12px;background:rgba(124,111,247,.12);color:#7c6ff7;margin-left:8px;font-weight:500}
    .footer{margin-top:32px;text-align:center;font-size:12px;color:#4a4f5e}
  </style>
</head>
<body>
  <div class="hub">
    <h1>✨ Style<span>Exchange</span></h1>
    <p class="sub">Clothing Exchange & Swap Marketplace — Project Hub</p>
    <div class="status ${dbConnected ? 'ok' : 'warn'}">${dbConnected ? '● Database connected' : '● Database offline — static pages only'}</div>
    <div class="cards">
      <a class="card" href="/style-exchange.html">
        <h2><span class="emoji">✨</span> Style Exchange <span class="tag">Final App</span></h2>
        <p>Full marketplace with listings, swap requests, messages, and in-app notifications.</p>
      </a>
      <a class="card" href="/clothing_swap_listings.html">
        <h2><span class="emoji">👗</span> Swap Listings App <span class="tag">Legacy Demo</span></h2>
        <p>Browse, list, and view clothing items with search, filters, carousel, and swap request modal.</p>
      </a>
      <a class="card" href="/clothing_swap_listings_feature.html">
        <h2><span class="emoji">📋</span> Listings Feature Prototype</h2>
        <p>Compact prototype of listing, browsing, and item detail views.</p>
      </a>
      <a class="card" href="/prompt5_chat_notifications.html">
        <h2><span class="emoji">💬</span> Chat & Notifications Spec</h2>
        <p>Specification document for real-time chat and notification system.</p>
      </a>
      <a class="card" href="/prompt6_dashboard_homepage.html">
        <h2><span class="emoji">📊</span> Dashboard & Homepage Spec</h2>
        <p>Specification for user dashboard (4 tabs) and mobile-first homepage.</p>
      </a>
      <a class="card" href="/prompt7_ai_best_offers.html">
        <h2><span class="emoji">✨</span> AI Best Offers Spec</h2>
        <p>Specification for Claude AI-powered swap suggestions feature.</p>
      </a>
    </div>
    <p class="footer">Server running on port ${process.env.PORT || 5000} · SwapMarket © 2025</p>
  </div>
</body>
</html>`);
});

// ─── Serve static frontend files ───────────────────────────────
app.use(express.static(__dirname));

// ─── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Style Exchange: http://localhost:${PORT}/style-exchange.html`);
  console.log(`   Project hub:    http://localhost:${PORT}/hub\n`);
});
