/* Mock EZFacility API (v2), backed by local MongoDB.

   Mirrors the real API's contract for the calls the Pillar site makes
   (https://api.sandbox.ezfacility.com/swagger/ui/index):
     • POST /token  OAuth2 resource-owner password grant. Client ID/secret go in
       a Basic Authorization header; the form body carries grant_type=password,
       username, password and scope (realm:tms | realm:self_service | realm:ezleagues | realm:none).
       Returns { access_token, expires_in: 1199, token_type: "bearer" }.
     • Every /v2 call needs "Authorization: Bearer <token>".
     • Paged endpoints require the "ez-page-number" header (from 1) and answer with
       ez-total-count, ez-per-page, ez-total-pages and ez-current-page headers.
       A page past the end returns an empty list, not an error.
     • Date ranges over one year are rejected (DateRangeExceedOneYear).

   Run: npm run mock:ez   (port MOCK_EZ_PORT, default 5055) */
import express from 'express';
import { MongoClient } from 'mongodb';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { seedMock, mockDbName } from './seed.js';

const PER_PAGE = 100;
const TOKEN_TTL = 1199;
const REALMS = ['tms', 'self_service', 'ezleagues', 'none'];

// ASP.NET Web API style error bodies
const fail = (res, status, code, message) => res.status(status).json({ Message: message, ErrorCode: code });

export function createMockApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.set('case sensitive routing', false);
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use((req, res, next) => {
    res.on('finish', () => console.log(`[mock-ez] ${req.method} ${req.originalUrl} → ${res.statusCode}`));
    next();
  });

  app.get('/', (req, res) => res.json({
    name: 'Mock EZFacility API', version: 'v2',
    docs: 'https://api.sandbox.ezfacility.com/swagger/ui/index',
    endpoints: ['POST /token', 'POST /v2/token/revoke', 'GET /v2/user/current', 'GET /v2/user/locations',
      'GET /v2/sessionCategories/all/locationID={locationID}', 'GET /v2/sessionTypes/all/sessionCategoryID={sessionCategoryID}',
      'GET /v2/schedule/{locationID}/{startDate}/{endDate}'],
  }));

  /* ---------- OAuth2 token ---------- */
  app.post('/token', async (req, res) => {
    const basic = (req.get('authorization') || '').match(/^Basic\s+(.+)$/i);
    if (!basic) return res.status(400).json({ error: 'invalid_client', error_description: 'Client credentials were not provided' });
    const [clientId, ...rest] = Buffer.from(basic[1], 'base64').toString('utf8').split(':');
    const client = await db.collection('clients').findOne({ clientId, clientSecret: rest.join(':') });
    if (!client) return res.status(400).json({ error: 'invalid_client', error_description: 'Client credentials are invalid' });

    const { grant_type, username, password, scope = 'realm:none' } = req.body || {};
    if (grant_type !== 'password') return res.status(400).json({ error: 'unsupported_grant_type' });
    const realm = String(scope).replace(/^realm:/, '');
    if (!REALMS.includes(realm)) return res.status(400).json({ error: 'invalid_scope', error_description: 'Invalid scope' });
    const user = await db.collection('users').findOne({ username, password });
    if (!user) return res.status(400).json({ error: 'invalid_grant', error_description: 'The user name or password is incorrect.' });
    if (!user.realms.includes(realm)) return res.status(400).json({ error: 'invalid_scope', error_description: `User is not allowed to use realm:${realm}` });

    const token = randomBytes(32).toString('base64url');
    await db.collection('tokens').insertOne({ token, realm, username, clientId, expiresAt: new Date(Date.now() + TOKEN_TTL * 1000) });
    res.set('Cache-Control', 'no-store').json({ access_token: token, expires_in: TOKEN_TTL, token_type: 'bearer' });
  });

  /* ---------- Bearer auth for /v2 ---------- */
  const auth = (...realms) => async (req, res, next) => {
    const m = (req.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
    const t = m && await db.collection('tokens').findOne({ token: m[1], expiresAt: { $gt: new Date() } });
    if (!t) return res.status(401).json({ Message: 'Authorization has been denied for this request.' });
    // Endpoints marked realm:none accept any token; the rest need a token from their realm
    if (!realms.includes('none') && !realms.includes(t.realm)) {
      const code = realms.includes('tms') ? 'WrongAPIScopeTMS' : realms.includes('self_service') ? 'WrongAPIScopeSS' : 'WrongAPIScopeEZL';
      return fail(res, 400, code, `This endpoint requires realm:${realms.join(' or realm:')}`);
    }
    req.token = t;
    next();
  };

  /* Paged responses: ez-page-number in, ez-* headers out */
  const paged = (req, res, items) => {
    const raw = req.get('ez-page-number');
    const page = Number(raw);
    if (raw === undefined || !Number.isInteger(page) || page < 1) return fail(res, 400, 'InvalidPageNumber', 'The ez-page-number header is required and must be 1 or greater.');
    const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
    res.set({ 'ez-total-count': String(items.length), 'ez-per-page': String(PER_PAGE), 'ez-total-pages': String(pages), 'ez-current-page': String(page) });
    res.json(items.slice((page - 1) * PER_PAGE, page * PER_PAGE));
  };

  const strip = ({ _id, ...doc }) => doc;
  const parseDay = s => {
    const v = decodeURIComponent(s);
    if (!/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/.test(v)) return null;
    const d = new Date(v.length === 10 ? `${v}T00:00:00Z` : v);
    return Number.isNaN(+d) ? null : d;
  };

  app.post('/v2/token/revoke', auth('none'), async (req, res) => {
    await db.collection('tokens').deleteOne({ token: req.body?.Token || req.token.token });
    res.json({});
  });

  app.get('/v2/user/current', auth('tms'), async (req, res) => {
    const u = await db.collection('users').findOne({ username: req.token.username });
    const loc = await db.collection('locations').findOne({ Id: u.locationId });
    res.json({ CalendarTypeId: 1, CalendarType: 'Sessions', Culture: 'en-US', FirstName: u.firstName, LastName: u.lastName,
      Address1: loc.Address1, Address2: loc.Address2, City: loc.City, StateProv: loc.State, Postal: loc.Zip,
      Phone: loc.Phone, Fax: loc.Fax, Email: '', Website: loc.Website, ReceiptFooter: '', HasEquipment: loc.HasEquipment });
  });

  app.get('/v2/user/locations', auth('tms'), async (req, res) => {
    res.json((await db.collection('locations').find().toArray()).map(strip));
  });

  app.get(/^\/v2\/sessionCategories\/all\/locationID=(\d+)$/i, auth('none'), async (req, res) => {
    const locationId = Number(req.params[0]);
    if (!await db.collection('locations').findOne({ Id: locationId })) return fail(res, 400, 'ScopeIDsInvalid', 'Invalid location ID.');
    const rows = await db.collection('sessionCategories').find({ locationId }).sort({ ID: 1 }).toArray();
    paged(req, res, rows.map(({ _id, locationId: _l, ...c }) => c));
  });

  app.get(/^\/v2\/sessionTypes\/all\/sessionCategoryID=(\d+)$/i, auth('none'), async (req, res) => {
    const rows = await db.collection('sessionTypes').find({ categoryId: Number(req.params[0]) }).sort({ ID: 1 }).toArray();
    paged(req, res, rows.map(({ ID, Name }) => ({ Name, ID })));
  });

  app.get(/^\/v2\/schedule\/(\d+)\/([^/]+)\/([^/]+)$/i, auth('tms'), async (req, res) => {
    const [locationId, s, e] = [Number(req.params[0]), parseDay(req.params[1]), parseDay(req.params[2])];
    if (!s) return fail(res, 400, 'StartDateMissing', 'A valid startDate is required.');
    if (!e) return fail(res, 400, 'EndDateMissing', 'A valid endDate is required.');
    if (e < s) return fail(res, 400, 'InvalidRequest', 'endDate must be after startDate.');
    if (e - s > 366 * 864e5) return fail(res, 400, 'DateRangeExceedOneYear', 'The date range cannot exceed one year.');
    if (!await db.collection('locations').findOne({ Id: locationId })) return fail(res, 400, 'ScopeIDsInvalid', 'Invalid location ID.');
    // endDate is inclusive of that whole day
    const endExclusive = new Date(+e + (req.params[2].length <= 10 ? 864e5 : 0));
    const rows = await db.collection('reservations').find({
      SiteId: locationId,
      StartTimeUTC: { $gte: s.toISOString().slice(0, 19), $lt: endExclusive.toISOString().slice(0, 19) },
    }).sort({ StartTimeUTC: 1 }).toArray();
    paged(req, res, rows.map(strip));
  });

  app.use((req, res) => res.status(404).json({ Message: `No HTTP resource was found that matches the request URI '${req.protocol}://${req.get('host')}${req.originalUrl}'.` }));
  app.use((err, req, res, _next) => { console.error('[mock-ez]', err); res.status(500).json({ Message: 'An error has occurred.' }); });
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.MOCK_EZ_PORT || 5055);
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 3000 });
  try {
    await client.connect();
  } catch (err) {
    console.error(`Mock EZFacility could not reach MongoDB (${err.message}). Start it with: npm run db:up`);
    process.exit(1);
  }
  const db = client.db(mockDbName());
  const seeded = await seedMock(db);
  if (!seeded.skipped) console.log(`[mock-ez] Empty database, seeded ${seeded.reservations} reservations`);
  createMockApp(db).listen(port, () => console.log(`Mock EZFacility API running at http://localhost:${port}`));
}
