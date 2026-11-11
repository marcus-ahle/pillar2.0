/* Pillar site server: serves the pages and the content API.

   GET  /api/content    programs (with sessions) + sponsors, everything a page needs
   GET  /api/events     flat list of dated sessions from the active source
   GET  /api/sponsors   sponsors
   GET  /api/settings   { eventsSource: 'database' | 'ezfacility' }
   PUT  /api/settings   change the events source (admin page)
   GET  /api/status     database counts + live EZFacility connection check

   Run: npm start   (or npm run dev to start the mock EZFacility API too) */
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { config } from './config.js';
import { getDb } from './db.js';
import { seedSite } from './seed.js';
import { createContentService } from './content/index.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

export function createApp(content) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '20kb' }));

  // Never cache: edits to pages, styles and data show on a normal refresh
  app.use((req, res, next) => { res.set({ 'Cache-Control': 'no-store, must-revalidate', Expires: '0' }); next(); });

  const api = express.Router();
  const wrap = fn => (req, res, next) => fn(req, res).catch(next);

  api.get('/content', wrap(async (req, res) => res.json(await content.getContent())));
  api.get('/events', wrap(async (req, res) => {
    const c = await content.getContent();
    res.json({
      source: c.source.events, warnings: c.warnings,
      events: c.programs.flatMap(p => (p.sessions || []).map(s => ({ programId: p.id, sport: p.sport, program: p.title, ...s })))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  }));
  api.get('/sponsors', wrap(async (req, res) => res.json((await content.getContent()).sponsors)));
  api.get('/settings', wrap(async (req, res) => res.json(await content.getSettings())));
  api.put('/settings', wrap(async (req, res) => res.json(await content.updateSettings(req.body || {}))));
  api.get('/status', wrap(async (req, res) => res.json(await content.getStatus())));
  api.use((req, res) => res.status(404).json({ error: 'Not found' }));
  api.use((err, req, res, _next) => {
    if (!err.status) console.error('[api]', err);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Server error' });
  });
  app.use('/api', api);

  // Static site: only the pages and their assets (not server code, package files or .env)
  app.use('/assets', express.static(path.join(ROOT, 'assets'), { dotfiles: 'deny' }));
  // Archived Concept A keeps its .html files; extensionless links from site.js resolve too
  app.use('/concept-a', express.static(path.join(ROOT, 'concept-a'), { dotfiles: 'deny', extensions: ['html'] }));

  // Pages live at clean URLs: /hockey serves hockey.html, / serves index.html.
  // Old /hockey.html, /hockey/ and /index links redirect there (query string kept).
  const isPage = name => /^[\w-]+$/.test(name) && existsSync(path.join(ROOT, `${name}.html`));
  const cleanUrl = (name, req) => {
    const q = req.originalUrl.indexOf('?');
    return (name === 'index' ? '/' : `/${name}`) + (q === -1 ? '' : req.originalUrl.slice(q));
  };
  app.get(/^\/([\w-]+)(?:\.html|\/)$/, (req, res, next) => isPage(req.params[0]) ? res.redirect(301, cleanUrl(req.params[0], req)) : next());
  app.get('/index', (req, res) => res.redirect(301, cleanUrl('index', req)));
  app.get(/^\/([\w-]*)$/, (req, res, next) => {
    const name = req.params[0] || 'index';
    isPage(name) ? res.sendFile(`${name}.html`, { root: ROOT }) : next();
  });
  app.use((req, res) => res.status(404).type('text/plain').send('Not found'));
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let db;
  try {
    db = await getDb();
  } catch (err) {
    console.error(`Could not reach MongoDB at ${config.mongoUri} (${err.message}).\nStart it with: npm run db:up`);
    process.exit(1);
  }
  const seeded = await seedSite(db);
  if (!seeded.skipped) console.log(`Empty database, seeded ${seeded.programs} programs, ${seeded.events} events, ${seeded.sponsors} sponsors`);
  const content = createContentService(db, config);
  createApp(content).listen(config.port, () => {
    console.log(`Pillar site running at http://localhost:${config.port}  (admin: /admin)`);
    console.log(`EZFacility API: ${config.ezfacility.baseUrl}`);
  });
}
