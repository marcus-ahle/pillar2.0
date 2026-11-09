/* Sport hub: hockey, baseball, softball and volleyball pages share this template */
(() => {
  const key = document.body.dataset.sport;
  const sport = SPORTS[key], hub = SPORT_HUBS[key];
  if (!sport || !hub) return;
  document.documentElement.dataset.theme = key;
  setSport(key);

  const mine = PROGRAMS.filter(p => p.sport === key);
  const teams = mine.filter(p => p.type === 'Team');
  const programs = mine.filter(p => p.type !== 'Team');
  const coaches = COACHES.filter(c => c.sport === key);
  const types = [...new Set(programs.map(p => p.type))];
  const sections = [['programs', 'Programs'], teams.length && ['teams', 'Teams'], hub.tryouts && ['tryouts', 'Tryouts'], ['coaches', 'Coaches'], ['faq', 'FAQ'], ['contact', 'Contact']].filter(Boolean);
  const tryoutSessions = mine.flatMap(p => upcomingSessions(p).filter(s => /tryout|evaluation/i.test(s.label || '')).map(s => [p, s]));

  const factNum = s => { const m = String(s).match(/^\d+$/); return m ? `<strong data-count="${s}">0</strong>` : `<strong class="txt">${esc(s)}</strong>`; };

  const ticketsFor = list => {
    const out = [];
    sortPrograms(list).forEach(p => {
      const up = upcomingSessions(p);
      if (up.length) up.slice(0, p.type === 'League' ? 6 : 3).forEach(s => out.push(ticket(p, s)));
      else out.push(ticket(p));
    });
    return out.join('');
  };
  const notifyTicket = `<article class="ticket notify" style="--c:var(--${key})">
      <div class="t-top"><div class="t-date"><span class="mono">Coming</span><span class="day" style="font-size:3.6rem">Soon</span></div><span class="t-status">New dates</span></div>
      <div class="t-body"><span class="sport">${sport.name} · Camps & clinics</span><h3>Be first in line</h3><p>Camps and clinics post here first. Get an email the day registration opens.</p></div>
      <div class="t-foot"><span class="mono">Free alert</span><a class="t-go" href="contact.html?topic=notify&sport=${key}">Notify me ${arrowNE}</a></div>
    </article>`;

  document.getElementById('main').innerHTML = `
    <section class="hub-hero" aria-labelledby="hub-title">
      <div class="wrap">
        <p class="crumb"><a href="index.html">Home</a> / ${sport.name}</p>
        <p class="hub-brand" aria-hidden="true"><img src="${ASSETS.logo}" alt="" width="48" height="48">Pillar</p>
        <h1 class="hub-word${hub.photo ? ' has-photo' : ''}${sport.name.length > 8 ? ' long' : ''}" id="hub-title"${hub.photo ? ` style="background-image:linear-gradient(#7877e6,#7877e6),url('${hub.photo}')"` : ''}><span class="sr-only">Pillar </span>${sport.name}</h1>
        <div class="hub-intro">
          <div>
            <p class="hub-tag">${esc(hub.tagline)}</p>
            <p class="muted" style="font-size:1.15rem;max-width:56ch;margin:0">${esc(hub.intro)}</p>
          </div>
          <div class="enter" style="justify-content:flex-end">
            <a class="btn btn-acc" href="#programs">See programs ${arrowNE}</a>
            <a class="btn btn-ghost" href="${hub.primary.url}">${esc(hub.primary.label)}</a>
          </div>
        </div>
        <div class="board" data-in>${hub.facts.map(([a, b]) => `<div>${factNum(a)}<span>${esc(b)}</span></div>`).join('')}</div>
      </div>
      ${hub.photo ? `<figure class="hub-photo" style="margin-top:clamp(40px,6vw,80px)"><img src="${hub.photo2 || hub.photo}" alt="${esc(hub.photo2 ? hub.photo2Alt : hub.photoAlt)}"></figure>` : ''}
    </section>

    <nav class="subnav" aria-label="${sport.name} sections"><ul>${sections.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join('')}</ul></nav>

    <section class="sec" id="programs" aria-labelledby="prog-title" style="padding-top:clamp(56px,8vw,110px)">
      <div class="wrap">
        <p class="kicker">${sport.name} programs</p>
        <h2 class="h-xl" id="prog-title">Train with<br><span class="acc">Pillar ${sport.name}</span></h2>
        ${types.length > 1 ? `<div class="chips" id="type-chips" role="group" aria-label="Filter ${sport.name} programs by type" style="margin-top:2rem">
          <button type="button" data-val="" aria-pressed="true">All</button>
          ${types.map(t => `<button type="button" data-val="${t}" aria-pressed="false">${t === 'Lessons' ? 'Private lessons' : t + 's'}</button>`).join('')}</div>` : '<div style="height:2rem"></div>'}
        <div class="ticket-grid" id="hub-tickets"></div>
      </div>
    </section>

    ${teams.length ? `
    <section class="sec" id="teams" aria-labelledby="teams-title" style="padding-top:0">
      <div class="wrap">
        <p class="kicker">Compete</p>
        <h2 class="h-xl" id="teams-title">Wear the<br><span class="outline">purple</span></h2>
        <div class="price-panels" style="margin-top:clamp(32px,5vw,56px)">${teams.map(teamPanel).join('')}</div>
        ${hub.calc ? `
        <div class="grid-2" style="display:grid;gap:clamp(24px,4vw,56px);grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));align-items:center;margin-top:clamp(56px,8vw,110px)">
          <div>
            <p class="kicker">Age group</p>
            <h3 class="h-xl" style="font-size:clamp(2.4rem,5vw,4.5rem)">Where do they <span class="acc">fit?</span></h3>
            <p class="muted">${key === 'baseball' ? 'Baseball uses an April 30 birthdate cutoff.' : 'Softball uses an August 31, 2026 cutoff.'} Confirm with the official ${key === 'baseball'
              ? '<a href="https://application.aausports.org/sbl/calculator/agecalculator.asp" target="_blank" rel="noopener">AAU calculator</a>'
              : '<a href="https://www.usasoftball.com/play-usa-softball/memberships/" target="_blank" rel="noopener">USA Softball calculator</a>'}.</p>
          </div>
          <form class="led" id="calc" novalidate>
            <label for="c-dob">Athlete's birthday</label>
            <input id="c-dob" type="date" required>
            <button class="btn btn-acc" type="submit">Check age group</button>
            <div class="led-out" id="calc-result" role="status" aria-live="polite"><span class="note mono">Waiting for a birthday…</span></div>
          </form>
        </div>` : ''}
      </div>
    </section>` : ''}

    ${hub.tryouts ? `
    <section class="sec" id="tryouts" aria-labelledby="tryout-title" style="padding-top:0">
      <div class="wrap split" style="align-items:start">
        <div>
          <p class="kicker">Tryouts & open gyms</p>
          <h2 class="h-xl" id="tryout-title">Earn your <span class="outline">spot</span></h2>
          <h3 style="font-size:1.6rem;text-transform:uppercase;font-stretch:80%;margin-top:1.5rem">${esc(hub.tryouts.title)}</h3>
          ${hub.tryouts.body.map(t => `<p class="muted">${esc(t)}</p>`).join('')}
          <p class="note">${esc(hub.tryouts.makeup)}</p>
        </div>
        <div class="stack">
          ${tryoutSessions.length ? tryoutSessions.map(([p, s]) => ticket(p, s)).join('') : notifyTicket}
          <div class="tryout-links">${hub.tryouts.links.map(([l, u]) => `<a class="btn btn-ghost" href="${u}"${linkAttrs(u)} style="justify-content:space-between">${esc(l)} ${icon('ext')}</a>`).join('')}</div>
        </div>
      </div>
    </section>` : ''}

    <section class="sec" id="coaches" aria-labelledby="coach-title" style="padding-top:0">
      <div class="wrap">
        <p class="kicker">The staff</p>
        <h2 class="h-xl" id="coach-title">Your ${sport.name.toLowerCase()}<br><span class="acc">coaches</span></h2>
        ${coaches.length ? `<div class="roster" style="margin-top:clamp(32px,5vw,56px)">${coaches.map(coachCard).join('')}</div>` : ''}
        ${hub.staffNote ? `<div class="tile" style="margin-top:${coaches.length ? '14px' : '2rem'};min-height:0">${coaches.length ? '<h3>The club staff</h3>' : '<h3>Profiles coming soon</h3>'}<p>${hub.staffNote}</p></div>` : ''}
        ${hub.quote ? `<div class="tile b-quote hub-quote" data-in><blockquote>“${esc(hub.quote[0])}”</blockquote><cite>${esc(hub.quote[1])}</cite></div>` : ''}
      </div>
    </section>

    <section class="sec" id="faq" aria-labelledby="faq-title" style="padding-top:0">
      <div class="wrap" style="max-width:1100px">
        <p class="kicker">FAQ</p>
        <h2 class="h-xl" id="faq-title">Good <span class="outline">questions</span></h2>
        <div class="faq" style="margin-top:2rem">${hub.faq.map(([q, a]) => `<details><summary>${esc(q)}<i aria-hidden="true"></i></summary><p>${esc(a)}</p></details>`).join('')}</div>
      </div>
    </section>

    <section class="sec" id="contact" aria-labelledby="contact-title" style="padding-top:0">
      <div class="wrap">
        <div class="contact-slab">
          <div>
            <p class="mono" style="font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;margin-bottom:1rem">Talk to ${esc(hub.contact.name)}</p>
            <h2 class="h-xl" id="contact-title">Questions about ${sport.name.toLowerCase()}?</h2>
            <p style="margin:1rem 0 0;font-weight:500"><a href="mailto:${hub.contact.email}">${hub.contact.email}</a> · replies within one business day</p>
          </div>
          <div class="enter" style="justify-content:flex-end">
            <a class="btn btn-dark" href="contact.html?sport=${key}">Ask a coach ${arrowNE}</a>
            ${sport.store ? `<a class="btn btn-line" href="${sport.store}" target="_blank" rel="noopener">Spirit wear ${icon('ext')}</a>` : ''}
          </div>
        </div>
      </div>
    </section>

    <section class="sec" aria-labelledby="more-title" style="padding-top:0">
      <div class="wrap">
        <p class="kicker">Multi-sport family?</p>
        <h2 class="h-xl" id="more-title" style="font-size:clamp(2.2rem,5vw,4rem)">Also at Pillar</h2>
        <div class="other" style="margin-top:2rem">${Object.keys(SPORTS).filter(k => k !== key).map(k => `<a href="${bLink(k)}"${extAttr(k)} style="--c:var(--${k})">${SPORTS[k].name}${SPORTS[k].external ? icon('ext') : arrowNE}</a>`).join('')}</div>
      </div>
    </section>`;

  // Programs + type filter
  const grid = document.getElementById('hub-tickets');
  const render = type => {
    const list = programs.filter(p => !type || p.type === type);
    const html = ticketsFor(list);
    grid.innerHTML = html + (!type && list.length < 3 ? notifyTicket : '');
  };
  render('');
  const chips = document.getElementById('type-chips');
  if (chips) chips.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    chips.querySelectorAll('button').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
    render(b.dataset.val);
  });

  // Age checker
  const calc = document.getElementById('calc');
  if (calc) calc.addEventListener('submit', e => {
    e.preventDefault();
    const dob = document.getElementById('c-dob'), out = document.getElementById('calc-result');
    if (!dob.value) { out.innerHTML = '<p>Please enter a birthday.</p>'; dob.focus(); return; }
    out.innerHTML = ageGroupResult(key, dob.value);
  });

  // Sub-nav highlight
  const links = [...document.querySelectorAll('.subnav a')];
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(a => a.getAttribute('href') === '#' + en.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(([id]) => io.observe(document.getElementById(id)));

  revealB();
  countUp();
})();
