/* Homepage */
(() => {
  const root = document.documentElement;
  const order = ['hockey', 'baseball', 'softball', 'volleyball'];
  const STAGE = {
    hockey: { src: ASSETS.hockeyTeam, cap: 'Pillar Hockey' },
    baseball: { src: ASSETS.baseballNight, cap: 'Pillar Baseball' },
    softball: { src: COACHES.find(c => c.sport === 'softball' && c.photo)?.photo, cap: 'Pillar Softball' },
    volleyball: { src: ASSETS.vbCelebrate, cap: 'Pillar Volleyball' },
  };
  const count = k => PROGRAMS.filter(p => p.sport === k).length;

  // ----- headline: kinetic letters -----
  splitText(document.getElementById('hero-title'));

  // ----- pillars (from the logo's columns) -----
  const H = [38, 62, 48, 80, 56, 92, 64, 74, 44];
  document.getElementById('pillars').innerHTML = H.map((h, i) => `<i style="--h:${h}%;--i:${i}"></i>`).join('');

  // ----- stage photos -----
  document.getElementById('stage').innerHTML = order.map(k => `<figure data-k="${k}">
    ${STAGE[k].src ? `<img src="${STAGE[k].src}" alt=""${k === 'hockey' ? ' fetchpriority="high"' : ' loading="lazy"'}>` : `<div class="art">${icon(k)}</div>`}
    <figcaption>${STAGE[k].cap}</figcaption></figure>`).join('');

  // ----- sport switcher -----
  const sw = document.getElementById('switch'), enter = document.getElementById('enter');
  sw.innerHTML = order.map(k => `<button type="button" data-k="${k}" style="--c:var(--${k})" aria-pressed="false">${SPORTS[k].name}<small>${SPORTS[k].external ? 'own site ↗' : count(k) + ' programs'}</small></button>`).join('');
  let current = getSport() && order.includes(getSport()) ? getSport() : 'hockey';
  function show(k) {
    current = k;
    root.dataset.theme = k;
    sw.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
    document.querySelectorAll('#stage figure').forEach(f => f.classList.toggle('on', f.dataset.k === k));
    const ext = SPORTS[k].external;
    enter.href = bLink(k);
    enter.toggleAttribute('target', !!ext); if (ext) { enter.target = '_blank'; enter.rel = 'noopener'; } else enter.removeAttribute('rel');
    enter.innerHTML = ext ? `Visit Pillar Volleyball ${icon('ext')}` : `Enter ${SPORTS[k].name.toLowerCase()} ${arrowNE}`;
  }
  show(current);

  // Auto-cycle until the visitor takes over (or motion is paused)
  const CYCLE = 4500;
  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; sw.classList.add('manual'); };
  const start = () => {
    clearInterval(timer);
    if (paused || sw.classList.contains('manual')) return;
    timer = setInterval(() => show(order[(order.indexOf(current) + 1) % order.length]), CYCLE);
  };
  sw.style.setProperty('--cycle', CYCLE + 'ms');
  sw.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; stop(); show(b.dataset.k); });
  sw.addEventListener('focusin', stop);
  document.addEventListener('motionchange', () => paused ? stop() : (sw.classList.remove('manual'), start()));
  start();
  // Only cycle while the hero is on screen, so the page doesn't recolor under a reader
  new IntersectionObserver(([e]) => e.isIntersecting ? start() : clearInterval(timer), { threshold: .25 }).observe(document.querySelector('.hero'));

  // ----- ticker: real upcoming sessions -----
  const sessions = PROGRAMS.flatMap(p => upcomingSessions(p).map(s => ({ p, s, d: parseDate(s.date) }))).sort((a, b) => a.d - b.d);
  const items = sessions.slice(0, 8).map(({ p, s, d }) =>
    `<span style="--c:var(--${p.sport})"><i class="live"></i><b>${fmt(d, { weekday: 'short', month: 'short', day: 'numeric' })}</b>${SPORTS[p.sport].name} · ${esc(p.title)}${s.label && s.label !== p.title ? ' · ' + esc(s.label) : ''}${s.soldOut ? ' · <b>Sold out</b>' : ''}</span>`)
    .concat(PROGRAMS.filter(p => p.type === 'Team' && p.price).map(p =>
      `<span style="--c:var(--${p.sport})"><i class="live"></i><b>Now forming</b>${SPORTS[p.sport].name} · ${esc(p.title)} · ${p.price}</span>`));
  const tick = document.getElementById('ticker');
  tick.innerHTML = `<div>${items.join('')}</div><div>${items.join('')}</div>`;
  tick.parentElement.setAttribute('aria-hidden', 'true'); // decorative repeat of the ticket rail below
  tick.parentElement.removeAttribute('aria-label');

  // ----- arena list -----
  const nextFor = k => { const s = sessions.find(x => x.p.sport === k && !x.s.soldOut); return s ? 'Next: ' + fmt(s.d, { month: 'short', day: 'numeric' }) : 'Year-round training'; };
  document.getElementById('arena').innerHTML = order.map((k, i) => `<li><a href="${bLink(k)}"${extAttr(k)} style="--c:var(--${k})" data-k="${k}">
      <span class="num">0${i + 1}</span><span class="name">${SPORTS[k].name}</span>
      <span class="meta"><span>${SPORTS[k].external ? 'Own site' : count(k) + ' programs & teams'}</span><span>${nextFor(k)}</span><span class="go">${SPORTS[k].external ? icon('ext') : arrowNE}</span></span>
    </a></li>`).join('');

  // Hovering a sport tints the page in that sport's accent (mouse only)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('#arena a').forEach(a => {
      a.addEventListener('pointerenter', () => { root.dataset.theme = a.dataset.k; });
      a.addEventListener('pointerleave', () => { root.dataset.theme = current; });
    });
  }

  // ----- ticket rail -----
  const rail = document.getElementById('rail');
  const ongoingIds = ['bb-12u', 'hk-academy', 'sb-travel', 'hk-private', 'bb-15u', 'bb-lessons'];
  rail.innerHTML = sessions.slice(0, 6).map(({ p, s }) => ticket(p, s)).join('') +
    ongoingIds.map(id => PROGRAMS.find(p => p.id === id)).filter(Boolean).map(p => ticket(p)).join('');
  document.querySelectorAll('[data-rail]').forEach(b => b.addEventListener('click', () =>
    rail.scrollBy({ left: +b.dataset.rail * Math.min(rail.clientWidth * .8, 800), behavior: paused ? 'auto' : 'smooth' })));

  // ----- pathway: sticky counter + progress -----
  const steps = [...document.querySelectorAll('.step')], num = document.getElementById('path-num'), bar = document.getElementById('path-bar');
  let active = null;
  const onScroll = () => {
    const mid = innerHeight * .55;
    let idx = 0;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) idx = i; });
    const first = steps[0].getBoundingClientRect(), last = steps[steps.length - 1].getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (mid - first.top) / (last.bottom - first.top)));
    bar.style.setProperty('--p', p.toFixed(3));
    if (idx !== active) {
      active = idx; steps.forEach((s, i) => s.classList.toggle('on', i === idx));
      num.textContent = steps[idx].dataset.step; num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
    }
  };
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();

  // ----- bento, roster, marquee -----
  document.getElementById('bento-img').src = ASSETS.treadmill;
  document.getElementById('roster').innerHTML = COACHES.filter(c => c.photo).map(coachCard).join('');
  const words = ['Train', 'Compete', 'Register', 'Elevate'];
  const run = words.map(w => `<span>${w}</span>`).join('');
  document.getElementById('marquee').innerHTML = run + run + run + run;

  partnerStrip(document.getElementById('partner-strip'));
  revealB();
  countUp();
})();
