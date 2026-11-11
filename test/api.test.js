/* End-to-end checks against a real local MongoDB (npm run db:up), using
   throwaway databases. Run: npm test */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoClient } from 'mongodb';
import { createMockApp } from '../mock-ezfacility/server.js';
import { seedMock } from '../mock-ezfacility/seed.js';
import { seedSite } from '../server/seed.js';
import { createApp } from '../server/app.js';
import { createContentService } from '../server/content/index.js';
import { EZFacilityClient } from '../server/content/ezfacility-client.js';
import { config } from '../server/config.js';

const listen = app => new Promise(r => { const s = app.listen(0, () => r(s)); });
const url = s => `http://127.0.0.1:${s.address().port}`;

let mongo, siteDb, mockDb, mockServer, siteServer, BASE, SITE, ezCfg;

before(async () => {
  mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 3000 });
  await mongo.connect();
  siteDb = mongo.db('pillar_test');
  mockDb = mongo.db('ezfacility_mock_test');
  await seedSite(siteDb, { reset: true });
  await siteDb.collection('settings').deleteMany({});
  await seedMock(mockDb, { reset: true });
  mockServer = await listen(createMockApp(mockDb));
  BASE = url(mockServer);
  ezCfg = { ...config.ezfacility, baseUrl: BASE, locationId: '', cacheSeconds: 0 };
  siteServer = await listen(createApp(createContentService(siteDb, { ...config, ezfacility: ezCfg })));
  SITE = url(siteServer);
});

after(async () => {
  mockServer?.close(); siteServer?.close();
  await siteDb?.dropDatabase(); await mockDb?.dropDatabase();
  await mongo?.close();
});

const client = () => new EZFacilityClient({ ...ezCfg });
const put = (path, body) => fetch(SITE + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('mock /token follows the EZFacility password grant', async () => {
  const noClient = await fetch(`${BASE}/token`, { method: 'POST', body: new URLSearchParams({ grant_type: 'password' }) });
  assert.equal(noClient.status, 400);
  assert.equal((await noClient.json()).error, 'invalid_client');

  const basic = 'Basic ' + Buffer.from(`${ezCfg.clientId}:${ezCfg.clientSecret}`).toString('base64');
  const bad = await fetch(`${BASE}/token`, { method: 'POST', headers: { Authorization: basic }, body: new URLSearchParams({ grant_type: 'password', username: 'x', password: 'y', scope: 'realm:tms' }) });
  assert.equal((await bad.json()).error, 'invalid_grant');

  const ok = await (await fetch(`${BASE}/token`, { method: 'POST', headers: { Authorization: basic }, body: new URLSearchParams({ grant_type: 'password', username: ezCfg.username, password: ezCfg.password, scope: 'realm:tms' }) })).json();
  assert.equal(ok.token_type, 'bearer');
  assert.equal(ok.expires_in, 1199);
  assert.ok(ok.access_token.length > 20);
});

test('mock enforces bearer auth, realm, paging header and one-year range', async () => {
  assert.equal((await fetch(`${BASE}/v2/user/locations`)).status, 401);

  const c = client();
  const token = await c.getToken();
  const h = { Authorization: `Bearer ${token}` };
  const noPage = await fetch(`${BASE}/v2/schedule/18342/2026-10-01/2027-09-30`, { headers: h });
  assert.equal((await noPage.json()).ErrorCode, 'InvalidPageNumber');
  const tooLong = await fetch(`${BASE}/v2/schedule/18342/2026-01-01/2027-06-01`, { headers: { ...h, 'ez-page-number': '1' } });
  assert.equal((await tooLong.json()).ErrorCode, 'DateRangeExceedOneYear');

  const ss = new EZFacilityClient({ ...ezCfg, scope: 'realm:self_service' });
  await assert.rejects(ss.getLocations(), e => e.code === 'WrongAPIScopeTMS');
});

test('client pages through results with ez-page-number', async () => {
  const extra = Array.from({ length: 230 }, (_, i) => ({
    ID: 900000 + i, SiteId: 18342, TypeId: 4501, Type: 'Court Rental', Title: `Rental ${i}`, IsRentalType: true,
    StartTimeUTC: '2027-02-01T15:00:00', EndTimeUTC: '2027-02-01T16:00:00', ReservationCategoryId: 305, SlotsTotal: 1, SlotsAvailable: 1,
  }));
  await mockDb.collection('reservations').insertMany(extra);
  try {
    const rows = await client().getSchedule(18342, '2027-02-01', '2027-02-01');
    assert.equal(rows.length, 230);
    assert.equal(new Set(rows.map(r => r.ID)).size, 230);
  } finally {
    await mockDb.collection('reservations').deleteMany({ ID: { $gte: 900000 } });
  }
});

test('client re-authenticates when a token is revoked', async () => {
  const c = client();
  await c.getLocations();
  await mockDb.collection('tokens').deleteMany({});
  const locations = await c.getLocations();
  assert.equal(locations[0].Id, 18342);
});

test('database and EZFacility sources produce the same events for linked programs', async () => {
  assert.equal((await put('/api/settings', { eventsSource: 'database' })).status, 200);
  const db = await (await fetch(`${SITE}/api/content`)).json();
  assert.equal((await put('/api/settings', { eventsSource: 'ezfacility' })).status, 200);
  const ez = await (await fetch(`${SITE}/api/content`)).json();

  assert.equal(db.source.events, 'database');
  assert.equal(ez.source.events, 'ezfacility');
  assert.deepEqual(ez.warnings, []);
  assert.deepEqual(ez.sponsors, db.sponsors, 'sponsors come from the database in both modes');

  const byId = list => Object.fromEntries(list.programs.map(p => [p.id, p]));
  const a = byId(db), b = byId(ez);
  for (const [id, p] of Object.entries(a)) {
    const sa = p.sessions || [], sb = b[id].sessions || [];
    assert.equal(sb.length, sa.length, `${id} session count`);
    sa.forEach((s, i) => {
      assert.equal(sb[i].date, s.date, `${id} date`);
      assert.equal(sb[i].label, s.label, `${id} label`);
      assert.equal(sb[i].url, s.url, `${id} url`);
      assert.equal(!!sb[i].soldOut, !!s.soldOut, `${id} soldOut`);
      if (s.time) assert.equal(sb[i].time, s.time, `${id} time survives the UTC round trip`);
    });
  }

  // EZ-only session type becomes its own program; rentals are left out
  const openGym = b['ez-type-4407'];
  assert.equal(openGym.sport, 'volleyball');
  assert.equal(openGym.sessions.length, 2);
  assert.equal(openGym.sessions[0].label, '13U – 18U');
  assert.match(openGym.sessions[0].url, /^contact\?program=/);
  assert.ok(!JSON.stringify(ez).includes('Court 2 rental'));
});

test('EZFacility changes show on the next fetch', async () => {
  await put('/api/settings', { eventsSource: 'ezfacility' });
  await mockDb.collection('reservations').updateOne({ Title: 'Hot Cocoa Classic' }, { $set: { SlotsAvailable: 0 } });
  const ez = await (await fetch(`${SITE}/api/content`)).json();
  const s = ez.programs.find(p => p.id === 'vb-4v4').sessions.find(x => x.label === 'Hot Cocoa Classic');
  assert.equal(s.soldOut, true);
});

test('EZFacility outage leaves programs up with a warning', async () => {
  const dead = createContentService(siteDb, { ...config, ezfacility: { ...ezCfg, baseUrl: 'http://127.0.0.1:9', timeoutMs: 1000 } });
  await siteDb.collection('settings').updateOne({ _id: 'site' }, { $set: { eventsSource: 'ezfacility' } }, { upsert: true });
  const c = await dead.getContent();
  assert.ok(c.programs.length >= 20);
  assert.ok(c.programs.every(p => !p.sessions));
  assert.match(c.warnings[0], /EZFacility unavailable/);
  const status = await dead.getStatus();
  assert.equal(status.ezfacility.ok, false);
});

test('settings reject unknown sources', async () => {
  const res = await put('/api/settings', { eventsSource: 'spreadsheet' });
  assert.equal(res.status, 400);
});

test('only pages and assets are served', async () => {
  for (const p of ['/package.json', '/server/app.js', '/.env', '/mock-ezfacility/fixtures.js', '/node_modules/express/package.json']) {
    assert.equal((await fetch(SITE + p)).status, 404, p);
  }
  for (const p of ['/', '/admin', '/hockey', '/schedule', '/assets/js/content.js', '/concept-a/', '/concept-a/schedule']) {
    assert.equal((await fetch(SITE + p)).status, 200, p);
  }
  for (const p of ['/nope', '/nope.html', '/server', '/package']) {
    assert.equal((await fetch(SITE + p)).status, 404, p);
  }
});

test('old .html URLs redirect to clean ones, keeping the query', async () => {
  const cases = {
    '/hockey.html': '/hockey',
    '/schedule.html?sport=hockey': '/schedule?sport=hockey',
    '/index.html?strip=events': '/?strip=events',
    '/index': '/',
    '/programs/': '/programs',
  };
  for (const [from, to] of Object.entries(cases)) {
    const res = await fetch(SITE + from, { redirect: 'manual' });
    assert.equal(res.status, 301, from);
    assert.equal(res.headers.get('location'), to, from);
  }
});
