# Build: Investor Proforma Sharing

**Status:** 🟡 In progress — Phase 3 complete, next Phase 4 (polish, optional)
**Owner:** (rolling — any agent picks up the next unchecked phase)
**Spans two repos:** `graphene` (primary, Phases 0–2) + sibling `hgdeck` (Phase 3)

> **Read this first, then do exactly one phase, update the Status Log at the
> bottom, and commit.** One phase = one commit. Do not merge to `staging`/`main`
> until a phase's acceptance criteria pass.

---

## Goal

Let an **hgdeck** investor (who logs into the deck, NOT graphene) open a single,
isolated proforma **variant** they can **view or edit**, without:
- being able to touch our master scenarios, and
- seeing the graphene sidebar / SPA chrome.

## Locked decisions (do not re-litigate)

1. **Graphene hosts the proforma.** The engine/editor stay in graphene — we do
   NOT fork them into hgdeck. (CLAUDE.md: the engine is shared client+server and
   must not drift.)
2. **A variant is a CLONE, never a master.** Sharing snapshots a master into a
   new `ProformaScenario` row. The investor only ever touches the clone.
3. **Access is by share token, not a graphene login.** A token grants one
   variant + one mode (`view`|`edit`). Token rides in the URL.
4. **Link-out MVP, not iframe.** The deck opens the embed page in a new tab on
   `admin.hgraphene.com`. Because that's *same-origin* to graphene's API, there
   is NO cross-origin/iframe/CSP/cookie work. (Iframe is a possible future
   upgrade, explicitly out of scope now.)
5. **Chrome-less = a separate page entry**, not CSS-hiding the SPA. New Vite
   entry mounts only the proforma editor/summary.

## The master-safety invariant (the thing that must never break)

> A share token can only ever READ or WRITE the single variant row it points at.
> It can never reach a master scenario — not via PUT, not via DELETE, not via id
> substitution. Enforced server-side in the token middleware/routes, independent
> of the existing `requireSuperAdmin` admin routes.

---

## Architecture

```
hgdeck (express-session, own DB)            graphene (JWT SPA, Prisma)
─────────────────────────────              ───────────────────────────────
users.show_proforma (bool)                 ProformaScenario (master rows)
users.proforma_embed_url (text) ──link──▶   ProformaScenario (variant clones)
  shown as "Open Proforma" button           ProformaShare { token, variantId, mode }
  in deck when show_proforma=true            ├─ POST /scenarios/:id/share  (admin, JWT) → clone+token
                                             ├─ GET  /proforma/share/:token (token auth) → variant+computed
                                             └─ PUT  /proforma/share/:token (token auth, edit only) → write variant
                                            proforma-embed.html  (chrome-less Vite entry, reads ?token=)
```

- **View mode reuses the existing `locked` rendering path** — a view-only variant
  renders exactly like a locked scenario (inputs disabled, Save hidden). Big reuse.
- The token routes live in their OWN router, separate from the `requireSuperAdmin`
  proforma routes, so existing guards are never weakened.

### Key files (from exploration)

**graphene**
- `prisma/schema.prisma` — `ProformaScenario` model (`assumptions` JSON, `locked`,
  `createdById`). Add `ProformaShare` + variant flag here.
- `server/routes/proforma.js` — all routes currently `authenticateToken,
  requireSuperAdmin`. PUT checks `locked` (line ~127); **DELETE does NOT** — harden.
- `server/routes/auth.js` — JWT Bearer middleware. Token path is separate from this.
- `client/index.html` + `client/src/js/app-refactored.js` — SPA bootstrap; proforma
  rendered via `getProformaTabHtml()` gated on `activeTab==='proforma'`. Depends on
  Alpine state (`proformaScenario/Computed/Assumptions`, `proformaView`,
  `proformaEditorTab`, `proformaSection`) + window globals (`_pfFmtC`, `_pfFmtP`)
  + `proformaService`.
- `client/src/js/services/ProformaService.js` — load/save/compute/clone logic.
- `client/src/js/services/api.js` — `proformaAPI` client.
- `vite.config.js` — single entry today; needs multi-entry for the embed page.

**hgdeck**
- `seed.js` — idempotent `ALTER TABLE users ADD COLUMN IF NOT EXISTS ...` pattern.
- `server.js` — `/api/me` (line ~301), admin investor list/PUT (line ~169/218).
- `views/admin.html` — per-investor toggle pattern (`toggle-switch`, PUTs to
  `/api/admin/investors/:id`).
- `static/js/main.js` — reads `/api/me`, hides sections by flag (line ~13).
- `static/index.html` — monolithic deck; PDF iframe precedent via `/view`.

---

## Phases

### Phase 0 — Spike: chrome-less mount  *(THROWAWAY CODE)*
De-risk the only real unknown: can the proforma editor render outside the SPA shell?
- Build a bare `proforma-embed.html` + minimal bootstrap that mounts the proforma
  editor/summary against a minimal Alpine context + `proformaService`, loading ONE
  existing scenario by id using normal auth (no token yet).
- **Acceptance:** the editor + summary render and recompute on a page with NO
  sidebar/header, driven only by proforma state. Document in the Status Log exactly
  what global state/services had to be provided. **This code is a spike — Phase 2
  rewrites it properly. Do not build the token path on top of the throwaway.**

### Phase 1 — Graphene: variant + token data model & API
- Prisma: add `ProformaShare { id, token (unique), scenarioId, mode, createdById,
  createdAt, revoked }`; flag variant clones (e.g. `isVariant Boolean` + optional
  `parentId`). `npx prisma db push`.
- `POST /api/proforma/scenarios/:id/share` (admin/JWT): clone master → variant row,
  create token+mode, return embed URL.
- Token middleware + `GET/PUT /api/proforma/share/:token` (PUT edit-only; writes
  ONLY the variant; recompute). Reject any non-variant / master / revoked target.
- Harden DELETE on the admin proforma router (the unguarded `locked` gap).
- List + revoke shares (admin).
- **Acceptance:** can create a share from a master (master row unchanged); GET
  returns variant+computed; PUT in edit mode mutates ONLY the variant; PUT in view
  mode and any attempt to reach a master returns 403. Verified with a script.

### Phase 2 — Graphene: the embed page (production)
- Real `proforma-embed.html` Vite entry reading `?token=`; calls token API; mounts
  editor/summary; view→locked rendering, edit→Save writes variant.
- Multi-entry Vite build config; confirm prod build emits both entries.
- **Acceptance:** opening `/proforma-embed.html?token=…` shows the variant
  chrome-less; edit-mode Save persists to the variant and survives reload; view-mode
  is fully read-only. Masters never appear.

### Phase 3 — hgdeck: permission + assignment + deck link
- `seed.js`: `show_proforma BOOLEAN DEFAULT false`, `proforma_embed_url TEXT`.
  (NOTE: default **false** — opt-in, unlike the existing `show_*` flags.)
- `server.js`: include both in investor list + PUT + `/api/me` (camelCase
  `showProforma`, `proformaEmbedUrl`).
- `views/admin.html`: a Proforma toggle + a URL field per investor.
- `static/index.html` + `static/js/main.js`: a gated "Open Proforma" link/section.
- **Acceptance:** admin can toggle proforma on for an investor and paste a share
  URL; that investor sees an "Open Proforma" button that opens the variant in a new
  tab; investors without the flag see nothing.

### Phase 4 — Polish & safety (optional / later)
- Share expiry + `lastAccessedAt` audit; ensure variants never pollute master
  lists/counts; optional `?theme=deck` styling. Iframe upgrade if ever wanted.

---

## Open questions / gotchas
- **Unguarded DELETE** on `server/routes/proforma.js` — fold the `locked`/variant
  guard in during Phase 1.
- Where variants surface in the admin scenario list — filter them out or group
  under "Shared variants" so they don't clutter masters.
- Token format: use a long random (e.g. 32-byte base64url), store as unique.

## Working rhythm
1. Read this doc. 2. Do the next unchecked phase. 3. Update the Status Log.
4. Commit `feat(proforma-share): phase N — <summary>`. 5. Add durable facts to
CLAUDE.md ONLY once a phase lands (the plan lives here, not in CLAUDE.md).

---

## Status Log
- **2026-06-02** — Doc created. Decisions locked (graphene-hosted variant,
  link-out MVP). Feature branch `feat/investor-proforma-sharing` cut from `staging`.
  Next: Phase 0 spike.
- **2026-06-02** — ✅ **Phase 0 complete (mount proven).** Files: `client/proforma-embed.html`
  + `client/src/js/proforma-embed-spike.js` (BOTH throwaway). Verified the full
  chrome-less mount chain via the live module graph: `window.grapheneApp()` is
  callable outside the SPA shell; `getProformaTabHtml()` renders editor+summary
  with NO sidebar markup; seeding a scenario LOCALLY from `getDefaultAssumptions()`
  + `calculateProforma()` (no auth/API) yields `proformaComputed` (5 yrs) + reseeded
  market sources (3); the delegate `getProformaSummary()` computes against seeded
  state and returns the full summary. Conclusion: the standalone mount works.
  - **Findings for Phase 2:**
    1. **Build a SLIM Alpine factory** (proforma state + delegates only) — do NOT
       reuse the full `grapheneApp()`. It pulls the whole SPA; its `init()` fires
       auth-dependent loaders (loadMCBs/loadSystemTags) that error without a token.
       The spike sidesteps this only because the embed page never calls `init()`.
    2. Required state to seed: `proformaScenario`, `proformaAssumptions`,
       `proformaComputed`, `proformaView='editor'`, `proformaEditorTab`,
       `proformaDirty=false`, then `proformaService._reseedMarketSources(ctx)`.
       Plus `activeTab='proforma'` for the `x-show` root (slim factory can drop the
       `activeTab` gate entirely).
    3. Globals the template needs: `window._pfFmtC`/`_pfFmtP` (set on import of
       ProformaTab.js), Chart.js CDN (charts sub-tab only).
    4. View mode = render scenario as `locked` (reuse existing disable/hide path).
  - **Spike is throwaway** — Phase 2 rewrites the entry against the token API +
    slim factory. Delete `proforma-embed-spike.js` and rebuild `proforma-embed.html`
    then. Next: Phase 1 (data model + token API).
- **2026-06-02** — ✅ **Phase 1 complete (data model + token API).** Verified by
  `scripts/verify-proforma-share.js` (25/25 checks against the acceptance criteria).
  - **Schema** (`prisma/schema.prisma`, `prisma db push`): new `ProformaShare`
    `{ id, token @unique, scenarioId→variant (onDelete: Cascade), mode 'view'|'edit',
    revoked, createdById, createdAt, updatedAt }`. `ProformaScenario` gained
    `isVariant Boolean @default(false)` + self-relation `parentId`/`parent`/`variants`
    (onDelete: SetNull) + `shares[]`. `User` gained `proformaShares[]`.
  - **Admin router** (`server/routes/proforma.js`, still `requireSuperAdmin`):
    `POST /scenarios/:id/share` clones master→variant (snapshots `assumptions`,
    sets `isVariant`+`parentId`, mints a 32-byte base64url token) and returns
    `{ share, variant, embedUrl }`; refuses to share a variant. `GET
    /scenarios/:id/shares` lists a master's shares; `POST /shares/:shareId/revoke`
    soft-revokes. `GET /scenarios` now filters `isVariant:false` so variants never
    clutter the master list. **DELETE hardened**: now 403s on `locked` (mirrors PUT).
  - **Token router** (`server/routes/proformaShare.js`, NO superadmin guard),
    mounted at `/api/proforma/share` **before** `/api/proforma` in `index.js` so it
    never hits `requireSuperAdmin`. `authenticateShareToken` resolves `:token`→its
    variant; rejects missing/revoked (404) and any non-variant target (403 — the
    master-safety backstop). `GET /:token` returns `{ scenario, computed, mode }`;
    `PUT /:token` is edit-mode-only (else 403), validates assumptions, and writes
    **only** `req.scenario.id` (derived from the token — no scenario id is ever
    accepted from URL/body, so id-substitution is impossible). Master-safety
    invariant holds: a token can only read/write its own variant clone.
  - **Verification**: `node scripts/verify-proforma-share.js` boots both real
    routers in-process with the real auth middleware + a minted SUPER_ADMIN JWT.
    Confirms: share leaves master unchanged; GET returns variant+computed; edit-PUT
    mutates only the variant (master untouched); view-PUT→403; master-pointing token
    GET/PUT→403; revoked token→404; admin route w/o JWT→401; variants excluded from
    list; locked DELETE→403. Next: Phase 2 (production embed page).
- **2026-06-02** — ✅ **Phase 2 complete (production embed page).** Verified in the
  browser against real minted view + edit tokens.
  - **Spike deleted.** `client/src/js/proforma-embed-spike.js` removed;
    `client/proforma-embed.html` rebuilt from scratch against the token API +
    slim factory (NOT the spike, NOT the full `grapheneApp()`).
  - **Slim Alpine factory** (`client/src/js/proforma-embed.js`,
    `window.proformaEmbedApp`): proforma state + delegates ONLY. Confirmed
    `window.grapheneApp` is `undefined` on the page, so no auth-dependent SPA
    loaders fire. Imports `getProformaTabHtml` (which sets `window._pfFmtC/_pfFmtP`
    and pulls in every section module's `window._pf*` helpers); Chart.js + Alpine
    plugins via CDN. Alpine auto-runs `init()` → reads `?token=` → `GET
    /api/proforma/share/:token` (the TOKEN router, not `requireSuperAdmin`) →
    seeds `proformaScenario/Assumptions/Computed`, `proformaView='editor'`,
    `proformaEditorTab='summary'`, `_reseedMarketSources`. View mode flags the
    scenario `locked:true` to reuse the editor's existing disable/hide path; edit
    mode `Save` PUTs `{ assumptions }` to the same token (writes only the variant).
    The list/create/delete/lock delegates are intentionally omitted; the editor's
    back-arrow is an inert no-op (no list to return to).
  - **Multi-entry Vite** (`vite.config.js`): added
    `build.rollupOptions.input = { index, 'proforma-embed' }`. `npm run build`
    emits BOTH `dist/index.html` AND `dist/proforma-embed.html` (+ a ~7.8 kB
    `proforma-embed` chunk that shares the `ProformaService` chunk). Express
    serves the embed page via `express.static(dist)` (before the SPA catch-all),
    so the share-route `embedUrl` (`/proforma-embed.html?token=…`) resolves in prod.
  - **🔧 Phase 1 gap fixed (required for the embed to work):** the global `/api`
    write-guard in `server/index.js` (skips GET, but JWT-guards all POST/PUT/DELETE)
    intercepted the token `PUT` *before* it reached the token router → 401 "Access
    token required". The Phase 1 verify script never caught this because it mounts
    the routers WITHOUT that global middleware. Fix: added `/proforma/share` to the
    guard's skip-list (alongside `/auth`, `/users`, `/email/cron`) so the share
    router does its own token auth. GET was unaffected (already skipped). Master
    safety is unchanged — the token router still rejects view-PUT (403),
    master-pointing tokens (403), and revoked tokens (404).
  - **Acceptance verified in-browser:** edit token → chrome-less editor, no
    sidebar/header; editing an assumption + Save persists to the variant
    (confirmed via an independent `GET` — `isVariant:true`, master untouched).
    View token → `locked:true`, Save + name input disabled, direct `PUT` via the
    view token → 403, app-level save is a no-op. Masters never appear. Next:
    Phase 3 (hgdeck permission + deck link).
- **2026-06-04** — ✅ **Admin Share UI shipped (graphene)** — fills the Phase 1
  "list + revoke shares (admin)" gap that the API had but no UI exposed. A link
  icon on each proforma scenario card (list view) opens a centered **Share
  modal**: pick View-only / Editable, "Create link" mints a token (auto-copied to
  clipboard), and active links list with per-link Copy + Revoke. Wiring:
  `proformaAPI.createShare/getShares/revokeShare` (api.js) → `ProformaService`
  `openShareModal/loadShares/createShare/revokeShare/copyShareUrl/shareEmbedUrl`
  → `app-refactored.js` delegates (`openProformaShareModal` etc.) + state
  `proformaShareModal`/`proformaShareMode` → `_shareModal()` in `ProformaTab.js`.
  URLs are reconstructed client-side as `${location.origin}/proforma-embed.html?token=`
  so a link minted on staging points at staging, prod at prod. The modal is
  guarded by `<template x-if="proformaShareModal">` so it never evaluates on the
  embed page (slim factory has no share state); the Share button lives only in
  the list view, which the embed never renders. Verified in-browser: mint
  view+edit, auto-copy, revoke (token→404), and each token resolves to a VARIANT
  (isVariant:true, id≠master). No new server code — reuses the Phase 1 endpoints.
- **2026-06-02** — ✅ **Phase 3 complete (hgdeck permission + assignment + deck
  link).** Done in the sibling `hgdeck` repo on branch
  `feat/investor-proforma-sharing` (commit `feat(proforma-share): phase 3 …`).
  Verified in-browser against the live hgdeck preview server.
  - **Schema** (`seed.js`): two idempotent `ALTER TABLE users ADD COLUMN IF NOT
    EXISTS` migrations — `show_proforma BOOLEAN DEFAULT false` (opt-in, unlike
    the existing `show_*` flags which default true) and `proforma_embed_url TEXT`.
  - **API** (`server.js`): both columns added to the admin investor list SELECT
    (~L172), the create RETURNING, and the investor PUT (body destructure +
    update builder; empty URL string normalizes to `NULL`) + its RETURNING.
    `/api/me` now exposes camelCase `showProforma` (strict `=== true`, defaults
    false) and `proformaEmbedUrl` (defaults null).
  - **Admin UI** (`views/admin.html`): new "Proforma" column = the existing
    `toggle-switch` (PUTs `show_proforma` to `/api/admin/investors/:id`) + a
    `.proforma-url-input` URL field that PUTs `proforma_embed_url` on change.
    New `toggleProforma()` / `saveProformaUrl()` handlers mirror the existing
    `toggleDecks`/`toggleDocuments` pattern (optimistic update + revert-on-error).
  - **Deck** (`static/index.html` + `static/js/main.js`): a gated
    `#navProformaBtn` "Open Proforma" link in the top nav (`target="_blank"`,
    hidden by default). `main.js` reveals it and sets `href` ONLY when
    `me.showProforma === true && me.proformaEmbedUrl` — mirrors the existing
    section-hiding-by-flag block.
  - **Acceptance verified in-browser:** admin toggled proforma on + pasted a
    graphene share URL for a test investor (persisted via re-fetch); that
    investor's deck showed an "Open Proforma" button (`target=_blank`, href = the
    share URL); flag off → button hidden; create defaults `show_proforma:false`/
    null URL (opt-in confirmed). No console errors. Test user cleaned up.
    Next: Phase 4 (polish/safety, optional).
