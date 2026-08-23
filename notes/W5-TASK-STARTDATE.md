# CHIP-W5-TASK-STARTDATE

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:**
  - `server/routes/tasks.js`
  - `client/src/js/components/modals/TaskModal.js`
  - `client/src/js/components/modals/TaskDetailPanel.js`
  - `client/src/js/components/tabs/TasksTab.js`
  - `client/src/js/services/TaskService.js`
  - `client/src/js/app-refactored.js` (§8 shared wiring — minimal additive only)
  - `notes/W5-TASK-STARTDATE.md`
- **Wave:** 5

## What I was asked to do

Track when a task begins. `Task.startDate` (`DateTime?` → `start_date`) already exists in the
schema and in the staging database — added by the Command Center, **not** mine to touch.

The whole point of the chip is the *no-backfill* design mandated by D-016:

> New columns are nullable, and are never backfilled. A backfill is a mass write to live data —
> precisely the risk this ruling exists to avoid. […] Add `startDate DateTime?`, leave every
> existing row null, and have the *read* path fall back to `createdAt` when it is null. Behaviour
> is identical for the user, new tasks set it explicitly, and not one existing row is written to.
> Where a fallback in the read path gives the same result as a backfill, the fallback wins.

So: **null `startDate` is meaningful, not missing** — it means "never explicitly set, so it is the
creation date." One fallback, server-side in the serializer, so every consumer inherits it.

D-017 is the reason `prisma/schema.prisma` and `scripts/railway-startup.sh` are radioactive:

> `scripts/railway-startup.sh`, the Railway start command, runs `prisma db push --accept-data-loss`
> on **every** deploy of both environments before the server boots. […] So `prisma/schema.prisma`
> is not a description of the production database. It is a command that rewrites it, automatically,
> on every push to `main`.

## What I did

### Decisions taken before writing code

**1. The fallback lives in exactly one function: `serializeTask()` in `server/routes/tasks.js`.**
Every task-shaped response in that router already flows through it — `POST /`, `PUT /:id`,
`PATCH /:id/status`, `PATCH /:id/cost-paid`, `GET /:id` (including its subtasks). The one exception
was `GET /` (list), which had its own hand-inlined copy of the same three field conversions at
lines 264–271. I replaced that copy with a `serializeTask()` call so there is genuinely one
fallback and it cannot drift. Verified the inlined map and `serializeTask` produced byte-identical
shapes before swapping.

**2. `startDate` is never null in a response.** `serializeTask` resolves
`task.startDate ?? task.createdAt` and emits a `YYYY-MM-DD` string, the same shape `dueDate`
already uses. It additionally emits `startDateIsDerived: boolean` so the UI can say *why* a date is
there without re-deriving it. That flag is the thing that keeps "null means creation date" legible
instead of magic — without it the detail panel cannot tell the user that clearing the field will
put the same date back.

**3. Clearing the field reverts to null, i.e. back to the creation date.** Argued:

- There is no coherent "this task has no start" state. The task exists; something created it at a
  moment; that moment is a defensible default. A blank would be a lie, and the D-016 design
  explicitly forbids rendering one.
- It makes the control reversible. Without it, the first person to type a date can never get back
  to the default, because they would have to know the creation timestamp to retype it.
- It keeps the database honest. An explicit value means "a human chose this"; null means "nobody
  ever did". A clear that wrote `createdAt` into the column would destroy that distinction, and it
  is the same mass-write-of-a-derived-value that D-016 exists to prevent — just one row at a time.

The panel labels the cleared state so it is not mistaken for a failed save.

**4. No activity entry on create unless the start date was backdated.** Cost logs `cost_set` at
creation, but cost is usually absent whereas start date is now always present (the modal defaults
it to today), so an unconditional entry would add a redundant line to *every* task's history right
next to `created`. It logs `start_date_set` on create only when the supplied date differs from the
creation day — which is exactly the case where the information is not already in the `created`
entry.

**5. Activity vocabulary follows the cost triad, not the `due_date_changed` singleton:**
`start_date_set` (null → value) · `start_date_changed` (value → value) ·
`start_date_reset` (value → null, i.e. back to the creation date). Three actions rather than one
because "reset to default" is a distinct event from "changed to another date", and the detail
panel can say so. `from`/`to` values are always the *resolved* dates, so a reset reads
"reset start date to Aug 23" rather than "to null".

**6. Where it is displayed — a considered per-surface call, not "everywhere `dueDate` appears".**
There are six `dueDate` render sites in `TasksTab.js`. Because the fallback means a start date is
now present on *every* task, anything I add renders on every row forever — so the bar is higher
than it would be for a nullable field.

| Surface | `TasksTab.js` | Decision | Why |
|---|---|---|---|
| Kanban card | :244 | **No** | Already carries assignees, priority, due date, goal pill, tags, subtask progress and a blocker chip. An always-present extra date is the thing that tips a dense card into unreadable, and the card's job is "what is late", which is due date. |
| List view, desktop table | :492 | **Yes — new `Start` column before `Due`** | The one place with a stable column grid, where start and due sit adjacent and the pair reads as a span. This is the surface that makes the feature useful. |
| List view, mobile cards | :540 | **No** | A single wrapping chip row (status · assignee · due · cost). A fourth always-present chip wraps it on a phone. Start date is one tap away in the detail panel. |
| Calendar agenda row | :683 | **No** | The calendar is a due-date projection by definition — every bucket, every pill and `getCalendarPillClass()` key off `dueDate`. Putting a second, unrelated date in the row invites the reader to think the pill is placed by it. |
| Costs table | :778 | **No** | The costs view answers a money question. |
| Costs table, grouped | :847 | **No** | Same. |
| Detail panel | — | **Yes, editable** | Follows the existing `<input type="date">` + `updateTaskInline` pattern used by Due Date at `TaskDetailPanel.js:95-98`. No second interaction style invented. |
| Create modal | — | **Yes, defaulted to today** | Per the brief. |

**7. Start-after-due gets a non-blocking warning, never a rejection.** Shown inline in both the
modal and the detail panel. The server does not validate the ordering: people backfill records out
of order and a task legitimately started before its due date was moved earlier.

**8. Timezone.** Explicit start dates round-trip exactly, because a `YYYY-MM-DD` input is stored as
UTC midnight and read back with `toISOString().split('T')[0]` — the same convention `dueDate`
already uses. The *derived* value is the UTC calendar date of `createdAt`, which is precisely what
the forbidden backfill would have produced, so behaviour matches the stated acceptance criterion.
It can read one day late for a task created after ~20:00 US Eastern. I did **not** add a
client-side re-derivation to correct it: that would mean two fallbacks, which is the scattered
`?? createdAt` the brief forbids, and it would only ever affect rows where nobody chose a date.
Logged as a finding with a proposed follow-up. All new client-side date formatting parses
`ymd + 'T00:00:00'` (local), matching the deliberate `_ymd()` convention at
`app-refactored.js:5395`, so nothing I added shifts a day.

## How I verified it

Express on port 3111 (`PORT=3111 node server/index.js`), JWT minted directly from `JWT_SECRET`
in `.env` — never via `/api/auth/login`, which writes `lastLogin` (D-005).

### 1. The no-backfill design — raw NULL in the database, resolved value out of the API

This is the heart of the feature. Task `cmt69pued0001wbj63oqeqao9` predates this chip (it is one of
the two archived rows a Wave 4 chip left behind) and its `start_date` column has never been
written to.

Raw SQL, bypassing Prisma's field mapping and the app entirely:

```
SELECT id, title, created_at, start_date FROM tasks WHERE id = 'cmt69pued0001wbj63oqeqao9';

  id         cmt69pued0001wbj63oqeqao9
  title      [W4-SUBTASK-EDIT chip test] parent
  created_at 2026-08-23T20:36:57.251Z
  start_date null          <-- never written
```

The same row through `GET /api/tasks/:id`:

```json
{
  "id": "cmt69pued0001wbj63oqeqao9",
  "createdAt": "2026-08-23T20:36:57.251Z",
  "startDate": "2026-08-23",      <-- resolved from createdAt
  "startDateIsDerived": true,
  "dueDate": null
}
```

And through the list endpoint `GET /api/tasks?status=ARCHIVED`, which is the path that had its own
inlined copy of the conversions:

```json
[{ "createdAt": "2026-08-23T20:36:57.251Z", "startDate": "2026-08-23", "startDateIsDerived": true }]
```

Both surfaces agree, the column is still null, and no row was written.

### 2. Full lifecycle through the API, with the activity log

Create with an explicit start date equal to the creation day (what the modal sends):

```
POST /api/tasks {"title":"...lifecycle","startDate":"2026-08-23","dueDate":"2026-09-10"}
  -> startDate "2026-08-23", startDateIsDerived false
  activity: created                                    <-- no start_date entry, by design (#4)
```

Create backdated, then edit, then clear, then set again — one task's whole history:

```
POST   startDate=2026-07-01  (createdAt 2026-08-23)
PUT    startDate=2026-07-15
PUT    startDate=null                                  <-- the "clear" case
PUT    startDate=null        (again — no-op guard)
PUT    startDate=2026-08-30

  created            from=null        to=null
  start_date_set     from=2026-08-23  to=2026-07-01    <-- backdated at creation, so logged
  start_date_changed from=2026-07-01  to=2026-07-15
  start_date_reset   from=2026-07-15  to=2026-08-23    <-- "to" is the resolved creation date
  start_date_set     from=2026-08-23  to=2026-08-30

  (no sixth entry — the repeated null was correctly detected as a no-op)
```

After the clear, checked against raw SQL rather than the API: `start_date = null`, and the API
resolved it back to `"2026-08-23"` with `startDateIsDerived: true`. So clearing genuinely returns
the row to the derived state rather than writing the creation date into the column.

### 3. Edge cases

| Case | Result |
|---|---|
| `PUT {"startDate":"not-a-date"}` | `400 {"error":"startDate must be a valid date (YYYY-MM-DD)"}` — not a Prisma crash |
| `PUT {"startDate":null}` twice | Second is a no-op; no duplicate activity entry |
| `PUT {"title":"..."}` with no `startDate` key | Raw `start_date` unchanged at `2026-08-30T00:00:00.000Z` |
| Explicit value round-trip | Stored as UTC midnight, read back as the same `YYYY-MM-DD`; no drift |

### 4. `npm run check` — green

```
  PASS    self-test (does the checker still work?)        45ms
  PASS    syntax (node --check)                          400ms
  PASS    relative import resolution                      70ms
  REPORT  duplicate object keys                           71ms
  PASS    build (vite build)                              1.1s
check PASSED in 1.7s.
```

The `REPORT` line is pre-existing: `NewsWidget.js` and `NewsScheduler.js` have never been
parseable as ESM, and neither is mine. `node --check` passed individually on all six files I
changed.

Dedicated build per D-010: `npx vite build --outDir ../dist-startdate` — `✓ built in 879ms`,
6 assets, no new warnings (the two shown are the pre-existing caniuse-lite and chunk-size ones).
Confirmed the feature survives minification rather than trusting the exit code:

| String | Occurrences in `dist-startdate/assets/index-CyO7t1WK.js` |
|---|---|
| `getTaskStartLabel` | 5 |
| `isStartAfterDue` | 3 |
| `startDateIsDerived` | 3 |
| `From creation date` | 1 |
| `start_date_reset` | 1 |
| `colspan="7"` | 5 (was 0) |

### 5. Client logic driven in-page via `window.grapheneApp()`

Vite on 5264; `window.grapheneApp()` returns the Alpine object without running `init()`.
**Zero console errors.**

**The timezone check is the one that mattered.** The browser reported
`new Date().getTimezoneOffset() === 360`, i.e. **UTC-6** — west of UTC, exactly the case that
breaks a `toISOString()`-based ymd:

| Call | Result |
|---|---|
| `getTaskStartLabel('2026-01-01')` | `"Jan 1"` — **not** `"Dec 31"` |
| `getTaskStartLabel('2026-08-23')` | `"Aug 23"` |
| `getTaskStartLabel('2025-12-31')` | `"Dec 31, 2025"` (year shown when not current) |
| `getTaskStartLabel('2026-08-23T00:00:00.000Z')` | `"Aug 23"` (tolerates a full timestamp) |
| `getTaskStartLabel('')` / `('not-a-date')` | `""` (no `Invalid Date` leaking to the UI) |

`openTaskForm()` set `taskForm.startDate` to `2026-08-23`, matching locally-computed today
(`matches_local_today: true`). `openEditTaskForm({... startDate:'2026-08-23' ...})` loaded
`2026-08-23`.

Warning predicate: `isStartAfterDue('2026-09-10','2026-09-01') === true`;
`('2026-09-01','2026-09-10')`, `('2026-09-01','2026-09-01')`, and either side null → `false`.
Equal dates do not warn.

**Template structure**, parsed with `DOMParser` and a recursive walker that descends into
`<template>.content` (a plain `querySelectorAll` silently returns nothing for this app's markup —
worth knowing for the next chip):

- List table: **7 `<thead>` headers** — Title, Status, Priority, Assignee, **Start**, Due, Cost —
  **7 task-row `<td>`s**, and both `colspan` values now `7`. Header count == body cell count.
- Costs table untouched: 6 headers, `colspan="6"` ×2.
- Start cell binds `:class="row.task.startDateIsDerived ? 'text-gray-400' : 'text-gray-700'"`.
- Modal: exactly one `input[type=date][x-model="taskForm.startDate"]`, labels read
  `Start Date`, `Due Date`, `Cost`.
- Detail panel date inputs, in order: `selectedTask.startDate`, `selectedTask.dueDate`,
  `sub.dueDate` — the subtask picker is untouched. `From creation date` and
  `Starts after it is due` hints both present.

### 6. Zero pre-existing rows written — the audit

Whole `tasks` table, raw SQL, after everything above:

```
total tasks: 4        non-null start_date: 2

cmt69pued0001wbj63oqeqao9  [W4-SUBTASK-EDIT chip test] parent      start_date=NULL  updated=2026-08-23T20:39:05
cmt69pv4n0005wbj6obpgacvm  trimmed rename                          start_date=NULL  updated=2026-08-23T20:39:05
cmt6ar0670001ww4s6fiad9pv  [W5-TASK-STARTDATE chip test] lifecycle start_date=2026-08-23  updated=2026-08-23T21:05:51
cmt6ar0qw0005ww4s2eftfrwh  [W5-TASK-STARTDATE chip test] backdated start_date=2026-08-30  updated=2026-08-23T21:06:22
```

- **Before:** 2 tasks, 0 non-null `start_date`. **After:** 4 tasks, 2 non-null — both mine, both
  name-prefixed with the chip name.
- The two pre-existing rows still hold `NULL`, and their `updated_at` is still **20:39:05**, the
  Wave 4 chip's timestamp. `updatedAt` is `@updatedAt`, so it bumps on *any* write to the row —
  an unchanged timestamp is positive proof of no write, which the count alone would not give.

**Left behind for the Command Center:** my two `[W5-TASK-STARTDATE chip test]` rows on staging.
I did not delete them, because the verification bar asks for an after-count in which only rows I
created appear, and because deleting is a write I was not asked to make. They are safe to remove.

## Measurements

| Thing measured | Value | Why it mattered |
|---|---|---|
| Tasks on the staging DB, before | 2 (both ARCHIVED, both Wave 4's) | Confirms D-017's finding that `.env` is staging, not production's 88 |
| Rows with non-null `start_date`, before | **0** | The baseline the no-write claim is measured against |
| Rows with non-null `start_date`, after | **2**, both created by me | The invariant |
| `updated_at` on pre-existing rows | unchanged either side | Stronger than a count — proves no write, not just no net change |
| `dueDate` render sites in `TasksTab.js` | 6 | Counted before deciding placement rather than adding to "everywhere"; 1 of 6 taken |
| Browser timezone during verification | UTC-6 | A UTC-based ymd would have been observably wrong here; it was not |
| Bundle occurrences of `colspan="7"` | 0 → 5 | The header/body/colspan change reached the minified output |

## Draft wiring

**None.** My spawn prompt granted me `client/src/js/app-refactored.js` directly (CHIP-PROTOCOL §8,
sole chip running), so there is no D-001 wiring debt to hand over. My changes to it were three and
all additive — no method moved, renamed, or reordered, so any sibling's anchors would still hold:

1. `taskForm` initial state gained `startDate: ''` (line ~513).
2. `getTaskStartLabel(startDate)` and `isStartAfterDue(startDate, dueDate)` added immediately
   after the existing `getTaskDueClass` delegate.

`client/index.html` needs **nothing** — no new tab, no new mount point; the modal and detail panel
are already mounted.

## Draft for shared docs

**Target:** `CLAUDE.md`, the Gotchas list, appended after the existing Task-costs bullet.

> - Task start dates: `Task.startDate` (`DateTime?` → `start_date`) is nullable and **a null is
>   meaningful, not missing** — it means "never explicitly set, so the start date is the creation
>   date". Existing rows were deliberately never backfilled (D-016); instead `serializeTask()` in
>   `server/routes/tasks.js` resolves `startDate ?? createdAt` to a `YYYY-MM-DD` string and emits
>   `startDateIsDerived: boolean` alongside it. **That is the only fallback — do not add
>   `?? createdAt` anywhere else**; every task-shaped response in that router flows through the
>   serializer, including the list endpoint. Clearing the field writes null, which returns the task
>   to deriving from `createdAt`; there is no "no start date" state. Activity actions are
>   `start_date_set | start_date_changed | start_date_reset`, and creation only logs one when the
>   supplied date differs from the creation day. Displayed in the Tasks list-view `Start` column
>   (muted grey when derived), the create modal (defaults to today, local time) and the detail
>   panel; deliberately **not** on kanban cards, mobile cards, the calendar, or the costs tables,
>   because the fallback means it renders on every row forever. Start-after-due shows a warning and
>   is never rejected.

## Handoff: changes needed in files I do not own

**`server/routes/goals.js:114-118`** — `GET /api/goals/:id` returns its tasks through a third
hand-inlined copy of the date conversion. The query at `goals.js:100-108` uses `include`, not a
narrowing `select`, so those task objects **do** carry `startDate` — but as the raw column, which
`res.json` renders as a full ISO timestamp (`"2026-08-30T00:00:00.000Z"`) or `null`. So the shape
is not merely missing, it is *inconsistent with the same field from the tasks router*
(`"2026-08-30"`, never null), which is the more dangerous of the two failures: a consumer that
handles it will look like it works until it hits a derived row.

Nothing renders it today, so nothing is broken now. The real fix is to export `serializeTask` from
`server/routes/tasks.js` and use it in both places. Minimal paste-ready version:

```js
  // was: dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null
  dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
  // Same read-path fallback as serializeTask() in routes/tasks.js (D-016 — no backfill).
  startDate: (t.startDate ?? t.createdAt)
    ? new Date(t.startDate ?? t.createdAt).toISOString().split('T')[0]
    : null,
  startDateIsDerived: t.startDate == null
```

That requires `createdAt` to be selected on that query — it is, the query uses `include`, not a
narrowing `select`. **I did not apply this**: `server/routes/goals.js` is on my do-not-touch list.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| medium | Goal-sourced tasks emit `startDate` as a raw ISO timestamp, not the `YYYY-MM-DD` the tasks router emits, and can be null — an inconsistent shape for the same field | `server/routes/goals.js:114-118` | left, why: not owned — paste-ready fix in Handoff; proposed as `CHIP-TASK-SERIALIZER-SHARE` |
| medium | The derived start date is the **UTC** calendar date of `createdAt`, so it reads one day late for a task created after ~20:00 US Eastern | `server/routes/tasks.js:60` (`resolveStartYmd`) | fixed here as far as one place allows — see Risks; proposed as `CHIP-TZ-CONVENTION` |
| low | The detail panel shows `createdAt` via `toLocaleDateString()` (local) while the derived start date is UTC-derived, so the two can disagree by a day on the same panel | `TaskDetailPanel.js:176` vs. the new Start Date field | left, why: fixing it properly is the timezone convention chip, not a patch |
| low | Three separate hand-inlined copies of the same date/cost serialization existed (`tasks.js` list, `tasks.js` `serializeTask`, `goals.js`) | `server/routes/tasks.js:264`, `goals.js:117` | 2 of 3 unified here; the third is not owned |
| low | `sortBy` on `GET /api/tasks` accepts `dueDate`/`priority`/`position` only; sorting by start date would need care because null means "derived", so a naive `orderBy: startDate` sorts every legacy row together instead of by its real creation date | `server/routes/tasks.js:217-221` | left, why: not requested — noted so nobody adds it naively |
| low | Two `[W5-TASK-STARTDATE chip test]` rows left on the staging database | staging `tasks` table | left, why: needed for the after-count; safe to delete |
| low | `NewsWidget.js` and `NewsScheduler.js` still fail ESM parsing, so `npm run check` cannot scan them for duplicate keys | `client/src/js/components/cards/`, `graphene-news/backend/jobs/` | left, why: pre-existing and not owned |

### What I saw outside my scope

**There is already a timezone-correct ymd helper in this repo, and the rest of the codebase does
not use it.** `ymdInTz(date, timezone)` at `server/services/emailDigest.js:9` uses
`Intl.DateTimeFormat('en-CA', { timeZone })` and exists precisely so that "due tomorrow" buckets
are per-local-day rather than per-UTC-day — its comment says so. Meanwhile `tasks.js` uses
`toISOString().split('T')[0]` and `app-refactored.js` uses a local-time `_ymd()`. That is three
different date conventions in one application, and which one you get depends on which subsystem
rendered the value. The email digest is the only one that is actually correct for a named user,
because it is the only one that knows the user's timezone.

`server/routes/goals.js:100-108` re-declares the same `include` block as the tasks list query, and
`buildTaskBuckets` re-derives task grouping that the tasks router also computes. The two routers
have drifted apart in exactly the way a shared serializer would prevent.

`getRelativeDateLabel()` in `client/src/js/utils/formatters.js:254` is due-date-specific despite
its generic name — it hardcodes `'Due today'` / `'Due tomorrow'` / `'Nd overdue'`, with the first
two overridable and the third not. I did not reuse it for start dates for that reason. A future
reader may reasonably assume from the name that it is general and get "3d overdue" on a start date.

### Risks in what I built

**Most likely to be wrong: the UTC derivation of the fallback date.** This is the single place my
work can produce a value a user calls wrong. `resolveStartYmd()` uses
`createdAt.toISOString().split('T')[0]`, so a task created at 21:30 US Central (03:30 UTC the next
day) shows a start date of *tomorrow*. **What would expose it:** create a task late in the evening
US-time and compare the list view's Start column against the "Created" line in its detail panel —
they will differ by one day, because the latter uses `toLocaleDateString()`. I took this
deliberately: it is byte-identical to what the forbidden backfill would have produced, a
client-side correction would mean two fallbacks (the exact thing the brief prohibits), and it only
ever affects rows where nobody chose a date. But it is a real defect with a real repro, not a
theoretical one, and the honest fix is a repo-wide convention rather than a patch here. Everything
a user *explicitly* sets round-trips exactly; verified.

**Second: `startDateIsDerived` is a new field three templates now read.** If any future code path
constructs a task object without going through `serializeTask()`, the flag is `undefined`, which is
falsy — so the list view would render that task's start date in the dark "explicitly set" colour
and the detail panel would hide the "From creation date" hint. It fails quiet and cosmetic rather
than loud, which is the wrong direction for catching it. `goals.js` is already such a path.

**Third: the list table's column count is enforced by nothing.** I changed a `<th>` count, a `<td>`
count, and two `colspan` attributes in three separate places in one 892-line template string.
I verified all three agree by parsing the output (7/7/7), but the next person to add a column has
no test to tell them they missed the `colspan`; the group-header row would silently under-span.
Note that `colspan="6"` also appears twice in the *costs* table in the same file — I confirmed by
line number which two of the four belonged to the list table before editing.

**Not a risk, deliberately checked:** the `updateTaskInline` path needed no change, because it is
field-generic (`API.tasks.update(taskId, { [field]: value })`). I did not add a `startDate` special
case anywhere in the client update path, so there is no second write path to keep in sync.

### Proposed follow-up chips

- **`CHIP-TASK-SERIALIZER-SHARE`** — export `serializeTask` from `server/routes/tasks.js` and use
  it for the task list in `server/routes/goals.js`, removing the third inlined copy. Owns
  `server/routes/tasks.js`, `server/routes/goals.js`. Lane A, sonnet. Small and well-specified; the
  paste-ready block is in my Handoff section.
- **`CHIP-TZ-CONVENTION`** — Lane B first: decide one date convention for the app and write it
  down. The material is all present — `ymdInTz()` at `emailDigest.js:9`, `_ymd()` at
  `app-refactored.js:5395`, and `toISOString().split('T')[0]` scattered through the routers. The
  question for Ben is whether a single org timezone is enough (it almost certainly is — one US
  company) or whether it is per-user. With an org timezone, `resolveStartYmd()` becomes
  `ymdInTz(task.createdAt, ORG_TZ)` and my finding closes. Owns notes only. Then a Lane A chip to
  apply it. **Worth doing before this feature ships to production**, because production has 88
  tasks whose derived start dates are computed by the rule this chip would change.
- **`CHIP-DEPLOY-SCHEMA-GUARD`** — already proposed by D-017 and still open. Working inside a
  feature whose whole design exists to avoid one mass write, while `--accept-data-loss` runs
  unattended on every deploy, made the asymmetry hard to ignore: this chip was forbidden from
  writing 88 rows, and the deploy script is authorised to drop the column.

### Harness improvements

**The spawn prompt was the best-specified I could ask for, and the reason is worth naming.** It
quoted D-016's worked example rather than citing it, told me the schema was already done, and —
most usefully — stated the *design constraint* (null means creation date, one fallback, server
side) rather than the implementation. That left the actual decisions (where to display it, what
clearing does, which activity verbs) as decisions, while removing any chance of my re-litigating
the settled part. The instruction to "work these out from the code rather than assuming, and
justify each in notes" is what stopped me adding the start date to all six `dueDate` sites, which
is what I would otherwise have done.

**One environment trap worth adding to CHIP-PROTOCOL §9.** Verifying a template string with
`DOMParser` or `innerHTML` and then `querySelectorAll` **silently returns nothing** for this app's
markup, because the tabs are full of `<template x-if>` / `<template x-for>` and `querySelectorAll`
does not descend into `template.content`. I got `tableCount: 0` on a file I could see had two
tables and briefly thought the template was malformed. The fix is a four-line recursive walker:

```js
function findAll(root, sel, acc = []) {
  root.querySelectorAll(sel).forEach(n => acc.push(n));
  root.querySelectorAll('template').forEach(t => findAll(t.content, sel, acc));
  return acc;
}
```

Suggested §9 row: *"`querySelectorAll` doesn't enter `<template>` — every tab in this app nests
content inside `x-if`/`x-for` templates, so structural checks on `getFooTabHtml()` need a
recursive walker or they return zero matches and read as a broken template."*

**Minor:** running a scratchpad script against the repo's `node_modules` needs absolute-path
imports (`import { PrismaClient } from '/abs/path/node_modules/@prisma/client/index.js'`), because
agent threads reset cwd between bash calls and Node resolves from the *file's* location, not the
cwd. Cost me one failed run. Worth a line in §9 next to the scratchpad guidance.

**Model tier: opus was right, and sonnet would have been a bad trade.** Not for the code — the
diff is small and mechanical. For the two judgement calls: that a null start date must never
render blank and therefore needs a `startDateIsDerived` companion flag to stay legible, and that
"everywhere `dueDate` appears" was the wrong answer to the display question. Both are places where
a competent implementation of the literal instruction would have been worse than the instruction
intended.
