/* Runtime configuration, read from the environment (see .env.example).
   Defaults run everything locally: MongoDB in Docker and the mock EZFacility API.
   Switching to the real EZFacility API only means changing the EZFACILITY_* values. */

const env = (k, d) => (process.env[k] ?? '').trim() || d;

export const config = {
  port: Number(env('PORT', 4173)),
  mongoUri: env('MONGODB_URI', 'mongodb://127.0.0.1:27017'),
  dbName: env('MONGODB_DB', 'pillar'),

  ezfacility: {
    // Mock: http://localhost:5055 · Sandbox: https://api.sandbox.ezfacility.com · Live: https://api.ezfacility.com
    baseUrl: env('EZFACILITY_BASE_URL', 'http://localhost:5055').replace(/\/+$/, ''),
    clientId: env('EZFACILITY_CLIENT_ID', 'pillar-local'),
    clientSecret: env('EZFACILITY_CLIENT_SECRET', 'local-mock-secret'),
    username: env('EZFACILITY_USERNAME', 'pillar.api'),
    password: env('EZFACILITY_PASSWORD', 'local-mock-password'),
    // realm:tms is the staff realm that can read the facility schedule
    scope: env('EZFACILITY_SCOPE', 'realm:tms'),
    // Blank = use the first location the API user can see (GET /v2/user/locations)
    locationId: env('EZFACILITY_LOCATION_ID', ''),
    // EZFacility returns UTC; the site shows dates and times in the facility's zone
    timeZone: env('EZFACILITY_TIMEZONE', 'America/New_York'),
    // Schedule window fetched for events (EZFacility rejects ranges over one year)
    pastDays: Number(env('EZFACILITY_PAST_DAYS', 45)),
    cacheSeconds: Number(env('EZFACILITY_CACHE_SECONDS', 60)),
    timeoutMs: Number(env('EZFACILITY_TIMEOUT_MS', 10000)),
  },
};

export const EVENT_SOURCES = ['database', 'ezfacility'];
