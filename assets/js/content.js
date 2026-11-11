/* Live content: programs, their dated sessions (events) and sponsors come from
   the site API (server/app.js), which reads MongoDB and, when the admin picks it,
   EZFacility. The results replace PROGRAMS and SPONSORS from data.js in place,
   so page code keeps using those arrays. Pages that read them wait for
   PillarContent.ready first.

   On a static host with no API (e.g. the Netlify concept site) the request
   fails and the bundled data.js content is used instead. */
const PillarContent = (() => {
  const replace = (target, items) => { target.splice(0, target.length, ...items); };

  const ready = fetch('api/content', { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then(r => {
      if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      replace(PROGRAMS, data.programs || []);
      replace(SPONSORS, data.sponsors || []);
      (data.warnings || []).forEach(w => console.warn('[content]', w));
      return { live: true, source: data.source, warnings: data.warnings || [], generatedAt: data.generatedAt };
    })
    .catch(err => {
      console.info('[content] API unavailable, showing bundled content from data.js:', err.message);
      return { live: false, source: { events: 'bundled', programs: 'bundled', sponsors: 'bundled' }, warnings: [] };
    });

  return { ready };
})();
