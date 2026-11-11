/* Seeds the site database from assets/js/data.js:
     programs  one document per program (no dates), with its EZFacility session type link
     events    one document per dated session (used when events come from the database),
               plus the flagged placeholder dates in placeholders.js
     sponsors  one document per sponsor
     settings  { _id: 'site', eventsSource: 'database' }
   Run: node server/seed.js [--reset]   (without --reset, an already-seeded database is left alone) */
import { pathToFileURL } from 'node:url';
import { loadSiteData } from './site-data.js';
import { SESSION_TYPES } from '../mock-ezfacility/fixtures.js';
import { PLACEHOLDER_EVENTS } from './placeholders.js';

export async function seedSite(db, { reset = false } = {}) {
  if (reset) {
    // Keep the admin's chosen source across reseeds
    await Promise.all(['programs', 'events', 'sponsors'].map(c => db.collection(c).drop().catch(() => {})));
  } else if (await db.collection('programs').countDocuments()) {
    return { skipped: true };
  }

  const { PROGRAMS, SPONSORS } = loadSiteData();
  const typeFor = new Map(SESSION_TYPES.filter(t => t.programId).map(t => [t.programId, t.ID]));

  const programs = PROGRAMS.map(({ sessions, ...p }, order) => ({
    ...p, order,
    ...(typeFor.has(p.id) ? { ezfacility: { sessionTypeId: typeFor.get(p.id) } } : {}),
  }));
  const events = PROGRAMS.flatMap(p => (p.sessions || []).map((s, order) => ({ programId: p.id, order, ...s })))
    .concat(PLACEHOLDER_EVENTS.map((e, i) => ({ ...e, order: 100 + i })));
  const sponsors = SPONSORS.map((s, order) => ({ ...s, order }));

  await db.collection('programs').insertMany(programs);
  await db.collection('events').insertMany(events);
  await db.collection('sponsors').insertMany(sponsors);
  await db.collection('programs').createIndex({ id: 1 }, { unique: true });
  await db.collection('programs').createIndex({ 'ezfacility.sessionTypeId': 1 }, { sparse: true });
  await db.collection('events').createIndex({ programId: 1, date: 1 });
  await db.collection('settings').updateOne({ _id: 'site' }, { $setOnInsert: { eventsSource: 'database', updatedAt: new Date() } }, { upsert: true });
  return { programs: programs.length, events: events.length, sponsors: sponsors.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { getDb, closeDb } = await import('./db.js');
  try {
    const db = await getDb();
    const out = await seedSite(db, { reset: process.argv.includes('--reset') });
    console.log(out.skipped ? 'Site database already seeded. Use --reset to reseed.'
      : `Seeded site database (${db.databaseName}): ${out.programs} programs, ${out.events} events, ${out.sponsors} sponsors.`);
  } catch (err) {
    console.error('Site seed failed:', err.message, '\nIs MongoDB running? Start it with: npm run db:up');
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}
