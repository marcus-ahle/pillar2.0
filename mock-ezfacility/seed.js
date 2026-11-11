/* Seeds the mock EZFacility database from the site's current sessions
   (assets/js/data.js) plus the fixtures. Run: node mock-ezfacility/seed.js [--reset] */
import { MongoClient } from 'mongodb';
import { pathToFileURL } from 'node:url';
import { loadSiteData } from '../server/site-data.js';
import { zonedToUtc, parseTimeRange } from '../lib/time.js';
import { PLACEHOLDER_EVENTS } from '../server/placeholders.js';
import {
  MOCK_LOCATION, MOCK_TIME_ZONE, MOCK_SITE_TZ_OFFSET, MOCK_CLIENTS, MOCK_USERS,
  CATEGORIES, SESSION_TYPES, EXTRA_RESERVATIONS,
} from './fixtures.js';

export const mockDbName = () => process.env.MOCK_EZ_DB || 'ezfacility_mock';

function buildReservations() {
  const { PROGRAMS } = loadSiteData();
  const typeByProgram = new Map(SESSION_TYPES.filter(t => t.programId).map(t => [t.programId, t]));
  const typeById = new Map(SESSION_TYPES.map(t => [t.ID, t]));
  let id = 500001;

  const make = ({ type, title, date, time, slotsAvailable, url, description, notes = '' }) => {
    const range = parseTimeRange(time || type.defaultTime || '6:00 – 7:00 PM');
    const start = zonedToUtc(date, range.start.hour, range.start.minute, MOCK_TIME_ZONE);
    const end = zonedToUtc(date, range.end.hour, range.end.minute, MOCK_TIME_ZONE);
    const resId = id++;
    return {
      ID: resId, ReservationNumber: resId,
      Title: title, Description: description || '',
      SiteId: MOCK_LOCATION.Id, SiteName: MOCK_LOCATION.Name, SiteAllowsSelfRegistration: true,
      TypeId: type.ID, Type: type.Name,
      StartTimeUTC: start.toISOString().slice(0, 19), EndTimeUTC: end.toISOString().slice(0, 19),
      Bookable: !type.rental, SlotsTotal: type.slots, SlotsAvailable: slotsAvailable,
      ReservationCategoryId: type.categoryId, ReservationSubCategoryId: 0,
      ResourceName: type.rental ? 'Court 2' : 'Main Facility', ResourceId: type.rental ? 902 : 901,
      AllResources: [{ ResourceId: type.rental ? 902 : 901, ResourceName: type.rental ? 'Court 2' : 'Main Facility', ResourceType: 'Venue' }],
      BookableUpToUTC: start.toISOString().slice(0, 19), CancellableUpToUtc: start.toISOString().slice(0, 19), Cancellable: true,
      SiteTimeZone: MOCK_SITE_TZ_OFFSET, HideFullSessions: false, AllowWaitlisting: !type.rental,
      IsRentalType: !!type.rental, IsSpecialType: false,
      CreatedBy: 'Mock Seed', CreatedOn: new Date().toISOString(), LastActionDate: new Date().toISOString(),
      Notes: notes, ShowOnEZLeagues: false, ZoomStartURL: null, ZoomJoinURL: null,
      // The real Pillar account registers through TMS online-registration links,
      // so the mock hands those back as the self-service URL.
      SelfServiceSessionURL: url || null,
    };
  };

  const reservations = [];
  for (const p of PROGRAMS) {
    const type = typeByProgram.get(p.id);
    if (!type || !p.sessions) continue;
    p.sessions.forEach((s, i) => reservations.push(make({
      type, title: s.label || p.title, date: s.date, time: s.time, url: s.url,
      // Sold-out sessions have no slots left; the rest have a few taken
      slotsAvailable: s.soldOut ? 0 : Math.max(1, type.slots - ((i * 3 + p.id.length) % type.slots)),
    })));
  }
  // Placeholder dates (server/placeholders.js) go on the mock schedule too
  PLACEHOLDER_EVENTS.forEach((e, i) => {
    const type = typeByProgram.get(e.programId);
    if (!type) throw new Error(`No mock session type for placeholder program ${e.programId}`);
    reservations.push(make({ type, title: e.label, date: e.date, time: e.time, url: e.url, notes: 'Placeholder date',
      slotsAvailable: Math.max(1, type.slots - (i % 4) - 1) }));
  });
  for (const x of EXTRA_RESERVATIONS) reservations.push(make({ ...x, type: typeById.get(x.typeId) }));
  return reservations;
}

export async function seedMock(db, { reset = false } = {}) {
  if (reset) await db.dropDatabase();
  const existing = await db.collection('reservations').countDocuments();
  if (existing && !reset) return { skipped: true, reservations: existing };

  await db.collection('locations').insertOne({ ...MOCK_LOCATION });
  await db.collection('clients').insertMany(MOCK_CLIENTS.map(c => ({ ...c })));
  await db.collection('users').insertMany(MOCK_USERS.map(u => ({ ...u, locationId: MOCK_LOCATION.Id })));
  await db.collection('sessionCategories').insertMany(CATEGORIES.map(c => ({
    ...c, locationId: MOCK_LOCATION.Id, CalendarTypeID: 1, IsDisabled: false, IsReservationCategory: true, IsReservationSubcategory: false, ReservationUseCount: 0,
  })));
  await db.collection('sessionTypes').insertMany(SESSION_TYPES.map(({ ID, Name, categoryId }) => ({ ID, Name, categoryId })));
  const reservations = buildReservations();
  await db.collection('reservations').insertMany(reservations);
  await db.collection('reservations').createIndex({ SiteId: 1, StartTimeUTC: 1 });
  await db.collection('tokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection('tokens').createIndex({ token: 1 }, { unique: true });
  return { reservations: reservations.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 3000 });
  try {
    await client.connect();
    const out = await seedMock(client.db(mockDbName()), { reset: process.argv.includes('--reset') });
    console.log(out.skipped ? `Mock EZFacility already seeded (${out.reservations} reservations). Use --reset to reseed.`
      : `Seeded mock EZFacility (${mockDbName()}): ${out.reservations} reservations.`);
  } catch (err) {
    console.error('Mock EZFacility seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}
