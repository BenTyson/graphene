# CHIP-W1-AUTH-GUARD

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:** `server/index.js`, `server/routes/auth.js`, `notes/W1-AUTH-GUARD.md`
- **Wave:** 1 (re-run)
- **Base:** branch `staging`, HEAD `c9486de`, shared working directory (D-010)

## What I was asked to do

Implement D-006: every `GET /api/*` must carry a valid JWT. Today `server/index.js` returns
`next()` for any GET before auth runs, so 23 of 33 route files are wide open to unauthenticated
reads. Preserve: proforma share-token flow (no JWT), `/api/auth/*`, `/api/health`,
`/api/email/cron/*` (secret-gated). THIRD_PARTY keeps read access *inside* the authenticated path.
Also report (not change) `/uploads` and `/news-images` static exposure.

## What I did

<!-- filled in as I go -->

### Reconnaissance (recorded before implementing)

**Baseline reproduction, local server on :3011, HEAD `c9486de`, no credentials:**

```
=== BASELINE (before change) — unauthenticated ===
200  26861B  GET /api/graphene
200  49659B  GET /api/biochar
200  4305B   GET /api/shipments
200  88829B  GET /api/dashboard/stats
401  49B     GET /api/tasks
401  49B     GET /api/pipeline/contacts
401  49B     GET /api/users
401  49B     GET /api/proforma/scenarios
200  110B    GET /api/health
200  57903B  GET /api/graphene/export/csv
=== unauthenticated POST ===
401  POST /api/biochar   {"success":false,"error":"Access token required"}
```

D-006's defect is reproduced exactly. The four already-401 GETs are routers that
self-enforce (`tasks.js`, `pipeline.js`, `users.js`, `proforma.js`).

**THE BLOCKING DISCOVERY — the client does not send a JWT on most requests.**

`client/src/js/services/api.js` has two request helpers and neither attaches a token:

- `api.js:16-22` `jsonRequest()` — `headers: { 'Content-Type': 'application/json' }`, no `Authorization`.
- `api.js:28-36` `downloadCSV()` — builds an `<a download href="/api/...">` and clicks it.
  A link navigation **cannot carry an Authorization header at all.**

and the bulk of reads are bare `fetch('/api/...')` with no second argument at all
(`api.js:43,48,62,67,83,91,97,...`; `app-refactored.js:1194,1327,3149,3157,3277,3290,3385,3408,...`).

Only the newer service groups (tasks, pipeline, goals, tags, proforma, users, email)
spread `...window.authService?.getAuthHeader()`. Measured: **62** occurrences of
`getAuthHeader` across `client/src/js`, against **237** `/api/` fetch call sites.

There is no global `fetch` interceptor — grepped `client/src/js/**` and `client/index.html`
for `window.fetch =`, `originalFetch`: zero hits.

Consequence: enforcing JWT on `GET /api/*` in `server/index.js` alone **white-screens the app**
for logged-in users. The client change is in files I do not own
(`client/src/js/services/api.js`, `client/src/js/app-refactored.js`), so it goes to
`## Handoff` and the server change **must not merge without it**.

**Side discovery, pre-existing, unrelated to my change:** because `jsonRequest()` sends no
token, `POST/PUT/DELETE` on biochar, shipments, compound-batches, mcb, etc. are *already*
401-ing today against the guard added in `b173a60` (2025-12-04). See Reflections.

### The two changes I made

**1. `server/index.js` — the guard itself.**

Replaced the `if (req.method === 'GET') return next();` bypass. The shape is now:

1. exempt-prefix check (unchanged position — still *above* everything else, so
   `/proforma/share` still reaches its own token router);
2. `authenticateToken` for everything else;
3. *inside* the authenticated callback, `GET`/`HEAD` pass through for every role;
4. everything else additionally passes `requireEditAccess`.

Three deliberate sub-decisions, each of which the Command Center can reverse in one line:

- **Exempt list shrank from 5 prefixes to 4** — `/users` was removed. Every route in
  `server/routes/users.js` already applies `authenticateToken` + `requireSuperAdmin` itself
  (`users.js:14,66,160,255,302`), so no role's outcome changes: `SUPER_ADMIN` is never
  `THIRD_PARTY`, so the newly-interposed `requireEditAccess` on mutations can never reject a
  request `requireSuperAdmin` would have allowed. Verified below: `GET /api/users` still 200s
  with a SUPER_ADMIN token. The gain is that a future route added to that file without
  middleware fails closed — which is exactly how the other 23 route files ended up public.
- **Matching is now segment-aware** (`p === path || path.startsWith(p + '/')`) instead of
  `startsWith(p)`. Under the old rule `/api/authfoo`, `/api/healthz` and
  `/api/proforma/shareable` were all exempt. None of them is a real route today, so this
  closes a latent trap rather than a live hole. Measured below.
- **`HEAD` is treated as a read.** Express routes `HEAD` to `GET` handlers, so the old code
  sent `HEAD` down the `requireEditAccess` branch and blocked THIRD_PARTY from it. Now it
  behaves like `GET`.

I did **not** reorder any route registration (`app.use('/api/proforma/share', …)` still
precedes `app.use('/api/proforma', …)`), and I did not touch the early `app.get('/api/health')`.

**2. `server/routes/auth.js` — bad/expired token now returns 401, not 403.**

`authenticateToken` returned `401` for a *missing* token but `403` for an invalid or expired
one. 403 means "authenticated but not permitted" — that is what `requireEditAccess` and
`requireSuperAdmin` correctly return. Before this chip, an expired token only ever affected
writes; now it affects every read in the app, so the client needs to be able to tell
"log in again" from "you're not allowed". Responses also gained a `code` field
(`TOKEN_MISSING` / `TOKEN_EXPIRED` / `TOKEN_INVALID`); the `success`/`error` fields are
unchanged, so this is additive.

Checked before changing: exactly one place in the whole client branches on an auth status
code — `client/src/js/services/authService.js:165` (`if (response.status === 401)`), and
nothing anywhere branches on 403. Grep: `grep -rn "403\|401" client/src/js --include="*.js"`
returns that single line.

## How I verified it

Lane A bar (CHIP-PROTOCOL.md §4 / D-007): build read, `node --check` on every changed file,
and the change actually exercised over HTTP with observed values.

Server: `PORT=3011 node server/index.js`, branch `staging`, against the live Railway DB
(reads only — D-005).

**Token minting, and why not `/api/auth/login`.** `POST /api/auth/login` executes
`prisma.user.update({ data: { lastLogin: new Date() } })` (`auth.js:70-73`). That is a
database write, which D-005 forbids. So tokens were minted locally with `jwt.sign` using
`JWT_SECRET` from `.env`, over user rows read with `findMany`/`findFirst`.

**Measured:** the database contains active users with exactly one distinct role —
`["SUPER_ADMIN"]`. There is no THIRD_PARTY or INVESTOR row to log in as, and creating one is
a write. The THIRD_PARTY and INVESTOR tokens below therefore reuse a real active user id but
carry the role under test in the JWT claim. That is precisely what the code under test reads:
`requireEditAccess` branches on `req.user.role`, and `req.user` is the verified JWT payload
(`auth.js:188`). No DB role lookup happens anywhere in the guard path, so the middleware
behaviour is identical to a real THIRD_PARTY login. Stated as a limitation, not hidden.

### `node --check`

```
$ node --check server/index.js && echo "index.js OK" && node --check server/routes/auth.js && echo "auth.js OK"
index.js OK
auth.js OK
```

### Build

```
$ npx vite build --outDir ../dist-authguard
vite v5.4.19 building for production...
✓ 125 modules transformed.
../dist-authguard/proforma-embed.html                      2.08 kB │ gzip:   0.96 kB
../dist-authguard/index.html                              88.88 kB │ gzip:  12.25 kB
../dist-authguard/assets/ProformaService-Bv2z0a8R.js     283.22 kB │ gzip:  61.01 kB
../dist-authguard/assets/index-i60oBe3u.js             1,199.08 kB │ gzip: 183.62 kB
✓ built in 879ms
```
Both entries emitted (`index.html` + `proforma-embed.html`), so the multi-entry config is
intact. The >500 kB chunk warning is pre-existing and unrelated. Output went to
`dist-authguard/` at the repo root, matched by `.gitignore:9 dist-*/` (confirmed with
`git check-ignore -v`). No client file was rebuilt into a shared `dist/`.

### A. Unauthenticated `GET /api/*` — the D-006 target

Before (HEAD `c9486de`, unmodified) → after (this change):

| Path | before | after |
|---|---|---|
| `/api/graphene` | **200, 26 861 B** | **401** |
| `/api/biochar` | **200, 49 659 B** | **401** |
| `/api/shipments` | **200, 4 305 B** | **401** |
| `/api/graphene/export/csv` | **200, 57 903 B** | **401** |
| `/api/dashboard/production-metrics` | 200 (guard skipped all GETs) | **401** |
| `/api/health` | 200 | **200** (unchanged) |

Full after-run:

```
401  GET /api/graphene                {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/biochar                 {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/shipments               {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/dashboard/stats         {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/graphene/export/csv     {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/mcb                     {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/bet                     {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/news                    {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/ai-insights/dashboard   {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/knowledge-base          {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/analysis/chart-data     {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/data/graphene/G-1       {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/users                   {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/tasks                   {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
401  GET /api/proforma/scenarios      {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
```

The graphene CSV export — the specific production leak D-006 cites, all 242 records — went
from 57 903 bytes of data to a 401.

### B. Authenticated GET still returns real data (SUPER_ADMIN)

```
200     26861B  GET /api/graphene              {"success":true,"data":[{"id":"cmfj4npqv00058ucpoqligv1i","experimentN…
200     49659B  GET /api/biochar               [{"id":"cmeq7w88m005fe12ugdllfbzy","experimentNumber":"TB1170","reacto…
200      4305B  GET /api/shipments             [{"id":"cmf4anjus000zhx77guvwwm9z","shipmentNumber":"SHIP-2025-09-4833…
200     57903B  GET /api/graphene/export/csv   Experiment #,Title Note,Oven,Quantity (g),Biochar Experiment,Base Amou…
200       650B  GET /api/mcb                   [{"id":"cmhpaqd45000114mmm7d585eb","mcbNumber":"test","totalRecoveredA…
200       276B  GET /api/users                 {"success":true,"data":{"users":[{"id":"cmfke8k9r0000xzwnk2aqai9t",…
200         2B  GET /api/tasks                 []
200       335B  GET /api/proforma/scenarios    [{"id":"cmp65rbbc0001m615bg8evusx","name":"2025 Projections",…
200       257B  GET /api/auth/me               {"success":true,"data":{"user":{"id":"cmfke8k9r0000xzwnk2aqai9t",…
```

Byte counts are **identical** to the unauthenticated baseline (26 861 / 49 659 / 4 305 /
57 903), i.e. authenticated reads return exactly the same payloads as before — the guard
gates access, it does not filter content. `GET /api/users` still 200s despite losing its
exemption, which is the specific regression risk of that sub-decision.

### C. THIRD_PARTY keeps read access, still cannot write

```
200  26861B  GET  /api/graphene
200  49659B  GET  /api/biochar
200   4305B  GET  /api/shipments
200  88829B  GET  /api/dashboard/stats
200  57903B  GET  /api/graphene/export/csv

403  POST   /api/biochar/zzz  {"success":false,"error":"View-only access. Editing is not permitted for your account."}
403  PUT    /api/biochar/zzz  {"success":false,"error":"View-only access. Editing is not permitted for your account."}
403  DELETE /api/biochar/zzz  {"success":false,"error":"View-only access. Editing is not permitted for your account."}
403  PATCH  /api/biochar/zzz  {"success":false,"error":"View-only access. Editing is not permitted for your account."}
```

Read-through, write-blocked, and the reads are byte-identical to SUPER_ADMIN's. INVESTOR
(a third role, neither superadmin nor third-party) also reads: `200 26861B GET /api/graphene`.

### D. Proforma share flow — no JWT, and it must stay that way

The `ProformaShare` table currently holds **0 rows** (counted read-only). Minting a real share
token requires `POST /api/proforma/scenarios/:id/share`, which is a DB write — banned by D-005.
So, as the spawn prompt allows, the proof is by **routing**: the request must reach
`proformaShare.js` and be rejected by *its* token middleware, not by the global guard.

```
404  GET  /api/proforma/share/doesnotexist123   {"error":"Share not found"}
404  PUT  /api/proforma/share/doesnotexist123   {"error":"Share not found"}
-- contrast, same server, no JWT --
401  GET  /api/proforma/scenarios               {"success":false,"error":"Access token required","code":"TOKEN_MISSING"}
```

`{"error":"Share not found"}` is emitted only by `authenticateShareToken` at
`server/routes/proformaShare.js:40`, and its body shape (`{error}`, no `success` key) is
distinct from the global guard's (`{success,error,code}`). Both the GET and the **PUT** get
there with no `Authorization` header at all, so view *and* edit share links are unaffected.
The sibling master router 401s, so the master-safety invariant is intact.

Independently re-verified the ruling's client-side claim — the embed page touches exactly one
API path:

```
$ grep -n "/api/" client/src/js/proforma-embed.js
12://   2. GET /api/proforma/share/:token  (the token router — NOT the
17://      - mode 'edit' → Save calls PUT /api/proforma/share/:token, which writes
85:        const res = await fetch(`/api/proforma/share/${encodeURIComponent(this.shareToken)}`, {
124:       const res = await fetch(`/api/proforma/share/${encodeURIComponent(this.shareToken)}`, {
```

Two comment lines and two real call sites, both on the exempt prefix. D-006's claim holds.

### E. Exemption boundary

```
200  GET /api/auth/login          <!DOCTYPE html>…      (exempt; falls to SPA catch-all — no GET /login route)
401  GET /api/authfoo             TOKEN_MISSING          (was exempt under startsWith)
401  GET /api/proforma/shareable  TOKEN_MISSING          (was exempt under startsWith)
200  GET /api/health              {"status":"ok",…}
401  GET /api/healthz             TOKEN_MISSING          (was exempt under startsWith)
500  GET /api/email/cron/weekly   {"success":false,"error":"EMAIL_CRON_SECRET not configured"}
401  GET /api/emailx/cron         TOKEN_MISSING          (was exempt under startsWith)
```

The cron 500 is the proof that matters for that prefix: that message comes from
`server/middleware/cronAuth.js:8`, so the request reached `requireCronSecret` rather than the
JWT guard. `EMAIL_CRON_SECRET` is simply not set in this local `.env` — I did not add it
(the cron path stays secret-gated, not JWT-gated, exactly as before).

### F. Token quality, and the 401/403 change

```
401  EXPIRED  GET /api/graphene  {"success":false,"error":"Invalid or expired token","code":"TOKEN_EXPIRED"}
401  GARBAGE  GET /api/graphene  {"success":false,"error":"Invalid or expired token","code":"TOKEN_INVALID"}
```

(Both were 403 before this change.)

### G. Health, CORS preflight, HEAD

```
200  GET     /api/health   (no JWT)   {"status":"ok","timestamp":"2026-08-22T01:17:22.422Z","port":"3011",…}
204  OPTIONS /api/graphene (no JWT)   ← handled by cors() at index.js:106, never reaches the guard
200  HEAD    /api/graphene (THIRD_PARTY token)
401  HEAD    /api/graphene (no JWT)
```

Browser CORS preflight is unaffected: `cors()` is registered at `index.js:106`, ahead of the
`/api` guard at :155, and terminates OPTIONS itself with 204. I deliberately did **not** add
an `OPTIONS` bypass inside the guard — it would be dead code today and a bypass tomorrow.

### H. Working tree stayed inside my ownership

```
$ git status --short
 M client/src/js/data/testMatrix.js     ← sibling W1-MATRIX-WRITE
 M server/index.js                      ← mine
 M server/routes/auth.js                ← mine
?? notes/W1-APP-DEDUPE.md   notes/W1-AUTH-GUARD.md   notes/W1-CHECK-SUITE.md
?? notes/W1-MATRIX-WRITE.md notes/W1-RECON-DEAD.md   scripts/check/
```

Two source files modified, both owned. No commits, no branch operations, no `prisma db push`,
no DB writes.

## Measurements

| What | Value | How |
|---|---|---|
| `/api/` fetch call sites in `client/src/js` | **237** | `grep -rEno "fetch\(\s*[\`'\"][^\`'\"]*/api/…"` |
| …of which attach a token (`getAuthHeader`) | **62** | `grep -rn "getAuthHeader" client/src/js \| wc -l` |
| CSV export endpoints reached by `<a download>` (cannot carry a header) | **13** | `grep -n "downloadCSV(" client/src/js/services/api.js` |
| Server route files with zero auth references | **23 of 33** | per-file grep for `authenticateToken\|requireSuperAdmin\|requireEditAccess\|requireCron` |
| Distinct active user roles in the live DB | **1** (`SUPER_ADMIN`) | read-only `prisma.user.findMany` |
| `ProformaShare` rows in the live DB | **0** | read-only `prisma.proformaShare.findMany` |
| Bytes leaked by `GET /api/graphene/export/csv` with no credentials, before | **57 903** | `curl -w '%{size_download}'` |
| Files under `uploads/` | 6 subdirs (`bet-`, `conductivity-`, `raman-`, `sem-`, `tem-`, `update-reports`) + `temp` | `ls` |
| Files under `public/news-images/` | **25** | `ls` |

No new numeric threshold was introduced by this change — the guard is boolean.

## Draft wiring

None. Both files I changed are server-side; `client/src/js/app-refactored.js` and
`client/index.html` need no block from me. The client work is a real code change, not wiring,
so it is under Handoff below.

## Draft for shared docs

**Doc:** `CLAUDE.md`, "Auth & Roles" section. **Replace** the current paragraph
(`- THIRD_PARTY: view-only. All POST/PUT/DELETE blocked by global middleware. …`) with:

> - **All `/api/*` requests require a valid JWT — reads included** (DECISIONS.md D-006).
>   The global guard in `server/index.js` authenticates first, then applies
>   `requireEditAccess` to mutating methods only. `GET`/`HEAD` pass for every authenticated
>   role.
> - Exempt from the JWT guard, and only these: `/api/auth/*` (login must be reachable;
>   `/auth/me` guards itself), `/api/health`, `/api/email/cron/*` (gated by
>   `EMAIL_CRON_SECRET`), `/api/proforma/share/*` (gated by share token). The exempt check
>   runs *before* the JWT check, and the `/proforma/share` entry is load-bearing for the
>   investor embed page — moving it below the JWT check breaks every share link.
> - Exempt matching is segment-aware, so `/api/authfoo` is **not** exempt.
> - THIRD_PARTY: view-only. Reads allowed once authenticated; all POST/PUT/DELETE/PATCH
>   blocked by the global middleware.
> - `authenticateToken` returns **401** for a missing, invalid, or expired token, with a
>   `code` of `TOKEN_MISSING` / `TOKEN_INVALID` / `TOKEN_EXPIRED`. 403 is reserved for
>   authenticated-but-not-permitted (`requireEditAccess`, `requireSuperAdmin`).
> - INVESTOR: no Tasks/Goals tab access. SUPER_ADMIN: full access + user management.

**Doc:** `CLAUDE.md`, "Gotchas". **Add:**

> - The client's legacy API layer (`client/src/js/services/api.js`, plus raw `fetch('/api/…')`
>   calls in `app-refactored.js`) does not attach a JWT. Since D-006 every `/api` request
>   needs one, so new client code must go through the token-injecting `fetch` wrapper rather
>   than calling `fetch` bare.

## Handoff: changes needed in files I do not own

**These are not optional. The server change in this chip must not merge without at least
Handoff 1 and Handoff 2, or the app breaks for every logged-in user.** Both are in
`client/src/js/services/api.js`, owned this wave by nobody — `app-refactored.js` is
W1-APP-DEDUPE's, and `api.js` is simply not on my list.

---

### Handoff 1 — install a token-injecting `fetch` wrapper (`client/src/js/services/api.js`)

Rationale for a wrapper rather than editing call sites: there are **237** `/api/` call sites
and only 62 carry a token. Editing 175 of them by hand, across two files owned by different
chips, is exactly the MOVE-shaped work CHIP-PROTOCOL.md §6 says to serialize. One wrapper
covers `api.js` **and** the raw `fetch('/api/graphene?…')` calls in `app-refactored.js`,
because ES module imports are evaluated before the importing module's body runs, so the
side-effect installs before any call fires.

**Target:** `client/src/js/services/api.js`
**Anchor:** immediately after `const API_BASE = '/api';` (line 4), before `handleResponse`.

```js
// ---------------------------------------------------------------------------
// Token-injecting fetch wrapper (DECISIONS.md D-006).
//
// Every /api/* request now needs a JWT — reads included. Most call sites in this
// file, and all the raw fetch('/api/...') calls in app-refactored.js, were written
// when GETs were public and pass no Authorization header. Rather than edit ~175
// call sites, patch fetch once, here: this module is imported before any of them
// runs, and ES module evaluation order guarantees the patch is in place first.
//
// Deliberately does NOT redirect or reload on 401. The login screen itself lives
// in the same SPA and fires /api calls while logged out; reloading on 401 would
// be an infinite loop. Session recovery belongs in one place — see Handoff 3.
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined' && !window.__apiAuthFetchInstalled) {
  window.__apiAuthFetchInstalled = true;
  const nativeFetch = window.fetch.bind(window);

  const isApiUrl = (url) =>
    url.startsWith('/api/') || url.startsWith(`${window.location.origin}/api/`);

  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    if (!isApiUrl(url)) return nativeFetch(input, init);

    // Read from storage on every call, not once at install time, so a login or
    // logout mid-session takes effect immediately.
    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) return nativeFetch(input, init);

    const opts = init || {};
    const headers = new Headers(
      opts.headers || (input instanceof Request ? input.headers : undefined)
    );
    // Never clobber an explicit header — the share embed and any future
    // token-authenticated caller must keep whatever it set.
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return nativeFetch(input, { ...opts, headers });
  };
}
```

Notes for whoever applies it:
- Only `Authorization` is set, so `FormData` bodies keep their browser-generated
  `Content-Type: multipart/form-data; boundary=…`. Do not add a `Content-Type` here.
- Harmless for `/api/proforma/share/:token`: `authenticateShareToken`
  (`server/routes/proformaShare.js:25`) reads `req.params.token` and ignores headers entirely.
  Verified — the embed page will keep working whether or not a stale JWT is in storage.
- The storage keys match `authService.getStoredToken()` (`authService.js:33`) exactly.

### Handoff 2 — `downloadCSV` must fetch-and-blob, not navigate

**This is a functional regression the server change causes and Handoff 1 does *not* fix.**
`downloadCSV` builds an `<a download href="/api/…">` and clicks it. A link navigation cannot
carry an `Authorization` header — no wrapper can help. All **13** CSV exports (biochar,
graphene, bet, conductivity, tem, particle-size, xrd, xps, raman, compound-batches,
micronization, mcb, shipments) will 401 after this chip merges unless this lands.

**Target:** `client/src/js/services/api.js`
**Anchor:** replaces the existing `const downloadCSV = (path, params) => { … };` (lines 28-36).

```js
// Helper for CSV downloads.
// Fetches the CSV as a blob rather than navigating to it: since D-006 the export
// endpoints require a JWT, and a plain <a href> navigation cannot send one. The
// fetch below goes through the token-injecting wrapper above; the resulting blob
// is handed to a transient <a download> the same way as before.
const downloadCSV = (path, params) => {
  const query = params ? params.toString() : '';
  const url = `${API_BASE}${path}${query ? `?${query}` : ''}`;
  return fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(
          res.status === 401 ? 'Your session has expired. Please log in again.'
                             : `Export failed (HTTP ${res.status})`
        );
      }
      // Keep honouring the server's Content-Disposition filename.
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
      const filename = match ? decodeURIComponent(match[1]) : 'export.csv';

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    })
    .catch((err) => {
      // Callers are `exportCSV: () => downloadCSV(...)` and ignore the return
      // value, so an uncaught rejection here would be silent. Surface it.
      console.error('CSV export failed:', err);
      alert(err.message);
    });
};
```

Confirmed the servers do set the header, e.g. `server/routes/graphene.js:783`
`res.setHeader('Content-Disposition', 'attachment; filename="graphene_export.csv"')`.
Same-origin, so the header is readable without a CORS expose list.

### Handoff 3 — session-expiry handling (recommended, not blocking)

With reads now authenticated, an expired token turns every request into a 401 instead of
silently continuing to work. `authService.authenticatedFetch` (`authService.js:151-176`)
already handles 401 by `clearAuth()` + `window.location.reload()`, but almost nothing uses it.

Do **not** move that reload into the Handoff 1 wrapper — the login screen is part of the same
SPA and fires `/api` calls while logged out, so a blanket reload-on-401 is an infinite loop.
The safe shape is: on a 401 whose body carries `code === 'TOKEN_EXPIRED'` or
`'TOKEN_INVALID'` (i.e. a token was sent and rejected — never `TOKEN_MISSING`), call
`window.authService.clearAuth()` and show the login view. Those `code` values are emitted by
`server/routes/auth.js` as of this chip.

### Handoff 4 — pre-existing, independent of D-006: writes send no token either

`jsonRequest` (`api.js:16-22`) sends no `Authorization` header, so **`POST`/`PUT`/`DELETE` on
biochar, shipments, compound-batches, mcb, and the other `jsonRequest` callers have been
401-ing since `b173a60` (2025-12-04)**, when the mutation guard was added. Reproduced:
`POST /api/biochar` → `401 {"success":false,"error":"Access token required"}` on the
*unmodified* base, before any change of mine. Handoff 1 fixes this as a side effect. Someone
should confirm with the user whether those tabs' create/edit buttons are known-broken in
production — if they are not, my model of the client is wrong somewhere and Handoff 1 needs
re-examining before it ships.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| blocker | `GET /api/*` required no auth; 242 graphene records (57 903 B) served to an anonymous caller | `server/index.js:165-168` | **fixed here** |
| blocker | Client sends no JWT on ~175 of 237 `/api` call sites, so the fix above white-screens the app on its own | `client/src/js/services/api.js:16-22`, raw `fetch` in `app-refactored.js:1194,1327,3149,…` | left, why: not owned — **Handoff 1**, must merge together |
| blocker | All 13 CSV exports use `<a download href>`, which can never carry an auth header — they 401 after this change | `client/src/js/services/api.js:28-36` | left, why: not owned — **Handoff 2**, must merge together |
| blocker | Production report PDFs (SEM/BET/Raman/TEM/XRD/XPS) are on unsigned public Cloudinary delivery URLs — no auth, no expiry, survives this fix entirely | `server/utils/cloudinaryConfig.js:57` | left, why: needs its own ruling — proposed as `CHIP-CLOUDINARY-ACCESS` |
| high | `jsonRequest` sends no token, so biochar/shipment/mcb/compound-batch writes have been 401-ing since 2025-12-04 (`b173a60`) — pre-existing, not caused by me | `client/src/js/services/api.js:16-22` | left, why: not owned — **Handoff 4** |
| high | `/uploads` + `/news-images` served by `express.static` with no auth; no directory listing, no traversal, but any known URL is world-readable forever | `server/index.js:140,147` | reported not changed, per D-006 — proposed as `CHIP-STATIC-UPLOADS` |
| medium | `shouldUseCloudinary()` checks only `NODE_ENV === 'production'`, but the static-path logic treats `'staging'` as production too — so **staging writes uploads to the local Railway disk**, which is ephemeral | `server/utils/cloudinaryConfig.js:120-132` vs `server/index.js:126` | left, why: not owned |
| medium | Exempt matching used `startsWith`, so `/api/authfoo`, `/api/healthz`, `/api/proforma/shareable` bypassed the guard. No such route exists today; it was a latent trap | `server/index.js:161` | **fixed here** (segment-aware match) |
| medium | Invalid/expired token returned 403, conflating "not authenticated" with "not permitted"; now that reads need a token this makes expiry unrecoverable mid-session | `server/routes/auth.js:182` | **fixed here** (401 + `code`) |
| medium | `/users` was exempt from the global guard purely by prefix; it happens to self-enforce, but nothing made that true | `server/index.js:161` | **fixed here** (exemption removed; verified no role's outcome changes) |
| low | **D-006's own text is wrong in one detail:** `/api/dashboard/stats` is not a route. It returned 200 because the SPA catch-all served `index.html` — 88 829 B of HTML, byte-identical before and after. Real endpoints are `/api/dashboard/production-metrics`, `/inventory-by-location`, `/best-test-results`, `/recent-activity`, and those *were* genuinely open | `server/routes/dashboard.js:7,129,510,599`; ruling D-006 | reported — ruling should be corrected by the Integrator |
| low | The `/health` entry in the exempt list is unreachable: `app.get('/api/health')` at :115 answers before the guard at :155 | `server/index.js:115` | left deliberately — kept so the exemption survives a reorder |
| low | Dev static serving exposes `client/src/**` (raw JS) to anonymous callers; harmless today but it is the same "public by default" reflex | `server/index.js:131` | left, why: dev-only, out of scope |

### What I saw outside my scope

**The real exposure is bigger than D-006 describes, and the biggest part is not in this repo's
`/api` surface at all.** In production, `shouldUseCloudinary()` returns true and every uploaded
report goes to Cloudinary, delivered from
`https://res.cloudinary.com/<cloud>/<raw|image>/upload/v.../<folder>/<filename>.pdf`
(`server/utils/cloudinaryConfig.js:57`). That is the *unsigned public delivery* URL type — no
signature, no expiry, no access control. Closing `/api` does nothing to it. Worse, the path is
semi-structured: an environment folder plus the original lab filename, e.g.
`25-050404-2_TB1180B_RAMAN.pdf`, where `TB1180B` is an experiment number. Someone who learns
one experiment number can guess neighbours. I'd rank this above the `/uploads` item the ruling
asked me to report on.

**`/uploads` and `/news-images` — what I was asked to report, measured not assumed.**

| Question | Answer | Evidence |
|---|---|---|
| Reachable without auth? | **Yes.** | `GET /news-images/054b7e…gif` → `200`, `image/gif`, 48 405 B, no credentials |
| Directory listing? | **No.** | `GET /uploads/` → `404` ("File not found", 14 B, from the fallback at `index.js:140-144`). `GET /uploads/tem-reports/` → `404`. `express.static` has no `index.html` to serve and `autoindex` is off by default. |
| `/news-images/` listing? | **No**, but it is *not* 404 either — it falls through to the SPA catch-all and returns `index.html` (200, 88 829 B). Confusing, not a leak. | `curl -w '%{content_type}'` → `text/html`, body is the app shell |
| Path traversal? | **No.** | `/uploads/%2e%2e/.env` → `404`. `/uploads/../.env` → the SPA shell, because the client normalises `..` before sending. `express.static` rejects encoded traversal itself. |
| Paths guessable? | **Partly.** | Filenames are `` `${basename}_${Date.now()}${ext}` `` (`server/routes/tem.js:18-24`, same pattern in raman/updateReports/micronization). The basename is a human lab filename; the suffix is 13-digit epoch-ms. Brute-forcing one file over HTTP within a known day is ~8.6×10⁷ requests — impractical, but this is obscurity, not access control. Nothing expires, and a URL shared once works forever. |
| What is actually there? | 6 report categories + `temp`: `bet-reports`, `conductivity-reports`, `raman-reports`, `sem-reports`, `tem-reports`, `update-reports`; and 25 cached news images. Real content, e.g. `uploads/raman-reports/25-050404-2_TB1180B_RAMAN_1757036969143.pdf`. | `find uploads -type f` |

I did not change them, per D-006. My recommendation for the ruling: `/news-images` is cached
public press imagery and is fine as-is; `/uploads` holds customer-relevant characterisation
reports and should sit behind the same JWT, which is a three-line change (`app.use('/uploads',
authenticateToken, express.static(...))`) plus a client change so PDF `<iframe>`/`<a>` viewers
fetch as blobs — the same shape as Handoff 2, and the reason it needs its own chip.

**The client-side auth layer is the actual root cause here, not the server.** The server has had
a correct-shaped guard since 2025-12-04. What is missing is any single place where the client
attaches credentials. Three eras coexist in `api.js`: bare `fetch` (2024-era), `jsonRequest`
(no token), and `...window.authService?.getAuthHeader()` (2025-era, tasks/pipeline/goals/proforma).
Every new feature re-solved it, and the old features were never revisited. That is why 23 of 33
route files have no auth and why the writes in Handoff 4 have apparently been broken for eight
months without anyone filing it.

**`app.js` and `app-original.js` both still contain a full second copy of the CRUD logic**
(`client/src/js/app.js:347,523`, `app-original.js:347,523`) including their own `/api/*/export/csv`
URL building. If either is live, my Handoff 1/2 blocks miss it. W1-RECON-DEAD owns that
question this wave; I flag it because the auth fix's completeness depends on the answer.

### Risks in what I built

1. **The single largest risk is a partial merge.** If `server/index.js` ships without Handoff 1,
   every logged-in user gets a dead app — every tab empty, every read 401. This is not a subtle
   regression; it is total. The server change is correct in isolation and I verified it in
   isolation, and that is exactly the trap. If the Command Center cannot land the client change
   in the same merge, the safer sequencing is: land Handoff 1+2 **first** (they are no-ops
   against today's server, since sending an unnecessary header changes nothing), then land this.
2. **Removing `/users` from the exempt list is the one change whose safety I argued rather than
   exhaustively measured.** I verified `GET /api/users` still 200s with a SUPER_ADMIN token, and
   I read all five routes in `users.js` and confirmed each carries
   `authenticateToken + requireSuperAdmin`. What I did *not* do is exercise every one of those
   five endpoints, because four are writes (D-005). If `users.js` grows a route that a
   THIRD_PARTY is meant to POST to, my change would now 403 it before `requireSuperAdmin` runs.
   Revert is one array element.
3. **My THIRD_PARTY and INVESTOR evidence uses minted tokens, not real user rows**, because the
   database has only `SUPER_ADMIN` users and creating one is a write. The guard reads
   `req.user.role` straight from the verified JWT (`auth.js:188`) with no DB lookup, so the
   middleware path is genuinely identical — but a route that *itself* re-loads the user and
   re-checks the role would behave differently, and I did not survey all 33 files for that.
4. **The proforma share proof is a routing proof, not an end-to-end proof.** There are zero
   `ProformaShare` rows and minting one is a write. I showed that GET and PUT both reach
   `proformaShare.js`'s own 404 with no JWT, which is the exact thing my change could have
   broken. What remains unproven is the happy path with a real token, and specifically that an
   *edit-mode* PUT still writes. Anyone with write access should mint one share link on staging
   and load the embed page once before this reaches `main`.
5. **The 401-instead-of-403 change alters an externally visible contract.** Nothing in this repo
   branches on 403 (grepped), but I cannot see external consumers — a monitoring check or a
   partner script asserting 403 would now fail. It is a two-line revert if so.
6. **`HEAD` as a read is untested against real route handlers beyond `/api/graphene`.** Express
   maps HEAD to GET handlers; a handler that writes a body without checking the method is
   unaffected, but I only exercised one.

### Proposed follow-up chips

| Name | Job | Owns | Lane | Tier |
|---|---|---|---|---|
| `CHIP-CLIENT-AUTH-HEADER` | Apply Handoffs 1-3: token-injecting fetch wrapper, blob-based `downloadCSV`, session-expiry handling. **Must merge with, or before, this chip.** | `client/src/js/services/api.js`, `client/src/js/services/authService.js` | A | sonnet — the diff is written; it needs applying and driving in a browser |
| `CHIP-CLOUDINARY-ACCESS` | Decide and implement access control for report PDFs on Cloudinary: signed/expiring URLs or `type: authenticated` + a server-side proxy. Highest-severity item I found. Needs a ruling first — it changes how every stored asset URL is produced and may invalidate URLs already in the DB. | `server/utils/cloudinaryConfig.js`, `server/utils/fileUpload.js` | A | opus |
| `CHIP-STATIC-UPLOADS` | Put `/uploads` behind `authenticateToken` and adapt the client PDF viewers. Blocked on a ruling, per D-006's own "does not change them without a further ruling". | `server/index.js`, plus whichever client file renders report links | A | sonnet |
| `CHIP-STAGING-UPLOAD-TARGET` | Reconcile `shouldUseCloudinary()` (`production` only) with `isProduction` (`production` **or** `staging`), so staging stops writing uploads to an ephemeral disk. | `server/utils/cloudinaryConfig.js` | A | fable |
| `CHIP-AUTH-ROUTE-AUDIT` | Now that the global guard is the only thing protecting 23 route files, audit each for routes that need *more* than a token — `/api/seed-staging`, `/api/data-import`, `/api/news/refresh` are authenticated-but-any-role today, and `seed-staging` can clear tables. | notes only | B | opus |

That last one is the one I'd run next. This chip made every read require *a* token; it did not
make any read require the *right* token. `POST /api/seed-staging/clear` is now reachable by any
authenticated non-THIRD_PARTY user, which after this chip means "anyone with a login", and it
was equally true before — but D-006 closing the anonymous hole makes the remaining
inside-the-perimeter gap the next thing worth looking at.

### Harness improvements

**1. The spawn prompt's verification list assumed the fix was server-only, and it isn't.** It
told me to prove "authenticated GET still returns data" — which I did, with curl — and that
check passes *while the actual application is completely broken*, because the application does
not send the header curl sends. A chip that met its stated bar exactly would have shipped a
blocker. What caught it was reading `api.js` on a hunch, not any instruction. Suggested rule
for CHIP-PROTOCOL.md §4 Lane A: **when a change alters a request/response contract, verify from
the side that actually makes the request, not just with a hand-built one.** Curl proves the
server; only the client proves the feature.

**2. "Prove the share flow still works" was not achievable as written, and the conflict was
predictable at spawn time.** D-005 forbids DB writes; minting a share link is a DB write; the
table is empty. The prompt did anticipate this ("if you cannot get a real share token… prove
the routing instead"), which was genuinely useful and I used it. But the general pattern is
worth naming: **a wave that bans writes cannot ask chips to verify write-created state.** Either
seed the fixture before the wave (the Command Center can write; chips can't), or say up front
which proofs are routing-only. One pre-created share token on staging would have upgraded my
strongest remaining unknown into a fact.

**3. D-006 contains a factual error** (`/api/dashboard/stats`, findings table, low severity). It
does not change the ruling's conclusion — the real dashboard endpoints were open — but per
CHIP-PROTOCOL.md §6 *trust the repo over the notes*, I checked rather than cited, and the check
was worth it. Same class of error as the "25 tests" correction in D-008. Two rulings out of ten
have now had a wrong detail caught by the chip implementing them, which suggests the
quote-the-ruling rule is doing real work and should stay.

**4. `node` in a scratchpad directory cannot resolve the repo's `node_modules`** (ESM resolves
from the script's own location, and ignores `NODE_PATH`). `node --input-type=module < script.mjs`
run from the repo root works, because then the resolution base is cwd. Cost me one round-trip;
worth a row in CHIP-PROTOCOL.md §9's environment-traps table, since every chip that needs a
throwaway script hits it and chips may not create files in the repo.

**5. Model tier: opus was right, but for a reason the task description didn't predict.** The
code change itself is maybe 40 lines and a sonnet-class edit. What needed the tier was noticing
that the sanctioned verification was insufficient, and then reasoning about *which* half of a
two-sided contract to check. The prior aborted run's salvage patch is the control: its
server-side middleware is essentially the same as mine, and its comments are good — it
independently reached the segment-aware match, which I'd rate as the better idea of the two of
us — yet it shipped with no notes, no client analysis, and no handoff, so applying it would have
taken the app down. Same tier, same code, opposite outcome, and the difference is entirely
CHIP-PROTOCOL.md §5a. That is the strongest evidence I have that the write-early rule is load-bearing.
