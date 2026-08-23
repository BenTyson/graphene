# CHIP-W5-STARTDATE-TZ

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:**
  - `server/routes/tasks.js`
  - `server/routes/goals.js`
  - `client/src/js/components/tabs/TasksTab.js`
  - `client/src/js/components/modals/TaskDetailPanel.js`
  - `client/src/js/app-refactored.js` (§8 shared wiring — minimal additive only)
  - `shared/orgTimezone.js` — **new file, ownership granted mid-task** (see Harness improvements)
  - `notes/W5-STARTDATE-TZ.md`
- **Wave:** 5

## What I was asked to do

Correct a timezone defect in `W5-TASK-STARTDATE`'s uncommitted work. The requirement is an
invariant, not an implementation:

> For any task whose `startDate` was never explicitly set, the Start date displayed must equal the
> Created date displayed for that same task, on the same screen, for a viewer in any timezone.

**The mechanism changed mid-task.** My original brief said to move the derivation to the *client*
and resolve `createdAt` in the browser's timezone. Partway through I received a course correction
carrying a ruling from Ben:

> "I only ever want to use MST for the date time picker, although we really only deal with dates,
> not times."

So: one fixed **organisation** timezone, not the viewer's. Everyone sees the same Mountain calendar
date wherever they are. That is a stronger requirement than the invariant — it satisfies it, and
additionally makes two people in different offices agree with each other. I had already built and
verified the client-side version; I reverted it. Both states are recorded below because the
comparison is the most useful thing in this file.

Preserved throughout: the no-backfill design (D-016). A null `start_date` means "nobody chose one,
so it is the creation date"; not one pre-existing row is written.

## What I did

### The defect, stated precisely

Two calendar dates on the same panel, computed in two different timezones:

| Surface | Before | Frame |
|---|---|---|
| Start (derived) | `server/routes/tasks.js` `resolveStartYmd()` → `createdAt.toISOString().split('T')[0]` | **UTC** |
| Created | `TaskDetailPanel.js` → `new Date(createdAt).toLocaleDateString()` | **browser-local** |

`createdAt` is an *instant*. An instant has no calendar date until a timezone is chosen. The old
code chose two different ones, so the same task read `Created: Aug 23` and `Start: Aug 24` for a
viewer at UTC−6 whenever it had been created after 18:00 Mountain. Production has 88 tasks, every
one of which takes a derived date.

### The fix: one shared timezone constant, both sides

**1. `shared/orgTimezone.js` — new, 60 lines, no dependencies.**

```js
export const ORG_TIMEZONE = 'America/Denver';
export function ymdInTz(date, timeZone = ORG_TIMEZONE) { /* Intl.DateTimeFormat('en-CA', …) */ }
export function orgYmd(value) { /* null-safe ymdInTz(value, ORG_TIMEZONE) */ }
```

- **Why `shared/`.** It is the only directory this repo already imports from *both* runtimes —
  `@shared/proformaEngine.js` from the client via the Vite alias (`vite.config.js:22`),
  `../../shared/proformaEngine.js` from the server (`server/routes/proforma.js:5`). Putting the
  constant anywhere else means two copies, and a timezone constant that exists twice is a timezone
  constant that will eventually be two different timezones. Plain ESM, no imports, so Node loads it
  unbuilt and Vite bundles it without special handling.
- **Why `America/Denver` and not `MST` or `UTC-7`.** Ben said "MST". Taken as *Mountain Time*.
  Denver observes daylight saving — it is MDT (UTC−6) right now, in August — so a fixed −7 offset
  would be wrong from March to November. For date-only rendering a one-hour error is not a rounding
  error: it is exactly the error that flips the calendar day either side of midnight, which is the
  entire bug this module exists to prevent. `America/Denver` resolves MST and MDT automatically.
  **This is an interpretation of "MST" and Ben may want to correct it** — the Command Center is
  flagging it to him.
- **Why `ymdInTz` lives here and not in `server/services/emailDigest.js:9`, where it already
  existed.** That copy was the only correct timezone-aware date conversion in the codebase, written
  so "due tomorrow" buckets are per-local-day rather than per-UTC-day. Hoisting the idea is what
  makes it reusable instead of one subsystem's private habit. I could not *move* it —
  `emailDigest.js` is not mine — so there are two copies until someone applies the four-line
  Handoff block below. I would rather report that honestly than leave the shared module importing
  from a server-only service, which the client cannot load.

**2. `server/routes/tasks.js` — the server derives again, correctly.**

```js
function resolveStartYmd(task) {
  return task.startDate ? toYmd(task.startDate) : orgYmd(task.createdAt ?? null);
}
```

Still the only fallback in the app. The distinction that matters is now written down in the code:
`toYmd()` (UTC) is for columns that *store* a bare calendar date as UTC midnight, where the UTC day
IS the day the user typed; `orgYmd()` is for anything derived from a real timestamp. A comment on
`toYmd()` says so, because the next person to reach for it will be holding a `createdAt`.

`startDateIsDerived` is **kept**. Under the client-derivation design it was redundant
(`startDate === null` said the same thing) and I had removed it. Under org-timezone the server
sends a resolved date again, so the client genuinely cannot tell "chosen" from "inherited" without
it. It is back, and it is now load-bearing rather than duplicative.

**3. `client/src/js/app-refactored.js` — the part that actually closes the invariant.**

The easy half of this bug is the server. The half that gets missed is that `Created` was
*browser-local*, so fixing only the server would relocate the bug rather than remove it.

```js
getTaskCreatedLabel(createdAt) {
  return this.getTaskStartLabel(orgYmd(createdAt));
},
```

`orgYmd(createdAt)` is not merely *equivalent to* what `resolveStartYmd()` computes for a derived
task — it is the identical expression on the identical input, formatted by the identical function.
The two cannot disagree without the shared module being broken, which is a much smaller surface to
be wrong about than two independently-correct date paths.

Also changed one line inside `getTaskStartLabel`: the "is this the current year?" test compared
against `new Date().getFullYear()`, the *browser's* year. On New Year's Eve a viewer in Auckland is
already a year ahead and would see `, 2026` appended to every date the Mountain office considers
current. Now compared against the org year. Cosmetic, same root cause, one line.

**4. `server/routes/goals.js` — the shape fix from `W5-TASK-STARTDATE`'s Handoff.**

Verified before applying, and it needed amending. The sibling's paste-ready block emitted
`startDate: (t.startDate ?? t.createdAt) …` — a *second* copy of the fallback, in UTC, i.e. the
defect I was sent to remove, freshly duplicated. Applied instead as the same two fields
`serializeTask()` emits, using `orgYmd` for the derived branch. Confirmed the `include` on the
query at `goals.js:100-108` carries `createdAt` (it does — no narrowing `select`).

I did **not** take the larger option of exporting `serializeTask()` and calling it here. It would
also change `cost` from a Prisma `Decimal` (JSON-serialized as the string `"12.50"`) to a `Number`,
and I could not establish that no `GoalDetailPanel` template does string arithmetic on it. That
remains `CHIP-TASK-SERIALIZER-SHARE`.

### The two knock-on decisions, argued

**Activity logging at creation: removed entirely.** There was an entry gated on
`toYmd(task.startDate) !== toYmd(task.createdAt)` — "log it only if the date was backdated". Both
sides of that comparison were in the wrong frame, and **only one of them is fixed by this chip**:

- `createdAt`'s calendar date is now well-defined (org timezone), but
- the date the *client sends* is still browser-local. `openTaskForm()` in
  `client/src/js/services/TaskService.js:74` defaults the field to `todayYmd()`, computed from the
  browser clock (`TaskService.js:17`, and it is explicit that it is local). A viewer outside
  Mountain Time creating a task near midnight sends a different day from the org day, the test
  reads that as a deliberate backdate, and a spurious "set the start date" line appears next to
  `created`.

I considered a tolerance window — offsets span UTC−12..UTC+14, so a client-sent "today" can only
ever be within about 36 hours of `createdAt`, and anything beyond that is unambiguously deliberate.
It works, and I rejected it: it encodes a magic number whose correctness depends on the accident
that the client happens to send local-today, and it would silently swallow a genuine "started
yesterday". Removing the entry costs nothing real — it only ever restated what the panel shows, and
now that Created and Start are both org-time the reader can compare them *directly*, which is the
whole point of this chip. Every change **after** creation is still logged, which is where an audit
trail earns its keep. If `TaskService` is fixed (Handoff below) the entry can come back correctly.

**Activity `fromValue`/`toValue`: the stored values, not the resolved ones.** Previously a reset
logged `toValue: <resolved creation date>`. An activity row is a permanent record of what changed
in the column. An explicit date the user typed is exactly that. "The creation date" is not — it is
a *rendering* of `createdAt` under whatever `ORG_TIMEZONE` currently is, and freezing today's answer
into a permanent row makes the log lie the day that constant changes. So a reset logs
`toValue: null`, and `TaskDetailPanel.js` renders `reset the start date to the creation date`
without a parenthetical date; the live resolved date is on the Start Date field a few inches above.

### What I reverted (the client-derivation design, built and verified, then withdrawn)

Recorded because the Command Center may want it if Ben rejects a single org timezone. It was:
serializer emits explicit-or-null; `startDateIsDerived` deleted as redundant; one client helper
`resolveTaskStartYmd(task)` returning `task.startDate` or `this._ymd(new Date(task.createdAt))`;
templates composing `getTaskStartLabel(resolveTaskStartYmd(task))`. It satisfied the invariant —
measured, at both Denver and Auckland — but it makes two viewers in different offices see different
dates for the same task, which is what the org-timezone ruling rejects. No trace of it remains
except this paragraph; `grep -rn "resolveTaskStartYmd\|isTaskStartDerived" client server` → none.

## How I verified it

Lane A bar (CHIP-PROTOCOL §4, D-007). Express on **3131** (`PORT=3131 node server/index.js`), Vite
on **5284**, JWT minted directly from `JWT_SECRET` — never `/api/auth/login` (D-005). Database is
staging (`trolley.proxy.rlwy.net:51966`), confirmed per D-017.

### 1. The bug, demonstrated before and after, at two timezones — the headline result

I needed a task whose `createdAt` falls on **different calendar days in UTC and in Mountain Time**.
None existed: every row on staging was created 20:36–21:30 UTC, which is mid-afternoon Denver. So I
created one with a controlled timestamp:

```
2026-08-24T02:30:00.000Z   ==  2026-08-23 20:30  America/Denver   (MDT, UTC-6)
                           ==  2026-08-24 14:30  Pacific/Auckland (NZST, UTC+12)
   UTC day = Aug 24        |    Mountain day = Aug 23
```

The harness renders rows using the **actual `getTaskStartLabel` and `getTaskCreatedLabel` source
extracted from `app-refactored.js` at run time by brace-matching** — not retyped copies — against
`startDate` values fetched live from the running API, under `TZ=` overrides.

```
process TZ = America/Denver   (ORG_TIMEZONE = America/Denver)
------------------------------------------------------------------------------------------------
createdAt (UTC)           BEFORE Start  BEFORE Created  | AFTER Start  AFTER Created  match?
------------------------------------------------------------------------------------------------
2026-08-23T20:36:57.251Z  2026-08-23    8/23/2026       | Aug 23       Aug 23         YES
2026-08-23T21:05:51.007Z  2026-08-23    8/23/2026       | Aug 23       Aug 23         n/a (explicit)
2026-08-23T21:05:51.753Z  2026-08-23    8/23/2026       | Aug 30       Aug 23         n/a (explicit)
2026-08-24T02:30:00.000Z  2026-08-24    8/23/2026       | Aug 23       Aug 23         YES   <-- THE BUG
------------------------------------------------------------------------------------------------
INVARIANT HOLDS: every derived row renders Start === Created

process TZ = Pacific/Auckland   (ORG_TIMEZONE = America/Denver)
------------------------------------------------------------------------------------------------
createdAt (UTC)           BEFORE Start  BEFORE Created  | AFTER Start  AFTER Created  match?
------------------------------------------------------------------------------------------------
2026-08-23T20:36:57.251Z  2026-08-23    8/24/2026       | Aug 23       Aug 23         YES   <-- THE BUG
2026-08-23T21:05:51.007Z  2026-08-23    8/24/2026       | Aug 23       Aug 23         n/a (explicit)
2026-08-23T21:05:51.753Z  2026-08-23    8/24/2026       | Aug 30       Aug 23         n/a (explicit)
2026-08-24T02:30:00.000Z  2026-08-24    8/24/2026       | Aug 23       Aug 23         YES
------------------------------------------------------------------------------------------------
INVARIANT HOLDS: every derived row renders Start === Created
```

Read the BEFORE columns first — the defect is visible in **both** timezones and in **opposite
directions**, which is exactly why a naive fix in either direction would have failed:

- **Denver, row 4:** Start `2026-08-24`, Created `8/23/2026`. Off by one, Start ahead.
- **Auckland, row 1:** Start `2026-08-23`, Created `8/24/2026`. Off by one, Created ahead.

AFTER, every derived row is `Aug 23 / Aug 23` in both. Note especially Auckland row 4: the viewer
sees **Aug 23** on a task whose UTC day and whose own local day are both Aug 24. That is the
org-timezone ruling working as intended, not a bug — the Mountain office's date is the date.

Ran `TZ=UTC` as a third control; also `Aug 23 / Aug 23` on both derived rows.

Explicit start dates are untouched by all of this: row 3 renders `Aug 30` in Denver, Auckland and
UTC, exactly as entered.

### 2. The same, in the real browser, in the real Alpine app

Vite 5284, `window.grapheneApp()`. Browser reported `America/Denver`, offset **360** (UTC−6, MDT).
**Zero console errors.**

| Input | `getTaskStartLabel` | `getTaskCreatedLabel` | match |
|---|---|---|---|
| createdAt `2026-08-24T02:30:00Z`, derived | `Aug 23` | `Aug 23` | **yes** |
| createdAt `2026-08-23T20:36:57Z`, derived | `Aug 23` | `Aug 23` | **yes** |
| explicit `2026-08-30` | `Aug 30` | `Aug 23` | n/a — explicit, correctly differs |

Degradation: `getTaskStartLabel('')` → `''`, `('not-a-date')` → `''`,
`getTaskCreatedLabel(null)` → `''`. No `Invalid Date` reaches the DOM.
`getTaskStartLabel('2025-12-31')` → `Dec 31, 2025` (year shown when not the org year).
`isStartAfterDue('2026-09-10','2026-09-01')` → `true`; equal dates → `false`.

### 3. Server round-trip, live

```
GET /api/tasks/cmt6bka810001kvulstwvshfu
  { "createdAt": "2026-08-24T02:30:00.000Z",   <- UTC day is Aug 24
    "startDate": "2026-08-23",                 <- Mountain day, as required
    "startDateIsDerived": true }

GET /api/tasks?status=ARCHIVED        (the list path, which had its own inlined copy pre-W5)
  2026-08-24T02:30:00.000Z | start=2026-08-23 | derived=true
  2026-08-23T20:36:57.251Z | start=2026-08-23 | derived=true
```

Single-task and list agree. Old behaviour on that first row would have been `2026-08-24`.

### 4. Full lifecycle and the activity log

```
POST {"title":"…lifecycle","startDate":"2026-08-23","dueDate":"2026-09-10"}
   -> startDate 2026-08-23, derived=false
POST {"title":"…derived-now"}                       (no startDate at all)
   -> createdAt 2026-08-23T21:30:13.787Z, startDate 2026-08-23, derived=true

PUT {"startDate":"2026-07-15"} -> 2026-07-15  derived=false
PUT {"startDate":null}         -> 2026-08-23  derived=true    <- reverts to derived, not blank
PUT {"startDate":null}         -> 2026-08-23  derived=true    <- no-op, no second log entry
PUT {"startDate":"2026-08-30"} -> 2026-08-30  derived=false
PUT {"startDate":"not-a-date"} -> HTTP 400 {"error":"startDate must be a valid date (YYYY-MM-DD)"}

activity log, task 1 (oldest first):
  created             from=null        to=null
  start_date_changed  from=2026-08-23  to=2026-07-15
  start_date_reset    from=2026-07-15  to=null          <- stored values, not resolved
  start_date_set      from=null        to=2026-08-30

activity log, task 2 (created with no startDate):
  created             from=null        to=null          <- and nothing else
```

Task 1 was created *with* an explicit `startDate` and produced **no** `start_date_set` entry — the
create-time log is gone, as designed. Explicit dates round-trip byte-exact (`2026-07-15`,
`2026-08-30`).

### 5. `goals.js` now emits the identical shape

Created a test goal, linked two of my test tasks (one derived, one explicit), then compared the two
routers on the same rows:

```
GET /api/goals/:id  ->  tasks[]
  {"createdAt":"2026-08-24T02:30:00.000Z","startDate":"2026-08-23","startDateIsDerived":true,"dueDate":null}
  {"createdAt":"2026-08-23T21:30:13.090Z","startDate":"2026-08-30","startDateIsDerived":false,"dueDate":"2026-09-10"}

GET /api/tasks/:id  ->  same two rows
  {"createdAt":"2026-08-24T02:30:00.000Z","startDate":"2026-08-23","startDateIsDerived":true,"dueDate":null}
  {"createdAt":"2026-08-23T21:30:13.090Z","startDate":"2026-08-30","startDateIsDerived":false,"dueDate":"2026-09-10"}
```

Byte-identical. Before this chip the goals router emitted `"2026-08-30T00:00:00.000Z"` and `null`
for those two.

### 6. No-backfill audit — zero pre-existing rows written

Raw SQL against `tasks`, before and after everything above.

| | Before | After |
|---|---|---|
| total rows | 4 | 7 |
| non-null `start_date` | 2 | 3 |

The 3 new rows are all mine and all prefixed `[W5-STARTDATE-TZ chip test]`. The 4 pre-existing rows:

```
cmt69pued0001wbj63oqeqao9  start=NULL                    updated=2026-08-23T20:39:05.581Z   (unchanged)
cmt69pv4n0005wbj6obpgacvm  start=NULL                    updated=2026-08-23T20:39:05.054Z   (unchanged)
cmt6ar0670001ww4s6fiad9pv  start=2026-08-23T00:00:00Z    updated=2026-08-23T21:05:51.007Z   (unchanged)
cmt6ar0qw0005ww4s2eftfrwh  start=2026-08-30T00:00:00Z    updated=2026-08-23T21:06:22.877Z   (unchanged)
```

`updated_at` is `@updatedAt`, so it bumps on **any** write to a row. All four are byte-identical to
the pre-change snapshot — positive proof of no write, which a row count alone would not give.

### 7. `npm run check` — green

```
  PASS    self-test (does the checker still work?)        49ms
  PASS    syntax (node --check)                          415ms
  PASS    relative import resolution                      72ms
  REPORT  duplicate object keys                           75ms
  PASS    build (vite build)                              1.2s
check PASSED in 1.8s.
```

The `REPORT` line is pre-existing — `NewsWidget.js` and `NewsScheduler.js` have never parsed as
ESM. Neither is mine. `node --check` also run individually on all six changed/new JS files.

Dedicated build per D-010: `npx vite build --outDir ../dist-startdatetz` → `✓ built in 867ms`,
6 assets, only the two pre-existing warnings (caniuse-lite, chunk size). Confirmed the change
survived minification rather than trusting the exit code:

| String in `dist-startdatetz/assets/index-DHhj8Jt-.js` | Count |
|---|---|
| `America/Denver` | 2 |
| `getTaskCreatedLabel` | 2 |
| `startDateIsDerived` | 3 |
| `From creation date` | 1 |
| `orgYmd` | 0 — minified away, as expected for a local binding |

### 8. Template structure intact

Parsed both templates with a recursive walker that descends into `<template>.content` (a plain
`querySelectorAll` returns nothing for this app's markup — the trap `W5-TASK-STARTDATE` flagged):

- List table: **7** `<thead>` headers — Title, Status, Priority, Assignee, **Start**, Due, Cost.
  `colspan` values across the file: `7, 7, 6, 6` — the two 7s are the list table, the two 6s the
  untouched costs table.
- Start cell binds `getTaskStartLabel(row.task.startDate)` and tints on `row.task.startDateIsDerived`.
- Panel date inputs, in order: `selectedTask.startDate`, `selectedTask.dueDate`, `sub.dueDate` —
  the subtask picker untouched.
- Created line now binds `getTaskCreatedLabel(selectedTask.createdAt)`. The old
  `new Date(selectedTask.createdAt).toLocaleDateString()` is gone.

## Measurements

| Thing measured | Value | Why it mattered |
|---|---|---|
| Browser timezone during verification | `America/Denver`, offset **360** (UTC−6, MDT) | Confirms Denver is on **MDT** in August — the reason `America/Denver` beats a hardcoded UTC−7 |
| Timezones exercised | 3 — `America/Denver`, `Pacific/Auckland`, `UTC` | Auckland (UTC+12) breaks a naive fix in the opposite direction from Denver |
| Derived rows where BEFORE Start ≠ BEFORE Created | **2 of 2** derived rows in Auckland; **1 of 2** in Denver | The bug was real and reproducible, not theoretical |
| Derived rows where AFTER Start ≠ AFTER Created | **0 of 2**, in all three timezones | The invariant |
| Tasks on staging, before → after | 4 → 7 (3 created by me, all prefixed) | D-017: staging, not production's 88 |
| Non-null `start_date`, before → after | 2 → 3 (the 1 added is mine) | No-backfill preserved |
| `updated_at` on the 4 pre-existing rows | **unchanged**, to the millisecond | Stronger than a count — proves no write |
| Timezone-offset span worldwide | UTC−12 … UTC+14 (26 h) | The measurement behind rejecting a tolerance window for the create-time activity log |
| `toISOString`-based date conversions on the server | **45** call sites (excluding my new module) | The audit below: 44 safe, 1 buggy, + 2 more reaching a timestamp through a helper |
| `window.formatDateSafe` call sites | **69** | Why converting the whole app is a separate chip, not a patch |

## Draft wiring

**None.** My prompt granted `client/src/js/app-refactored.js` directly (§8, sole chip running). My
three changes to it are: one import (`@shared/orgTimezone.js`), one new method
(`getTaskCreatedLabel`), and one line inside `getTaskStartLabel`. No method moved, renamed or
reordered, so any sibling's drafted anchors still hold. `client/index.html` needs nothing.

## Draft for shared docs

**Target: `CLAUDE.md`, Gotchas.** This **supersedes** the bullet drafted in
`notes/W5-TASK-STARTDATE.md` — that text describes a UTC derivation and a "do not add `?? createdAt`
anywhere else" rule that are both now differently worded. Use this one instead.

> - **Dates are rendered in one organisation timezone, not the viewer's.** `ORG_TIMEZONE` is
>   `'America/Denver'` and lives in `shared/orgTimezone.js`, imported by the server
>   (`../../shared/orgTimezone.js`) and the client (`@shared/orgTimezone.js`). Ben's ruling: one
>   site, one calendar date, wherever you are reading from. **Use `America/Denver`, never the string
>   `MST` and never a fixed UTC−7** — Mountain Time observes DST and a one-hour error flips the
>   calendar day at midnight. `orgYmd(value)` is the null-safe "what calendar date is this instant"
>   helper; `ymdInTz(date, tz)` is the general form. **The rule: a column that stores a bare
>   calendar date as UTC midnight (`dueDate`, `startDate`, `experimentDate`, `shipmentDate`) may use
>   `toISOString().split('T')[0]`, because its UTC day is the day the user typed. Anything derived
>   from a real timestamp (`createdAt`, `updatedAt`) must use `orgYmd()`** — UTC is a different day
>   from Mountain every evening between 18:00 and midnight. Most of the app has not been converted
>   yet: `window.formatDateSafe` (69 call sites) and the Tasks calendar view are still browser-local.
> - **Task start dates:** `Task.startDate` (`DateTime?` → `start_date`) is nullable and **a null is
>   meaningful, not missing** — it means "never explicitly set, so the start date is the creation
>   date". Existing rows were deliberately never backfilled (D-016); `resolveStartYmd()` in
>   `server/routes/tasks.js` resolves it as `startDate` or `orgYmd(createdAt)`, and `serializeTask()`
>   emits it with `startDateIsDerived: boolean`. **That is the only fallback.** `goals.js` emits the
>   identical two fields for goal-linked tasks. `TaskDetailPanel.js` renders "Created" through
>   `getTaskCreatedLabel()`, which is the same `orgYmd(createdAt)` call, so Created and a derived
>   Start can never name different days. Clearing the field writes null and returns the task to
>   deriving; there is no "no start date" state. Activity actions are
>   `start_date_set | start_date_changed | start_date_reset`, they record **stored** values (a reset
>   logs `toValue: null`), and creation logs nothing — the client still sends a browser-local
>   "today", so a server-side "was this backdated?" test would compare two frames.

## Handoff: changes needed in files I do not own

### 1. `server/services/emailDigest.js` — delete the duplicate `ymdInTz`

Its copy (lines 5–21) is functionally identical to the one now in `shared/orgTimezone.js`. Two
copies of the app's only correct date conversion is one too many. `ymdInTz` is exported from
`emailDigest.js` but nothing outside it imports it (verified: `grep -rn "ymdInTz" server/` returns
only `emailDigest.js` itself), so re-exporting keeps the module's surface unchanged.

```js
// at the top, with the other imports:
import { ymdInTz } from '../../shared/orgTimezone.js';

// delete the local `export function ymdInTz(date, timezone) { … }` block (lines 5-21) and
// re-export instead, so the module's public surface is unchanged:
export { ymdInTz };
```

All eight internal call sites pass an explicit `timezone`, so the new default parameter changes
nothing. Note the digest is correct to stay **per-user** timezone-aware — it emails individuals
using `UserEmailPreference.timezone` — which is a different question from what the UI renders.

### 2. `client/src/js/services/TaskService.js` — new tasks should store the org day

`todayYmd()` at line 17 computes the **browser's** today and `openTaskForm()` (line 74) stores it as
an explicit `startDate` on every new task. Under the org-timezone ruling that is wrong for anyone
outside Mountain Time creating a task near midnight: the stored date differs from the org day, and
because it is stored *explicitly* it never self-corrects. This is a write of a wrong value, not a
display bug, so it ranks above the rest of the audit.

```js
import API from './api.js';
import { orgYmd } from '@shared/orgTimezone.js';

/**
 * Today as YYYY-MM-DD in the ORGANISATION's timezone (America/Denver), not the browser's.
 * A new task's start date is stored explicitly, so a browser-local "today" would persist the
 * wrong calendar day for anyone outside Mountain Time.
 */
function todayYmd() {
  return orgYmd(new Date());
}
```

Once this lands, the create-time `start_date_set` activity entry I removed from
`server/routes/tasks.js` can be restored correctly as
`if (task.startDate && toYmd(task.startDate) !== orgYmd(task.createdAt))` — both sides would finally
be in the same frame.

`openEditTaskForm` (line 88, `startDate: task.startDate || ''`) needs no change: the server always
sends a resolved value.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| high | Derived Start date computed in UTC while Created rendered browser-local — same task, same panel, one day apart | `server/routes/tasks.js:61` and `TaskDetailPanel.js:192` (pre-fix) | **fixed here** |
| high | New tasks store a **browser-local** "today" as an explicit `startDate` — a persisted wrong date for anyone outside Mountain Time | `client/src/js/services/TaskService.js:17,74` | left, why: not owned — paste-ready fix in Handoff §2; proposed as `CHIP-ORG-TZ-TASKS-TAIL` |
| high | 4 client call sites default a new record's date field to **UTC today**, so a record created after 18:00 Mountain is dated tomorrow — again a persisted wrong date | `CRUDService.js:1155` (shipment), `:1269` (micronization), `:1358` (MCB duplicate), `utils/constants.js:319` (MCB combinedDate) | left, why: not owned — proposed as `CHIP-ORG-TZ-DEFAULTS` |
| medium | `uploadDate` is a real timestamp (`createdAt`) rendered as its UTC calendar date — the identical bug I was sent to fix, in the graphene update-reports payload | `server/routes/graphene.js:563` | left, why: not owned |
| medium | Shipment CSV export writes `createdAt`/`updatedAt` as UTC calendar dates | `server/routes/shipments.js:344-345` via `csvDateOnly` (`server/utils/csv.js:87`) | left, why: not owned |
| medium | `getOverdueSubtaskCount()` compares subtask due dates against **UTC today**, so between 18:00 and midnight Mountain a subtask due tomorrow shows as overdue and the parent card shows a red "1 overdue" | `client/src/js/app-refactored.js:5225` | left, why: outside the scoped surface (Command Center: do not convert the app) — one-line fix, `orgYmd(new Date())` |
| medium | `window.formatDateSafe` renders every `Created:` / `Updated:` / `lastLogin` in the **browser's** timezone across **69 call sites** | `client/src/js/app-refactored.js:155` | left, why: explicitly out of scope — proposed as `CHIP-ORG-TZ-SWEEP` |
| medium | Three timestamps in the panel I just converted are still browser-local — attachment, comment and activity dates sit inches from an org-timezone "Created" | `TaskDetailPanel.js`, `x-text="new Date(att/comment/activity.createdAt).toLocaleDateString()"` | left, why: scope discipline — they are event timestamps, not the task's dates; flagged because it is the nearest-neighbour inconsistency |
| medium | The Tasks **calendar view** buckets and colours entirely in browser-local time (`_ymd`, `_todayYmd`) — correct for a browser-local convention, wrong under an org-timezone one. An Auckland viewer sees tasks in the wrong day cell | `app-refactored.js:5413,5419` and `getCalendarWeeks/Agenda/PillClass` | left, why: out of scope — belongs in `CHIP-ORG-TZ-SWEEP` |
| medium | `getRelativeDateLabel` / `getRelativeDateClass` compute "today" at browser-local midnight, so "Due today" / red-overdue fire on the wrong day outside Mountain Time | `client/src/js/utils/formatters.js:261,282` | left, why: out of scope — same sweep |
| low | `W5-TASK-STARTDATE`'s paste-ready `goals.js` block would have introduced a **second** UTC fallback — the exact defect this chip removes | `notes/W5-TASK-STARTDATE.md`, Handoff | fixed here — applied in corrected form, `orgYmd` not `toISOString` |
| low | `ymdInTz` now exists twice — the canonical one in `shared/`, the original in `emailDigest.js` | `shared/orgTimezone.js:34`, `server/services/emailDigest.js:9` | left, why: not owned — 4-line Handoff §1 |
| low | `dashboard.js` formats month buckets with `toLocaleDateString('en-US', …)` on the **server**, so the label depends on the server process's timezone | `server/routes/dashboard.js:101` | left, why: not owned; low impact (month granularity) |
| low | 3 `[W5-STARTDATE-TZ chip test]` tasks + 1 test goal left on staging; 2 of the tasks are linked to that goal | staging `tasks` / `goals` | left, why: needed for the after-count; safe to delete |
| low | `NewsWidget.js` / `NewsScheduler.js` still fail ESM parsing, so `npm run check` cannot scan them for duplicate keys | pre-existing | left, why: not owned |

### The audit you asked for: where else did this mistake get made?

**45 `toISOString()`-based date conversions on the server** (measured, excluding my new module):
shipments 16 · graphene 8 · pipeline 6 · compoundBatch 4 · goals 3 · tasks 3 · emailDigest 3 ·
biochar 1 · utils/csv 1. **44 of them are safe. 1 is the same bug** — plus **2 more** that reach a
timestamp through the `csvDateOnly` *helper* rather than calling `toISOString` themselves, so they
do not appear in that grep at all. **3 defect sites in total.**

The distinction is not "which function was used" — it is **what was passed in**:

- **Safe (44).** A column that stores a bare calendar date, written as UTC midnight from an
  `<input type="date">`. Its UTC day *is* the day the user typed, so `toISOString().split('T')[0]`
  is an exact round-trip, not a timezone guess. This covers `shipments.js` `shipmentDate` /
  `receivedDate` (16), `graphene.js` / `biochar.js` `experimentDate` (4), `compoundBatch.js` +
  `graphene.js` `createdDate` / `reportDate` (6), `pipeline.js` `nextFollowUpAt` (6), `goals.js`
  `targetDate` / `dueDate` / explicit `startDate` (3), `tasks.js` `toYmd` + `dueDate` (3),
  `graphene.js` `weekDate` (1), `emailDigest.js` (3), and the fallbacks inside the two `csvDateOnly`
  helpers (2). **These should be left alone.** A
  well-meaning sweep that "fixes" them by piping them through `orgYmd()` would shift every one of
  them back a day, because it would re-interpret a UTC-midnight marker as a real instant. That is
  the trap in this whole area and it is worth writing down.
- **The same bug (3).** A real timestamp turned into a calendar date:
  `graphene.js:563` (`uploadDate` from `updateReport.createdAt`), and `shipments.js:344-345`
  (`csvDateOnly(shipment.createdAt)` / `(shipment.updatedAt)` in the CSV export). All three read one
  day late for anything created after 18:00 Mountain. None is in a file I own.

**On the client the picture is worse, because 4 of the sites *write* rather than display.**
`CRUDService.js:1155,1269,1358` and `utils/constants.js:319` default a new shipment / micronization
/ MCB's date field to `new Date().toISOString().split('T')[0]` — **UTC today**. Create a shipment at
19:00 Denver and the form pre-fills tomorrow's date, and it gets saved. A display bug is annoying;
this one puts wrong data in the database, silently, every evening. It is the highest-value item in
this audit and it has nothing to do with tasks.

The other CRUDService `toISOString` sites (`:341,752,892,1058,1060,1194,1304`) are round-trips of
date-only columns into `<input type="date">` — safe, same reasoning as the server's 41.

**Three conventions, still, in one application** — and after this chip, four:

| Convention | Where | Correct for |
|---|---|---|
| UTC (`toISOString`) | 45 server sites, 12 client sites | date-only columns only — 3 server + 4 client sites misapply it to timestamps or to "today" |
| browser-local (`_ymd`, `toLocaleDateString`, `formatDateSafe`) | calendar view, `formatDateSafe` ×69, `formatters.js`, 3 panel timestamps | nothing, under Ben's ruling |
| per-user timezone (`ymdInTz` + `UserEmailPreference.timezone`) | `emailDigest.js` | email digests — genuinely correct there, and should stay |
| **org timezone (`orgYmd`)** | task start/created, new this chip | everything the UI renders |

The right end state is that the second row disappears into the fourth, the first row survives only
for date-only columns with a comment saying why, and the third stays as the deliberate exception for
outbound email. That is `CHIP-ORG-TZ-SWEEP`, and it is bigger than this chip was.

### What I saw outside my scope

**`prisma/schema.prisma` is not in `git status`** — the `Task.startDate` column was already
committed by the Command Center before this wave, so the uncommitted tree holds only application
code. Worth knowing: D-017's "the deploy runs `prisma db push --accept-data-loss`" hazard is not
armed by anything in this change set.

**The proforma subsystem has its own date handling entirely** (`shared/proformaEngine.js` works in
month indices, not dates) so it is untouched by any of this. Good design, incidentally — it sidesteps
the whole problem.

**`UserEmailPreference.timezone` exists** (`prisma/schema.prisma:1304`) and is the *only* per-user
timezone in the system. Under Ben's ruling it should stay scoped to email — a person receiving a
9am digest wants it at 9am where they are, which is a different question from what calendar date a
record displays. Nobody should be tempted to thread it into the UI.

### Risks in what I built

**Most likely to be wrong: `America/Denver` is my reading of "MST".** If Ben literally means a fixed
UTC−7 year-round — some labs do run on a fixed offset deliberately, so instrument timestamps never
jump — then every date this chip renders is one hour off from what he wants, which flips the day for
records created between 17:00 and 18:00 Mountain in summer. **What would expose it:** ask him. This
is a one-line change in `shared/orgTimezone.js` if he says so, which is precisely why the constant
is in one place. The Command Center is flagging it.

**Second: the panel is now internally inconsistent for a viewer outside Mountain Time.** "Created"
is org-time; the attachment, comment and activity dates three sections below are still
browser-local. In Auckland they would read `Aug 24` beside a `Created Aug 23`. I left them
deliberately (scope), but a reader who does not know that will report it as a new bug introduced by
this change — and from their point of view, correctly. **What would expose it:** anyone opening a
task detail panel from outside Mountain Time. This is the single most likely complaint.

**Third: `getTaskCreatedLabel` is a new method that three templates do not call.** The kanban card,
the list view and the mobile card do not show a creation date, so the fix is only visible on the
detail panel and in the list view's Start column. If a creation date is added to another surface
later and it reaches for `formatDateSafe` (the obvious thing to do — it is global and it is used 69
times), the bug comes straight back on that surface. The defence is documentation, which is weak.

**Not a risk, deliberately checked:** `updateTaskInline` needed no change — it is field-generic
(`API.tasks.update(taskId, { [field]: value })`), so there is no second write path. And clearing the
field still round-trips: `PUT null` → column null → API resolves back to the org-timezone creation
date → the picker re-renders with that date and the "From creation date" hint. Verified live, twice
in a row, with no duplicate activity entry.

### Proposed follow-up chips

- **`CHIP-ORG-TZ-TASKS-TAIL`** — apply the two Handoff blocks: `emailDigest.js` re-exports the shared
  `ymdInTz`, and `TaskService.todayYmd()` becomes `orgYmd(new Date())`. Then restore the create-time
  `start_date_set` activity entry, which becomes correct once both sides are in the same frame.
  Owns `server/services/emailDigest.js`, `client/src/js/services/TaskService.js`,
  `server/routes/tasks.js`. Lane A, sonnet. Both blocks are written and verified above.
- **`CHIP-ORG-TZ-DEFAULTS`** — the highest-value item in this audit and the smallest. Fix the 4 sites
  that default a new record's date to **UTC today** (`CRUDService.js:1155,1269,1358`,
  `utils/constants.js:319`). These persist a wrong date every evening. Owns
  `client/src/js/services/CRUDService.js`, `client/src/js/utils/constants.js`. Lane A, sonnet.
  **Should run before the sweep** — it is data correctness, the sweep is presentation.
- **`CHIP-ORG-TZ-SERVER-TIMESTAMPS`** — the 3 server sites that render a timestamp as a UTC calendar
  date: `graphene.js:563` (`uploadDate`), `shipments.js:344-345` (CSV `createdAt`/`updatedAt`). Owns
  `server/routes/graphene.js`, `server/routes/shipments.js`, `server/utils/csv.js`. Lane A, sonnet.
  **Must carry the "41 safe sites" list from this audit in its prompt**, or it will helpfully convert
  the date-only columns too and shift every experiment date in the app back a day.
- **`CHIP-ORG-TZ-SWEEP`** — the big one, and it should start as **Lane B**: enumerate every
  presentation date path, decide the end state, then a Lane A chip applies it. Scope:
  `window.formatDateSafe` (69 call sites), the Tasks calendar view (`_ymd`/`_todayYmd` and the four
  `getCalendar*` helpers), `formatters.js` `getRelativeDateLabel`/`getRelativeDateClass`, and the 3
  remaining `toLocaleDateString` calls in `TaskDetailPanel.js`. Lane B opus, then Lane A sonnet. The
  calendar view is the interesting part — moving day-buckets to a fixed zone changes which cell a
  task lands in, which is a visible behaviour change, not a bug fix.
- **`CHIP-TASK-SERIALIZER-SHARE`** — still open from `W5-TASK-STARTDATE`. Export `serializeTask()`
  and use it in `goals.js`, removing the last inlined copy. Now smaller than it was: `startDate` and
  `dueDate` already match exactly, so the only remaining divergence is `cost`
  (Prisma `Decimal` string vs `Number`) and `costPaidAt`. Whoever takes it must check the
  `GoalDetailPanel` templates for string arithmetic on `cost` — that is the reason I did not.
  Lane A, sonnet.

### Harness improvements

**The mid-task requirement change was handled well and is worth naming as a pattern.** It arrived
with the reasoning (single-site team), the ruling verbatim, an explicit correction of the likely
misreading (`America/Denver`, not `MST`, not UTC−7, with the DST argument spelled out), an explicit
scope fence (fix the task surfaces, do not convert the app, propose the rest), and a *revised
verification bar* — the last of which mattered most, because the correct Auckland result inverted:
before, Auckland should show the Auckland date; after, Auckland must show the Mountain date. Without
that sentence I would have kept a passing test that was now testing the wrong thing. **A course
correction that changes the mechanism must also state what "correct" now looks like**, or the chip
happily re-verifies the old requirement.

**Cost: roughly a third of the work was thrown away.** I had the client-derivation design built,
templates updated and both-timezone verification green when the correction arrived. Nothing to be
done about it from the chip side, and I have recorded the discarded design above in case Ben rejects
the org-timezone reading. But it does suggest a general rule: **when a chip's brief chooses between
two defensible mechanisms and the choice turns on a user preference nobody has asked about, ask
first.** My original brief even said "if you think a different approach better satisfies the
invariant, argue for it" — the approach that won was one neither of us had considered, and one
sentence from Ben settled it.

**Ownership of a new file in a serialized directory is ambiguous in the protocol.** I was told to
put the constant somewhere shared, and `shared/` is a §3c serialization point ("single owner per
wave"). §1 says new files must sit in an authorized path, and `shared/` was not on my owned list. I
created `shared/orgTimezone.js` on the reading that §3c protects the *existing* proforma files from
concurrent edits and that a brand-new module collides with nothing — and I am the only chip running.
**Suggested §3c amendment:** creating a *new* file under a serialized directory is permitted when
the chip owns no existing file there and no sibling is running; editing an existing one is not.
Right now a chip has to guess.

**Two environment traps, both costing a few minutes:**
- Composing a `curl` + `node` pipeline inline with `&&` chains and `$(...)` in a heredoc-free Bash
  call produced `failed to change group ID: operation not permitted` from zsh. Writing the same
  thing to a `.sh` file in the scratchpad and running `bash file.sh` worked immediately. Worth a §9
  row: **for anything beyond a single command, write a script to the scratchpad and run it** —
  agent threads reset cwd between calls anyway, so a file is more reliable than a long one-liner.
- Confirming `W5-TASK-STARTDATE`'s note about absolute-path imports in scratchpad scripts: yes,
  `import { PrismaClient } from '/abs/path/node_modules/@prisma/client/index.js'` is required. Same
  for `dotenv` and `jsonwebtoken`. Already proposed for §9 by that chip; seconding it.

**A verification technique worth stealing.** Rather than retyping the helpers into a test harness, I
extracted `getTaskStartLabel` and `getTaskCreatedLabel` **from `app-refactored.js` at run time** by
locating `\n    name(` and brace-matching, then `new Function(...)`-ing them with `orgYmd` injected.
That means the two-timezone table above exercises the shipped source and would break loudly if the
source changed. It costs about 12 lines and it removes the "your test tests your copy of the code"
objection entirely — which matters a lot in a repo where the interesting logic lives inside one
6,000-line object literal that cannot be imported piecemeal.

**Model tier: opus was right, and for one specific reason.** The code is small. What was not small
was noticing that fixing the server alone would have *relocated* the bug rather than removed it —
the Command Center's message flagged `TaskDetailPanel.js:192` explicitly, but the same trap recurs
in the three panel timestamps, in `getOverdueSubtaskCount`, and in the 4 CRUDService write-defaults
that nobody had mentioned. The audit found a data-corruption bug (wrong dates persisted on new
shipments every evening) that is more serious than the display bug I was sent to fix, and finding it
required understanding *why* the original was wrong rather than pattern-matching on `toISOString`.
A grep-and-replace pass at a lower tier would have "fixed" the 41 safe sites and broken every
experiment date in the app.
