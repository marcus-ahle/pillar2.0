/* EZFacility API v2 client. Written against the published contract
   (https://api.sandbox.ezfacility.com/swagger/ui/index), so the same code
   talks to the local mock, the sandbox or production; only config changes.

   Auth: OAuth2 resource-owner password grant at POST {base}/token, with the
   app's Client ID/secret as HTTP Basic auth and the API user's credentials in
   the form body. Tokens last ~20 minutes and are reused until shortly before expiry.
   Paging: send "ez-page-number" (from 1), read "ez-total-pages", repeat. */

export class EZFacilityError extends Error {
  constructor(message, { status, code, body } = {}) {
    super(message);
    this.name = 'EZFacilityError';
    Object.assign(this, { status, code, body });
  }
}

export class EZFacilityClient {
  constructor({ baseUrl, clientId, clientSecret, username, password, scope = 'realm:tms', timeoutMs = 10000, fetchImpl = fetch }) {
    Object.assign(this, { baseUrl: baseUrl.replace(/\/+$/, ''), clientId, clientSecret, username, password, scope, timeoutMs, fetch: fetchImpl });
    this.token = null; // { value, expiresAt }
    this.pendingToken = null;
  }

  async #request(path, init = {}) {
    const url = `${this.baseUrl}${path}`;
    let res;
    try {
      res = await this.fetch(url, { ...init, signal: AbortSignal.timeout(this.timeoutMs) });
    } catch (err) {
      throw new EZFacilityError(`EZFacility unreachable at ${this.baseUrl} (${err.cause?.code || err.cause?.message || err.message})`, { code: 'Unreachable' });
    }
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { res, body };
  }

  /** Bearer token, fetched on first use and refreshed a minute before it expires. */
  async getToken({ force = false } = {}) {
    if (!force && this.token && Date.now() < this.token.expiresAt) return this.token.value;
    if (this.pendingToken) return this.pendingToken;
    this.pendingToken = (async () => {
      const form = new URLSearchParams({ grant_type: 'password', username: this.username, password: this.password, scope: this.scope });
      const { res, body } = await this.#request('/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
        body: form.toString(),
      });
      if (!res.ok || !body?.access_token) {
        throw new EZFacilityError(`EZFacility login failed: ${body?.error_description || body?.error || res.status}`, { status: res.status, code: body?.error, body });
      }
      const ttl = Number(body.expires_in) || 1199;
      this.token = { value: body.access_token, expiresAt: Date.now() + Math.max(30, ttl - 60) * 1000 };
      return this.token.value;
    })().finally(() => { this.pendingToken = null; });
    return this.pendingToken;
  }

  /** GET a /v2 resource. Retries once with a fresh token on 401. */
  async get(path, { page } = {}) {
    for (let attempt = 0; ; attempt++) {
      const token = await this.getToken({ force: attempt > 0 });
      const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` };
      if (page !== undefined) headers['ez-page-number'] = String(page);
      const { res, body } = await this.#request(path, { headers });
      if (res.status === 401 && attempt === 0) continue;
      if (!res.ok) {
        const code = body?.ErrorCode || body?.error;
        throw new EZFacilityError(`EZFacility ${res.status} on GET ${path}: ${body?.Message || code || 'request failed'}`, { status: res.status, code, body });
      }
      return { body, headers: res.headers };
    }
  }

  /** GET every page of a paged endpoint and return one array. */
  async getAll(path, { maxPages = 50 } = {}) {
    const out = [];
    for (let page = 1; page <= maxPages; page++) {
      const { body, headers } = await this.get(path, { page });
      const rows = Array.isArray(body) ? body : body ? [body] : [];
      out.push(...rows);
      const totalPages = Number(headers.get('ez-total-pages'));
      const perPage = Number(headers.get('ez-per-page')) || 100;
      if (totalPages ? page >= totalPages : rows.length < perPage) break;
    }
    return out;
  }

  /* ---------- Endpoints the site uses ---------- */

  /** GET /v2/user/locations (realm:tms) */
  getLocations() { return this.get('/v2/user/locations').then(r => r.body || []); }

  /** GET /v2/sessionCategories/all/locationID={locationID} (paged, realm:none) */
  getSessionCategories(locationId) { return this.getAll(`/v2/sessionCategories/all/locationID=${encodeURIComponent(locationId)}`); }

  /** GET /v2/schedule/{locationID}/{startDate}/{endDate} (paged, realm:tms). Dates as YYYY-MM-DD; range ≤ 1 year. */
  getSchedule(locationId, startDate, endDate) {
    return this.getAll(`/v2/schedule/${encodeURIComponent(locationId)}/${startDate}/${endDate}`);
  }
}
