/* Fixture data for the mock EZFacility account.

   In EZFacility, a dated event is a *reservation* on the facility schedule.
   Each reservation has a session *type* (e.g. "Skating Clinic") inside a
   reservation *category* (e.g. "Hockey"). The site links a program to
   EZFacility through its session type ID (`program.ezfacility.sessionTypeId`),
   so every reservation of that type shows up as a date on that program.

   These IDs are invented. With a real account, put the real session type IDs
   on the program documents in MongoDB. */

export const MOCK_LOCATION = {
  Id: 18342, POSClientID: 0, Name: 'Pillar Sports Academy', Status: 'Active',
  Address1: '10020 Compass Dr', Address2: '', City: 'Rossford', State: 'OH', Zip: '43551',
  Phone: '(419) 930-5974', Fax: '', Website: 'https://pillarsportsacademy.com',
  HasPOS: false, HasPOSv2: false, HasEquipment: false, HasCheckIn: true, HasSelfServiceEnabled: true,
};

export const MOCK_TIME_ZONE = 'America/New_York';
export const MOCK_SITE_TZ_OFFSET = -5; // EZFacility's SiteTimeZone (hours, standard time)

/* Application + user credentials the mock accepts at POST /token.
   They match the defaults in server/config.js. */
export const MOCK_CLIENTS = [{ clientId: 'pillar-local', clientSecret: 'local-mock-secret', name: 'Pillar website (local)' }];
export const MOCK_USERS = [{ username: 'pillar.api', password: 'local-mock-password', firstName: 'Pillar', lastName: 'Website', realms: ['tms', 'self_service', 'none'] }];

export const CATEGORIES = [
  { ID: 301, CategoryName: 'Hockey' },
  { ID: 302, CategoryName: 'Baseball' },
  { ID: 303, CategoryName: 'Softball' },
  { ID: 304, CategoryName: 'Volleyball' },
  { ID: 305, CategoryName: 'Rentals' },
];

/* Session types. `programId` ties a type to a site program (used by the site seed
   to fill program.ezfacility.sessionTypeId). `defaultTime` is for site sessions
   that don't list a time: every EZFacility reservation has one. */
export const SESSION_TYPES = [
  { ID: 4101, Name: 'Skating Clinic', categoryId: 301, programId: 'hk-skating', slots: 6, defaultTime: '6:00 – 7:00 PM' },
  { ID: 4102, Name: 'Shooting Clinic', categoryId: 301, programId: 'hk-shooting', slots: 6, defaultTime: '7:00 – 8:00 PM' },
  { ID: 4103, Name: 'Hockey Day Camp', categoryId: 301, programId: 'hk-election', slots: 6 },
  { ID: 4201, Name: '12U Baseball Tryout', categoryId: 302, programId: 'bb-12u', slots: 30 },
  { ID: 4202, Name: '15U Baseball Tryout', categoryId: 302, programId: 'bb-15u', slots: 30 },
  { ID: 4301, Name: 'Softball Day Camp', categoryId: 303, programId: 'sb-election', slots: 20 },
  { ID: 4302, Name: 'Softball Team Evaluation', categoryId: 303, programId: 'sb-travel', slots: 24 },
  { ID: 4401, Name: 'Juniors Academy', categoryId: 304, programId: 'vb-juniors', slots: 24 },
  { ID: 4402, Name: 'Volleyball Skill Camp', categoryId: 304, programId: 'vb-election', slots: 16 },
  { ID: 4403, Name: '4v4 Tournament', categoryId: 304, programId: 'vb-4v4', slots: 16, defaultTime: '9:00 AM – 3:00 PM' },
  { ID: 4404, Name: 'Adult League', categoryId: 304, programId: 'vb-adult', slots: 8, defaultTime: '9:00 – 10:40 PM' },
  { ID: 4405, Name: 'Club Tryout', categoryId: 304, programId: 'vb-club', slots: 60 },
  { ID: 4406, Name: 'FLEX Evaluation', categoryId: 304, programId: 'vb-flex', slots: 40, defaultTime: '10:00 AM – 12:00 PM' },
  // Only in EZFacility: no matching site program, so the site builds one from the EZ data
  { ID: 4407, Name: 'Open Gym', categoryId: 304, slots: 30 },
  // Court rentals are on the schedule too, but the site filters them out
  { ID: 4501, Name: 'Court Rental', categoryId: 305, slots: 1, rental: true },
];

/* Reservations that exist only in EZFacility (no site session to copy). */
export const EXTRA_RESERVATIONS = [
  { typeId: 4407, title: 'Open Gym · 13U – 18U', date: '2026-12-05', time: '1:00 – 3:00 PM', slotsAvailable: 22,
    description: 'Open gym for players getting ready for club tryouts. Pre-registration required.' },
  { typeId: 4407, title: 'Open Gym · 13U – 18U', date: '2026-12-12', time: '1:00 – 3:00 PM', slotsAvailable: 30,
    description: 'Open gym for players getting ready for club tryouts. Pre-registration required.' },
  { typeId: 4501, title: 'Court 2 rental', date: '2026-11-20', time: '6:00 – 8:00 PM', slotsAvailable: 0 },
];
