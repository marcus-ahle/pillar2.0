/* Pillar Sports Academy — shared site script
   Header/footer are injected here so the prototype stays DRY.
   In production these become Astro components (server-rendered). */

/* ---------- Icons (inline SVG, 24px grid, stroke) ---------- */
const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.7.8 2.7 2.6 3 5.2"/>',
  level: '<path d="M5 20v-5M12 20V10M19 20V4"/>',
  group: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M7 12h10"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  filter: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  whistle: '<circle cx="9" cy="14" r="5"/><path d="M12.5 10.5 20 6v4l-6 2.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/>',
  facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7.5v4H10v7h4v-7h3l.5-4H14V8.5c0-.3.2-.5.5-.5z"/>',
  hockey: '<path d="M14 3 8.5 17.5c-.4 1-1.3 1.5-2.3 1.5H3.5"/><ellipse cx="17" cy="18" rx="4" ry="1.8"/><path d="M13 18v0"/>',
  baseball: '<circle cx="12" cy="12" r="8.5"/><path d="M7.2 5c1.8 2 2.6 4.4 2.6 7s-.8 5-2.6 7M16.8 5c-1.8 2-2.6 4.4-2.6 7s.8 5 2.6 7"/>',
  softball: '<circle cx="12" cy="12" r="8.5"/><path d="M5.5 7.5c3 1 5 3.6 5.2 6.8M18.5 16.5c-3-1-5-3.6-5.2-6.8"/>',
  volleyball: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5c-1.5 3-1 6 0 8.5s5.5 4 8 3M12 12c-2.5 1.5-6 1.5-8.3.5M12 12c2.5-1.5 4-4.5 3.8-7.8"/>',
};
const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

/* ---------- Dates ---------- */
const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const TODAY = (() => {
  const q = new URLSearchParams(location.search).get('today'); // ?today=2026-11-01 for demos
  if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return parseDate(q);
  const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate());
})();
const fmt = (d, o) => d.toLocaleDateString('en-US', o);
const fmtShort = d => fmt(d, { weekday: 'short', month: 'short', day: 'numeric' });
const daysFromToday = d => Math.round((d - TODAY) / 864e5);

/* ---------- Program helpers ---------- */
const upcomingSessions = p => (p.sessions || []).filter(s => parseDate(s.date) >= TODAY);

function programStatus(p) {
  if (p.ongoing && !p.sessions) return { key: 'open', label: 'Year-round', cls: 'badge-open' };
  const up = upcomingSessions(p);
  if (!up.length) return { key: 'closed', label: 'New dates soon', cls: 'badge-closed' };
  if (up.every(s => s.soldOut)) return { key: 'full', label: 'Sold out', cls: 'badge-full' };
  const next = up.find(s => !s.soldOut);
  const days = daysFromToday(parseDate(next.date));
  if (days <= 14) return { key: 'open', label: days <= 0 ? 'Today' : `In ${days} day${days === 1 ? '' : 's'}`, cls: 'badge-soon' };
  return { key: 'open', label: 'Registration open', cls: 'badge-open' };
}
function nextOpenDate(p) {
  const s = upcomingSessions(p).find(s => !s.soldOut);
  return s ? parseDate(s.date) : null;
}
function sortPrograms(list) {
  const rank = p => { const st = programStatus(p).key; const d = nextOpenDate(p);
    if (d) return d.getTime(); if (st === 'open') return 9e15; return 9.5e15; };
  return [...list].sort((a, b) => rank(a) - rank(b));
}
const isExternal = url => /^https?:/.test(url);
const linkAttrs = url => isExternal(url) ? ' target="_blank" rel="noopener"' : '';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderProgramCard(p, opts = {}) {
  const sport = SPORTS[p.sport];
  const st = programStatus(p);
  const up = upcomingSessions(p);
  const flag = p.confirm ? '<span class="confirm-flag" title="Placeholder — confirm with Pillar">confirm</span>' : '';
  const levels = p.level.length === 3 ? 'All levels' : p.level.join(' · ');
  const meta = [
    `<li>${icon('users')}<span>${esc(p.ageLabel)}${flag}</span></li>`,
    `<li>${icon('level')}<span>${levels}</span></li>`,
    p.capacity ? `<li>${icon('group')}<span>${esc(p.capacity)}</span></li>` : '',
    p.coach ? `<li>${icon('whistle')}<span>${esc(p.coach)}</span></li>` : '',
  ].join('');
  const price = p.price ? `<div class="p-price">${p.price}<small>${p.priceNote || ''}</small></div>` : '';
  const details = p.details && !opts.compact
    ? `<details><summary>${p.type === 'Team' ? "What's included" : 'What we focus on'} ${icon('chevron')}</summary><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>` : '';

  let sessions = '';
  if (p.sessions) {
    const max = opts.compact ? 2 : 4;
    if (up.length) {
      sessions = '<ul class="p-sessions" aria-label="Upcoming dates">' + up.slice(0, max).map(s => {
        const d = parseDate(s.date);
        const sub = [s.label, s.time].filter(Boolean).join(' · ');
        const body = `<span><span class="s-date">${fmtShort(d)}</span><span class="s-sub">${esc(sub)}</span></span>`;
        if (s.soldOut) return `<li><span class="full">${body}<span>Sold out</span></span></li>`;
        return `<li><a href="${s.url}"${linkAttrs(s.url)} aria-label="Register for ${esc(p.title)}, ${fmt(d, { month: 'long', day: 'numeric' })}${s.label ? ', ' + esc(s.label) : ''} (opens registration)">${body}<span class="s-go">Register ${icon('ext')}</span></a></li>`;
      }).join('') + '</ul>' + (up.length > max ? `<p class="note">+ ${up.length - max} more date${up.length - max > 1 ? 's' : ''}</p>` : '');
    } else {
      const last = parseDate(p.sessions[p.sessions.length - 1].date);
      sessions = `<p class="note">Last ran ${fmt(last, { month: 'short', day: 'numeric' })}. New dates post here first.</p>`;
    }
  }

  let actions = '';
  if (p.ongoing) {
    const ext = isExternal(p.ongoing.url);
    actions = `<a class="btn btn-primary btn-sm" href="${p.ongoing.url}"${linkAttrs(p.ongoing.url)}>${esc(p.ongoing.label)} ${icon(ext ? 'ext' : 'arrow')}</a>`;
  } else if (st.key === 'closed' || st.key === 'full') {
    actions = `<a class="btn btn-outline btn-sm" href="contact?topic=notify&program=${p.id}">${icon('bell')} Notify me</a>`;
  }
  const extNote = p.sport === 'volleyball' && !opts.compact ? '<span class="note">Volleyball details on pillarvolleyball.com</span>' : '';

  return `<article class="p-card" style="--sport:${sport.color}" data-id="${p.id}">
    <div class="p-top"><span class="tag tag-${p.sport}">${sport.name}</span><span class="tag tag-neutral">${p.type}</span><span class="badge ${st.cls}">${st.label}</span></div>
    <h3>${esc(p.title)}</h3>
    ${price}
    <p class="p-summary">${esc(p.summary)}</p>
    <ul class="p-meta">${meta}</ul>
    ${details}
    ${sessions}
    <div class="p-actions">${actions}${extNote}</div>
  </article>`;
}

function renderCoachCard(c, opts = {}) {
  const sport = SPORTS[c.sport];
  const initials = c.name.split(' ').map(w => w[0]).join('');
  const photo = c.photo
    ? `<img src="${c.photo}" alt="${esc(c.name)}" loading="lazy" width="400" height="420">`
    : `<div class="initials" aria-hidden="true">${initials}</div>`;
  const bio = opts.compact ? '' : `<details><summary>Read bio ${icon('chevron')}</summary>${c.bio.map(p => `<p>${esc(p)}</p>`).join('')}</details>`;
  const cta = opts.compact ? '' : c.phone
    ? `<a class="btn btn-outline btn-sm coach-cta" href="tel:+1${c.phone.replace(/\D/g, '')}">${icon('phone')} Book a lesson</a>`
    : c.email ? `<a class="btn btn-outline btn-sm coach-cta" href="mailto:${c.email}">${icon('mail')} Email ${esc(c.name.split(' ')[0])}</a>` : '';
  return `<article class="coach-card" data-sport="${c.sport}">
    <div class="photo">${photo}</div>
    <div class="body"><div><span class="tag tag-${c.sport}">${sport.name}</span></div>
      <h3>${esc(c.name)}</h3><p class="role">${esc(c.role)}</p>${bio}${cta}</div>
  </article>`;
}

function renderTeamCard(p) {
  const sport = SPORTS[p.sport];
  const check = icon('check');
  const ext = isExternal(p.ongoing.url) && !/^mailto:|^tel:/.test(p.ongoing.url);
  return `<article class="card price-card" style="border-top:4px solid ${sport.color}">
    <div><span class="tag tag-${p.sport}">${sport.name}</span></div>
    <h3 style="margin-top:.85rem;margin-bottom:0">${esc(p.title)}</h3>
    <p class="muted mb-0" style="font-size:.92rem">${esc(p.coach || p.ageLabel)}</p>
    ${p.price ? `<div class="amount">${p.price}<small> est. / player</small></div>` : '<div class="amount" style="font-size:1.25rem">Ask for season details</div>'}
    ${p.details ? `<ul>${p.details.map(d => `<li>${check}<span>${esc(d)}</span></li>`).join('')}</ul>` : `<p class="muted">${esc(p.summary)}</p>`}
    <a class="btn btn-primary" href="${p.ongoing.url}"${ext ? linkAttrs(p.ongoing.url) : ''}>${esc(p.ongoing.label)}</a>
  </article>`;
}

/* Age-group estimate. Baseball: April 30 cutoff. Softball: Aug 31, 2026. */
function ageGroupResult(sport, dobStr, teamsHref = '#teams') {
  const dob = parseDate(dobStr);
  const seasonYear = TODAY.getMonth() >= 8 ? TODAY.getFullYear() + 1 : TODAY.getFullYear();
  const cutoff = sport === 'baseball' ? new Date(seasonYear, 3, 30) : new Date(2026, 7, 31);
  let age = cutoff.getFullYear() - dob.getFullYear();
  if (cutoff < new Date(cutoff.getFullYear(), dob.getMonth(), dob.getDate())) age--;
  const cutoffTxt = fmt(cutoff, { month: 'long', day: 'numeric', year: 'numeric' });
  if (sport === 'baseball') {
    const team = age <= 12 && age >= 11 ? '12U' : age >= 14 && age <= 15 ? '15U' : null;
    return `<span class="note">Age on ${cutoffTxt}</span><strong>${age} → ${age}U</strong>${team ? `<p class="mb-0" style="margin-top:.4rem">Pillar's <a href="${teamsHref}">${team} team</a> fits this age group.</p>` : `<p class="mb-0" style="margin-top:.4rem">Pillar fields 12U and 15U teams. <a href="mailto:drew@pillarfitness.com">Ask Drew</a> about other options.</p>`}`;
  }
  return `<span class="note">Age on ${cutoffTxt}</span><strong>${age} years old</strong><p class="mb-0" style="margin-top:.4rem">Use this age to pick a 9U–14U team, and <a href="mailto:angela@pillarfitness.com">confirm placement with Angela</a>.</p>`;
}

/* ---------- Remembered sport ----------
   Visiting a sport hub remembers that sport, so Programs and Schedule open
   pre-filtered to it. Per-browser convenience only; safe if storage is blocked. */
const SPORT_KEY = 'pillar.sport';
const getSport = () => { try { const s = localStorage.getItem(SPORT_KEY); return SPORTS[s] ? s : null; } catch { return null; } };
const setSport = s => { try { s ? localStorage.setItem(SPORT_KEY, s) : localStorage.removeItem(SPORT_KEY); } catch {} };

/* ---------- Header / footer ---------- */
const HUB_SPORTS = ['hockey', 'baseball', 'softball'];
const NAV = [
  { href: 'schedule', label: 'Schedule' },
  { href: 'programs', label: 'All programs' },
  { href: 'coaches', label: 'Coaches' },
  { href: 'contact', label: 'Contact' },
];
const sportLink = k => SPORTS[k].external || k;
/* Current page as a clean name: '/hockey' and '/hockey.html' → 'hockey', '/' → 'index' */
const currentPage = () => location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';

function mountChrome() {
  const page = currentPage();
  const cur = href => href === page ? ' aria-current="page"' : '';
  const sportNav = Object.entries(SPORTS).map(([k, s]) => `<li><a class="nav-sport" href="${sportLink(k)}"${s.external ? ' target="_blank" rel="noopener"' : cur(sportLink(k))} style="--sport:${s.color}"><span class="nav-dot" aria-hidden="true"></span>${s.name}${s.external ? icon('ext', 'ext-icon') + '<span class="sr-only"> (opens pillarvolleyball.com)</span>' : ''}</a></li>`).join('');
  const navItems = sportNav + '<li class="nav-sep" aria-hidden="true"></li>' + NAV.filter(n => n.href !== 'programs').map(n => `<li><a href="${n.href}"${cur(n.href)}>${n.label}</a></li>`).join('');
  const brand = (light) => `<a class="brand" href="./"${light ? ' style="color:#fff"' : ''}><img src="${ASSETS.logo}" alt="" width="44" height="44"><span class="brand-text">Pillar Sports<small${light ? ' style="color:var(--on-dark-muted)"' : ''}>Academy · Rossford, OH</small></span><span class="sr-only">— home</span></a>`;

  const header = document.getElementById('site-header');
  if (header) header.outerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="top">
    <div class="container header-inner">
      ${brand(false)}
      <nav class="main-nav" aria-label="Main"><ul>${navItems}</ul></nav>
      <div class="header-cta">
        <a class="btn btn-primary btn-sm" href="register"${page === 'register' ? ' aria-current="page"' : ''}>Register</a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">${icon('menu')}</button>
      </div>
    </div>
  </header>
  <div class="mobile-nav" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Site menu">
    <div class="header-inner">${brand(true)}<button class="menu-btn" type="button" data-close aria-label="Close menu">${icon('x')}</button></div>
    <p class="mobile-label" style="margin-top:1.5rem">Choose your sport</p>
    <ul class="mobile-sport-list">${Object.entries(SPORTS).map(([k, s]) => `<li><a href="${sportLink(k)}"${s.external ? ' target="_blank" rel="noopener"' : ''} style="--sport:${s.color}"><span><span class="nav-dot" aria-hidden="true"></span>${s.name}</span>${icon(s.external ? 'ext' : 'arrow')}</a></li>`).join('')}</ul>
    <div class="mobile-links">${NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join('')}</div>
    <a class="btn btn-accent btn-block" href="register">Register now</a>
    <p class="note" style="color:var(--on-dark-muted);margin-top:1.25rem">Questions? <a href="mailto:drew@pillarfitness.com" style="color:#fff">drew@pillarfitness.com</a></p>
  </div>`;

  const footer = document.getElementById('site-footer');
  if (footer) footer.outerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          ${brand(true)}
          <p style="margin-top:1rem">Youth development across hockey, baseball, softball and volleyball, building complete players on the field, court, rink and in life.</p>
          <form class="newsletter" data-newsletter novalidate>
            <label class="sr-only" for="nl-email">Email address</label>
            <input id="nl-email" type="email" placeholder="Email for news & new dates" autocomplete="email" required>
            <button class="btn btn-accent btn-sm" type="submit">Sign up</button>
          </form>
          <p class="note nl-msg" role="status" style="color:var(--on-dark-muted);margin-top:.5rem">We respect your privacy.</p>
          <div class="socials">
            <a href="https://www.instagram.com/pillar_perform/" target="_blank" rel="noopener" aria-label="Pillar on Instagram">${icon('instagram')}</a>
            <a href="https://www.facebook.com/pillarperformanceandsports" target="_blank" rel="noopener" aria-label="Pillar on Facebook">${icon('facebook')}</a>
          </div>
        </div>
        <nav aria-label="Sports"><h2>Sports</h2><ul>
          ${Object.entries(SPORTS).map(([k, s]) => `<li><a href="${sportLink(k)}"${s.external ? ' target="_blank" rel="noopener"' : ''}>${s.name}${s.external ? icon('ext', 'ext-icon') : ''}</a></li>`).join('')}
        </ul></nav>
        <nav aria-label="Academy"><h2>Academy</h2><ul>
          <li><a href="schedule">Schedule</a></li>
          <li><a href="programs">All programs</a></li>
          <li><a href="register#teams">Teams & Pricing</a></li>
          <li><a href="coaches">Coaches</a></li>
          <li><a href="register">Register</a></li>
          <li><a href="contact">Contact</a></li>
        </ul></nav>
        <nav aria-label="More from Pillar"><h2>More Pillar</h2><ul>
          <li><a href="https://pillarfitness.ezfacility.com/OnlineRegistration" target="_blank" rel="noopener">Performance & Fitness${icon('ext', 'ext-icon')}</a></li>
          <li><a href="${SPORTS.hockey.store}" target="_blank" rel="noopener">Hockey spirit wear${icon('ext', 'ext-icon')}</a></li>
          <li><a href="${SPORTS.baseball.store}" target="_blank" rel="noopener">Baseball spirit wear${icon('ext', 'ext-icon')}</a></li>
          <li><a href="${SPORTS.softball.store}" target="_blank" rel="noopener">Softball spirit wear${icon('ext', 'ext-icon')}</a></li>
        </ul></nav>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Pillar Sports Academy · Rossford, Ohio</span>
        <span>Build the Foundation. Elevate the Game.</span>
      </div>
    </div>
  </footer>`;
}

function wireChrome() {
  const hdr = document.querySelector('.site-header');
  const onScroll = () => hdr && hdr.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const mnav = document.getElementById('mobile-nav');
  const openBtn = document.querySelector('.site-header .menu-btn');
  if (mnav && openBtn) {
    const close = () => { mnav.classList.remove('open'); openBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; openBtn.focus(); };
    openBtn.addEventListener('click', () => {
      mnav.classList.add('open'); openBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden';
      mnav.querySelector('[data-close]').focus();
    });
    mnav.querySelector('[data-close]').addEventListener('click', close);
    mnav.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // focus trap
        const f = [...mnav.querySelectorAll('a,button')]; const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { document.body.style.overflow = ''; }));
  }

  document.querySelectorAll('[data-newsletter]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const input = f.querySelector('input'); const msg = f.parentElement.querySelector('.nl-msg');
    if (!input.checkValidity()) { msg.textContent = 'Please enter a valid email address.'; input.focus(); return; }
    msg.textContent = "You're on the list. We'll email you when new dates post."; f.reset();
  }));

  // JS-rendered content shifts layout, so re-apply #hash jumps once the page is built
  if (location.hash.length > 1) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) window.addEventListener('load', () => t.scrollIntoView({ block: 'start' }));
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}

mountChrome();
if (new URLSearchParams(location.search).has('review')) document.body.classList.add('review'); // ?review shows placeholder flags
document.addEventListener('DOMContentLoaded', wireChrome);
