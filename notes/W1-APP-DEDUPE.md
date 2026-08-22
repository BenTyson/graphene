# CHIP-W1-APP-DEDUPE

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:** `client/src/js/app-refactored.js`, `notes/W1-APP-DEDUPE.md`
- **Wave:** 1 (re-run)
- **Base:** `staging` @ `c9486de`

## What I was asked to do

Seven method keys are defined twice in the object literal returned by `window.grapheneApp()`.
JS object literals take the LAST definition, so the earlier one is silently dead. For each pair:
grep call sites, decide merge-vs-drop, and state the behavior change. `init()` is a live
user-visible bug — the dead early version calls `initSidebarState()`, `handleInitialRoute()`,
`autoExpandParentGroup()`, none of which run anywhere else.

I own a shared wiring file (D-001 exception, CHIP-PROTOCOL §8): public surface must stay intact
— no renames, no reordering, no reformatting.

## Status log (appended as I work)

- Measured duplicates with `npx esbuild client/src/js/app-refactored.js --outfile=/dev/null --log-limit=0`.
  **17 duplicate keys**, not 7. Spawn prompt listed 7 method pairs; esbuild finds 11 method pairs
  plus 6 data-property pairs. Baseline table saved below (see ## Measurements).


## Measurements — duplicate-key baseline (before any edit)

`npx esbuild client/src/js/app-refactored.js --outfile=/dev/null --log-limit=0` on base `c9486de`,
file 6274 lines. **17 duplicate keys in the `grapheneApp()` object literal.**

| # | Key | Kind | Earlier (dead) | Later (wins) | In spawn prompt? |
|---|---|---|---|---|---|
| 1 | `expandedCompoundBatches` | data | 548 | 664 | no |
| 2 | `compoundBatchRelatedData` | data | 549 | 676 | no |
| 3 | `loadingCompoundBatchRelated` | data | 550 | 679 | no |
| 4 | `compoundBatchRecords` | data | 434 | 682 | no |
| 5 | `compoundBatchSearch` | data | 565 | 683 | no |
| 6 | `compoundBatches` | data | 433 | 1810 | no |
| 7 | `init` | method | 230 | 1228 | YES |
| 8 | `searchCompoundBatches` | method | 1598 | 2203 | YES |
| 9 | `handleSemFileChange` | method | 2169 | 2373 | YES |
| 10 | `closeSemModal` | method | 2165 | 2405 | YES |
| 11 | `nextNewsPage` | method | 4473 | 4497 | no |
| 12 | `previousNewsPage` | method | 4478 | 4504 | no |
| 13 | `goToNewsPage` | method | 4483 | 4511 | no |
| 14 | `loadMoreNews` | method | 4488 | 4518 | no |
| 15 | `refreshNewsFeed` | method | 4448 | 4524 | YES |
| 16 | `hasActiveFilters` | method | 4277 | 4596 | YES |
| 17 | `shareArticle` | method | 4618 | 4744 | YES |

Spawn-prompt line numbers matched exactly for all 7 listed pairs — the file had not drifted.

## Investigation log (per pair, appended live)

### `init()` — 230 (dead) vs 1228 (wins)
- `initSidebarState` referenced only at 231 (dead call) + 6020 (def) → **never runs**.
- `handleInitialRoute` referenced only at 232 (dead call) + 237 (def) → **never runs**.
- `autoExpandParentGroup` also called from `switchTab` (4335), so it runs on navigation but not at boot.
- Server has `app.get('*') → sendFile(index.html)` (`server/index.js:219-224`), and `switchTab`
  writes path URLs via `history.replaceState` (4368). So `/graphene` is a real, reachable URL —
  but on load the app always falls back to `activeTab: 'dashboard'`. **Deep links and reloads
  silently lose the tab today.**
- Ordering: `handleInitialRoute` early-returns when the hash is a data-page route (247-251), so it
  cannot fight `setupDataPageRouting()` (848-861) in either order.
- Decision: **merge** — insert the three calls into the surviving `init()` immediately after
  `setupDataPageRouting()` and *before* the `activeTab === 'dashboard'` dashboard preload, so a
  deep-linked non-dashboard tab does not trigger a wasted dashboard fetch.

### `searchCompoundBatches()` — 1598 (dead, debounced) vs 2203 (wins, delegate)
- Single call site: `components/tabs/CompoundBatchesTab.js:44` `@input="searchCompoundBatches()"`.
- Winner calls `CRUDService.searchCompoundBatches` (CRUDService.js:941-947): one API call **per
  keystroke**, no debounce, no `loadAvailableCompoundBatches()`, leaves stale rows on error.
- Dead version debounces 300ms into `loadCompoundBatches()` (1433-1441) which does the same fetch
  **plus** `loadAvailableCompoundBatches()` and clears rows on error. Matches the sibling pattern
  used by `searchSemReports` (1589) and `searchShipments` (1607).
- Decision: **merge onto the debounced version at 1598**, delete the 2203 delegate.

### `closeSemModal()` — 2165 (dead, delegate) vs 2405 (wins, inline)
- `CRUDService.closeSemModal` (CRUDService.js:797-800) is byte-equivalent to the inline body.
- Live via a string reference: `client/index.html:1263` `closeMethod: 'closeSemModal'`.
- Decision: **drop the inline duplicate at 2405**, keep the delegate at 2165 next to its sibling
  `viewSemPdf` delegate. No behavior change.

### `handleSemFileChange(event)` — 2169 (dead, delegate) vs 2373 (wins, inline)
- **The two do completely different things.** Delegate → multi-file, writes
  `semReportForm.semFiles` (SEM Reports tab). Inline → single file, writes
  `grapheneForm.semReportFile` (Graphene modal).
- Only call site is the Graphene modal: `components/modals/GrapheneModal.js:563,577`
  `@change="handleSemFileChange($event)"`. The SEM Reports tab modal does **not** call it —
  `client/index.html:1173` inlines `semReportForm.semFiles = Array.from($refs.semFileInput.files)`.
- So the surviving version is the correct one for the only caller.
- Decision: **drop the dead delegate**, leave a one-line tombstone pointing at
  `CRUDService.handleSemFileChange` (CHIP-PROTOCOL §7 prefers a tombstone to silent removal).

### `hasActiveFilters()` — 4277 (dead, AI Analysis) vs 4596 (wins, News)
- **Two unrelated features sharing one name**, same shape as the `exportData` collision.
- Call sites, both live `x-show` bindings in always-rendered templates:
  - `components/tabs/AIInsightsTab.js:176` — AI Insights tab (**visible, in the sidebar**).
  - `components/tabs/NewsTab.js:225` — News tab (no sidebar entry exists; reachable only by URL).
- Today the News delegate wins, so on AI Insights the "active filters" chip row is driven by
  `NewsService.newsFilters` and therefore **never appears**, however many analysis filters are set.
- I may not rename either call site (`client/src/js/components/**` is do-not-touch), so the merged
  method must serve both. Discriminator: the tab roots are `x-show="activeTab === 'ai-insights'"`
  (AIInsightsTab.js:30) and `x-show="activeTab === 'news'"` (NewsTab.js:4).
- Decision: **merge into one tab-dispatching method at 4277**; delete the 4596 delegate.

### `nextNewsPage` / `previousNewsPage` / `goToNewsPage` / `loadMoreNews` — 4473-4491 (dead, delegates) vs 4497-4520 (win, local state)
- **Not in the spawn prompt's list of 7 — found by esbuild.** Four more dead methods.
- Pagination state is owned by `NewsService` (`newsCurrentPage` at NewsService.js:16, read by
  `updatePagination()` at 193-199). The winning local versions mutate `this.newsCurrentPage`,
  which the service never reads, then call `this.updatePagination()` → the service recomputes from
  its own unchanged page. **News pagination cannot advance today.**
- The dead delegates advance the service correctly but `updatePagination()` (4466-4472) copies
  only `paginatedNewsArticles` / `newsTotalPages` / `newsHasMorePages` back — not `newsCurrentPage`
  — so the page indicator would freeze instead.
- Decision: **merge** — keep the four delegates, and add the missing `newsCurrentPage` sync to
  `updatePagination()`. `NewsService.getNewsState()` already returns it (NewsService.js:625) and
  `filterNews()` already syncs it via `Object.assign`. Touching `updatePagination()` is the only
  way to preserve the winner's behavior; called out explicitly as a scope note.

### `refreshNewsFeed()` — 4448 (dead, delegate) vs 4524 (wins, inline)
- Delegate → `NewsService.refreshNewsFeed` (NewsService.js:118-123): re-reads the DB, then a toast
  guarded by `if (appContext.showNotification)`.
- Winner → `POST /api/news/refresh` (external acquisition) then `fetchNewsArticles()`, with a
  `newsLoading` spinner and a fallback fetch on every error path.
- **`showNotification` is not defined anywhere on the `grapheneApp()` object** (grepped: only
  call sites at app-refactored.js:4729,4737,4754,4757 plus guarded uses inside NewsService). So
  the delegate's toast could never have fired, and the winner is a strict functional superset.
- Decision: **drop the delegate.** No behavior change; tombstone left.

### `shareArticle(article)` — 4618 (dead, delegate) vs 4744 (wins, inline)
- Bodies are the same algorithm; the difference is the guard. `NewsService.shareArticle`
  (NewsService.js:412-431) wraps every `showNotification` in `if (appContext && appContext.showNotification)`.
  The inline winner calls `this.showNotification(...)` **unguarded** at 4754 and 4757 — and that
  method does not exist, so on any browser without `navigator.share` the clipboard path throws
  `TypeError` inside a `.then()`/`.catch()` (unhandled rejection).
- Call site: `components/tabs/NewsTab.js:432` `@click="shareArticle(article)"`.
- Decision: **keep the guarded delegate at 4618, delete the inline at 4744.** This one is a real
  fix, not just a tidy-up.

### The six duplicate *data* keys (not methods, not in the spawn prompt)
All initialise to identical literals, so removing either occurrence is a runtime no-op:
`expandedCompoundBatches` 548/664 `{}`, `compoundBatchRelatedData` 549/676 `{}`,
`loadingCompoundBatchRelated` 550/679 `{}`, `compoundBatchRecords` 434/682 `[]`,
`compoundBatchSearch` 565/683 `''`. Kept the earlier occurrences (they sit in the organized
"Expansion states" / `*Records` / `*Search` groupings) and deleted the scattered later ones.
`compoundBatches` is different: 433 `compoundBatches: []` is shadowed by
`get compoundBatches() { return this.compoundBatchRecords; }` at 1810 — the getter is the intended
definition, so the dead data line at 433 goes.

---

## What I did

All 17 duplicate keys removed. Every removal site carries a one-line comment naming where the
surviving definition lives and why, so the next reader doesn't re-add the duplicate
(CHIP-PROTOCOL §7 prefers a tombstone to a silent deletion).

**No method was renamed, no method moved, no unrelated code reformatted, and no key was added or
removed from the object's public surface.** `Object.keys(window.grapheneApp()).length` is **984**
after the change, and was 984 before — duplicates already collapsed at parse time, which is exactly
why they were invisible. §8 satisfied: every name another chip could anchor wiring against still
resolves, and each now resolves to exactly one definition instead of two.

### Per-pair result

| Pair | Decision | Evidence (call sites) | Behavior change |
|---|---|---|---|
| `init()` | **merge** — 3 dead calls moved into the surviving `async init()`, after `setupDataPageRouting()` | `initSidebarState`/`handleInitialRoute` had **zero** other references anywhere in `client/`, `server/`, `shared/`, `scripts/` | Deep links now work: `/graphene` opens Graphene, not Dashboard. Sidebar collapse state is restored from localStorage at first paint. Sidebar parent group auto-expands on load. |
| `hasActiveFilters()` | **merge** — one method, dispatching on `activeTab` | `AIInsightsTab.js:176` and `NewsTab.js:225`, both `x-show="hasActiveFilters()"`; neither file is mine to edit | AI Insights' "active filters" row now reflects `analysisFilters` instead of the News filters. News keeps its own behavior. |
| `searchCompoundBatches()` | **merge** — kept the debounced version, dropped the raw delegate | `CompoundBatchesTab.js:44` `@input="searchCompoundBatches()"` | 6 keystrokes now issue **1** request instead of 6; also refreshes the available-compound-batch dropdown and clears rows on error. |
| `closeSemModal()` | **drop** the inline copy, keep the CRUDService delegate | live via a string reference: `client/index.html:1263` `closeMethod: 'closeSemModal'` | None — `CRUDService.closeSemModal` is byte-equivalent. |
| `handleSemFileChange(event)` | **drop** the dead delegate, keep the inline Graphene-form version | only caller is `GrapheneModal.js:563,577`; the SEM Reports modal inlines its own handler at `client/index.html:1173` | None. The surviving version is the correct one for the only caller. |
| `refreshNewsFeed()` | **drop** the dead delegate, keep the inline version | `NewsTab.js:257` `@click="refreshNewsFeed()"` | None. The survivor is a functional superset (it POSTs `/api/news/refresh` first); the delegate's only extra was a toast gated on `showNotification`, which does not exist. |
| `shareArticle(article)` | **keep the dead delegate, drop the inline copy** | `NewsTab.js:432` `@click="shareArticle(article)"` | Real fix: the inline copy called `this.showNotification(...)` unguarded and that method does not exist, so on any browser without `navigator.share` (including desktop Chrome, measured below) the clipboard path threw `TypeError`. |
| `nextNewsPage` / `previousNewsPage` / `goToNewsPage` / `loadMoreNews` **(4 extra pairs, not in the spawn prompt)** | **merge** — kept the NewsService delegates; added the missing `newsCurrentPage` mirror to `updatePagination()` | `NewsTab.js` pagination controls | Real fix: News pagination could not advance at all. Measured below. |
| 6 duplicate **data** keys (not in the spawn prompt) | **drop** the redundant occurrence | identical literals (`{}`/`[]`/`''`); `compoundBatches` was shadowed by its own getter | None. |

### The one line I changed that is not itself a duplicate

`updatePagination()` gained `this.newsCurrentPage = state.newsCurrentPage;`. Without it the
`nextNewsPage` merge would be incomplete: the surviving delegate advances NewsService but nothing
copies the page number back to Alpine, so the page indicator would freeze at 1 — losing the one
behavior the discarded version had. `NewsService.getNewsState()` already returns the field
(NewsService.js:625) and `filterNews()` already mirrors it, so this follows the existing pattern.
Flagged explicitly because it is the only edit outside a duplicate site.

---

## How I verified it

Lane A bar (CHIP-PROTOCOL §4, D-007): build read, `node --check`, and the change **run**.

### Static

```
$ npx esbuild client/src/js/app-refactored.js --outfile=/dev/null --log-limit=0
  → 17 duplicate-object-key warnings BEFORE
  → 0 warnings AFTER          (grep -c duplicate-object-key = 0)

$ node --check client/src/js/app-refactored.js
  → OK

$ npx vite build --outDir ../dist-dedupe
  ✓ 125 modules transformed.
  ../dist-dedupe/index.html                   88.88 kB │ gzip:  12.25 kB
  ../dist-dedupe/assets/index-Cr91abIV.js  1,198.02 kB │ gzip: 183.39 kB
  ✓ built in 864ms
  (only the pre-existing >500 kB chunk-size advisory and the stale caniuse-lite notice)
```

Per-key definition count after the change — all 1:
`expandedCompoundBatches, compoundBatchRelatedData, loadingCompoundBatchRelated,
compoundBatchRecords, compoundBatchSearch, compoundBatches, init, hasActiveFilters,
searchCompoundBatches, closeSemModal, handleSemFileChange, refreshNewsFeed, shareArticle,
nextNewsPage, previousNewsPage, goToNewsPage, loadMoreNews`.

### Running the app

`PORT=3013 node server/index.js` (Environment: development) + `npx vite --port 5186`.

> Port 3013 was already held by a **leftover Express from the aborted Wave 1 run of this chip**,
> serving out of `.claude/worktrees/agent-ab452bb636cd75452`. Killed it (PID 35126) before starting
> mine. Worth the Command Center knowing that aborted chips can leave listeners behind.

SPA fallback, proving the `init()` fix is about a real reachable URL space
(`server/index.js:250-256`, `app.get('*') → client/index.html` in dev):

```
$ for p in / /graphene /tasks /test-matrix /news; do curl -s -o /dev/null -w "%{http_code} " localhost:3013$p; done
/  200   /graphene 200   /tasks 200   /test-matrix 200   /news 200
   (each response contains grapheneApp())
```

**`init()` verified live in the browser** at `http://localhost:5186/...`, reading the mounted
Alpine component's own state (not a fresh object):

| URL | `activeTab` | `sidebarExpanded` | parent group | localStorage |
|---|---|---|---|---|
| `/graphene` | `graphene` | `true` | `sidebarProductionOpen: true` | (unset) |
| `/test-matrix` | `test-matrix` | **`false`** | `sidebarTestResultsOpen: true` | `sidebarExpanded="false"` |

Before the fix all three columns would have been `dashboard` / `true` / `false`. All three
restored calls demonstrably run. (localStorage key removed again afterwards.)

The remaining six pairs exercised against `window.grapheneApp()` in the page context — the same
technique used to verify the `exportData` fix on this base:

```
hasActiveFilters   activeTab='ai-insights' + analysisFilters.species='Species 1' → true
                   activeTab='news'        + analysisFilters.species='Species 2' → false  (news branch ignores analysis state)
closeSemModal      showSemModal true→false, currentSemPdf '/uploads/x.pdf'→null
handleSemFileChange  fed a real File('a.pdf') → grapheneForm.semReportFile='a.pdf',
                     semReportForm.semFiles=null   (correct target; the graphene modal is the only caller)
searchCompoundBatches  6 simulated keystrokes → 0 calls immediately, 1 call after 400 ms  (was 6)
refreshNewsFeed    stubbed fetch → exactly one request: ["/api/news/refresh","POST"],
                   then 1 fetchNewsArticles(), newsLoading back to false
```

**News pagination**, driven against the real `NewsService` singleton (imported into the page via
`/src/js/services/NewsService.js`, 45 fake articles, `newsPageSize` = 10 → 5 pages):

| call | app `newsCurrentPage` | service page | first 3 article ids |
|---|---|---|---|
| initial | 1 | 1 | 1, 2, 3 |
| `nextNewsPage()` | 2 | 2 | 11, 12, 13 |
| `nextNewsPage()` | 3 | 3 | 21, 22, 23 |
| `previousNewsPage()` | 2 | 2 | 11, 12, 13 |
| `goToNewsPage(4)` | 4 | 4 | 31, 32, 33 |
| `goToNewsPage(999)` | 4 | 4 | (rejected, correct) |
| `loadMoreNews()` | 5 | 5 | `newsHasMorePages: false` |
| `loadMoreNews()` at end | 5 | 5 | (no-op, correct) |

And the **old** behavior replayed verbatim on the same object for contrast:
`{ before: [1,2,3], afterOldNextNewsPage: [1,2,3], servicePage: 1 }` — the article slice never
moved. That is the bug this pair was hiding.

**`shareArticle` — the TypeError proved, not asserted.** With `navigator.share` forced undefined
(this Chrome reports `'share' in navigator === false` natively, so the fallback is the real desktop
path) and `clipboard.writeText` forced to reject:

```
new path (NewsService delegate)  → unhandled rejections: []
old inline body, replayed        → ["TypeError: o.showNotification is not a function"]
typeof o.showNotification        → "undefined"
```

### Console state

The page loads and renders (login gate shown; I have no credentials and did not create a user or
write to the database — D-004/D-005). Console errors present are all environment or pre-existing,
none from this change:

- ~15 × `500 (Internal Server Error)` on `/api/*` — Vite's proxy target is hardcoded to
  `localhost:3001` (`vite.config.js:26`) and I am on 3013; `vite.config.js` is not mine to edit.
- A cascade of `Cannot read properties of null (reading 'weeklyDigestEnabled' | 'fromAddress' | …)`
  from `EmailAdminTab.js` binding `emailSettingsForm.*` while that state is `null`. Confirmed
  initial state is `emailSettingsForm: null` and my diff does not touch anything email-related.
  Pre-existing; recorded as a finding below.

---

## Draft wiring

None. I own the wiring file this wave; everything is applied.

## Draft for shared docs

**Doc:** `CLAUDE.md`, **Section:** `## Gotchas` — append:

> - `client/src/js/app-refactored.js` returns one ~6,300-line object literal, so a repeated key is
>   legal JavaScript and the **last definition silently wins**. Seventeen such duplicates existed
>   and were removed in Wave 1 (`exportData` earlier, then `init`, `hasActiveFilters`,
>   `searchCompoundBatches`, `closeSemModal`, `handleSemFileChange`, `refreshNewsFeed`,
>   `shareArticle`, the four News pagination methods, and six compound-batch data keys). Before
>   adding a method here, check the name isn't already taken:
>   `npx esbuild client/src/js/app-refactored.js --outfile=/dev/null --log-limit=0` reports every
>   duplicate key with both line numbers. Two features needing the same method name must be
>   *merged into one dispatching method*, not defined twice — `hasActiveFilters()` (AI Insights vs
>   News) is the worked example.

**Doc:** `CLAUDE.md`, **Section:** `## Gotchas` — append:

> - `showNotification()` is called in several places (`NewsService`, and formerly in
>   `app-refactored.js`) but **is not defined on the `grapheneApp()` object**. `NewsService` guards
>   every call with `if (appContext.showNotification)`; anything calling `this.showNotification(...)`
>   directly will throw. There is no toast system in this app yet.

**Doc:** `DECISIONS.md` — no change proposed. Nothing here contradicts an existing ruling.

## Handoff: changes needed in files I do not own

None required for this chip's job. Two adjacent issues are written up as findings + proposed
follow-up chips below rather than as handoff diffs, because each needs a decision, not a
transcription.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| high | `init()` defined twice; the earlier one held the only calls to `initSidebarState()` and `handleInitialRoute()`. Deep links and reloads always landed on Dashboard; the saved sidebar collapse state was never restored | `client/src/js/app-refactored.js:230` (was) | **fixed here** |
| high | `hasActiveFilters()` defined twice for two unrelated features. News won, so the AI Insights "active filters" row was driven by news filter state and never appeared | `app-refactored.js:4277` / `:4596` (was) | **fixed here** — merged into one tab-dispatching method |
| high | News pagination could not advance: `nextNewsPage`/`previousNewsPage`/`goToNewsPage`/`loadMoreNews` were each defined twice, and the winning copies mutated the Alpine page number while `NewsService` owns it. **Not in the spawn prompt — found by esbuild** | `app-refactored.js:4497-4520` (was) | **fixed here** |
| high | `shareArticle()` called `this.showNotification(...)`, which is not defined on the object → `TypeError` on the clipboard fallback (the real path on desktop Chrome, where `navigator.share` is absent) | `app-refactored.js:4754,4757` (was) | **fixed here** by keeping the guarded `NewsService` delegate |
| medium | `showNotification()` is referenced but **never defined** on `grapheneApp()`. `toggleBookmark()` still calls it unguarded at two places, so bookmarking an article throws in both the success and error paths | `app-refactored.js:4711,4719` (in `toggleBookmark`, 4675) | left, why: not a duplicate key — outside the dedupe scope. Proposed as CHIP-NOTIFY-TOAST |
| medium | `searchCompoundBatches()` fired one API request per keystroke (no debounce, unlike every sibling search method), so out-of-order responses could show stale rows | `app-refactored.js:2203` (was) | **fixed here** — 6 keystrokes now = 1 request |
| medium | `AIInsightsTab.js` `hasActiveFilters()` is truthy with default state, because `analysisFilters.includeCompoundBatches` and `.includeMicronization` both default to `true`. Now that the AI branch is live, the "Active filters" row shows two chips on first load | `app-refactored.js` `analysisFilters` default | left, why: I restored the dead implementation verbatim; changing what "active" means is a product decision, not a dedupe |
| medium | Every `emailSettingsForm.*` binding in `EmailAdminTab.js` throws `Cannot read properties of null` on first paint, because `emailSettingsForm` starts as `null` and the tab template is always in the DOM (mounted via `x-html`, gated only by `x-show`). ~20 console errors per page load | `EmailAdminTab.js` + `app-refactored.js` `emailSettingsForm: null` | left, why: not owned / not a duplicate. Proposed as CHIP-EMAILTAB-NULLGUARD |
| medium | Restoring `handleInitialRoute()` makes `/news` reachable again — verified: navigating to `/news` sets `activeTab='news'` and renders the retired News tab. It has no sidebar entry by design (CLAUDE.md: "News Feed tab is hidden, code preserved") but it is in the route allowlist | `app-refactored.js:249,261` | left, why: needs a ruling — remove `'news'` from both allowlists, or accept it |
| low | The 25-entry `validTabs` array is duplicated verbatim inside `handleInitialRoute()`, and `switchTab()` has no allowlist at all. Adding a tab means editing two literals correctly | `app-refactored.js:249` and `:261` | left, why: shared wiring surface; would move anchors. Proposed as CHIP-TABS-ALLOWLIST |
| low | `client/src/js/app.js` and `client/src/js/app-original.js` are unreferenced (no import, no `<script src>`, no `x-data`) and contain older copies of `handleSemFileChange`, `closeSemModal`, `viewSemReport` — they polluted every grep I ran for this job | `client/src/js/` | left, why: not owned. W1-RECON-DEAD appears to own this ground |
| low | `client/src/js/components/tabs/NewsTabFunctions.js` is unreferenced and defines a third copy of `refreshNewsFeed`/`shareArticle`/`hasActiveFilters` | `components/tabs/NewsTabFunctions.js` | left, why: not owned |
| low | `client/index.html:1173` sets `semReportForm.semFiles` inline and skips PDF validation entirely, while `CRUDService.handleSemFileChange()` — which validates every file — has no caller | `client/index.html:1173`, `CRUDService.js:802` | left, why: not owned |
| low | Six duplicate *data* keys (`compoundBatchRecords`, `compoundBatchSearch`, `expandedCompoundBatches`, `compoundBatchRelatedData`, `loadingCompoundBatchRelated`, `compoundBatches`) | `app-refactored.js` | **fixed here** — no runtime effect, but they made the esbuild signal noisy |
| medium | 46 `/api/*` GETs across 17 endpoints fire at the **login screen**, before authentication: `client/index.html:26` puts `x-data="grapheneApp()" x-init="init()"` on an `x-show`-gated div, and Alpine initialises regardless of `x-show`. Directly relevant to W1-AUTH-GUARD | `client/index.html:26` | left, why: not owned. Proposed as CHIP-AUTH-INIT-GATE |
| low | An Express process from the **aborted** Wave 1 run of this chip was still listening on port 3013, serving from a deleted worktree | port 3013, PID 35126 | **fixed here** — killed before starting mine |

### What I saw outside my scope

**The spawn prompt undercounted by 10.** It listed 7 method pairs; `esbuild` reports 17 duplicate
keys — 11 method pairs and 6 data pairs. The four extra method pairs are the News pagination set,
and they are not cosmetic: they are the reason News pagination doesn't work. The prompt's seven
line numbers were all still exactly right, so the file had not drifted — the earlier measurement
simply wasn't exhaustive. `npx esbuild <file> --outfile=/dev/null --log-limit=0` is a complete,
zero-config detector; it took one command and needs no dependency (esbuild is already vendored
under Vite). **W1-CHECK-SUITE should use it rather than writing a parser.**

**This file has a systemic shape problem, and the duplicates are the symptom.** Every duplicate I
resolved was one of three stories, and all three are structural:

1. *A service extraction that was never finished.* `searchCompoundBatches`, `closeSemModal`,
   `handleSemFileChange`, `refreshNewsFeed`, `shareArticle` and the News pagination set each exist
   as an old inline body **and** a newer `Service.method(this)` delegate, sitting hundreds of lines
   apart in the same literal. Someone added the delegate layer and left the originals in place.
   The delegates are grouped near the top, the originals near the bottom, so ordering decided
   which half of the migration is actually running — and it decided **inconsistently**: the
   delegate won for `hasActiveFilters` but lost for `shareArticle`. Nobody chose that.
2. *Two features colliding on a generic name.* `exportData` (already fixed) and `hasActiveFilters`.
   With no modules there is no namespace, so "does any filter apply" is a global identifier. There
   will be more of these; `formatDate`, `getActiveFilters`, `removeFilter` and `clearAllFilters`
   are all currently single-owner but generically named.
3. *Copy-paste state blocks.* The six data keys are the same five compound-batch fields declared in
   two different "state" regions ~120 lines apart.

**The service layer's state ownership is split down the middle.** `NewsService` keeps its own
`newsCurrentPage`/`filteredNewsArticles`/`newsPageSize` and the Alpine object keeps *copies*, hand-
synced by `Object.assign(this, NewsService.getNewsState())` in some methods and by three explicit
field copies in others. That mismatch is exactly what broke pagination. Contrast `CRUDService`,
which mutates `appContext` directly and holds no state — the pattern CLAUDE.md documents.
`NewsService` (and `FilterService`, which also has a `getActiveFilters`) do not follow it.

**`showNotification` does not exist.** Four call sites in `app-refactored.js` (two of which I
removed) plus ten guarded ones in `NewsService`. The guarded ones silently no-op, which is why
nobody noticed. There is no toast/notification system in this app at all.

**A note for W1-AUTH-GUARD:** `client/index.html:26` is
`x-data="grapheneApp()" x-init="init(); updateCurrentUser()"` on a div that is only `x-show`-gated
by `isAuthenticated`. Alpine initialises the subtree regardless of `x-show`, so **`init()` runs its
full 16-endpoint `Promise.all` before anyone has logged in.** Measured on the login screen via
`performance.getEntriesByType('resource')`: **46 `/api/*` requests across 17 distinct endpoints**,
with `/api/bet`, `/api/conductivity`, `/api/raman`, `/api/tem`, `/api/update-reports` and
`/api/sem-reports` each hit 4 times (the rest twice) — so there is retry/duplication on top of the
initial fan-out. Once GETs require a JWT those all become 401s on every unauthenticated page load.
Nothing breaks (each loader catches and sets `[]`), but the console will be loud and it is 46
wasted round-trips before a user has typed a password. Pre-existing — my change adds no loader
calls. `x-if` instead of `x-show` on that div would fix the bulk of it; that is `client/index.html`,
so it needs its own chip.

### Risks in what I built

1. **`hasActiveFilters()` dispatching on `activeTab` is the weakest thing here.** It is correct for
   the two known call sites, but it makes a shared method's result depend on global UI state. If a
   third caller appears, or if either tab is ever rendered while `activeTab` is something else
   (e.g. `'data-page'`), it silently takes the AI branch. The clean fix is two differently-named
   methods, which requires editing `AIInsightsTab.js` / `NewsTab.js` — both do-not-touch for me.
   **This should be revisited by whoever next owns those two files.**
2. **`init()` ordering.** I reasoned about the interaction with `setupDataPageRouting()` from the
   code (`handleInitialRoute` early-returns on a data-page hash) and verified the plain-path cases
   in the browser. What I could **not** verify is the combination *hash data-page route + logged-in
   user + real data*, because that needs credentials and a live API. If a regression shows up, it
   will be a URL like `/graphene#/data/graphene/GR-001`.
3. **`init()` now runs three more things before auth is known.** `enforceThirdPartyRestrictions()`
   still runs after (via `updateCurrentUser()` at the old position and again from `x-init`), and I
   placed my calls deliberately before it so a restricted deep link gets corrected. I confirmed the
   ordering by reading, not by logging in as a THIRD_PARTY user. **A THIRD_PARTY deep-linking to
   `/tasks` is the case to spot-check at integration.**
4. **The `searchCompoundBatches` debounce is a visible timing change.** Results now appear 300 ms
   after typing stops rather than per keystroke. Intended, matches every sibling search, but it is
   the change a user would most plausibly describe as "it got slower".
5. **`updatePagination()` gained a line.** If any caller relied on `newsCurrentPage` *not* being
   overwritten, it would now be. I found no such caller.

### Proposed follow-up chips

| Name | Job | Owns | Lane | Tier |
|---|---|---|---|---|
| `CHIP-NOTIFY-TOAST` | Add a real `showNotification(message, type)` to the app (or delete the ~14 call sites). Fix `toggleBookmark`'s two unguarded calls, which throw today | `client/src/js/app-refactored.js` (+ a small toast component) | A | sonnet |
| `CHIP-EMAILTAB-NULLGUARD` | Stop `EmailAdminTab` throwing ~20 null-property errors on every page load before settings load | `client/src/js/components/tabs/EmailAdminTab.js` | A | sonnet |
| `CHIP-NEWSSERVICE-STATE` | Make `NewsService` mutate `appContext` like `CRUDService` does instead of holding a shadow copy of pagination/filter state, removing the hand-sync entirely | `client/src/js/services/NewsService.js` + `app-refactored.js` news delegates | A | opus |
| `CHIP-TABS-ALLOWLIST` | One `VALID_TABS` constant instead of two inline literals; decide whether `'news'` stays routable; make `switchTab()` validate | `client/src/js/utils/constants.js`, `app-refactored.js` | A | sonnet |
| `CHIP-AUTH-INIT-GATE` | `x-if` instead of `x-show` on the `grapheneApp()` root so `init()` doesn't fire 16 API calls at the login screen. **Pairs with W1-AUTH-GUARD** | `client/index.html` | A | sonnet |
| `CHIP-APP-DECOMPOSE` | The roadmap item. Split the 6,274-line literal into domain mixins. **MOVE work — must run alone** (CHIP-PROTOCOL §6/§8) | `client/src/js/app-refactored.js` + new files | A | opus |

On `CHIP-APP-DECOMPOSE`, since §8 invites the proposal: the file is already ~40% delegate
one-liners grouped by domain, so the natural seam is per-domain mixin objects
(`newsMixin`, `compoundBatchMixin`, …) spread into the returned literal — `filterMixin` is already
imported and does exactly this, so the pattern exists in-repo and needs no framework. That would
have made all 17 duplicates impossible: a repeated key across two spread objects is still
last-wins, but a repeated key *within* one 300-line mixin is visible to a human reviewer. It is
MOVE work and would invalidate every anchor, so it must run alone, ideally right after a wave
where nothing else has drafted wiring.

### Harness improvements

1. **The spawn prompt's list of pairs was presented as the job, and it was incomplete.** I nearly
   stopped at seven. What saved it was the verification bar's separate sentence — "confirm zero
   duplicate top-level method keys remain" — which forced a full measurement. Suggestion: when a
   prompt enumerates instances of a defect, say explicitly whether the list is exhaustive or
   indicative, and give the command that regenerates it. "Measure before choosing a threshold"
   (§6) should probably generalise to "measure before trusting an enumeration."
2. **Two chips measuring the same defect while one fixes it is fine, but only because the prompt
   said so.** Being told up front that W1-CHECK-SUITE's baseline would move under it removed the
   only real coordination anxiety. Worth keeping as a prompt convention.
3. **`vite.config.js` hardcodes the proxy target to `localhost:3001`, and it isn't in anyone's
   owned-files list.** Per-chip ports are assigned for Express and Vite, but a chip on port 3013
   cannot make the browser reach its own server — every `/api` call 500s. §9's port-pair advice is
   therefore only half a solution for any chip that needs the UI *with* data. Either give one chip
   per wave ownership of `vite.config.js`, or read the target from `process.env.PORT`.
4. **Aborted chips leave listeners behind.** Port 3013 was held by an Express from the aborted
   Wave 1, running out of a worktree that no longer exists. A pre-wave `lsof -nP -iTCP -sTCP:LISTEN`
   sweep by the Command Center would catch this. Add to §9.
5. **The login gate is a real ceiling on Lane A verification.** D-005 gives read-only DB access,
   but the UI is unreachable without credentials, and D-004/D-005 correctly forbid creating a user.
   The `window.grapheneApp()` direct-instantiation trick works well and should be written into §4
   as *the* technique for this repo — but a read-only seeded test account would be worth more than
   any other single harness change for client-side chips.
6. **Model tier: opus was right, and not because of the code volume.** The mechanical edit is
   sonnet work. What needed the tier was deciding *which* of each pair survives: three of the
   eleven pairs inverted on evidence found only by grepping template strings and checking whether
   a method exists at all. `shareArticle` in particular looks like an obvious "delete the dead
   delegate, keep the real implementation" until you notice the surviving implementation calls a
   method that doesn't exist. A cheaper model following the prompt's framing ("the earlier is
   silently dead") would very plausibly have kept the throwing version in four places.
