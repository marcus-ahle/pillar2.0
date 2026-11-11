# Pillar Sports Academy site

Static pages (`*.html`, `assets/`) plus a small Node server that serves them and a content API.
Pages live at clean URLs (`/hockey`, `/schedule`, …); old `*.html` links 301-redirect there.
Netlify and GitHub Pages serve `hockey.html` at `/hockey` the same way.
Programs, their dated sessions ("events") and sponsors load live from that API.

## Run locally

Needs Node 22+ and Docker.

```bash
npm install
npm run db:up      # MongoDB 7 in Docker on 127.0.0.1:27017
npm run seed       # load programs, events, sponsors + the mock EZFacility account
npm run dev        # site on http://localhost:4173, mock EZFacility on http://localhost:5055
```

Admin: http://localhost:4173/admin. Tests: `npm test` (uses throwaway databases).

## Where content comes from

The admin page switches the events source for the whole site (stored in MongoDB `settings`):

| | Programs | Events (dated sessions) | Sponsors |
|---|---|---|---|
| **Option 1 · Database** | MongoDB `programs` | MongoDB `events` | MongoDB `sponsors` |
| **Option 2 · EZFacility** | MongoDB `programs` | EZFacility schedule | MongoDB `sponsors` |

In Option 2, each reservation on the EZFacility schedule becomes a session. A program picks up
every reservation whose session type matches its `ezfacility.sessionTypeId`. Reservations of a
type no program claims become their own program (sport taken from the EZFacility category).
Court rentals and full sessions marked "hide when full" are left out.

On a static host with no API (e.g. the Netlify concept site), pages fall back to the bundled
copy in `assets/js/data.js`, which is also what `npm run seed` loads.

## API

| | |
|---|---|
| `GET /api/content` | programs (with `sessions`) + sponsors, what every page loads |
| `GET /api/events` | flat list of sessions from the active source |
| `GET /api/sponsors` | sponsors |
| `GET/PUT /api/settings` | `{ "eventsSource": "database" \| "ezfacility" }` |
| `GET /api/status` | MongoDB counts and a live EZFacility connection check |

## EZFacility

`server/content/ezfacility-client.js` follows the published API
(https://api.sandbox.ezfacility.com/swagger/ui/index): OAuth2 password grant at `POST /token`
(client ID/secret as Basic auth, `scope=realm:tms`), Bearer token on every call, `ez-page-number`
paging, ranges of at most one year. It calls:

- `GET /v2/user/locations`
- `GET /v2/sessionCategories/all/locationID={locationID}`
- `GET /v2/schedule/{locationID}/{startDate}/{endDate}`

`mock-ezfacility/` implements those endpoints (and `/token`) on MongoDB with the same rules, so the
site code is identical against the mock and the real API.

### Switching to a real account

1. Copy `.env.example` to `.env`.
2. Set `EZFACILITY_BASE_URL` (`https://api.sandbox.ezfacility.com` or `https://api.ezfacility.com`),
   the client ID/secret from the EZFacility developer portal, and the API user's username/password.
   Set `EZFACILITY_LOCATION_ID` if the user can see more than one location.
3. Put the real session type IDs on the programs in MongoDB (`programs.ezfacility.sessionTypeId`).
   The seeded IDs (4101, 4102, …) only exist in the mock.
4. Restart the server and use **Check again** on the admin page.
