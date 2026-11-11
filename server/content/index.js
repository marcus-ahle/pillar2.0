/* Builds what the site renders: programs (with their dated sessions) and sponsors.

   Programs and sponsors always come from MongoDB. Sessions ("events") come from
   the source chosen on the admin page:
     • database   → the `events` collection
     • ezfacility → reservations on the EZFacility schedule */
import { EVENT_SOURCES } from '../config.js';
import { createEzfacilityEvents } from './ezfacility-events.js';

const SETTINGS_ID = 'site';
const DEFAULT_SETTINGS = { eventsSource: 'database' };

export function createContentService(db, cfg) {
  const ez = createEzfacilityEvents(cfg.ezfacility);

  async function getSettings() {
    const doc = await db.collection('settings').findOne({ _id: SETTINGS_ID });
    const out = { ...DEFAULT_SETTINGS, ...(doc || {}) };
    delete out._id;
    if (!EVENT_SOURCES.includes(out.eventsSource)) out.eventsSource = DEFAULT_SETTINGS.eventsSource;
    return out;
  }

  async function updateSettings(patch) {
    if (patch.eventsSource !== undefined && !EVENT_SOURCES.includes(patch.eventsSource)) {
      throw Object.assign(new Error(`eventsSource must be one of: ${EVENT_SOURCES.join(', ')}`), { status: 400 });
    }
    const $set = { updatedAt: new Date() };
    if (patch.eventsSource) $set.eventsSource = patch.eventsSource;
    await db.collection('settings').updateOne({ _id: SETTINGS_ID }, { $set }, { upsert: true });
    ez.clearCache();
    return getSettings();
  }

  const getPrograms = () => db.collection('programs').find({}, { projection: { _id: 0 } }).sort({ order: 1, id: 1 }).toArray();
  const getSponsors = () => db.collection('sponsors').find({ hidden: { $ne: true } }, { projection: { _id: 0 } }).sort({ order: 1, name: 1 }).toArray();

  async function databaseEvents() {
    const rows = await db.collection('events').find({ hidden: { $ne: true } }, { projection: { _id: 0 } }).sort({ date: 1, order: 1 }).toArray();
    return { sessions: rows.map(r => ({ ...r, startsAt: r.date })), extraPrograms: [], warnings: [] };
  }

  async function loadEvents(source, programs) {
    if (source === 'ezfacility') {
      try {
        return await ez.load(programs);
      } catch (err) {
        console.error('[content] EZFacility events failed:', err.message);
        return { sessions: [], extraPrograms: [], warnings: [`EZFacility unavailable, no events shown: ${err.message}`] };
      }
    }
    return databaseEvents();
  }

  /** Programs with `sessions` attached (sorted, omitted when none), plus sponsors. */
  async function getContent() {
    const [settings, programs, sponsors] = await Promise.all([getSettings(), getPrograms(), getSponsors()]);
    const events = await loadEvents(settings.eventsSource, programs);

    const byProgram = new Map();
    for (const s of events.sessions) {
      if (!byProgram.has(s.programId)) byProgram.set(s.programId, []);
      byProgram.get(s.programId).push(s);
    }
    const orphans = [...byProgram.keys()].filter(id => !programs.some(p => p.id === id) && !events.extraPrograms.some(p => p.id === id));
    if (orphans.length) events.warnings.push(`Events reference unknown programs: ${orphans.join(', ')}`);

    const out = [...programs, ...events.extraPrograms].map(({ order, ...p }) => {
      const list = (byProgram.get(p.id) || [])
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt) || (a.order ?? 0) - (b.order ?? 0))
        .map(({ programId, startsAt, order: _o, ...s }) => s);
      if (list.length) p.sessions = list; else delete p.sessions;
      return p;
    });

    return {
      source: { events: settings.eventsSource, programs: 'database', sponsors: 'database' },
      generatedAt: new Date().toISOString(),
      ...(events.fetchedAt ? { eventsFetchedAt: events.fetchedAt } : {}),
      warnings: events.warnings,
      programs: out,
      sponsors: sponsors.map(({ order, hidden, ...s }) => s),
    };
  }

  async function getStatus() {
    const settings = await getSettings();
    const [programs, events, sponsors, placeholders] = await Promise.all([
      ...['programs', 'events', 'sponsors'].map(c => db.collection(c).countDocuments()),
      db.collection('events').countDocuments({ placeholder: true }),
    ]);
    let ezfacility;
    try {
      ezfacility = { ...(await ez.check()), baseUrl: cfg.ezfacility.baseUrl };
    } catch (err) {
      ezfacility = { ok: false, baseUrl: cfg.ezfacility.baseUrl, error: err.message };
    }
    ezfacility.mock = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(cfg.ezfacility.baseUrl);
    return { eventsSource: settings.eventsSource, database: { ok: true, name: db.databaseName, programs, events, sponsors, placeholders }, ezfacility };
  }

  return { getSettings, updateSettings, getContent, getStatus };
}
