/* Time-zone helpers shared by the site API and the mock EZFacility seed.
   EZFacility stores reservation times in UTC; the site shows facility-local
   dates ("2026-11-03") and time ranges ("10:00 AM – 12:00 PM"). */

const pad = n => String(n).padStart(2, '0');

/** Offset in minutes of `timeZone` from UTC at the given instant (e.g. -300 for EST). */
function offsetMinutes(date, timeZone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date).map(p => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** Wall-clock time in `timeZone` → UTC Date. `date` is YYYY-MM-DD. */
export function zonedToUtc(date, hour, minute, timeZone) {
  const [y, m, d] = date.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, minute);
  // Two passes settle the offset across DST changes
  let t = guess - offsetMinutes(new Date(guess), timeZone) * 60000;
  t = guess - offsetMinutes(new Date(t), timeZone) * 60000;
  return new Date(t);
}

/** UTC Date → { date: 'YYYY-MM-DD', hour, minute } in `timeZone`. */
export function utcToZoned(when, timeZone) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(when).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: +p.hour, minute: +p.minute };
}

const clock = (h, m) => `${h % 12 || 12}:${pad(m)}`;
const meridiem = h => (h < 12 ? 'AM' : 'PM');

/** Formats a range the way the site writes it: "10:00 – 11:30 AM", "10:00 AM – 12:00 PM". */
export function formatTimeRange(start, end) {
  if (!end) return `${clock(start.hour, start.minute)} ${meridiem(start.hour)}`;
  const same = meridiem(start.hour) === meridiem(end.hour);
  return same
    ? `${clock(start.hour, start.minute)} – ${clock(end.hour, end.minute)} ${meridiem(end.hour)}`
    : `${clock(start.hour, start.minute)} ${meridiem(start.hour)} – ${clock(end.hour, end.minute)} ${meridiem(end.hour)}`;
}

/** Parses "10:00 AM – 12:00 PM" or "12:00 – 2:00 PM" → { start: {hour, minute}, end: {hour, minute} }. */
export function parseTimeRange(text) {
  const parts = String(text).split(/\s*[–-]\s*/);
  const read = s => {
    const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!m) throw new Error(`Unrecognised time "${s}" in "${text}"`);
    return { h: +m[1], minute: +m[2], ap: m[3]?.toUpperCase() };
  };
  const a = read(parts[0]), b = parts[1] ? read(parts[1]) : null;
  const to24 = (h, ap) => (ap === 'PM' ? (h % 12) + 12 : h % 12);
  const end = b && { hour: to24(b.h, b.ap ?? 'PM'), minute: b.minute };
  // "12:00 – 2:00 PM": the start shares the end's meridiem unless that would put it after the end
  let startAp = a.ap ?? b?.ap ?? 'AM';
  let start = { hour: to24(a.h, startAp), minute: a.minute };
  if (!a.ap && end && start.hour * 60 + start.minute > end.hour * 60 + end.minute) start = { hour: to24(a.h, 'AM'), minute: a.minute };
  return { start, end: end ?? { hour: start.hour + 1, minute: start.minute } };
}

export const isoDate = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
