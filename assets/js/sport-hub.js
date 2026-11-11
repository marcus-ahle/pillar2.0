/* Sport hub — one template renders hockey, baseball and softball.
   The page sets <body data-sport="baseball">; everything else comes from data.js.
   In production this becomes one Astro route: /[sport]. */
(() => {
  const key = document.body.dataset.sport;
  const sport = SPORTS[key], hub = SPORT_HUBS[key];
  if (!sport || !hub) return;
  setSport(key);
  const arrow = icon('arrow');
  const mine = PROGRAMS.filter(p => p.sport === key);
  const teams = mine.filter(p => p.type === 'Team');
  const programs = mine.filter(p => p.type !== 'Team');
  const coaches = COACHES.filter(c => c.sport === key);
  const first = s => s.split(' ')[0];

  const sections = [
    ['programs', 'Programs'],
    teams.length && ['teams', 'Teams'],
    ['coaches', 'Coaches'],
    ['faq', 'FAQ'],
    ['contact', 'Contact'],
  ].filter(Boolean);

  const media = hub.photo
    ? `<div class="hub-media${hub.photo2 ? ' two' : ''}">
        <figure><img src="${hub.photo}" alt="${esc(hub.photoAlt)}" fetchpriority="high"></figure>
        ${hub.photo2 ? `<figure><img src="${hub.photo2}" alt="${esc(hub.photo2Alt)}" loading="lazy"></figure>` : ''}
      </div>`
    : `<div class="hub-media hub-media-logo"><img src="${hub.logo}" alt="Pillar ${sport.name} logo"></div>`;

  // Programs: type chips only for types this sport actually offers
  const types = [...new Set(programs.map(p => p.type))];

  const ageCalc = hub.calc ? `
    <div class="grid grid-2 hub-calc" style="align-items:start;gap:clamp(24px,4vw,48px);margin-top:clamp(40px,5vw,64px)">
      <div>
        <h3>Which age group?</h3>
        <p class="muted">${key === 'baseball' ? 'Baseball uses an <strong>April 30</strong> birthdate cutoff.' : 'Softball uses an <strong>August 31, 2026</strong> cutoff.'} Enter your athlete's birthday for a quick estimate.</p>
        <p class="note">Confirm with the official calculator: ${key === 'baseball'
          ? '<a href="https://application.aausports.org/sbl/calculator/agecalculator.asp" target="_blank" rel="noopener">AAU baseball</a>'
          : '<a href="https://www.usasoftball.com/play-usa-softball/memberships/" target="_blank" rel="noopener">USA Softball</a>'}</p>
      </div>
      <form class="card form" id="calc" novalidate>
        <div class="field"><label for="c-dob">Athlete's birthday</label><input id="c-dob" type="date" required></div>
        <button class="btn btn-primary" type="submit">Check age group</button>
        <div class="calc-result" id="calc-result" role="status" aria-live="polite"></div>
      </form>
    </div>` : '';

  const others = Object.entries(SPORTS).filter(([k]) => k !== key);

  document.getElementById('main').innerHTML = `
    <section class="page-hero hub-hero" style="--sport:${sport.color}" aria-labelledby="hub-title">
      <div class="container hub-hero-inner">
        <div>
          <nav class="crumbs" aria-label="Breadcrumb"><a href="./">Home</a> / ${sport.name}</nav>
          <div class="hub-badge"><img src="${hub.logo}" alt="" width="56" height="56"></div>
          <h1 id="hub-title">Pillar ${sport.name}</h1>
          <p class="hub-tagline">${esc(hub.tagline)}</p>
          <p class="lead">${esc(hub.intro)}</p>
          <div class="hero-actions">
            <a class="btn btn-accent" href="#programs">See ${sport.name.toLowerCase()} programs ${icon('chevron')}</a>
            <a class="btn btn-ghost-light" href="${hub.primary.url}">${esc(hub.primary.label)}</a>
          </div>
        </div>
        ${media}
      </div>
      <div class="stats">${hub.facts.map(([a, b]) => `<div><strong>${a}</strong><span>${b}</span></div>`).join('')}</div>
    </section>

    <nav class="subnav" aria-label="${sport.name} sections" style="--sport:${sport.color}">
      <div class="container"><ul>${sections.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join('')}</ul>
        <a class="btn btn-primary btn-sm subnav-cta" href="#programs">Register</a></div>
    </nav>

    <section class="section-sm" id="programs" aria-labelledby="prog-title">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">${sport.name} programs</p><h2 id="prog-title">Train with Pillar ${sport.name}</h2></div>
          <a class="link-arrow" href="schedule?sport=${key}">${sport.name} schedule ${arrow}</a>
        </div>
        ${types.length > 1 ? `<div class="chip-row" id="type-chips" role="group" aria-label="Filter ${sport.name} programs by type" style="margin-bottom:1.5rem">
          <button type="button" class="chip" data-val="" aria-pressed="true">All</button>
          ${types.map(t => `<button type="button" class="chip" data-val="${t}" aria-pressed="false">${t === 'Lessons' ? 'Private lessons' : t + 's'}</button>`).join('')}
        </div>` : ''}
        <div class="grid grid-3" id="hub-programs"></div>
      </div>
    </section>

    ${teams.length ? `
    <section class="section-sm section-alt" id="teams" aria-labelledby="teams-title">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">Compete</p><h2 id="teams-title">${sport.name} teams</h2></div>
          ${teams.some(t => t.price) ? '<p class="muted" style="max-width:46ch">Season costs are estimates per player and cover a full year of development, not just games.</p>' : ''}
        </div>
        <div class="grid grid-3">${teams.map(renderTeamCard).join('')}</div>
        ${ageCalc}
      </div>
    </section>` : ''}

    <section class="section-sm" id="coaches" aria-labelledby="coach-title">
      <div class="container">
        <div class="section-head"><div><p class="eyebrow">Coaching staff</p><h2 id="coach-title">Your ${sport.name.toLowerCase()} coaches</h2></div></div>
        ${coaches.length ? `<div class="grid grid-4">${coaches.map(c => renderCoachCard(c)).join('')}</div>`
          : `<div class="empty" style="text-align:left"><h3>Staff profiles coming soon</h3><p class="mb-0">${hub.staffNote}</p></div>`}
      </div>
    </section>

    <section class="section-sm section-alt" id="faq" aria-labelledby="faq-title">
      <div class="container" style="max-width:860px">
        <p class="eyebrow">FAQ</p>
        <h2 id="faq-title">${sport.name} questions</h2>
        <div class="faq">${hub.faq.map(([q, a]) => `<details><summary>${esc(q)}${icon('plus')}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      </div>
    </section>

    <section class="section-sm" id="contact" aria-labelledby="contact-title">
      <div class="container">
        <div class="cta-band" style="--sport:${sport.color}">
          <div>
            <h2 id="contact-title">Questions about ${sport.name.toLowerCase()}?</h2>
            <p class="mb-0">Email ${esc(first(hub.contact.name) === 'Pillar' ? 'our hockey staff' : first(hub.contact.name))} at <a href="mailto:${hub.contact.email}" style="color:#fff">${hub.contact.email}</a>, or send a note and we'll reply within one business day.</p>
          </div>
          <div class="actions">
            <a class="btn btn-accent" href="contact?sport=${key}">Ask a coach</a>
            ${sport.store ? `<a class="btn btn-ghost-light" href="${sport.store}" target="_blank" rel="noopener">Spirit wear ${icon('ext')}</a>` : ''}
          </div>
        </div>
      </div>
    </section>

    <section class="section-sm section-alt" aria-labelledby="more-title">
      <div class="container">
        <div class="section-head"><div><p class="eyebrow">Multi-sport family?</p><h2 id="more-title">Also at Pillar</h2></div>
          <a class="link-arrow" href="programs">Browse all programs ${arrow}</a></div>
        <div class="grid grid-3">${others.map(([k, s]) => `<a class="sport-tile sport-tile-sm" href="${sportLink(k)}" style="--sport:${s.color}"${s.external ? ' target="_blank" rel="noopener"' : ''}>
          <div class="icon-wrap">${icon(k)}</div><h3>${s.name}</h3>
          <span class="go">${s.external ? 'pillarvolleyball.com ' + icon('ext') : 'Visit ' + s.name + ' ' + arrow}</span></a>`).join('')}</div>
      </div>
    </section>`;

  // ----- programs + type filter -----
  const grid = document.getElementById('hub-programs');
  const renderPrograms = type => {
    const list = sortPrograms(programs.filter(p => !type || p.type === type));
    const notify = !type && list.length < 3
      ? `<article class="card hub-notify" style="--sport:${sport.color}"><div class="icon-circle">${icon('bell')}</div>
          <h3>More ${sport.name.toLowerCase()} dates are coming</h3>
          <p class="muted">Camps and clinics post here first. Get an email the day registration opens.</p>
          <a class="btn btn-outline btn-sm" href="contact?topic=notify&sport=${key}">${icon('bell')} Notify me</a></article>` : '';
    grid.innerHTML = list.map(p => renderProgramCard(p)).join('') + notify;
  };
  renderPrograms('');
  const chips = document.getElementById('type-chips');
  if (chips) chips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
    renderPrograms(b.dataset.val);
  });

  // ----- age calculator -----
  const calc = document.getElementById('calc');
  if (calc) calc.addEventListener('submit', e => {
    e.preventDefault();
    const dob = document.getElementById('c-dob'), out = document.getElementById('calc-result');
    const field = dob.closest('.field');
    out.className = 'calc-result show';
    if (!dob.value) { field.classList.add('has-error'); out.innerHTML = 'Please enter a birthday.'; dob.focus(); return; }
    field.classList.remove('has-error');
    out.innerHTML = ageGroupResult(key, dob.value);
  });

  // ----- sub-nav: highlight the section in view -----
  const links = [...document.querySelectorAll('.subnav a[href^="#"]:not(.subnav-cta)')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.getAttribute('href') === '#' + en.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
      const active = links.find(a => a.hasAttribute('aria-current'));
      if (active) { const ul = active.closest('ul'); ul.scrollTo({ left: active.parentElement.offsetLeft - 8, behavior: 'smooth' }); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
