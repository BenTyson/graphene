// authFetch.js — the single interception point for API authentication.
//
// WHY THIS EXISTS (D-011, live production outage)
// -----------------------------------------------
// The server has required `Authorization: Bearer <jwt>` on every mutating /api
// request since 2025-12-04, and after W1-AUTH-GUARD lands it will require one on
// reads too (D-006). The client never sent that header, so every create/update in
// the app failed with "Failed to save record: Access token required".
//
// There are 219 `fetch(` call sites in client/src/js. Editing them individually is
// unmergeable and would miss cases, so this module wraps `window.fetch` once and
// every existing call site is fixed without being touched.
//
// MEASURED, NOT ASSUMED — `fetch` really is the only transport:
//   - `grep -rn "XMLHttpRequest\|axios\|sendBeacon\|EventSource" client/src/js` → 0 hits.
//   - No `href="/api/..."` or `src="/api/..."` anywhere in client/src or the two
//     HTML entries → 0 hits.
//   - Every fetch in the client targets a relative `/api/...` path or
//     `${window.location.origin}/api/...`. There is no cross-origin fetch at all;
//     Cloudinary uploads go through the server as multipart to `/api`.
// The one exception is `downloadCSV` in services/api.js, which used an `<a download>`
// navigation — an anchor cannot carry a header, so no wrapper can fix it. It is
// rewritten to fetch-to-blob and uses `getAuthHeader()` from this module.
//
// THIS MODULE HAS NO SIDE EFFECTS ON IMPORT. Installing the wrapper is an explicit
// call to `installAuthFetch()`, made from exactly one place:
// services/installAuthFetch.js, which is the first import of app-refactored.js.
// That keeps the wrapper out of the proforma-embed entry entirely (see below).

// Storage keys, kept identical to AuthService.getStoredToken()
// (services/AuthService.js:32-34). The token is read live on every request rather
// than cached, so logging in or out takes effect without a page reload.
const TOKEN_KEY = 'authToken';

// Same-origin API prefix this wrapper is responsible for.
const API_PREFIX = '/api';

// The proforma share endpoints authenticate by share token in the URL, not by JWT
// (server/routes/proformaShare.js:25 reads only req.params.token), and the server's
// global /api guard exempts them. An external investor viewing the embed has no JWT
// so the wrapper would be inert there anyway — but skipping the path explicitly
// means a logged-in admin previewing the embed on the same origin never leaks their
// JWT to it either.
const SHARE_PREFIX = '/api/proforma/share';

/**
 * Read the stored JWT, or null. Never throws: storage access can fail in a
 * sandboxed iframe or with cookies/site-data blocked, and a request path must not
 * be able to throw on the way out.
 */
export function getAuthToken() {
  try {
    return (
      window.localStorage.getItem(TOKEN_KEY) ||
      window.sessionStorage.getItem(TOKEN_KEY) ||
      null
    );
  } catch (_e) {
    return null;
  }
}

/**
 * `{ Authorization: 'Bearer <jwt>' }` when a token exists, otherwise `{}`.
 * Spread-safe in both cases — the same shape AuthService.getAuthHeader() returns.
 */
export function getAuthHeader() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * True only for a same-origin request whose path sits under `/api`, excluding the
 * share-token endpoints.
 *
 * Resolved against `location.href` so a relative path, an absolute path, and a
 * fully-qualified same-origin URL are all judged the same way — and so anything
 * pointing at another host (which nothing in this app currently does, but a future
 * Cloudinary or third-party call would) is rejected before a token is attached.
 */
function isSameOriginApiUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl), window.location.href);
  } catch (_e) {
    return false; // unparseable → fail closed, send it unmodified
  }
  if (url.origin !== window.location.origin) return false;

  const path = url.pathname;
  const underApi = path === API_PREFIX || path.startsWith(API_PREFIX + '/');
  if (!underApi) return false;

  const isShare = path === SHARE_PREFIX || path.startsWith(SHARE_PREFIX + '/');
  return !isShare;
}

/**
 * Pull the request URL out of whatever `fetch`'s first argument is.
 * Strings and URL objects are the only forms used in this codebase; Request is
 * handled for robustness.
 */
function urlOf(input) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  if (typeof Request !== 'undefined' && input instanceof Request) return input.url;
  return String(input && input.url ? input.url : input);
}

/** Does this request already carry an Authorization header? */
function alreadyAuthorized(input, init) {
  try {
    if (init && init.headers && new Headers(init.headers).has('Authorization')) return true;
    if (
      typeof Request !== 'undefined' &&
      input instanceof Request &&
      input.headers.has('Authorization')
    ) {
      // Only counts if the init headers didn't replace them wholesale.
      if (!init || !init.headers) return true;
    }
  } catch (_e) {
    // A malformed headers value — let fetch itself report it, don't mask it here.
    return true;
  }
  return false;
}

/**
 * Install the wrapper on `window.fetch`. Idempotent: calling it twice is a no-op,
 * so a second import path can never double-wrap.
 *
 * The wrapper is deliberately ADDITIVE ONLY. It attaches one header and changes
 * nothing else — no Content-Type (multipart uploads in api.js rely on the browser
 * setting their own boundary), no credentials, no retry, and no 401 handling. In
 * particular it does NOT clear auth and reload on 401, the way
 * AuthService.authenticatedFetch does: a single unrelated 401 must not be able to
 * reload the whole app out from under an unsaved form.
 *
 * @returns {boolean} true if this call installed it, false if already installed.
 */
export function installAuthFetch() {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return false;
  if (window.__grapheneAuthFetchInstalled) return false;

  const nativeFetch = window.fetch.bind(window);

  const wrappedFetch = function authFetch(input, init) {
    // Anything that isn't a same-origin /api call — or that already carries its own
    // Authorization header — goes straight through, untouched.
    if (!isSameOriginApiUrl(urlOf(input)) || alreadyAuthorized(input, init)) {
      return nativeFetch(input, init);
    }

    const token = getAuthToken();
    if (!token) return nativeFetch(input, init); // logged out: pure no-op

    try {
      if (typeof Request !== 'undefined' && input instanceof Request && !init) {
        const req = new Request(input);
        req.headers.set('Authorization', `Bearer ${token}`);
        return nativeFetch(req);
      }
      const headers = new Headers((init && init.headers) || undefined);
      headers.set('Authorization', `Bearer ${token}`);
      return nativeFetch(input, { ...(init || {}), headers });
    } catch (_e) {
      // Never let header injection break a request that would otherwise work.
      return nativeFetch(input, init);
    }
  };

  window.fetch = wrappedFetch;
  window.__grapheneAuthFetchInstalled = true;
  return true;
}

export default { getAuthToken, getAuthHeader, installAuthFetch };
