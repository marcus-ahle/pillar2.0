/* PLACEHOLDER dates, invented so every sport has something upcoming on the
   schedule while we wait for Pillar's real winter dates. The live sites list
   none for hockey, softball or baseball after early November 2026.

   `npm run seed` loads these into MongoDB (flagged `placeholder: true`) and into
   the mock EZFacility schedule. Replace them with real dates before launch:
   delete events where placeholder is true, then add the real ones. */

const contact = id => `contact?program=${id}`;

export const PLACEHOLDER_EVENTS = [
  // Hockey clinics, continuing their Wednesday pattern
  { programId: 'hk-skating', date: '2026-12-02', time: '6:00 – 7:00 PM', label: 'Skating' },
  { programId: 'hk-skating', date: '2026-12-09', time: '6:00 – 7:00 PM', label: 'Skating' },
  { programId: 'hk-skating', date: '2027-01-06', time: '6:00 – 7:00 PM', label: 'Skating' },
  { programId: 'hk-shooting', date: '2026-12-02', time: '7:00 – 8:00 PM', label: 'Shooting' },
  { programId: 'hk-shooting', date: '2026-12-09', time: '7:00 – 8:00 PM', label: 'Shooting' },
  { programId: 'hk-shooting', date: '2027-01-06', time: '7:00 – 8:00 PM', label: 'Shooting' },
  // Baseball tryouts
  { programId: 'bb-12u', date: '2026-12-12', time: '10:00 AM – 12:00 PM', label: '12U Tryout' },
  { programId: 'bb-15u', date: '2026-12-12', time: '12:30 – 2:30 PM', label: '15U Tryout' },
  // Softball travel team evaluations
  { programId: 'sb-travel', date: '2026-12-05', time: '10:00 – 11:30 AM', label: '9U – 11U Evaluation' },
  { programId: 'sb-travel', date: '2026-12-05', time: '11:30 AM – 1:00 PM', label: '12U – 14U Evaluation' },
].map(e => ({ ...e, url: contact(e.programId), placeholder: true }));
