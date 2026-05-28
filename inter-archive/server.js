const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ══════════════════════════════════════════════════════════
//  Middleware
// ══════════════════════════════════════════════════════════
app.use(express.json());
app.use(express.static(__dirname));

app.use((req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.url}`);
  next();
});

// ══════════════════════════════════════════════════════════
//  Helper
// ══════════════════════════════════════════════════════════
function loadData() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'inter_data.json'), 'utf-8'));
}

// ══════════════════════════════════════════════════════════
//  Routes
// ══════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// GET /api/seasons — lista stagioni con metadati
app.get('/api/seasons', (req, res) => {
  try {
    const data = loadData();
    const seasons = Object.keys(data).map(id => ({
      id,
      label: id.replace('-', '/'),
      allenatore: data[id].allenatore,
      titoli: data[id].titoli,
      punti: data[id].punti
    }));
    res.json(seasons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel caricamento stagioni' });
  }
});

// GET /api/stats/:season
app.get('/api/stats/:season', (req, res) => {
  try {
    const data = loadData();
    const { season } = req.params;
    if (!data[season]) return res.status(404).json({ error: `Stagione "${season}" non trovata` });
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(data[season]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// GET /api/compare/:s1/:s2
app.get('/api/compare/:season1/:season2', (req, res) => {
  try {
    const data = loadData();
    const { season1, season2 } = req.params;
    const d1 = data[season1], d2 = data[season2];
    if (!d1) return res.status(404).json({ error: `Stagione "${season1}" non trovata` });
    if (!d2) return res.status(404).json({ error: `Stagione "${season2}" non trovata` });

    const compare = (k, lowerBetter=false) => {
      const v1=d1[k], v2=d2[k];
      return { season1: v1, season2: v2, winner: lowerBetter ? (v1<=v2?season1:season2) : (v1>=v2?season1:season2) };
    };

    res.json({
      season1: { id: season1, ...d1 },
      season2: { id: season2, ...d2 },
      comparison: {
        punti:        compare('punti'),
        vittorie:     compare('vittorie'),
        gol_fatti:    compare('gol_fatti'),
        gol_subiti:   compare('gol_subiti', true),
        capocannoniere_gol: compare('top_scorer_gol')
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel confronto' });
  }
});

// GET /api/player/:season/:name
app.get('/api/player/:season/:name', (req, res) => {
  try {
    const data = loadData();
    const season = data[req.params.season];
    if (!season) return res.status(404).json({ error: 'Stagione non trovata' });
    const player = season.giocatori.find(g =>
      g.nome.toLowerCase().includes(req.params.name.toLowerCase())
    );
    if (!player) return res.status(404).json({ error: 'Giocatore non trovato' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: 'Errore nella ricerca' });
  }
});

// GET /api/top-scorers — classifica marcatori tra tutte le stagioni
app.get('/api/top-scorers', (req, res) => {
  try {
    const data = loadData();
    const all = [];
    for (const [season, s] of Object.entries(data)) {
      s.giocatori.forEach(g => all.push({ season, ...g }));
    }
    all.sort((a,b) => b.gol - a.gol);
    res.json(all.slice(0, 20));
  } catch (err) {
    res.status(500).json({ error: 'Errore' });
  }
});

// GET /api/search?q=... — ricerca globale giocatori
app.get('/api/search', (req, res) => {
  try {
    const data = loadData();
    const q = (req.query.q || '').toLowerCase();
    if (!q) return res.json([]);
    const results = [];
    for (const [season, s] of Object.entries(data)) {
      s.giocatori.forEach(g => {
        if (g.nome.toLowerCase().includes(q)) results.push({ season, ...g });
      });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Errore nella ricerca' });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint "${req.path}" non trovato` });
});

// ══════════════════════════════════════════════════════════
//  Start
// ══════════════════════════════════════════════════════════
const server = app.listen(PORT, () => {
  console.log(`
⚫🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🔵⚫
     INTER HISTORICAL ARCHIVE — Server in esecuzione
     URL   : http://localhost:${PORT}
     Dir   : ${__dirname}
─────────────────────────────────────────────────────────
     API disponibili:
     GET /api/seasons
     GET /api/stats/:season
     GET /api/compare/:s1/:s2
     GET /api/player/:season/:name
     GET /api/top-scorers
     GET /api/search?q=
⚫🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🔵⚫
  `);
});

process.on('SIGINT', () => {
  console.log('\n⏹  Chiusura server…');
  server.close(() => { console.log('✅ Chiuso.'); process.exit(0); });
});
