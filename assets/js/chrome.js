/* Pillar Sports Academy — shared chrome + motion helpers.
   Content helpers (programStatus, upcomingSessions, icon, esc…) come from site.js,
   and all content from data.js (the single source of truth). */

const HUBS = ['hockey', 'baseball', 'softball', 'volleyball'];
const bLink = k => SPORTS[k].external || `${k}.html`;
const extAttr = k => SPORTS[k].external ? ' target="_blank" rel="noopener"' : '';
const arrowNE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/* ----- Motion preference: OS setting or the header toggle ----- */
const MOTION_KEY = 'pillar.motion';
const osReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = (() => { try { return localStorage.getItem(MOTION_KEY) === 'off'; } catch { return false; } })() || osReduce;
document.documentElement.classList.toggle('paused', paused);

/* Split a heading into animated characters; screen readers get the plain text */
function splitText(el) {
  const text = el.textContent;
  let i = 0;
  el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
  el.querySelectorAll('.l').forEach(line => {
    line.setAttribute('aria-hidden', 'true');
    line.innerHTML = line.textContent.split(' ').map(w =>
      `<span class="w">${[...w].map(c => `<span class="ch" style="--i:${i++}">${c}</span>`).join('')}</span>`).join(' ');
  });
}

/* Ticket card for a dated session or a year-round program */
function ticket(p, s) {
  const sp = SPORTS[p.sport];
  const c = `var(--${p.sport})`;
  if (s) {
    const d = parseDate(s.date), days = daysFromToday(d);
    const hot = !s.soldOut && days <= 14;
    const status = s.soldOut ? 'Sold out' : days <= 0 ? 'Today' : hot ? `In ${days} day${days === 1 ? '' : 's'}` : 'Open';
    const go = s.soldOut
      ? `<a class="t-go ghost" href="contact.html?topic=notify&program=${p.id}">Notify me</a>`
      : `<a class="t-go" href="${s.url}"${linkAttrs(s.url)} aria-label="Register for ${esc(p.title)}, ${fmt(d, { month: 'long', day: 'numeric' })} (opens registration)">Register ${icon('ext')}</a>`;
    return `<article class="ticket" style="--c:${c}">
      <div class="t-top"><div class="t-date"><span class="mono">${fmt(d, { weekday: 'short' })}</span><span class="day">${d.getDate()}</span><span class="mono">${fmt(d, { month: 'short' })}</span></div>
        <span class="t-status${hot ? ' hot' : ''}">${status}</span></div>
      <div class="t-body"><span class="sport">${sp.name} · ${p.type}</span><h3>${esc(p.title)}</h3><p>${esc([s.label !== p.title ? s.label : '', s.time, p.ageLabel].filter(Boolean).join(' · '))}</p></div>
      <div class="t-foot"><span class="mono">${esc(p.capacity || 'Rossford, OH')}</span>${go}</div>
    </article>`;
  }
  const st = programStatus(p);
  const label = p.ongoing ? p.ongoing.label : st.key === 'closed' ? 'Notify me' : 'Details';
  const url = p.ongoing ? p.ongoing.url : `contact.html?topic=notify&program=${p.id}`;
  return `<article class="ticket" style="--c:${c}">
    <div class="t-top"><div class="t-date"><span class="mono">${p.ongoing ? 'Any day' : 'Next'}</span><span class="day" style="font-size:3.6rem">${p.ongoing ? 'Year-round' : 'Soon'}</span></div>
      <span class="t-status">${p.price ? esc(p.price) : st.label}</span></div>
    <div class="t-body"><span class="sport">${sp.name} · ${p.type}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></div>
    <div class="t-foot"><span class="mono">${esc(p.ageLabel)}</span><a class="t-go${p.ongoing ? '' : ' ghost'}" href="${url}"${linkAttrs(url)}>${esc(label)} ${icon(isExternal(url) ? 'ext' : 'arrow')}</a></div>
  </article>`;
}

function coachCard(c) {
  const initials = c.name.split(' ').map(w => w[0]).join('');
  return `<article class="player" style="--c:var(--${c.sport})">
    ${c.photo ? `<img src="${c.photo}" alt="${esc(c.name)}" loading="lazy">` : `<div class="initials" aria-hidden="true">${initials}</div>`}
    <div class="info"><h3>${esc(c.name)}</h3><p>${SPORTS[c.sport].name} · ${esc(c.role)}</p></div>
  </article>`;
}

/* Upcoming session rows with Register buttons */
function dateRows(p, list) {
  return '<ul class="dates" aria-label="Upcoming dates">' + list.map(s => {
    const d = parseDate(s.date), sub = esc([s.label !== p.title ? s.label : '', s.time].filter(Boolean).join(' · '));
    const body = `<span><b>${fmtShort(d)}</b><small>${sub}</small></span>`;
    return s.soldOut ? `<li><span class="full">${body}<span class="mono">Sold out</span></span></li>`
      : `<li><a href="${s.url}"${linkAttrs(s.url)} aria-label="Register for ${esc(p.title)}${s.label && s.label !== p.title ? ', ' + esc(s.label) : ''}, ${fmt(d, { month: 'long', day: 'numeric' })} (opens registration)">${body}<span class="t-go">Register ${icon('ext')}</span></a></li>`;
  }).join('') + '</ul>';
}
/* Extra registration links, e.g. one per in-house team */
const linkButtons = p => p.links ? p.links.map(([l, u]) => `<a class="btn btn-ghost btn-sm" href="${u}"${linkAttrs(u)}>${esc(l)} ${icon(isExternal(u) ? 'ext' : 'arrow')}</a>`).join('') : '';

/* Full program card: finder + register pages */
function programCard(p) {
  const st = programStatus(p), up = upcomingSessions(p), sp = SPORTS[p.sport];
  const flag = p.confirm ? '<span class="confirm-flag" title="Placeholder: confirm with Pillar">confirm</span>' : '';
  const levels = p.level.length === 3 ? 'All levels' : p.level.join(' · ');
  const meta = [esc(p.ageLabel) + flag, levels, p.capacity && esc(p.capacity), p.coach && esc(p.coach)].filter(Boolean).map(m => `<li>${m}</li>`).join('');
  const max = p.type === 'League' ? 6 : 4;
  let dates = '';
  if (p.sessions) {
    dates = up.length
      ? dateRows(p, up.slice(0, max)) + (up.length > max ? `<p class="note">+ ${up.length - max} more date${up.length - max > 1 ? 's' : ''}</p>` : '')
      : `<p class="note">Last ran ${fmt(parseDate(p.sessions[p.sessions.length - 1].date), { month: 'short', day: 'numeric' })}. New dates post here first.</p>`;
  }
  let act = linkButtons(p);
  const ongoingUrl = p.ongoing && (p.ongoing.url.startsWith('#') ? `${p.sport}.html${p.ongoing.url}` : p.ongoing.url);
  if (p.ongoing) act += `<a class="btn btn-acc btn-sm" href="${ongoingUrl}"${linkAttrs(ongoingUrl)}>${esc(p.ongoing.label)} ${icon(isExternal(ongoingUrl) ? 'ext' : 'arrow')}</a>`;
  else if (st.key !== 'open' && !p.links) act = `<a class="btn btn-ghost btn-sm" href="contact.html?topic=notify&program=${p.id}">${icon('bell')} Notify me</a>`;
  return `<article class="pcard" data-id="${p.id}">
    <div class="top"><span class="lbl">${sp.name} · ${p.type}</span><span class="t-status${st.cls === 'badge-soon' ? ' hot' : ''}">${st.label}</span></div>
    <h3>${esc(p.title)}</h3>
    ${p.price ? `<p class="price">${p.price}<small>${esc(p.priceNote || '')}</small></p>` : ''}
    <p class="sum">${esc(p.summary)}</p>
    <ul class="meta-list">${meta}</ul>
    ${p.details ? `<details><summary>${p.type === 'Team' ? "What's included" : 'What we focus on'}</summary><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>` : ''}
    ${dates}
    ${act ? `<div class="actions">${act}</div>` : ''}
  </article>`;
}

/* Team pricing panel with the big outlined age-group watermark */
function teamPanel(p) {
  const check = icon('check');
  const up = upcomingSessions(p).filter(s => !s.soldOut);
  const href = p.ongoing && (p.ongoing.url.startsWith('#') && location.pathname.split('/').pop() !== `${p.sport}.html` ? `${p.sport}.html${p.ongoing.url}` : p.ongoing && p.ongoing.url);
  return `<article class="panel" data-in data-num="${esc((p.ageLabel.match(/\d+U/) || [''])[0])}">
    <p class="kicker">${SPORTS[p.sport].name} · ${esc(p.coach || p.ageLabel)}</p>
    <h3>${esc(p.title)}</h3>
    ${p.price ? `<p class="price${p.price.length > 8 ? ' long' : ''}">${p.price}<small>est. / player</small></p>` : `<p class="muted">${esc(p.summary)}</p>`}
    ${p.details ? `<ul>${p.details.map(d => `<li>${check}<span>${esc(d)}</span></li>`).join('')}</ul>` : ''}
    ${up.length ? `<div style="margin:0 0 1.5rem">${dateRows(p, up.slice(0, 3))}</div>` : ''}
    <div class="enter">${linkButtons(p)}${p.ongoing ? `<a class="btn btn-acc" href="${href}"${linkAttrs(href)}>${esc(p.ongoing.label)} ${arrowNE}</a>` : ''}</div>
  </article>`;
}

/* "Showing Baseball only" banner for the remembered sport */
const scopeBanner = k => k && HUBS.includes(k)
  ? `<div class="scope"><p>Showing <strong>${SPORTS[k].name}</strong> only.</p><a href="${k}.html">${SPORTS[k].name} home</a><button type="button" data-all-sports>Show all sports</button></div>` : '';

// Pages are built by script after load, so the browser's own scroll restore on refresh
// lands in the wrong place. Always start at the top unless the URL points to a section.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

function mountB() {
  requestAnimationFrame(() => { const nav = document.querySelector('.nav'); if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); });
  const page = location.pathname.split('/').pop() || 'index.html';
  const navSports = Object.entries(SPORTS).map(([k, s]) =>
    `<li><a href="${bLink(k)}"${extAttr(k)}${page === k + '.html' ? ' aria-current="page"' : ''} style="--c:var(--${k})"><span class="dot" aria-hidden="true"></span>${s.name}${s.external ? icon('ext') + '<span class="sr-only"> (opens in a new tab)</span>' : ''}</a></li>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
  <a class="skip" href="#main">Skip to content</a>
  <header class="nav" aria-label="Site">
    <a class="nav-brand" href="index.html"><img src="${ASSETS.logo}" alt="" width="52" height="52"><span>Pillar<span class="nav-sports"> Sports</span><span class="nav-academy"> Academy</span></span><span class="sr-only"> home</span></a>
    <nav aria-label="Main"><ul class="nav-links">${navSports}<li><a href="schedule.html"${page === 'schedule.html' ? ' aria-current="page"' : ''}>Schedule</a></li></ul></nav>
    <button class="icon-btn" type="button" id="motion" aria-pressed="${paused}" aria-label="Pause animations" title="Pause animations">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg></button>
    <a class="btn btn-acc btn-sm" href="register.html">Register</a>
    <button class="icon-btn menu-open" type="button" aria-expanded="false" aria-controls="overlay" aria-label="Open menu">${icon('menu')}</button>
  </header>
  <div class="overlay" id="overlay" role="dialog" aria-modal="true" aria-label="Menu">
    <button class="icon-btn" type="button" data-close aria-label="Close menu">${icon('x')}</button>
    <p class="kicker">Choose your sport</p>
    <ul>${Object.entries(SPORTS).map(([k, s], i) => `<li style="--i:${i}"><a href="${bLink(k)}"${extAttr(k)} style="--c:var(--${k})">${s.name}<small>${s.external ? '↗<span class="sr-only"> opens in a new tab</span>' : '0' + (i + 1)}</small></a></li>`).join('')}</ul>
    <div class="sub">
      <a class="btn btn-ghost btn-sm" href="schedule.html">Schedule</a>
      <a class="btn btn-ghost btn-sm" href="programs.html">All programs</a>
      <a class="btn btn-ghost btn-sm" href="coaches.html">Coaches</a>
      <a class="btn btn-ghost btn-sm" href="contact.html">Contact</a>
    </div>
    <a class="btn btn-acc" href="register.html">Register now ${arrowNE}</a>
  </div>`);

  document.body.insertAdjacentHTML('beforeend', `
  <footer class="foot">
    <div class="wrap">
      <div class="foot-grid">
        <div style="grid-column:1/-1;max-width:520px">
          <p class="h-xl" style="font-size:clamp(2rem,4vw,3rem);margin:0 0 .5rem">Build the foundation.<br><span class="acc">Elevate the game.</span></p>
          <form data-newsletter novalidate><label class="sr-only" for="nl">Email address</label><input id="nl" type="email" placeholder="Email for new dates" autocomplete="email" required><button class="btn btn-acc btn-sm" type="submit">Sign up</button></form>
          <p class="nl-msg mono muted" role="status" style="font-size:.75rem;margin-top:.5rem">We respect your privacy.</p>
        </div>
        <nav aria-label="Sports"><h2>Sports</h2><ul>${Object.entries(SPORTS).map(([k, s]) => `<li><a href="${bLink(k)}"${extAttr(k)}>${s.name}${s.external ? ' ↗' : ''}</a></li>`).join('')}</ul></nav>
        <nav aria-label="Academy"><h2>Academy</h2><ul>
          <li><a href="schedule.html">Schedule</a></li><li><a href="programs.html">All programs</a></li>
          <li><a href="coaches.html">Coaches</a></li><li><a href="register.html">Register</a></li><li><a href="contact.html">Contact</a></li><li><a href="sponsors.html">Sponsor us</a></li></ul></nav>
        <nav aria-label="More from Pillar"><h2>More Pillar</h2><ul>
          <li><a href="https://pillarfitness.ezfacility.com/OnlineRegistration" target="_blank" rel="noopener">Performance & Fitness ↗</a></li>
          <li><a href="https://www.instagram.com/pillar_perform/" target="_blank" rel="noopener">Instagram ↗</a></li>
          <li><a href="https://www.facebook.com/pillarperformanceandsports" target="_blank" rel="noopener">Facebook ↗</a></li>
          <li><a href="strategy.html">Redesign overview</a></li></ul></nav>
      </div>
    </div>
    <div class="wordmark" aria-hidden="true">Pillar</div>
    <div class="wrap foot-bottom"><span>© ${new Date().getFullYear()} Pillar Sports Academy · Rossford, Ohio</span><span>Build the foundation. Elevate the game.</span></div>
  </footer>`);

  // Menu overlay
  const ov = document.getElementById('overlay'), openBtn = document.querySelector('.menu-open');
  const close = () => { ov.classList.remove('open'); openBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; openBtn.focus(); };
  openBtn.addEventListener('click', () => { ov.classList.add('open'); openBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; ov.querySelector('[data-close]').focus(); });
  ov.querySelector('[data-close]').addEventListener('click', close);
  ov.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { const f = [...ov.querySelectorAll('a,button')], a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });

  // Motion toggle
  const mBtn = document.getElementById('motion');
  const setLabel = () => { mBtn.setAttribute('aria-pressed', String(paused)); mBtn.title = paused ? 'Play animations' : 'Pause animations'; mBtn.setAttribute('aria-label', mBtn.title);
    mBtn.innerHTML = paused ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>'; };
  setLabel();
  mBtn.addEventListener('click', () => {
    paused = !paused; document.documentElement.classList.toggle('paused', paused); setLabel();
    try { localStorage.setItem(MOTION_KEY, paused ? 'off' : 'on'); } catch {}
    document.dispatchEvent(new CustomEvent('motionchange'));
  });
}

function revealB() {
  const els = document.querySelectorAll('[data-in]');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  els.forEach(e => io.observe(e));
}

/* Count-up for scoreboard numbers: <strong data-count="36">0</strong> */
function countUp() {
  const els = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, pad = el.dataset.pad ? +el.dataset.pad : 0;
    const show = n => { el.textContent = String(n).padStart(pad, '0') + (el.dataset.suffix || ''); };
    if (paused) return show(end);
    const t0 = performance.now(), dur = 1400;
    const tick = t => { const k = Math.min(1, (t - t0) / dur); show(Math.round(end * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .4 });
  els.forEach(e => io.observe(e));
}

mountB();

/* Sponsor wordmark or logo image */
const sponsorMark = s => s.logo ? `<img src="${s.logo}" alt="${esc(s.name)}" loading="lazy">` : `<span class="wm ${s.style || 'a'}">${esc(s.name)}</span>`;

/* Homepage "Proudly backed by" strip: <div id="partner-strip"></div> */
function partnerStrip(el) {
  if (!el || !SPONSORS.length) return;
  const row = SPONSORS.map(s => `<span class="wm ${s.style || 'a'}">${esc(s.name)}</span>`).join('');
  el.outerHTML = `<section class="partner-strip" aria-label="Our partners">
    <span class="lbl">Proudly backed by</span>
    <p class="sr-only">${SPONSORS.map(s => esc(s.name)).join(', ')}</p>
    <div class="vp" aria-hidden="true"><div class="track">${row}${row}</div></div>
    <a class="btn btn-ghost btn-sm" href="sponsors.html">Sponsor us ${arrowNE}</a>
  </section>`;
}
