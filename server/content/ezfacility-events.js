/* Events from EZFacility: reservations on the facility schedule become
   program sessions on the site.

   Linking: a site program with `ezfacility.sessionTypeId` gets every reservation
   of that session type. A reservation whose type no program claims becomes a
   program of its own, built from the EZFacility data (sport from its category). */
import { EZFacilityClient } from './ezfacility-client.js';
import { utcToZoned, formatTimeRange, isoDate } from '../../lib/time.js';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const guessType = name =>
  /camp/i.test(name) ? 'Camp'
  : /clinic/i.test(name) ? 'Clinic'
  : /lesson/i.test(name) ? 'Lessons'
  : /tournament|classic/i.test(name) ? 'Tournament'
  : /league/i.test(name) ? 'League'
  : /tryout|team|evaluation/i.test(name) ? 'Team'
  : 'Training';

/* "Open Gym · 13U – 18U" on program "Open Gym" → "13U – 18U" (the site prints both) */
const sessionLabel = (title, programTitle) => {
  const t = String(title).trim();
  if (t.toLowerCase() === programTitle.toLowerCase()) return t;
  const lead = t.slice(0, programTitle.length);
  const rest = t.slice(programTitle.length).match(/^\s*[·:|–-]\s*(.+)$/);
  return lead.toLowerCase() === programTitle.toLowerCase() && rest ? rest[1] : t;
};

/* EZFacility timestamps come without a zone suffix but are UTC */
const asUtc = s => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`);

export function createEzfacilityEvents(cfg, client = new EZFacilityClient(cfg)) {
  let locationId = cfg.locationId || null;
  let cache = null;    // { at, categories, reservations, window }
  let inflight = null;

  async function resolveLocation() {
    if (locationId) return locationId;
    const locations = await client.getLocations();
    if (!locations.length) throw new Error('The EZFacility API user has no locations');
    locationId = locations[0].Id;
    return locationId;
  }

  /** Fetch categories + schedule; ≤ 1 year window starting `pastDays` ago. */
  async function fetchRaw() {
    const loc = await resolveLocation();
    const today = utcToZoned(new Date(), cfg.timeZone).date;
    const start = new Date(`${today}T00:00:00Z`); start.setUTCDate(start.getUTCDate() - cfg.pastDays);
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 364);
    const [categories, reservations] = await Promise.all([
      client.getSessionCategories(loc),
      client.getSchedule(loc, isoDate(start), isoDate(end)),
    ]);
    return { at: Date.now(), categories, reservations, window: [isoDate(start), isoDate(end)] };
  }

  async function getRaw() {
    if (cache && Date.now() - cache.at < cfg.cacheSeconds * 1000) return { raw: cache, warnings: [] };
    inflight ??= fetchRaw().finally(() => { inflight = null; });
    try {
      cache = await inflight;
      return { raw: cache, warnings: [] };
    } catch (err) {
      // Serve the last good schedule rather than an empty site
      if (cache) return { raw: cache, warnings: [`EZFacility unavailable, showing schedule from ${new Date(cache.at).toISOString()}: ${err.message}`] };
      throw err;
    }
  }

  /**
   * @param programs site programs (from MongoDB)
   * @returns {{ sessions: Array<{programId, startsAt, date, time, label, url, soldOut}>, extraPrograms: object[], warnings: string[] }}
   */
  async function load(programs) {
    const { raw, warnings } = await getRaw();
    const sports = new Set(programs.map(p => p.sport));
    const sportOfCategory = new Map(raw.categories.map(c => [c.ID, String(c.CategoryName || '').trim().toLowerCase()]));
    const programByType = new Map(programs.filter(p => p.ezfacility?.sessionTypeId).map(p => [Number(p.ezfacility.sessionTypeId), p]));

    const sessions = [], extra = new Map(), skippedCategories = new Set();
    for (const r of raw.reservations) {
      if (r.IsRentalType) continue;
      const full = r.SlotsTotal > 0 && r.SlotsAvailable <= 0;
      if (full && r.HideFullSessions) continue;

      let program = programByType.get(Number(r.TypeId));
      if (!program) {
        const sport = sportOfCategory.get(r.ReservationCategoryId);
        if (!sports.has(sport)) { skippedCategories.add(sport || `category ${r.ReservationCategoryId}`); continue; }
        const id = `ez-type-${r.TypeId}`;
        if (!extra.has(id)) {
          extra.set(id, {
            id, sport, type: guessType(r.Type), title: r.Type,
            level: LEVELS, ageMin: 0, ageMax: 99, ageLabel: 'All ages',
            summary: r.Description || `${r.Type} at Pillar Sports Academy.`,
            source: 'ezfacility', ezfacility: { sessionTypeId: r.TypeId },
          });
        }
        program = extra.get(id);
      }

      const start = utcToZoned(asUtc(r.StartTimeUTC), cfg.timeZone);
      const end = r.EndTimeUTC ? utcToZoned(asUtc(r.EndTimeUTC), cfg.timeZone) : null;
      sessions.push({
        programId: program.id,
        startsAt: asUtc(r.StartTimeUTC).toISOString(),
        date: start.date,
        time: formatTimeRange(start, end && end.date === start.date ? end : null),
        label: sessionLabel(r.Title || r.Type, program.title),
        // No online registration link → send families to the contact form for that program
        url: r.SelfServiceSessionURL || `contact?program=${encodeURIComponent(program.id)}`,
        ...(full ? { soldOut: true } : {}),
        ...(r.SlotsTotal > 0 ? { spotsLeft: Math.max(0, r.SlotsAvailable) } : {}),
        ezfacility: { reservationId: r.ID },
      });
    }
    if (skippedCategories.size) warnings.push(`Skipped EZFacility reservations in categories with no matching sport: ${[...skippedCategories].join(', ')}`);
    return { sessions, extraPrograms: [...extra.values()], warnings, fetchedAt: new Date(raw.at).toISOString() };
  }

  /** Live connection check for the admin page (bypasses the cache). */
  async function check() {
    const started = Date.now();
    await client.getToken({ force: true });
    const locations = await client.getLocations();
    const loc = locationId || locations[0]?.Id;
    const location = locations.find(l => l.Id === Number(loc)) || null;
    return { ok: !!location, ms: Date.now() - started, location: location && { id: location.Id, name: location.Name } };
  }

  return { load, check, clearCache: () => { cache = null; } };
}
