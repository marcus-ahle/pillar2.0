/* Pillar Sports Academy — content data
   All copy, dates, prices and links come from the current sites
   (pillarsportsacademy.com + pillarvolleyball.com). Fields marked
   `confirm: true` hold placeholder ages/levels that the live site
   doesn't state; confirm them with the owner before launch.
   In production this file becomes CMS-managed content. */

const CDN = 'https://images.squarespace-cdn.com/content/v1/6a0ca4d7d63dd86d7ee2d26b/';
const img = (path, w = 750) => `${CDN}${path}?format=${w}w`;
const EZ = id => `https://tms.ezfacility.com/OnlineRegistrations/Register.aspx?CompanyID=9045&GroupID=${id}`;
const VBCDN = 'https://images.squarespace-cdn.com/content/v1/6963d5367e96a66b0bf34aa8/';
const vbImg = (path, w = 1000) => `${VBCDN}${path}?format=${w}w`;
const VB_EMAIL = 'mailto:volleyball@pillarfitness.com';

const ASSETS = {
  logo: img('05071a9e-8506-4b8e-8672-d0cdc2498515/SmallLogo.png', 300),
  hockeyLogo: img('f24f5f81-3f75-43e8-9034-604007c10f65/PILLAR+HOCKEY+-+Purple+PNG.png', 500),
  baseballMark: img('174c65c6-76da-490a-a510-e032ae59ab38/Pillar+Baseball+-+Purple_whitepng.png', 500),
  softballMark: img('1701bcd3-66be-442d-9516-571caae08a88/0-2.png', 500),
  hockeyTeam: img('82d387b9-7bc7-4f72-939b-49e707c81e8a/825279360_122124874755124206_1963041272881774652_n.jpg', 1500),
  treadmill: img('186015d1-d569-4236-b6a4-a025b72060df/Treadmill', 1000),
  baseballNight: img('ccacbec9-a311-4fa8-a15c-8c4e453858c8/1000010421.jpg', 1000),
  vbCelebrate: vbImg('20b27a46-fce9-42e6-9997-37f550d68672/Pillar+Volleyball_Nike+North+Coast+Cup_2-14-2026-144.jpg', 1500),
  vbTeam: vbImg('ae84736c-f033-4b3a-b436-1c57655fb607/17-Black-039.jpg', 1500),
  vbCourt: vbImg('bcb9940f-1db3-40cf-9220-930b8fcacefa/Pillar+Volleyball_Nike+North+Coast+Cup_2-14-2026-106.jpg', 1500),
};

/* Facility details (from pillarvolleyball.com) */
const FACILITY = { address: '10020 Compass Dr, Rossford, OH 43551', phone: '(419) 930-5974',
  maps: 'https://www.google.com/maps/search/?api=1&query=10020+Compass+Dr+Rossford+OH+43551' };

const SPORTS = {
  hockey:     { name: 'Hockey',     color: '#2B8AC9', email: 'hockey@pillarfitness.com', store: 'https://gbrandusa.chipply.com/pillarhockeyacademy/store.html?eid=595633&action=viewall' },
  baseball:   { name: 'Baseball',   color: '#D64545', email: 'drew@pillarfitness.com',   store: 'https://gbrandusa.chipply.com/pillarbaseball/store.html?eid=653349&action=viewall' },
  softball:   { name: 'Softball',   color: '#E8A317', email: 'angela@pillarfitness.com', store: 'https://gbrandusa.chipply.com/pillarsoftball/store.html?eid=655823&action=viewall' },
  volleyball: { name: 'Volleyball', color: '#7877E6', email: 'volleyball@pillarfitness.com', store: 'https://gbrandusa.chipply.com/pillarvolleyball/' },
};

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TYPES = ['Camp', 'Clinic', 'Lessons', 'Training', 'Team', 'Tournament', 'League'];
const ALL = LEVELS;

const PROGRAMS = [
  /* ---------- HOCKEY ---------- */
  {
    id: 'hk-skating', sport: 'hockey', type: 'Clinic', title: 'Skating Clinics',
    level: ALL, ageMin: 7, ageMax: 18, ageLabel: 'Youth skaters', confirm: true,
    capacity: 'Small group',
    summary: 'An intense, small-group skating session designed to build better mechanics, control, and endurance.',
    sessions: [
      { date: '2026-10-07', label: 'Skating', url: EZ(4119562) },
      { date: '2026-10-14', label: 'Skating', url: EZ(4119573) },
      { date: '2026-11-04', label: 'Skating', url: EZ(4119581) },
    ],
  },
  {
    id: 'hk-shooting', sport: 'hockey', type: 'Clinic', title: 'Shooting Clinics',
    level: ALL, ageMin: 7, ageMax: 18, ageLabel: 'Youth skaters', confirm: true,
    capacity: '6 players per session',
    summary: 'Small-group, high-repetition shooting sessions to improve technique and take your shot to the next level. Every player gets plenty of reps and individual attention.',
    sessions: [
      { date: '2026-10-07', label: 'Shooting', url: EZ(4119594) },
      { date: '2026-10-14', label: 'Shooting', url: EZ(4119595) },
      { date: '2026-11-04', label: 'Shooting', url: EZ(4119597) },
    ],
  },
  {
    id: 'hk-election', sport: 'hockey', type: 'Camp', title: 'Election Day Camp',
    level: ALL, ageMin: 7, ageMax: 18, ageLabel: 'Youth skaters', confirm: true,
    capacity: 'Limited to 6 skaters',
    summary: 'No school? Get on the ice! A high-intensity 2-hour skill session focused on skating and puck skills.',
    sessions: [{ date: '2026-11-03', time: '10:00 AM – 12:00 PM', label: 'Camp', url: EZ(4119790) }],
  },
  {
    id: 'hk-private', sport: 'hockey', type: 'Lessons', title: 'Private Lessons',
    level: ALL, ageMin: 6, ageMax: 18, ageLabel: 'All ages', confirm: true,
    capacity: '1-on-1 · 60 min',
    summary: 'Individualized hockey development built around your player — skills, mechanics, and confidence.',
    details: ['Skating & mechanics', 'Stickhandling & puck skills', 'Shooting & scoring', 'Game-specific skill development', 'Video analysis'],
    ongoing: { label: 'Request a lesson', url: 'mailto:hockey@pillarfitness.com?subject=Private%20Lesson%20Inquiry' },
  },
  {
    id: 'hk-academy', sport: 'hockey', type: 'Training', title: 'Pillar Hockey Academy',
    level: ALL, ageMin: 6, ageMax: 18, ageLabel: 'All ages', confirm: true,
    capacity: 'Treadmill + synthetic ice',
    summary: 'Progressive drills on the skating treadmill and synthetic ice, with real-time coaching and delayed video playback so every learning style can fix their stride.',
    ongoing: { label: 'Ask about training', url: 'mailto:hockey@pillarfitness.com?subject=Hockey%20Academy' },
  },
  {
    id: 'hk-teams', sport: 'hockey', type: 'Team', title: 'Pillar Hockey Teams',
    level: ['Intermediate', 'Advanced'], ageMin: 8, ageMax: 18, ageLabel: 'Youth teams', confirm: true,
    capacity: 'Competitive',
    summary: 'Built on the pillars of strength, skill, and community. Coaches who mentor, prioritizing long-term development over short-term wins.',
    ongoing: { label: 'Ask about teams', url: 'mailto:hockey@pillarfitness.com?subject=Hockey%20Teams' },
  },

  /* ---------- BASEBALL ---------- */
  {
    id: 'bb-12u', sport: 'baseball', type: 'Team', title: '12U Travel Team',
    level: ['Advanced'], ageMin: 11, ageMax: 12, ageLabel: '12U',
    price: '$1,750', priceNote: 'est. per player', coach: 'HC Curtis Dodd',
    capacity: 'NWOABL · Apr–Jul',
    summary: 'A full season of NWOABL games plus four tournaments, with a winter of team practice and academy training.',
    details: ['Games in NWOABL (Apr – July)', '4 tournaments', 'Umpire fees', 'Uniforms', 'Winter team practices (12)', 'Winter academy training (12)', 'Performance training (12)', 'Mental mindset training'],
    ongoing: { label: 'Ask about tryouts', url: 'mailto:drew@pillarfitness.com?subject=12U%20Baseball' },
  },
  {
    id: 'bb-15u', sport: 'baseball', type: 'Team', title: '15U Travel Team',
    level: ['Advanced'], ageMin: 14, ageMax: 15, ageLabel: '15U',
    price: '$1,800', priceNote: 'est. per player', coach: 'Coach TBA',
    capacity: '6 tournaments',
    summary: 'Six tournaments with a full winter development block for older players chasing a varsity roster spot.',
    details: ['6 tournaments', 'Umpire fees', 'Uniforms', 'Winter team practices (12)', 'Winter academy training (12)', 'Performance training (12)', 'Mental mindset training'],
    ongoing: { label: 'Ask about tryouts', url: 'mailto:drew@pillarfitness.com?subject=15U%20Baseball' },
  },
  {
    id: 'bb-lessons', sport: 'baseball', type: 'Lessons', title: 'Private Lessons · Coach Creecy',
    level: ALL, ageMin: 7, ageMax: 18, ageLabel: 'All ages', confirm: true,
    capacity: '1-on-1',
    summary: 'One-on-one baseball instruction with Bryce Creecy, a former High School Player of the Year who went on to play at St. Cloud Junior College.',
    ongoing: { label: 'Call 309-409-9154', url: 'tel:+13094099154' },
  },

  /* ---------- SOFTBALL ---------- */
  {
    id: 'sb-election', sport: 'softball', type: 'Camp', title: 'Election Day Camp',
    level: ALL, ageMin: 7, ageMax: 14, ageLabel: '8U – 14U',
    capacity: 'Split by age group',
    summary: 'A day-off camp at Pillar Sports, split into two age groups.',
    sessions: [
      { date: '2026-11-03', time: '10:00 AM – 12:00 PM', label: '8U – 10U', url: EZ(4122100) },
      { date: '2026-11-03', time: '12:00 – 2:00 PM', label: '11U – 14U', url: EZ(4122100) },
    ],
  },
  {
    id: 'sb-travel', sport: 'softball', type: 'Team', title: 'Travel Teams 9U – 14U',
    level: ['Intermediate', 'Advanced'], ageMin: 8, ageMax: 14, ageLabel: '9U – 14U',
    price: '$1,250', priceNote: 'est. per player', coach: 'Led by Angela Hoffsis',
    capacity: '6–7 summer tournaments',
    summary: 'A year-round path from fall training through a full summer tournament season.',
    details: ['Fall training', '1 fall tournament', '1 indoor dome tournament', 'Performance training', 'Winter & spring training', '6–7 summer tournaments', 'Uniforms', 'Team meat locker fundraiser'],
    ongoing: { label: 'Connect with Angela', url: 'mailto:angela@pillarfitness.com?subject=Softball%20Travel%20Teams' },
  },

  /* ---------- VOLLEYBALL (content from pillarvolleyball.com) ---------- */
  {
    id: 'vb-learn', sport: 'volleyball', type: 'Clinic', title: 'Learn to Volley',
    level: ['Beginner'], ageMin: 6, ageMax: 10, ageLabel: 'Young beginners', confirm: true,
    summary: 'The perfect way to get your child moving while learning the fundamentals of the game. New dates coming soon.',
    ongoing: { label: 'Ask about dates', url: `${VB_EMAIL}?subject=Learn%20to%20Volley` },
  },
  {
    id: 'vb-juniors', sport: 'volleyball', type: 'Training', title: 'Juniors Academy',
    level: ['Beginner', 'Intermediate'], ageMin: 8, ageMax: 14, ageLabel: 'Grades 3 – 8',
    capacity: 'Saturdays · 8:30 or 10 AM',
    summary: 'For players new to volleyball, or with some experience, who want to build their skills and move up in the sport.',
    sessions: [
      { date: '2026-11-07', time: '10:00 – 11:30 AM', label: 'Fall 2 session', url: EZ(4098593), soldOut: true },
      { date: '2027-01-09', time: '10:00 – 11:30 AM', label: 'Winter 1 session', url: EZ(4133568) },
    ],
  },
  {
    id: 'vb-dev', sport: 'volleyball', type: 'Training', title: 'Development Training',
    level: ['Intermediate', 'Advanced'], ageMin: 11, ageMax: 18, ageLabel: 'Team players', confirm: true,
    summary: 'Intensive training for players who play on (or want to play on) a team, ahead of the JO season. Open to players from any club.',
    ongoing: { label: 'Ask about training', url: `${VB_EMAIL}?subject=Development%20Training` },
  },
  {
    id: 'vb-lessons', sport: 'volleyball', type: 'Lessons', title: 'Private Lessons',
    level: ALL, ageMin: 8, ageMax: 18, ageLabel: 'All ages', confirm: true,
    capacity: '1-on-1',
    summary: 'One-on-one volleyball instruction with a Pillar coach. Send a request and we\'ll match you with the right coach and time.',
    ongoing: { label: 'Request a lesson', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdgbkU34bqRigE1CxqBHa-Fn4Q3kBVkuopebc6fC5LeIwPQsw/viewform' },
  },
  {
    id: 'vb-election', sport: 'volleyball', type: 'Camp', title: 'Election Day Skill Camps',
    level: ALL, ageMin: 9, ageMax: 14, ageLabel: '10U – 14U',
    summary: 'High-energy, skill-specific hours with our coaches. Book one or all three.',
    sessions: [
      { date: '2026-11-03', time: '10:00 – 11:00 AM', label: 'Serving', url: EZ(4122906) },
      { date: '2026-11-03', time: '11:00 AM – 12:00 PM', label: 'Hitting', url: EZ(4122912) },
      { date: '2026-11-03', time: '12:00 – 1:00 PM', label: 'Passing', url: EZ(4122914) },
    ],
  },
  {
    id: 'vb-4v4', sport: 'volleyball', type: 'Tournament', title: '4v4 Tournaments',
    level: ['Intermediate', 'Advanced'], ageMin: 12, ageMax: 18, ageLabel: 'JR High · HS JV · HS Varsity',
    summary: 'Get some friends together and enter a team. A fun way to enjoy the game.',
    sessions: [
      { date: '2026-11-28', label: 'Pumpkin Pie Classic', url: EZ(4129326) },
      { date: '2026-12-20', label: 'Hot Cocoa Classic', url: EZ(4129541) },
    ],
  },
  {
    id: 'vb-adult', sport: 'volleyball', type: 'League', title: 'Adult Leagues',
    level: ALL, ageMin: 18, ageMax: 99, ageLabel: 'Adults',
    capacity: '3 courts · games 9 & 9:50 PM',
    summary: 'Leagues every night of the week for all skill levels, from competitive to rec. Register by Tuesday, December 1. Need a team? Ask Drew to join the free-agent list.',
    sessions: [
      { date: '2026-12-14', label: 'Mon · Coed 4s · Competitive', url: EZ(4140997) },
      { date: '2026-12-14', label: 'Mon · Coed 4s · Rec', url: EZ(4140998) },
      { date: '2026-12-15', label: 'Tue · Coed 6s · Rec', url: EZ(4141001) },
      { date: '2026-12-16', label: "Wed · Women's 4s", url: EZ(4141004) },
      { date: '2026-12-17', label: 'Thu · Reverse coed 4s · Competitive', url: EZ(4141005) },
      { date: '2026-12-18', label: 'Fri · Coed 4s · Rec', url: EZ(4141002) },
    ],
  },
  {
    id: 'vb-club', sport: 'volleyball', type: 'Team', title: 'JO Club Teams',
    level: ['Advanced'], ageMin: 10, ageMax: 18, ageLabel: '11U – 18U',
    price: '$2,750 – $3,900', priceNote: 'est. per player', coach: 'Director Tim Pierce',
    capacity: 'Season Dec – May',
    summary: 'Competitive club volleyball built on the pillars of strength, skill and community, with coaches who put long-term development ahead of short-term wins.',
    details: ['All training, games & events in one price', '6 – 10 tournaments, by team', 'Volleyball + performance coaching', 'Season runs December – May', 'Uniforms billed by the supplier', 'New uniform kits every 2 years'],
    sessions: [{ date: '2026-11-15', time: '10:00 AM – 12:00 PM', label: '15U – 18U Tryout', url: EZ(4131809) }],
    ongoing: { label: 'Tryouts & open gyms', url: '#tryouts' },
  },
  {
    id: 'vb-flex', sport: 'volleyball', type: 'Team', title: 'In-House & FLEX Teams',
    level: ['Beginner', 'Intermediate'], ageMin: 8, ageMax: 14, ageLabel: 'Grades 3 – 8',
    summary: 'An alternative to JO volleyball for the multi-sport athlete, or anyone building skills and confidence before their season.',
    sessions: [{ date: '2026-11-15', label: 'FLEX Evaluation Day', url: EZ(4115776) }],
    links: [['Grades 3/4 team', EZ(4131680)], ['Grades 5/6 team', EZ(4117172)], ['Grades 7/8 team', EZ(4117176)]],
  },
];

const COACHES = [
  { name: 'Angela Hoffsis', sport: 'softball', role: 'Head of Softball Operations', photo: img('2e0097ad-efa9-47e4-baf3-bb25df5411c2/Angela.png', 500),
    email: 'angela@pillarfitness.com',
    bio: ['Angela combines a lifetime of softball experience with elite athletic training expertise. A former collegiate player at Albion College and BGSU club softball standout, she holds a B.S. in Exercise Science and spent five years as General Manager and Coach at Pillar Fitness Monroe.',
          'She blends proper softball fundamentals with strength, speed, and movement mechanics, building a positive, empowering environment where players develop confidence, resilience, and skill.'] },
  { name: 'Marnie Hartman', sport: 'softball', role: '9U Head Coach', photo: null,
    bio: ['Full bio coming soon.'] },
  { name: 'Maddie Hartman', sport: 'softball', role: '9U Assistant Coach', photo: null,
    bio: ['Full bio coming soon.'] },
  { name: 'Curtis Dodd', sport: 'baseball', role: '12U Head Coach', photo: img('ccacbec9-a311-4fa8-a15c-8c4e453858c8/1000010421.jpg', 500),
    bio: ['Nearly a decade of coaching: four years in community youth baseball and five in competitive travel baseball, helping players build fundamentals, confidence, teamwork, and a love for the game.',
          'Coach Dodd focuses beyond wins and losses, on character, sportsmanship, and preparing athletes for success in baseball and in life.'] },
  { name: 'Bryce Creecy', sport: 'baseball', role: 'Coach · Private Lessons', photo: img('e292fd14-e7cf-44a1-878d-a57fe784d393/1000010418.jpg', 500),
    phone: '309-409-9154',
    bio: ['A former High School Player of the Year who went on to play at St. Cloud Junior College. Known for his competitive drive, leadership, and passion for the game.'] },
  { name: 'Richard Creecy', sport: 'baseball', role: 'Coach', photo: img('af1db633-9d69-4174-b924-61912071021a/1000010483.jpg', 500),
    bio: ['12+ years of travel and high school coaching. A former standout for the nationally ranked Start High School program of the 1990s.',
          'His philosophy blends elite baseball IQ and fundamentals with accountability, discipline, and teamwork.'] },
  { name: 'Christian Behrens', sport: 'baseball', role: 'Coach', photo: img('42110a2e-80ed-4f0c-8d1e-0740d58a2ea1/1000010357.jpg', 500),
    bio: ['An All-State and All-Conference high school standout and former travel baseball assistant coach. Christian focuses on strong fundamentals, baseball IQ, discipline, and sportsmanship.'] },
  { name: 'Martin Rancourt', sport: 'baseball', role: 'Coach', photo: img('21984364-0479-496a-a153-41797eb41795/image0.jpg', 500),
    bio: ['Nearly a decade coaching from middle school through high school varsity (2015–2023). A player-development specialist focused on mechanics, game preparation, and baseball IQ, with accountability, perseverance, and sportsmanship at the core.'] },
  { name: 'Tim Pierce', sport: 'volleyball', role: 'Volleyball Director', photo: vbImg('1cd47f40-9f5a-4422-bbc3-0d45f31a4d1b/15-Purple-029.jpg', 750),
    email: 'volleyball@pillarfitness.com',
    bio: ['Tim has over 20 years of volleyball experience. He has coached both high school and club volleyball and has played competitively.',
          'He also played baseball and basketball at St. Francis High School and Siena Heights University, and enjoys time with his wife, two kids and his dog Maddie.'] },
];

const CONTACTS = [
  { team: 'Volleyball', name: 'Pillar Volleyball', email: 'volleyball@pillarfitness.com' },
  { team: 'General & Baseball', name: 'Drew', email: 'drew@pillarfitness.com' },
  { team: 'Hockey', name: 'Pillar Hockey', email: 'hockey@pillarfitness.com' },
  { team: 'Softball', name: 'Angela Hoffsis', email: 'angela@pillarfitness.com' },
  { team: 'Baseball lessons', name: 'Bryce Creecy', phone: '309-409-9154' },
];

/* ---------- Sport hub pages (hockey, baseball, softball, volleyball) ----------
   One record per sport drives its whole hub page. Copy is condensed from the
   current site's sport folders and coach bios. */
const SPORT_HUBS = {
  hockey: {
    tagline: 'Built on the pillars of strength, skill, and community.',
    intro: 'Small-group skating and shooting clinics, skating treadmill training, private lessons and competitive teams, with coaches who put long-term development ahead of short-term wins.',
    logo: ASSETS.hockeyLogo,
    photo: ASSETS.hockeyTeam, photoAlt: 'Pillar Hockey players in purple jerseys posing as a team',
    photo2: ASSETS.treadmill, photo2Alt: 'Coach working with a skater on the skating treadmill',
    facts: [['6 max', 'Skaters per clinic'], ['Treadmill', '+ synthetic ice training'], ['1-on-1', 'Private lessons, 60 min'], ['Video', 'Delayed playback feedback']],
    contact: { name: 'Pillar Hockey', email: 'hockey@pillarfitness.com' },
    primary: { label: 'Ask about teams', url: 'mailto:hockey@pillarfitness.com?subject=Hockey%20Teams' },
    staffNote: 'Hockey coach profiles are coming soon. To book a lesson or ask about our staff, email <a href="mailto:hockey@pillarfitness.com">hockey@pillarfitness.com</a>.',
    faq: [
      ['What ages are hockey clinics for?', 'Clinics and camps are for youth skaters. Email us your player\'s age and level and we\'ll point you to the right session.'],
      ['A clinic already happened or is sold out. What now?', 'Tap “Notify me” on the program and we\'ll email you as soon as new dates post. Clinics run in small groups, so they fill fast.'],
      ['What is the skating treadmill?', 'A moving skating surface where coaches can correct a stride in real time, with delayed video playback so players see exactly what to fix.'],
      ['How do I join a Pillar Hockey team?', 'Email hockey@pillarfitness.com to ask about rosters, evaluations and season details.'],
    ],
  },
  baseball: {
    tagline: 'Fundamentals, baseball IQ and character.',
    intro: '12U and 15U travel teams, private lessons and a full winter of academy training, led by coaches with years of travel, high school and college experience.',
    logo: ASSETS.baseballMark,
    photo: ASSETS.baseballNight, photoAlt: 'Pillar Baseball coach with young players at a night game',
    facts: [['12U · 15U', 'Travel teams'], ['NWOABL', 'League play, Apr – Jul'], ['36', 'Winter training sessions'], ['1-on-1', 'Private lessons']],
    contact: { name: 'Drew', email: 'drew@pillarfitness.com' },
    primary: { label: 'Ask about tryouts', url: 'mailto:drew@pillarfitness.com?subject=Baseball%20Tryouts' },
    calc: true,
    faq: [
      ['Which age group is my player?', 'Baseball uses an April 30 birthdate cutoff. Use the age-group checker on this page, then confirm with the official AAU calculator.'],
      ['How do tryouts work?', 'Email drew@pillarfitness.com to ask about tryouts for the 12U and 15U teams.'],
      ['What does the season cost include?', 'NWOABL games, four tournaments, umpire fees, uniforms, and 36 winter sessions of team practice, academy and performance training, plus mental mindset training.'],
      ['How do I book a private lesson?', 'Call or text Coach Bryce Creecy at 309-409-9154.'],
    ],
  },
  softball: {
    tagline: 'Fundamentals, strength and confidence.',
    intro: 'Travel teams from 9U to 14U, day-off camps and year-round training led by Angela Hoffsis, blending softball fundamentals with strength, speed and movement mechanics.',
    logo: ASSETS.softballMark,
    photo: null,
    facts: [['9U – 14U', 'Travel teams'], ['6 – 7', 'Summer tournaments'], ['Year-round', 'Fall through summer'], ['Aug 31', '2026 age cutoff']],
    contact: { name: 'Angela Hoffsis', email: 'angela@pillarfitness.com' },
    primary: { label: 'Connect with Angela', url: 'mailto:angela@pillarfitness.com?subject=Softball%20Travel%20Teams' },
    calc: true,
    faq: [
      ['Which age group is my player?', 'Softball uses an August 31, 2026 cutoff. Use the age-group checker on this page, then confirm placement with Angela.'],
      ['What does the travel season include?', 'Fall training and a fall tournament, an indoor dome tournament, performance training, winter and spring training, 6–7 summer tournaments, uniforms and a team meat locker fundraiser.'],
      ['Who coaches Pillar Softball?', 'The program is led by Angela Hoffsis, a former collegiate player with a B.S. in Exercise Science. Team coaches are listed above.'],
    ],
  },
  volleyball: {
    tagline: 'Learn. Elevate. Compete.',
    intro: 'The premier club for players to learn, elevate and compete: JO club teams, juniors academy, in-house teams, camps, tournaments and adult leagues, with strong communication off the court and relentless focus on individual development on it.',
    photo: ASSETS.vbCelebrate, photoAlt: 'Pillar Volleyball players celebrating a point on an indoor court',
    photo2: ASSETS.vbTeam, photo2Alt: 'Six Pillar Volleyball players in black and purple uniforms',
    facts: [['11U – 18U', 'JO club teams'], ['Dec – May', 'Club season'], ['Grades 3 – 8', 'Juniors & in-house'], ['3', 'Courts, every night']],
    contact: { name: 'Pillar Volleyball', email: 'volleyball@pillarfitness.com' },
    primary: { label: 'Tryouts & open gyms', url: '#tryouts' },
    staffNote: 'Club team coaches include Brenden Borer, Kora Rollins, Kali Glase, Lauryn Olenic, Tammy Kaseman, Ella Lewis, Norm McGhee, Linden Kunick, Jayda Copciac and Kevin Young. Volleyball and performance coaches work together, so every athlete builds skill, strength, speed and resilience.',
    quote: ['Everyone inside Pillar only wants what is best for you. Which is why Pillar isn’t just a club, it’s a family.', 'Current player, Pillar Volleyball'],
    tryouts: {
      title: '2026/27 club tryouts',
      body: ['All players must pre-register. Register for the age group that matches the grade you’re entering in Fall 2026, using the USA Volleyball age chart. Players only need to attend one tryout date.',
             'Played for Pillar in 2025/26? Your membership is good until August 31, so you don’t need a new one for July tryouts. Open gym dates are coming soon.'],
      links: [['USA Volleyball age chart', 'https://usavolleyball.org/wp-content/uploads/2025/06/USAV-2026-2027-Age-Definition-Chart-Only.pdf'],
              ['OVR tryout policy', 'https://www.members.ovr.org/docs_staff/girlsprogram/tryoutpolicy_girls.pdf'],
              ['Open gym registration', 'https://steelrainfitness.sites.zenplanner.com/sign-up-now.cfm?display=MBRSHPS&categoryId=50B5AC63-08EE-4A23-A6CF-962758BE714A&']],
      makeup: 'Need a make-up tryout? Email volleyball@pillarfitness.com.',
    },
    faq: [
      ['What does Pillar club volleyball cost?', 'Annual costs vary by program and age, from about $2,750 to $3,900 per player. Contact us for your athlete’s exact team.'],
      ['What is included in player fees?', 'All training, games, events and operational fees are rolled into one price so families can budget for the year. Uniforms are an additional fee paid directly to the uniform supplier, with new kits every two years.'],
      ['Which age group should my player try out for?', 'Register based on the grade your athlete is entering in Fall 2026, and use the USA Volleyball age chart to confirm the age group.'],
      ['What if my player is new to volleyball?', 'Start with Learn to Volley or the Juniors Academy (grades 3–8). In-House and FLEX teams are a great step before JO club.'],
      ['How do adult leagues work?', 'Leagues run every night on three courts, with games at 9 and 9:50 PM. Register a team by December 1, or email drew@pillarfitness.com to join the free-agent list.'],
    ],
  },
};

/* Sponsors / partners. PLACEHOLDERS: the live sites list no sponsors, so these
   names are invented. Replace with real partners (add `logo` for an image file;
   without one, the name renders as a styled wordmark using `style` a–e). */
const SPONSORS = [
  { name: 'Riverbend Auto', tier: 'Pillar', style: 'a', url: '#', confirm: true },
  { name: 'Lakeside Dental', tier: 'All-Star', style: 'b', url: '#', confirm: true },
  { name: 'Harbor Title', tier: 'All-Star', style: 'c', url: '#', confirm: true },
  { name: 'northwood pizza co.', tier: 'Starter', style: 'd', url: '#', confirm: true },
  { name: 'Summit Roofing', tier: 'Starter', style: 'e', url: '#', confirm: true },
  { name: 'Compass PT', tier: 'Starter', style: 'a', url: '#', confirm: true },
  { name: 'Maple & Main', tier: 'Fan', style: 'b', url: '#', confirm: true },
  { name: 'eastside cu', tier: 'Fan', style: 'd', url: '#', confirm: true },
];
