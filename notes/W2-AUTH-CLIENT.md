# CHIP-W2-AUTH-CLIENT

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:**
  - `client/src/js/services/api.js`
  - `client/src/js/app-refactored.js` (§8 shared wiring file — minimal changes only)
  - `client/index.html` (§8 shared wiring file — minimal changes only)
  - new modules under `client/src/js/services/`
  - `notes/W2-AUTH-CLIENT.md`
- **Wave:** 2

## What I was asked to do

Fix the live production outage recorded in D-011: every create/update on
admin.hgraphene.com returns `"Failed to save record: Access token required"` because the
client never sends an `Authorization` header. Three parts:

1. **One interception point** that attaches `Authorization: Bearer <token>` to same-origin
   `/api/*` requests when a token exists, and is inert otherwise. Not 237 individual edits.
2. **Rewrite `downloadCSV`** — an `<a download href>` navigation cannot carry a header, so no
   wrapper can fix the 13 CSV exports. Must become fetch → blob → object URL, preserving the
   server-supplied `Content-Disposition` filename and the optional `URLSearchParams` filters.
3. **Close the login-screen leak** at `client/index.html:26` — `x-init="init(); updateCurrentUser()"`
   on a div gated only by `x-show="isAuthenticated"`. Alpine initialises regardless of `x-show`,
   so 46 `/api/*` requests fire before login. Harmless today; 46 × 401 after W1-AUTH-GUARD merges.

Constraints: must be a no-op against today's server and correct against tomorrow's; must not
break the token-authenticated proforma embed; must never leak the JWT cross-origin; must not
break when there is no token (the login screen itself calls `/api/auth/login`).

## Status log

<!-- appended as I work -->

- [x] Read CHIP-PROTOCOL.md, DECISIONS.md (D-011, D-010, D-001, §8). Both present.
- [x] Notes skeleton created.
- [x] Recon: AuthService, api.js, call-site census, embed entry, share router, parked server change.
- [x] Baseline measured and saved (M1/M2/M3) **before** building — §5a. This is what survived the
      first kill (host machine slept). Nothing was re-measured after resume.
- [x] Wrapper implemented: `client/src/js/services/authFetch.js` (helpers + installer fn, **no
      import side effects**) + `client/src/js/services/installAuthFetch.js` (the single
      side-effecting import). `node --check` passes on both.
- [x] `downloadCSV` rewritten blob-based in `client/src/js/services/api.js` (+ a
      `filenameFromContentDisposition()` parser). `node --check` passes.
- [x] `x-init` gate fixed in `client/index.html`: main app div wrapped in
      `<template x-if="isAuthenticated && !isLoading">`, and the 8 `<script>` tags
      that sat *inside* that div moved below the closing `</template>` (template
      content is inert — scripts inside one never execute).
- [x] Verification complete: V1-V13 below. Build PASS, `npm run check` PASS, `node --check`
      PASS on all 4 JS files, wrapper behaviour proved on 9 URL shapes, 7 CSV exports run
      for real, embed proved untouched at runtime, login screen 82 -> 0 requests and
      0 console errors.
- [x] Notes finished, Reflections written. `git status` confirms only owned files changed.

## What I did

Three changes, plus two new files. Nothing outside my owned list was touched
(`git diff --stat` shows `client/src/js/data/testMatrix.js` moving — that is
W2-MATRIX-RULINGS working in the shared tree under D-010, not me).

### 1. One interception point — `client/src/js/services/authFetch.js` (new)

Wraps `window.fetch` once. Attaches `Authorization: Bearer <token>` to a request only
when **all** of these hold: same origin, path under `/api`, path not under
`/api/proforma/share`, a token exists in storage, and the request does not already
carry an `Authorization` header. Otherwise it calls through untouched.

Everything else about the request is left alone — **no** `Content-Type` (the multipart
uploads in `api.js` need the browser to set their own boundary), no `credentials`, no
retry, and deliberately **no 401 handling**. `AuthService.authenticatedFetch` clears auth
and calls `window.location.reload()` on a 401; putting that on the global request path
would let one unrelated 401 reload the app out from under an unsaved form. Out of scope
and, I think, actively wrong to do here — see Reflections.

The token is read from storage **per request**, not cached, so login and logout take
effect without a reload. Storage access is wrapped in try/catch: it throws in a
sandboxed iframe or with site data blocked, and the request path must not be able to
throw on the way out.

**Why a global `fetch` wrapper and not something narrower.** The brief said one
interception point; I checked whether one is actually sufficient, because a wrapper that
covers 95% of traffic is worse than useless — it hides the remaining 5% until production.
Measured:

- 219 `fetch(` call sites in `client/src/js` (`api.js` 153, `app-refactored.js` 21,
  `CardService.js` 17, `NewsService.js` 5, `DashboardService.js` 4, `AuthService.js` 4,
  `NewsTabFunctions.js` 3, `filterStateManager.js` 3, `FilterService.js` 2,
  `proforma-embed.js` 2, `DashboardTab.js` 2, `NewsWidget.js` 2, `DataPageLayout.js` 1).
- `grep` for `XMLHttpRequest`, `axios`, `navigator.sendBeacon`, `EventSource` → **0 hits**.
- `grep` for `href="/api/..."` / `src="/api/..."` in `client/src`, `client/index.html`,
  `client/proforma-embed.html` → **0 hits**.
- Every single client fetch targets a relative `/api/...` or
  `${window.location.origin}/api/...`. There is **no cross-origin fetch in the app at
  all** — Cloudinary uploads go through our own server as multipart to `/api`.

So `fetch` is the only transport for `/api`, with exactly one exception: the `<a download>`
in `downloadCSV`. Wrapper + that one rewrite = 100% coverage, and I can say that
categorically rather than hopefully.

### 2. `client/src/js/services/installAuthFetch.js` (new) — the only place it switches on

`authFetch.js` deliberately has **no import side effects**, because `api.js` needs
`getAuthHeader()` from it and `api.js` is reachable from the proforma embed entry
(`proforma-embed.js` → `ProformaService.js` → `api.js`). Installation is therefore a
separate one-line module, imported from exactly one place: **the first import statement of
`app-refactored.js`**.

That placement does two jobs. It guarantees the wrapper is installed before any other
module body runs — which matters, because `services/AuthService.js` fires
`GET /api/auth/me` at *import* time — and it keeps the wrapper out of the embed bundle
entirely, since the embed does not import `app-refactored.js`. Verified in the built
output and at runtime (V3, V4, V8).

### 3. `downloadCSV` rewritten blob-based — `client/src/js/services/api.js`

An anchor navigation carries no request headers, so no wrapper can reach the 13 CSV
exports. Now: `fetch` with `getAuthHeader()` → `response.blob()` → object URL →
synthetic anchor click. Preserved exactly: the server's `Content-Disposition` still names
the file (parsed by a new `filenameFromContentDisposition()` and applied to
`link.download`, because a `blob:` URL has no headers of its own to name it from); the
optional `URLSearchParams` still scopes filtered exports; and there is still no
popup-blocker exposure — no `window.open`, no new tab, same synthetic click on an anchor
this function creates.

Two deliberate behaviour changes: failures now surface (`console.error` + `alert`) instead
of silently saving the server's error body as a `.csv`, and the object URL is revoked on a
60s timer rather than immediately, because Chrome and Safari read the blob asynchronously
after the click and revoking in the same tick cancels the download.

### 4. The login-screen leak — `client/index.html`

The main app div was gated by `x-show="isAuthenticated && !isLoading"` while carrying
`x-init="init(); updateCurrentUser()"`. Alpine initialises an `x-show`-hidden element like
any other, so the whole app booted behind the login form. It is now wrapped in
`<template x-if="isAuthenticated && !isLoading">`, which genuinely defers.

**The trap in that change, which is why it is more than a one-word edit:** eight
`<script>` tags — Chart.js, the Chart date adapter, Marked, SortableJS, LoggingService,
`app-refactored.js`, and both Alpine plugins plus Alpine itself — physically sat *inside*
that div (old `client/index.html:1334-1358`, closing `</div>` at 1359). A `<template>`'s
content is inert and scripts inside one never execute, so wrapping without moving them
would have taken the entire application down, Alpine included. They moved below the
closing `</template>`, still last in `<body>`, still in the same relative order.

I checked tag balance before and after with comments stripped: `div 238/239` in both HEAD
and working tree (the file has one stray `</div>` that predates me), `template 12/12` →
`13/13`. My change adds exactly one balanced `<template>` pair and no div change.

## How I verified it

### V1 — Build (`npx vite build --outDir ../dist-authclient`) — PASS, output read

```
vite v5.4.19 building for production...
✓ 127 modules transformed.
../dist-authclient/proforma-embed.html                    2.08 kB │ gzip:  0.95 kB
../dist-authclient/index.html                            90.20 kB │ gzip: 12.99 kB
../dist-authclient/assets/proforma-embed-Gcp_pttr.js      7.76 kB │ gzip:  2.61 kB
../dist-authclient/assets/ProformaService-B5W7ByIu.js   285.37 kB │ gzip: 61.87 kB
../dist-authclient/assets/index-CRMkjU9d.js           1,203.11 kB │ gzip:184.94 kB
✓ built in 861ms
```
Both entries emit. The only warning is the pre-existing >500 kB chunk-size notice.

### V2 — `node --check` on every changed/created JS file — PASS

```
node --check client/src/js/services/authFetch.js         -> SYNTAX OK
node --check client/src/js/services/installAuthFetch.js  -> SYNTAX OK
node --check client/src/js/services/api.js               -> SYNTAX OK
node --check client/src/js/app-refactored.js             -> SYNTAX OK
```

### V3 — The wrapper is provably ABSENT from the proforma embed (hard constraint 1)

Checked in the built output, not assumed. `authFetch.js` is reached by `api.js`, which the
embed *does* pull in via `ProformaService.js`, so its *code* lands in the shared chunk — but
the *call* does not:

- Shared chunk `ProformaService-B5W7ByIu.js` **defines** `installAuthFetch` (minified `Qr`)
  and **exports** it as `i`. It never calls it.
- Embed entry `proforma-embed-Gcp_pttr.js` imports `{g as c, p as e, e as u, m as d}` from
  the shared chunk — `i` is **not** in that list. Grep for `__grapheneAuthFetchInstalled` in
  the embed entry chunk: **0 hits**.
- Index entry `index-CRMkjU9d.js` imports `{i as st, ...}` and calls **`st()` exactly once**.

`proforma-embed.html` loads only `proforma-embed-Gcp_pttr.js` + the shared chunk, never
`index-CRMkjU9d.js`. So on the embed page `window.fetch` stays native and
`/api/proforma/share/:token` is untouched. Belt-and-braces on top of that, `authFetch.js`
skips the `/api/proforma/share` prefix explicitly even when it *is* installed.

### V4 — The wrapper installs before anything can fetch (byte offsets in the built bundle)

```
installAuthFetch() call        at byte    1,435
AuthService GET /api/auth/me   at byte  629,050   -> installed first: True
AuthService POST /api/auth/login at byte 628,361  -> installed first: True
```
`AuthService` fires `GET /api/auth/me` at *import* time, so "first import of the entry module"
is not cosmetic. Alpine (a later `<script defer>`) runs later still.


### V5 — Login-screen requests: **82 → 0** (the number the brief asked for)

Same rig, same method as M1, no token in storage, single clean load in a **fresh tab**
(the console reader accumulates across navigations, so a fresh tab is the only honest read):

```
=== AFTER FIX: single load of login screen, no token ===
--- total /api requests: 0
```

Console on that fresh load — **zero errors**, the entire M2 baseline gone:
```
[debug] [vite] connecting...
[log]   🐞 LoggingService initialized - Debug: OFF
[debug] [vite] connected.
[log]   Loading app-refactored.js...
[log]   grapheneApp defined on window: function
```
That eliminates all 12 `Cannot read properties of null` TypeErrors, all 24
`Component Error Detected` reports, and both `/api/tags` 401s — they were all the
logged-out app div initialising.

Login screen renders correctly (screenshotted): logo, Username/Email, Password,
"Keep me signed in", Sign in, "© HGraphene 2026".

And the wrapper is live on the main app, evaluated in-page:
```js
{ fetchIsWrapped: true, installedFlag: true, local: null, session: null }
```
i.e. `window.fetch` is no longer native, `window.__grapheneAuthFetchInstalled` is set,
and it is doing nothing because there is no token — hard constraint 3.

### V6 — What the wrapper attaches, and to what (all three hard constraints)

Run in-page against the **real shipped module** (`import('/src/js/services/authFetch.js')`),
installed over a recorder standing in for native fetch, with the minted token in
`localStorage`. Nothing hit the network; the table is what the shipped code decided.

| # | URL passed to fetch | Authorization attached? | Why |
|---|---|---|---|
| 1 | `/api/biochar` | **yes** | same-origin /api |
| 2 | `/api/graphene/export/csv?species=Hemp` | **yes** | same-origin /api, query preserved |
| 3 | `http://localhost:5194/api/tasks` (POST) | **yes** | absolute same-origin URL resolves the same as a relative one |
| 4 | `https://res.cloudinary.com/demo/image/upload/x.png` | no | cross-origin — **hard constraint 2** |
| 5 | `https://api.example.com/api/steal` | no | cross-origin **even though the path starts with `/api`** — the check is origin-first, not a string prefix on the URL |
| 6 | `/api/proforma/share/SOME-SHARE-TOKEN` | no | explicit share-path skip — **hard constraint 1** |
| 7 | `/src/styles/main.css` | no | same-origin but not under /api |
| 8 | `/uploads/foo.pdf` | no | same-origin but not under /api |
| 9 | `new Request('/api/mcb')` | **yes** | `Request` objects handled, not just strings |

Row 5 is the one that would bite a naive implementation: `url.startsWith('/api')` is false for
it, but `url.includes('/api')` or a sloppy path extraction would leak the JWT to a third party.

With **no** token in storage the same wrapper attaches nothing at all (V5) — **hard constraint 3**.

### V7 — The header is what the outage was missing (curl against the local server)

```
POST /api/biochar   no Authorization header  -> HTTP 401  {"error":"Access token required"}
POST /api/biochar   Authorization: Bearer <minted>  -> HTTP 500 PrismaClientValidationError:
                                                       Argument `experimentNumber` is missing
```
The second call is the proof: it passes `authenticateToken` *and* `requireEditAccess` and gets
all the way to `prisma.biochar.create()`. I deliberately sent `{}` as the body so the write
**could not** succeed — Prisma rejected it on validation before touching the database, so no
record was created (D-005: chips do not write).

The token was minted with `jwt.sign` against `JWT_SECRET` from `.env`. `POST /api/auth/login`
was **not** called: it writes `lastLogin` at `server/routes/auth.js:70-73`.

### V8 — Proforma embed at runtime, including the worst case (hard constraint 1)

`http://localhost:5194/proforma-embed.html?token=...`, evaluated in the page:

```
{ fetchIsNative: true,
  fetchSource: "function fetch() { [native code] }",
  installedFlag: "undefined (never installed)",
  tokenInStorage: null }
```

Then the worst case — a logged-in admin opening the embed on the same origin, so their
JWT **is** in `localStorage`:

```
{ url: "/proforma-embed.html", tokenInStorage: true,
  fetchIsNative: true, installedFlag: "undefined (never installed)" }
```

`window.fetch` is still native and the installer still never ran. The embed cannot be
affected by this change.

### V9 — CSV exports, run for real through the rewritten `downloadCSV`

`HTMLAnchorElement.prototype.click` was patched to record instead of saving, so the real
`downloadCSV` ran end to end without the automated browser swallowing a file.

| Export | filename applied to `link.download` | href | data rows |
|---|---|---|---|
| biochar | `biochar_export.csv` | `blob:` | 77 |
| graphene (no params) | `graphene_export.csv` | `blob:` | 242 |
| shipments | `material_shipments.csv` | `blob:` | 7 |
| mcb | `mcb_export.csv` | `blob:` | 1 |
| particleSize | `particle_size_export.csv` | `blob:` | 1 |

All five filenames are exactly what the server's `Content-Disposition` sends (checked
against `res.setHeader('Content-Disposition', ...)` in the route files), and the bodies are
real CSV with correct header rows — e.g. biochar begins
`Experiment #,Reactor,Raw Material,Starting Amount (g),Acid A…`.

**The Graphene Species filter still scopes the export** — the specific thing the brief
asked me to prove. Driven with the exact params `buildGrapheneQueryParams()` builds for
each Species pill (`app-refactored.js:1310-1312`, values from `GrapheneTab.js:60-71`):

| Params | rows via `downloadCSV` | rows via `curl` (bypasses my code) |
|---|---|---|
| `species=all` | 242 | 242 |
| `species=species1` | **209** | 209 |
| `species=species2` | **33** | 33 |
| `species=species2&tested[]=bet` | **2** | 2 |
| no params at all | 242 | 242 |

209 + 33 = 242, and the browser numbers match curl exactly.

> **A wrong turn worth recording.** My first pass used `?species=Hemp` / `?species=Corn`
> and got 242 rows every time, and I briefly had it written down as "the server ignores
> the species filter on the export route". It does not. The valid values are
> `all` / `species1` / `species2` (`server/routes/graphene.js` `buildGrapheneWhere`), so
> `Hemp` correctly matched nothing and fell through to "no additional filtering". I made
> up the test input instead of reading it off the UI, and nearly filed a server bug that
> did not exist. The rule that caught it was checking the same thing a second way, with
> curl, against the actual handler.

### V10 — Error paths (these are new behaviour, so they get tested)

`window.fetch` stubbed to force each failure:

| Simulated server behaviour | Result |
|---|---|
| `401 {"error":"Access token required"}` — i.e. exactly what a stale token will produce once W1-AUTH-GUARD lands | alert `Export failed: Access token required`, **no file saved** |
| network failure (`TypeError: Failed to fetch`) | alert `Export failed: Failed to fetch`, **no file saved** |

Previously both of these saved the error body to disk as a `.csv`.

### V11 — The app still renders when the gate flips (the x-if white-screen risk)

The real risk of swapping `x-show` for `x-if` is that the app never appears. I cannot log
in (D-004/D-005: no user creation, no DB writes, and `POST /api/auth/login` writes
`lastLogin`), so I flipped the gate directly on the root Alpine component — which is what a
successful login does — and watched:

```
before: { appDivExists: false, sidebarExists: false }
after : { appDivExists: true,  sidebarExists: true,
          navButtons: 37, bodyTextLen: 1603 }
```

Screenshotted: full sidebar with all nav groups, breadcrumb "Dashboard", and the real
dashboard rendering live data — Total Produced 1,301.37 g over 242 experiments, Inventory
by Location (Curia Albany 930.81 g), Best Test Results (BET 2.09 × 10³ m²/g, Conductivity
18.80 S/cm). The footer shows "undefined undefined" for the user name, which is expected
and is an artefact of my flipping the flag without a real authenticated user, not of the
gate.

### V12 — `npm run check` — PASS

```
  PASS    self-test (does the checker still work?)        39ms
  PASS    syntax (node --check)                          383ms
  PASS    relative import resolution                      68ms
  REPORT  duplicate object keys                           69ms
  PASS    build (vite build)                              1.0s
check PASSED in 1.6s.
```

### V13 — The lifecycle change `x-if` introduces, tested rather than reasoned about

`x-if` moves `init()` from page load to login. `init()` registers a `window` listener for
`auth:login` at `app-refactored.js:1237`, but `AuthWrapper.handleLogin()` dispatches that
event **synchronously** at `AuthWrapper.js:118` while Alpine creates the gated DOM on a
microtask — so under `x-if` the listener is registered *after* its own event has already
fired and never hears it. That is the single most likely place this change is subtly wrong,
so I reproduced `handleLogin()`'s exact sequence (set `authService.user`, flip
`isAuthenticated`, dispatch `auth:login`) instead of arguing about it:

```
{ appRendered: true,
  currentUserPickedUp: "Sim User / THIRD_PARTY",
  activeTab: "graphene",
  isThirdParty: true,
  footerName: "Sim User | Third Party | Logout" }
```

Both effects the listener would have produced still happen, because `init()` calls
`this.updateCurrentUser()` directly at `app-refactored.js:1242`, and that reads
`window.authService.getCurrentUser()` — which `login()` sets synchronously before
dispatching — and then calls `enforceThirdPartyRestrictions()`. The proof it really ran is
`activeTab: "graphene"`: the app started on `dashboard`, and a THIRD_PARTY user was pushed
off it. The sidebar footer resolved the user name too.

So the dead listener is harmless **today**. It is still a trap for tomorrow — see Risks.

## Measurements

### M1 — Login-screen API traffic, BEFORE any change (baseline)

Environment: `PORT=3021 node server/index.js` + Vite on 5194 (scratchpad config, proxy →3021),
Chrome, no token in storage, single load of `http://localhost:5194/`.

**82 `/api/*` requests fire at the login screen, across 27 distinct endpoints.**
Counted two ways and they agree:
- Express access log segment for one page load: 82 lines matching `(GET|POST|PUT|DELETE) /api/`.
- Browser network panel for one page load: request ids `.375` … `.456` = 82 entries.

Every endpoint appears an **even** number of times — the whole `init()` fan-out runs **twice**
per load (`loadDashboardData()` block twice, then the 16-way `Promise.all` twice). That doubling
is pre-existing and independent of this chip's fix; see Reflections.

Distinct endpoints hit while logged out (count per single load):

```
 12 GET /api/micronization                (6 distinct ?compoundBatchNumber= + 6 bare, ×2)
  4 GET /api/update-reports      4 GET /api/tem          4 GET /api/shipments
  4 GET /api/sem-reports         4 GET /api/raman        4 GET /api/graphene
  4 GET /api/conductivity        4 GET /api/compound-batches   4 GET /api/bet
  2 GET /api/xrd                 2 GET /api/xps          2 GET /api/tags
  2 GET /api/particle-size       2 GET /api/mcb          2 GET /api/mcb/available/micronizations
  2 GET /api/dashboard/recent-activity    2 GET /api/dashboard/production-metrics
  2 GET /api/dashboard/inventory-by-location  2 GET /api/dashboard/best-test-results
  2 GET /api/biochar             2 GET /api/biochar/lots
  2 GET /api/compound-batches/<id>/related  × 5 distinct ids
```

Note the spawn prompt quoted "46 requests across 17 endpoints" from W1-APP-DEDUPE. I measured
**82 across 27** on today's `staging`. Reporting my own number per CHIP-PROTOCOL.md §6
(*trust the repo over the notes*); I did not try to reproduce theirs.

### M2 — Console errors at the login screen, BEFORE any change (baseline)

Not zero. The logged-out app div initialising produces, per load:
- 12 × `Uncaught TypeError: Cannot read properties of null (reading '<x>')` where `<x>` is
  `fromAddress`, `replyTo`, `testRecipient`, `weeklyDigest`, `dueTomorrow`, `overdue3Day`,
  `overdue6Day`, `overdue9Day`, `onlyMyTasks`, `includeUnassigned`, `timezone` ×2 — all from
  EmailAdminTab bindings evaluating against a null settings object.
- 24 × `Component Error Detected: {message: Script error.}` (the app's own window.onerror hook,
  two per TypeError).
- 2 × `GET /api/tags 401 Unauthorized` → `Failed to load system tags: Access token required`.

`/api/tags` **already** enforces auth today (its own router-level guard), so the login screen
already produces a real 401. That is the shape every one of the other 80 requests takes on once
W1-AUTH-GUARD merges.

### M3 — CSV export call sites

`downloadCSV` is defined once (`client/src/js/services/api.js:28`) and called from **13** export
helpers (api.js lines 78, 179, 252, 320, 388, 456, 528, 600, 668, 920, 1007, 1055, 1088). Exactly
one of them takes filter params: `grapheneAPI.exportCSV(params)` at api.js:178. All 13 are invoked
from a single `switch` in `app-refactored.js:2306-2331`.

### M4 — Where the 82 requests went (after the fix)

They did not disappear, they moved to where they belong. Same rig, gate flipped to
authenticated:

| When | /api requests at the login screen | /api requests on becoming authenticated |
|---|---|---|
| before | **82** | 0 (they had already fired) |
| after | **0** | **82** |

Two things follow. First, the fix is a pure deferral — no data load was lost, which is what
"no-op against today's server" has to mean. Second, **the double-initialisation survives the
change**: the post-flip 82 still shows every endpoint an even number of times, so the
doubling is not caused by `x-show` vs `x-if` and is not cured by it. It is an independent
pre-existing bug. Proposed as a follow-up chip; deliberately not fixed here.

## Draft wiring

**None.** This chip owns `client/src/js/app-refactored.js` and `client/index.html`
exclusively under CHIP-PROTOCOL.md §8, so there is nothing to hand to the Integrator.

For the Integrator's benefit, the total footprint in those two files is deliberately tiny,
because other chips' drafted wiring is anchored against them:

- `app-refactored.js`: **one added import** (plus its comment) at the top of the file.
  No method, no state key, no line inside the object literal was touched, moved or
  renamed. Every anchor another chip may have drafted against is intact.
- `client/index.html`: **one `<template x-if>` wrapper** around the existing main app div
  (the div keeps its `x-data` and `x-init` verbatim; only the now-redundant `x-show` and
  `x-cloak` came off it), and **eight `<script>` tags relocated** from inside that div to
  after the closing `</template>`. Their order and their position at the end of `<body>`
  are unchanged. No nav entry, no mount `<div>`, no modal container was touched.

## Draft for shared docs

### For `CLAUDE.md`, the **Gotchas** list — add these three bullets

> - **All client→server authentication goes through one wrapper.** `client/src/js/services/authFetch.js`
>   wraps `window.fetch` and attaches `Authorization: Bearer <token>` to same-origin `/api/*`
>   requests when a token is in `localStorage`/`sessionStorage`. It is switched on by
>   `client/src/js/services/installAuthFetch.js`, which **must stay the first import in
>   `app-refactored.js`** — `AuthService.js` fires `GET /api/auth/me` at import time, so a later
>   import would miss it. Individual `fetch` call sites do **not** set auth headers and must not
>   start doing so. The wrapper skips cross-origin requests and `/api/proforma/share/*` (the
>   investor embed authenticates by share token), and is inert when no token exists.
> - **The proforma embed deliberately does not get the wrapper.** `proforma-embed.js` is a separate
>   Vite entry and does not import `app-refactored.js`, so `window.fetch` stays native there.
>   `authFetch.js` has no import side effects precisely so that `api.js` can use its
>   `getAuthHeader()` without dragging the wrapper into the embed bundle. Keep it side-effect-free.
> - **CSV exports are blob downloads, not `<a href>` navigations.** `downloadCSV` in
>   `client/src/js/services/api.js` fetches with the auth header, reads the body as a Blob and
>   saves from an object URL. It cannot go back to an anchor navigation: an anchor carries no
>   request headers, so it cannot authenticate. The filename comes from the server's
>   `Content-Disposition`, parsed client-side and applied to `link.download`.

### For `CLAUDE.md`, **Auth & Roles** — append

> Since D-011, the client attaches its JWT centrally (see the authFetch gotcha above). Before that
> it attached one on almost nothing, and every create/update in the app had been failing in
> production for eight months.

## Handoff: changes needed in files I do not own

**No changes are required in unowned files for this fix to work.** The two items below are
things I found and did not touch; neither blocks the merge.

1. `client/src/js/services/AuthService.js:151` — `authenticatedFetch()` is called from
   nowhere (four-way search in Reflections) and is now genuinely redundant: the wrapper does
   the header injection it was built for. Its *other* behaviour — `clearAuth()` +
   `window.location.reload()` on any 401 — is the part I deliberately did **not** adopt.
   Recommend un-exporting rather than deleting (CHIP-PROTOCOL.md §7), and deciding session
   expiry as its own piece of work rather than inheriting it by accident.
2. `client/src/js/services/AuthService.js:146` — the method is `getAuthHeader()` (singular).
   My spawn prompt said `getAuthHeaders()` at `:147`. Trivial, but it is the kind of drift
   §6's *trust the repo over the notes* exists for; flagging so the roadmap text gets fixed.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| blocker | Client sent no `Authorization` header on any `/api` request; every create/update in the app has failed in production for 8 months | `client/src/js/services/api.js` + 219 fetch sites | **fixed here** — one `window.fetch` wrapper, `services/authFetch.js` |
| blocker | All 13 CSV exports used an `<a download href>`; an anchor navigation cannot carry a header, so they become 401s the moment reads require auth | `client/src/js/services/api.js:28` (old) | **fixed here** — fetch → blob → object URL |
| high | App booted behind the login form: **82** `/api` requests across **27** endpoints fired before anyone logged in | `client/index.html:26` (`x-show` + `x-init`) | **fixed here** — `<template x-if>`; 82 → **0** |
| high | Eight `<script>` tags — including Alpine and the app entry point — sat *inside* the div being gated; wrapping it without moving them would have white-screened the entire app | `client/index.html:1334-1358` (old) | **fixed here** — moved below `</template>` |
| medium | The whole `init()` fan-out runs **twice** per load; every endpoint appears an even number of times. Survives the `x-if` change, so it is independent of it | `client/src/js/app-refactored.js:1219` `init()` | left, why: out of scope, would tangle two changes — proposed as **CHIP-W3-DOUBLE-INIT** |
| medium | `AuthService.authenticatedFetch()` is defined and called from nowhere; four-way search returned only its own definition. The plumbing for this outage existed and was never connected | `client/src/js/services/AuthService.js:151` | left, why: not owned — see Handoff |
| medium | The 13 `exportCSV` wrappers discard `downloadCSV`'s promise, so exports are fire-and-forget and a caller cannot await or handle failure | `client/src/js/services/api.js` (13 sites) | left, why: 13 edits for no behaviour gain — `downloadCSV` catches and alerts internally |
| medium | Under `x-if`, `init()`'s `auth:login` listener is registered after the event has already fired, so it never runs on the login it exists for | `client/src/js/app-refactored.js:1237` | left, why: harmless today (V13 proves `updateCurrentUser()` covers both effects) — latent trap, see Risks |
| medium | W1-APP-DEDUPE's login-screen figure (46 requests / 17 endpoints) does not match today's `staging`: I measured **82 / 27**, counted two independent ways that agreed | `notes/W1-APP-DEDUPE.md` | left, why: another chip's notes — flagged for supersession |
| low | `/api/tags` already enforces auth today, so the login screen already produces a real 401 + a `Failed to load system tags: Access token required` console error | observed at runtime | **fixed here** as a side effect (request no longer fires) |
| low | Login screen produced 12 `Cannot read properties of null` TypeErrors + 24 `Component Error Detected` reports per load, from EmailAdmin bindings evaluating against null settings | observed at runtime | **fixed here** as a side effect — console is now clean |
| low | `client/index.html` has one unbalanced `</div>` (238 open / 239 close, comments striped) — pre-existing, identical in HEAD and after my change | `client/index.html` | left, why: pre-existing, unrelated to this fix |
| low | Spawn prompt cited `AuthService.getAuthHeaders()` at `:147`; the method is `getAuthHeader()` (singular) at `:146` | `client/src/js/services/AuthService.js:146` | left, why: not owned — see Handoff |
| low | `/uploads` and `/news-images` are `express.static` outside `/api`, so they stay unauthenticated after the auth fix. My wrapper correctly does not touch them (V6 row 8) | `server/index.js:150-161` | left, why: server not owned; already noted in D-006 |

### What I saw outside my scope

**The plumbing for this outage was built and then never wired up.**
`AuthService.getAuthHeader()` returns exactly the right header and
`AuthService.authenticatedFetch()` is a complete authenticated wrapper — and the four-way
search (§7: basename, path, all file types, dynamic refs) finds **no caller anywhere**.
Someone did the hard part and never connected it. That is worth more than a shrug: the
failure mode was not "nobody thought about auth", it was "auth was thought about, written,
and left one import short", and nothing in the repo could tell the difference between the
two until a user hit Save in production.

**The double-init is the biggest thing I found that I was not looking for.** Every
endpoint the app loads is fetched exactly twice on every boot — 82 requests where 41 would
do, including 12 `/api/micronization` calls. It is not the `x-show`/`x-if` question: I
measured it again after the gate change and the doubling is identical, just relocated to
login. On a Railway instance talking to a remote Postgres this is double the query load on
every session start, and it is invisible because everything still works.

**`/api/tags` is a preview of the whole app after W1-AUTH-GUARD.** It is the one route
that already guards itself, and its behaviour at the login screen today — 401, red console
error, feature silently degraded — is exactly what the other 26 endpoints will do. Anyone
wanting to see the merged state before merging can just look at what `/api/tags` does now.

**`GrapheneTab.js` species values are `species1` / `species2`, not material names.** The UI
labels them as species but the wire values are positional. That is what made my wrong test
input look plausible for as long as it did.

### Risks in what I built

1. **The async gap in `downloadCSV` is my most likely real-world failure, and I could not
   test it.** The old anchor click happened synchronously inside the user's click event.
   Mine happens after `await fetch(...)`, so the download is triggered outside the user
   gesture. Chrome is fine with this (proved — V9 saved seven files). **Safari is the
   risk**: it is markedly stricter about programmatic downloads outside a gesture, and I
   have only Chrome here. Exposure: a Mac/iPad user clicks Export, no file appears, no
   error (the fetch succeeded, so no alert fires either). If anyone reports that, this is
   the cause, and the fix is to create the anchor before the await and only set `href`
   after. I did not pre-emptively restructure for it because the pattern I used is the
   standard one and guessing at Safari without testing is how you get two bugs.
2. **`alreadyAuthorized()` is a deliberate short-circuit that can suppress the token.** Any
   call site that sets its own `Authorization` header wins, including one that sets a
   *stale* one. Today only `AuthService` does this and it is correct. Exposure: a future
   call site caching a token in a closure would get 403 `Invalid or expired token` on that
   one endpoint while everything else works — a confusing, localised failure. I chose it
   anyway because silently overwriting a caller's explicit header is worse.
3. **The dead `auth:login` listener (V13) is a trap, not a bug.** It is harmless now only
   because `init()` happens to call `updateCurrentUser()` itself. Anyone who later adds
   work to that listener — analytics, a redirect, a preference load — will find it silently
   never runs on first login, and it will look like an Alpine mystery rather than an
   ordering bug. Cheapest guard: move the listener registration out of `init()`, or delete
   it and rely on `updateCurrentUser()`. I left it alone to keep the `app-refactored.js`
   footprint to a single import, per §8.
4. **`x-if` destroys and rebuilds the whole app subtree, where `x-show` never did.** Nothing
   in the codebase depends on that subtree existing at page load — I checked
   `getElementById`/`querySelector` for `card-modal-container`, `pdf-viewer-modal-container`,
   `original-app-content` and `app` (zero hits in JS) and for `DOMContentLoaded` handlers
   (zero). But this is the change with the widest blast radius: if the app fails to render
   for someone, it is this, and the tell is an empty page with a clean console rather than
   an error.
5. **Everything I verified about the logged-in app was verified with a simulated gate flip,
   not a real login.** I could not log in (D-004/D-005 — no user creation, no DB writes, and
   `POST /api/auth/login` writes `lastLogin`). V11 and V13 flip the same flags
   `handleLogin()` flips, in the same order, but they do not exercise the real
   `login()` → token-store → `validateToken()` path. **The first real login after this
   merges is the genuinely untested step**, and it should be the Command Center's first
   action on the combined branch.
6. **Read-path scope.** My change is verified against today's server, where GET is
   unguarded. I read the parked `chip/w1-auth-guard` server change (a read, not a branch
   operation) and matched my client to it: exempt prefixes `/auth`, `/health`,
   `/email/cron`, `/proforma/share`; `Bearer` scheme; missing token → 401, bad token → 403.
   But **I have not run my client against that server**, and nobody has run the
   combination. That is the one verification this chip structurally could not do.

### Proposed follow-up chips

| Name | Job | Owns | Lane | Tier |
|---|---|---|---|---|
| **W3-DOUBLE-INIT** | Find and fix why the `init()` fan-out runs twice per boot — 82 requests where 41 suffice. Evidence and repro rig are in M1/M4 of this file; the checker in `scripts/check/` already exists to guard the result | `client/src/js/app-refactored.js`, `client/index.html` (§8 exclusive) | A | opus |
| **W3-SESSION-EXPIRY** | Decide and implement what happens when a token expires mid-session. Today: nothing — the user gets 403s and degraded features with no signal. `AuthService.authenticatedFetch`'s clear-and-reload is the obvious candidate and is exactly what I refused to put on the global path unconsidered | `client/src/js/services/authFetch.js`, `client/src/js/services/AuthService.js` | A | opus |
| **W3-AUTHSERVICE-TIDY** | Un-export the now-redundant `authenticatedFetch`, fix the `getAuthHeader` naming drift, and make `AuthService` read its token through `authFetch.getAuthToken()` so storage keys have one owner | `client/src/js/services/AuthService.js` | A | sonnet |
| **W3-STATIC-UPLOADS** | Rule on and implement auth for `/uploads` and `/news-images`, which stay world-readable after D-006. Needs a ruling first — signed URLs vs. a JWT-checked static handler is a real design choice | `server/index.js` (§3c single owner) | A | opus |
| **W3-EXPORT-GESTURE** | Verify the blob download in Safari/iPadOS and, if it fails, restructure `downloadCSV` to create and click the anchor inside the user gesture | `client/src/js/services/api.js` | A | sonnet |

### Harness improvements

**§5a saved this chip, and it should say so with a number.** I was killed by the host
sleeping, mid-sentence, immediately after finishing recon and measurement. Because M1/M2/M3
were already on disk, the resume cost roughly nothing — the baseline measurement (two
independent counts, a browser rig, a console-error census) was the single most expensive
thing I did all session and it survived intact. The rule currently justifies itself with a
story about two chips that died; it now has a case where it demonstrably worked. Worth
adding: *save after every file, not every phase* — the Command Center's resume instruction
said that more sharply than §5a does, and it was the better wording.

**The assigned port pair is unusable without also owning `vite.config.js`.** My prompt
assigned Express `3021` and Vite `5194`, but `vite.config.js:26` hardcodes the proxy target
`http://localhost:3001`, and `vite.config.js` was not on my owned list. So Vite on 5194
proxies `/api` to a server that isn't mine. I worked around it with a scratchpad-only config
(`--config <scratchpad>/vite.authclient.config.js`) mirroring the repo's, and hit a second
trap on the way: a config file outside the project cannot `import { defineConfig } from 'vite'`
(module resolution fails), so it has to export a plain object. Two fixes, either works:
make the proxy target read `process.env.PORT`, or hand each chip a ready-made config. This
will cost every future chip that needs the UI the same 15 minutes.

**"Verify the change is a no-op" needs a stated baseline to be checkable.** My brief asked
for before/after request counts, which was exactly right and is why I have M1 — but it also
quoted a number (46/17) from a sibling's notes that did not match reality (82/27). Quoting a
prior measurement into a prompt gives it the authority of a ruling. Prompts should quote
*rulings* (§6) and cite *measurements*, with an explicit "re-measure, don't inherit".

**A prompt that says "minimal changes only" should say what to do when minimal is
impossible.** Gating the app div required relocating eight `<script>` tags, because a
`<template>`'s contents are inert. That is a structurally larger edit than "minimal changes"
suggests, and skipping it would have shipped a white screen. §8 would be stronger with:
*if the minimal edit is unsafe, make the safe one and justify the delta in notes* — which is
what I did, but I had to decide it was allowed.

**Model tier: opus was right, and not for the coding.** The wrapper is 60 lines of
unremarkable code. What needed the tier was the judgement around it: deciding a global
`fetch` wrapper was *provably* sufficient rather than probably sufficient (the
XHR/axios/anchor/`src=` census), spotting that the script tags were inside the div being
gated before doing it rather than after, refusing to put 401-reload on the global request
path, and catching my own false "the server ignores the species filter" finding by testing
it a second way. A cheaper tier would very plausibly have shipped the `<template>` wrapper
with the scripts still inside it.
