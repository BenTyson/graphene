# CHIP-W4-SUBTASK-EDIT

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:**
  - `client/src/js/components/modals/TaskDetailPanel.js`
  - `client/src/js/services/TaskService.js`
  - `server/routes/tasks.js`
  - `notes/W4-SUBTASK-EDIT.md`
- **Wave:** 4

## What I was asked to do

Two things on the subtask surface of the Task detail panel:

1. **Completion prompt.** When the *last* incomplete subtask of a task is marked complete, ask the
   user whether the parent task itself is now done, and move it to DONE if they say yes.
2. **Editable subtasks.** Subtask titles (and whatever else is genuinely useful) must be editable
   in place — updating the existing row, never delete-and-recreate.

Hard constraints carried from the spawn prompt: no schema change (D-004/D-016), no writes that
delete anything, no edits to `app-refactored.js` / `TasksTab.js` / `TaskModal.js` /
`prisma/schema.prisma` / `client/index.html`. Delegates for `app-refactored.js` get drafted into
`## Draft wiring` for the Integrator.

## Recon — established before writing any code

### What is editable on a subtask today (measured, not assumed)

`client/src/js/components/modals/TaskDetailPanel.js:213-241` is the whole subtask row. It renders:

| Control | Handler | Editable? |
|---|---|---|
| Done checkbox | `toggleSubtaskDone(sub)` → `TaskService.js:328` | yes |
| Title | `<span x-text="sub.title">` (line 225) | **no — plain text, no input** |
| Due date | `updateSubtaskDueDate(sub.id, ...)` → `TaskService.js:341` | yes |
| Assignee avatars | `getTaskAssigneeUsers(sub)` (line 230) | no — display only |

So the spawn prompt's summary is accurate: create / toggle-done / due-date, and nothing else.
Confirmed there is no other subtask edit surface anywhere — subtask rows are not clickable, so a
subtask can never be opened as `selectedTask`; only dependency rows call `openTaskDetail`
(lines 266, 330).

### Does `PUT /api/tasks/:id` already handle a subtask title update?

Yes. `server/routes/tasks.js:458` sets `data.title = title.trim()` and `:482-484` logs an `edited`
activity with from/to. A subtask is a `Task` row, so the existing PUT is the correct update-in-place
path and **no new endpoint is needed**. `API.tasks.update(id, data)` (`api.js:1300`) already PUTs
there, and `updateSubtaskDueDate` already uses it — so no change to `api.js` (which I do not own)
is required either.

**But PUT has a real defect**: unlike POST (`tasks.js:381`, `if (!title || !title.trim())` → 400),
PUT applies `title.trim()` with **no empty check**. `PUT {"title":"   "}` blanks the row's title.
Fixing that is a prerequisite for shipping title editing. Also `title.trim()` throws on a non-string
`title` (e.g. `{"title": 123}` → 500). Both fixed in this chip.

### `TaskActivity.action` is a plain `String`, not an enum

`prisma/schema.prisma` — `action String` (no `@db` enum, no Prisma enum). A **new action value needs
no schema change**, which keeps this chip inside D-004/D-016.

### The DONE-transition guard — where the three existing paths are

| Path | File:line | Endpoint it calls | Creator-only gate? |
|---|---|---|---|
| `updateTaskInline` | `TaskService.js:229-235` | `PUT /api/tasks/:id` | **yes** — `tasks.js:453` |
| `updateTaskStatus` | `TaskService.js:144-153` | `PATCH /api/tasks/:id/status` | no |
| kanban `onReorder` | `app-refactored.js:5508-5518` | `PATCH /api/tasks/reorder` | no |

All three funnel through `taskService.confirmDoneIfBlocked(task)` (`TaskService.js:257`), which
treats a blocker as satisfied when its status is in `['DONE','ARCHIVED']` (`:254`).

**Chosen host for the new prompt: `updateTaskStatus`.** Reasons, in order of weight:
1. It is a *status-only* transition, which is exactly what completing a parent is. `updateTaskInline`
   is the generic field-writer and would be a semantic mismatch.
2. Its guard **self-heals**: `:149-151` re-fetches the task when `blockedBy` is not an array, so the
   blocker check is correct even when the caller hands it a thin task object. `updateTaskInline`'s
   guard (`:233`) only looks at `ctx.selectedTask` or `ctx.tasks.find(...)` and silently skips the
   check if neither carries `blockedBy`.
3. `PATCH /:id/status` has **no creator-only restriction**, whereas `PUT /:id` returns 403 unless you
   are the task creator or SUPER_ADMIN (`tasks.js:453`). A team member who finishes the last subtask
   on someone else's task would get "Only the task creator or admin can edit this task" if the prompt
   were routed through `updateTaskInline`. That is a user-visible difference, not a style call.
4. `toggleSubtaskDone` already calls `API.tasks.updateStatus`, so this keeps one endpoint in play.

### Pre-existing bypass found: `toggleSubtaskDone` is already an unguarded 4th path to DONE

`TaskService.js:328-339` calls `API.tasks.updateStatus(subtask.id, 'DONE')` **directly**, without
`confirmDoneIfBlocked`. A subtask that is itself blocked by a `TaskDependency` can be checked off with
no warning. This predates my change and contradicts the `CLAUDE.md` note that says all DONE paths are
routed through the three. Fixed here (see below) since `toggleSubtaskDone` is the function I am
modifying anyway.

### Does ARCHIVED count as complete?

Yes, and there is precedent on both sides of the codebase:
- blockers: `['DONE','ARCHIVED']` — `TaskService.js:254`, `tasks.js:255`, `tasks.js:364`
- overdue subtasks: `s.status !== 'DONE' && s.status !== 'ARCHIVED'` — `app-refactored.js:5148`

The one place that counts only `DONE` is the *progress ratio* — `getSubtaskProgress`
(`app-refactored.js:5143`) and the panel's own `x/y` badge and progress bar
(`TaskDetailPanel.js:197,208`). That is a display fraction, not a completeness predicate, and I am
deliberately not changing it (it is also in a file I do not own). My predicate matches the blocker
semantics: an ARCHIVED subtask does not hold the parent open.

## What I did

### Feature 4 — editable subtasks

**`server/routes/tasks.js`** (PUT `/api/tasks/:id`)
- Added a title guard before anything is written. `title`, when present, must be a non-empty
  string; otherwise **400 `Title is required`**, matching POST's wording. Previously
  `if (title !== undefined) data.title = title.trim();` ran unconditionally — `{"title":""}`
  silently blanked the row and `{"title":123}` threw a 500 on `.trim()`.
- The activity log for a rename now writes **two** rows when the task is a subtask: the existing
  `edited` on the subtask itself, plus a new `subtask_renamed` on the **parent**. Reason: a
  subtask's own activity trail is unreachable in the UI — subtask rows cannot be opened as a
  detail panel — so without the mirror the edit is traceable only by querying the API directly.
  `TaskActivity.action` is a plain `String` in the schema, so this needed **no schema change**.
- No new endpoint. A subtask is a `Task` with a `parentId`, so the ordinary PUT already does the
  update in place and already carries the activity log.

**`client/src/js/services/TaskService.js`**
- New `updateSubtaskTitle(ctx, subtaskId, title)`. Trims, refuses empty, skips the write when the
  title is unchanged, PUTs via the existing `API.tasks.update`, then refetches the open parent.
  On failure it alerts *and* refetches, so the row snaps back to what actually persisted rather
  than sitting on a value the server rejected. **Never deletes and recreates** — same row id.

**`client/src/js/components/modals/TaskDetailPanel.js`**
- The subtask title `<span x-text="sub.title">` became an `<input>` styled to read as plain text
  until hovered or focused — the same borderless-until-hover treatment as the parent task's own
  title input at line 32. Behaviour copied from that input verbatim (blur saves when non-empty and
  changed, otherwise reverts; Enter blurs to commit) plus **Escape reverts and blurs**, which is the
  pattern the tag inputs in this same panel already use (`@keydown.escape.prevent`, line 393).
  So: blur-saves, Enter-commits, Escape-cancels — consistent with what the panel already does.
- Added a renderer for the new `subtask_renamed` activity action, so it shows as
  *renamed subtask "old" to "new"* rather than falling through to the raw action string.

**Deliberately not editable.** Only the title. Priority and an inline assignee picker were
considered and rejected as scope creep — an assignee picker is a real chunk of UI, and the row is
already dense. Proposed as a follow-up chip below.

### Feature 1 — the parent-completion prompt

**`client/src/js/services/TaskService.js`**
- `shouldPromptParentComplete(parent, triggerSubtaskId, declinedIds)` — a **pure** predicate, no
  I/O and no `ctx`, so the firing rules are directly testable. Rules, and why each exists:

| Rule | Why |
|---|---|
| parent `DONE` or `ARCHIVED` → never prompt | asked for explicitly |
| parent id in the declined set → never prompt | declining must stick |
| no subtasks → never prompt | nothing to complete |
| trigger subtask must be in the set **and** `DONE` | fires only on the transition that settled the last one |
| every subtask `DONE` **or** `ARCHIVED` | ARCHIVED counts as settled — matches the blocker rule |

- `maybePromptParentComplete(ctx, parentId, triggerSubtaskId)` — resolves the parent from
  `ctx.selectedTask` (or fetches it), runs the predicate, `confirm()`s, and on **yes** calls
  `this.updateTaskStatus(ctx, parent.id, 'DONE')`.
- `toggleSubtaskDone` rewritten to call `this.updateTaskStatus(...)` instead of hitting
  `API.tasks.updateStatus` directly, then refresh the parent, then prompt.
- `addSubtask` clears the parent's declined flag.

**Why `updateTaskStatus` is the right host** — the four reasons are in the Recon section above; the
short version is that it is the status-only path, its blocker guard self-heals by fetching when
`blockedBy` is absent, and its endpoint has no creator-only gate (so a non-creator finishing the
last subtask is not met with a 403). **No fourth path to DONE was created:** every DONE transition
this chip can cause goes through `updateTaskStatus`, which calls `confirmDoneIfBlocked` at
`TaskService.js:152`.

**Ordering vs. `confirm()` blocking.** `confirm()` is synchronous and freezes the main thread, so
every `await` — the status PATCH, the task-list reload, the parent refetch — is settled *before*
the prompt is raised. Nothing is in flight while the dialog is up. This also means the parent the
predicate inspects is **server state fetched after the toggle landed**, not an optimistic guess,
which is what makes the whole thing degrade safely: if the toggle failed, or the user declined the
blocker warning on the subtask, the refetched parent still shows that subtask as `TODO`, the
predicate returns `false`, and no stray prompt appears. That property is load-bearing, not
incidental.

**Where the dismissal lives.** `this._parentCompleteDeclined`, a `Set` on the TaskService singleton
— not Alpine state. Nothing renders from it, so it is not reactive state, and keeping it in a file
I own removed a D-001 wiring dependency. It resets on page reload; declining is remembered for the
session, and cleared for a parent when a new subtask is added to it.

### Bug fixed in passing (inside a function I was already rewriting)

`toggleSubtaskDone` was **already an unguarded fourth path to DONE** before this chip: it called
`API.tasks.updateStatus(subtask.id, 'DONE')` directly, so a subtask carrying its own
`TaskDependency` blockers could be checked off with no warning. Routing it through
`updateTaskStatus` closes that. This contradicts the `CLAUDE.md` claim that the guard covers all
DONE paths — a doc correction is drafted below.

## How I verified it

Lane A bar (CHIP-PROTOCOL.md §4, D-007): check suite green, build read, and the change actually run.

### 1. `npm run check` — PASSED

```
  PASS    self-test (does the checker still work?)        43ms
  PASS    syntax (node --check)                          433ms
  PASS    relative import resolution                      73ms
  REPORT  duplicate object keys                           77ms
  PASS    build (vite build)                              1.2s
check PASSED in 1.8s.
```
The 2 unparseable files (`NewsWidget.js`, `graphene-news/backend/jobs/NewsScheduler.js`) and the
2 build warnings are pre-existing and unrelated — neither is a file I touched.

`node --check` individually on all three changed JS files: all pass.

### 2. Build to my own output directory — PASSED, output read

```
npx vite build --outDir ../dist-subtaskedit
✓ built in 866ms
dist-subtaskedit/assets/index-DHwo60wW.js   1,207.35 kB │ gzip: 186.60 kB
```

Verified the new code actually reached the **minified bundle**, not just the source:

| String | occurrences in `dist-subtaskedit/assets/index-DHwo60wW.js` |
|---|---|
| `shouldPromptParentComplete` | 1 |
| `subtask_renamed` | 1 |
| `Mark this task as Done` | 1 |
| `Click to rename` | 1 |
| `renamed subtask` | 1 |

### 3. Server exercised with `curl` on port 3092 — subtask renamed in place

`PORT=3092 node server/index.js`, JWT minted from `JWT_SECRET` for the `admin` SUPER_ADMIN
(`cmfke8k9r0000xzwnk2aqai9t`) — **not** via `/api/auth/login`, so `lastLogin` was not written
(D-005). Auth sanity: `GET /api/tasks/stats` → **200**.

Test rows created for this (no pre-existing task was read-modified-or-deleted):

```
parent  cmt69pued0001wbj63oqeqao9  "[W4-SUBTASK-EDIT chip test] parent"
subtask cmt69pv4n0005wbj6obpgacvm  "original subtask title"  parentId=cmt69pued0001wbj63oqeqao9
```

**BEFORE** `GET /api/tasks/cmt69pv4n0005wbj6obpgacvm`
```json
{ "id": "cmt69pv4n0005wbj6obpgacvm", "title": "original subtask title", "status": "TODO",
  "parentId": "cmt69pued0001wbj63oqeqao9",
  "createdAt": "2026-08-23T20:36:58.199Z", "updatedAt": "2026-08-23T20:36:58.199Z" }
```

`PUT /api/tasks/cmt69pv4n0005wbj6obpgacvm  {"title":"renamed in place by chip"}` → 200

**AFTER**
```json
{ "id": "cmt69pv4n0005wbj6obpgacvm", "title": "renamed in place by chip", "status": "TODO",
  "parentId": "cmt69pued0001wbj63oqeqao9",
  "createdAt": "2026-08-23T20:36:58.199Z", "updatedAt": "2026-08-23T20:37:09.415Z" }
```

**Same `id`, same `createdAt`, only `updatedAt` moved** — this is an in-place update, not a
delete-and-recreate. That is the property Ben's "DO NOT delete existing data" instruction turns on,
so it is verified explicitly rather than assumed.

### 4. The activity log entry the edit produced

```
activity ON THE SUBTASK itself:
  edited             from='original subtask title' to='renamed in place by chip'
  created            from=None to=None

activity ON THE PARENT (mirrored — this is what the detail panel renders):
  subtask_renamed    from='original subtask title' to='renamed in place by chip'
  created            from=None to=None
```

### 5. Empty / malformed titles cannot blank a subtask

```
PUT {"title":""}     -> HTTP 400  {"error":"Title is required"}
PUT {"title":"   "}  -> HTTP 400  {"error":"Title is required"}
PUT {"title":123}    -> HTTP 400  {"error":"Title is required"}
PUT {"title":null}   -> HTTP 400  {"error":"Title is required"}

title survived all four attempts:  'renamed in place by chip'
legitimate rename with whitespace: '   trimmed rename   ' -> 'trimmed rename'
```

Pre-fix behaviour confirmed from git rather than asserted —
`git show HEAD:server/routes/tasks.js | sed -n '458p'` gives
`if (title !== undefined) data.title = title.trim();`, unconditional.

### 6. Firing logic — case table, real function, no browser

`svc.shouldPromptParentComplete` imported from the real module (not a reimplementation):

| # | case | expected | observed | |
|---|---|---|---|---|
| 1 | last subtask completes (2 of 2) | true | true | PASS |
| 2 | not-last completes (1 of 2 done) | false | false | PASS |
| 3 | single subtask, it completes | true | true | PASS |
| 4 | parent already DONE | false | false | PASS |
| 5 | parent already ARCHIVED | false | false | PASS |
| 6 | last outstanding done, sibling ARCHIVED | true | true | PASS |
| 7 | sibling still IN_REVIEW | false | false | PASS |
| 8 | already declined for this parent | false | false | PASS |
| 9 | declined for a DIFFERENT parent | true | true | PASS |
| 10 | trigger was un-completed (toggled off) | false | false | PASS |
| 11 | trigger not in parent's subtask list | false | false | PASS |
| 12 | task with no subtasks at all | false | false | PASS |
| 13 | subtasks missing from payload | false | false | PASS |
| 14 | no parent object at all | false | false | PASS |

Blocker guard, proven untouched:

```
hasIncompleteBlockers(parent with an incomplete blocker) = true   (expected true)  PASS
hasIncompleteBlockers(parent whose blocker is DONE)      = false  (expected false) PASS
hasIncompleteBlockers(parent whose blocker is ARCHIVED)  = false  (expected false) PASS
hasIncompleteBlockers(parent with no blockers)           = false  (expected false) PASS
shouldPromptParentComplete(same blocked parent)          = true   (expected true)  PASS
```

That last row is the important one: for a parent with incomplete blockers the completion prompt
**still fires**, and the blocker warning is raised afterwards by `updateTaskStatus`. The new prompt
does not suppress or bypass the blocker check — it feeds into it.

**14 of 14 predicate cases pass, 5 of 5 blocker cases pass, 0 failures.**

### 7. Dismissal + routing, exercised end to end with a stubbed `confirm`

```
SEQUENCE 1 — user DECLINES, then un-completes and re-completes twice
  1st completion of last subtask -> prompt shown       prompts=1 statusCalls=[]
  re-complete #1 after declining                       prompts=1 statusCalls=[]
  re-complete #2 after declining                       prompts=1 statusCalls=[]
  => prompt fired 1 time across 3 completions. Expected 1.  PASS
  => parent was never moved to DONE: []                     PASS

  prompt text shown to the user:
  "All 2 subtasks of \"Ship the thing\" are complete.\n\nMark this task as Done?"

SEQUENCE 2 — a NEW subtask is added, which clears the dismissal
  prompt fired again after the work changed shape: PASS (1)

SEQUENCE 3 — user ACCEPTS
  updateTaskStatus called with [["P","DONE"]]  PASS
```

### 8. Test data left in a known state — nothing deleted

Both rows I created were set to `ARCHIVED` (not deleted) and confirmed still present:

```
archived: cmt69pv4n0005wbj6obpgacvm 'trimmed rename'                     -> ARCHIVED
archived: cmt69pued0001wbj63oqeqao9 '[W4-SUBTASK-EDIT chip test] parent' -> ARCHIVED
GET /api/tasks/cmt69pv4n0005wbj6obpgacvm -> HTTP 200
GET /api/tasks/cmt69pued0001wbj63oqeqao9 -> HTTP 200
```

**Two rows remain in the live database.** I did not delete them, because the instruction not to
delete tasks is categorical and I would rather leave two obviously-labelled archived rows than
exercise a cascade delete on the live Tasks table. They are hidden from the board unless "Show
archived" is ticked. **If the Command Center wants them gone, that is a deliberate human call.**

### What I could NOT verify

- **The UI itself.** Per D-001 the delegate `updateSubtaskTitle` is not wired into
  `app-refactored.js`, so the rename input is inert until the Integrator applies the block below.
  The panel is also login-gated and I have no credentials (and must not create any, D-005). What I
  verified instead: the template string compiles and ships in the bundle, the service method works
  against the real endpoint, and the predicate is exercised over its full case space.
- **Two `confirm()` dialogs in sequence** (completion prompt → blocker warning) has been proven at
  the function-call level, not observed visually in a browser.

## Measurements

- **Extra HTTP requests per subtask check-off: +1 GET.** Routing `toggleSubtaskDone` through
  `updateTaskStatus` means the subtask is fetched once to read its `blockedBy` before a DONE
  transition (the detail GET's subtask include does not carry `blockedBy` —
  `tasks.js:318-324`). Measured against the old path: was `1 PATCH + 1 GET(parent) + loadTasks`,
  now `1 GET(subtask) + 1 PATCH + loadTasks + 1 GET(parent)`. Un-checking a subtask skips the guard
  and adds nothing. Judged worth it: the alternative is leaving a DONE path unguarded.
- **Prompts per completed subtask set: 1**, measured over a 3-completion decline/re-complete
  sequence (§7 above). The design target was "not every time an already-complete set is touched".
- **Case space of the firing predicate: 14 cases**, chosen to cover every early-return branch in
  the function plus both ARCHIVED interpretations. All 14 exercised.

## Draft wiring

### Target: `client/src/js/app-refactored.js`

**Anchor** — insert immediately **after** this existing line (verified present at line 5135 as of
this writing, with the sibling chip W4-TASK-COLUMNS's additive changes already in the tree):

```js
    async updateSubtaskDueDate(subtaskId, date) { await taskService.updateSubtaskDueDate(this, subtaskId, date); },
```

**Literal code to insert:**

```js
    async updateSubtaskTitle(subtaskId, title) { await taskService.updateSubtaskTitle(this, subtaskId, title); },
```

That is the **only** wiring this chip needs. One delegate, one line. No new Alpine state (the
dismissal set lives on the TaskService singleton), no `client/index.html` change, no
`server/index.js` change — `server/routes/tasks.js` is already registered.

**Verification after applying:** open a task with two or more subtasks in the detail panel; click a
subtask title, type, press Enter — the title should persist and an entry
*renamed subtask "old" to "new"* should appear in that task's Activity list. Then check off the
last outstanding subtask and confirm the "Mark this task as Done?" prompt appears exactly once.

## Draft for shared docs

### Doc: `CLAUDE.md`, the Gotchas bullet beginning "Task dependencies (`TaskDependency` model)"

That bullet currently ends:

> The DONE-transition guard is applied in `updateTaskInline`, `updateTaskStatus`, and the kanban
> `onReorder` — if adding a new DONE-transition code path, route it through one of these.

It was **incomplete**: `toggleSubtaskDone` was a fourth, unguarded path. Proposed replacement for
that sentence:

> The DONE-transition guard is applied in `updateTaskInline`, `updateTaskStatus`, and the kanban
> `onReorder`. `toggleSubtaskDone` routes through `updateTaskStatus` rather than calling the API
> directly, so the subtask checkbox is guarded too — if adding a new DONE-transition code path,
> route it through one of the three rather than writing a parallel one.

### Doc: `CLAUDE.md`, new Gotchas bullet (subtask editing + the completion prompt)

> - Subtasks are editable in place. The title is an inline input in `TaskDetailPanel.js`
>   (blur-saves, Enter commits, Escape reverts) that PUTs to the ordinary `PUT /api/tasks/:id` —
>   a subtask is a `Task` with a `parentId`, so there is no subtask-specific endpoint and none
>   should be added. `PUT` rejects an empty or non-string `title` with 400 rather than blanking
>   the row. A subtask rename writes **two** activity rows: `edited` on the subtask and
>   `subtask_renamed` on the parent, because a subtask's own activity trail is not reachable in
>   the UI. When the last outstanding subtask is checked off, `TaskService.maybePromptParentComplete`
>   asks whether the parent is done and, on yes, routes through `updateTaskStatus` so the
>   incomplete-blocker warning still applies. ARCHIVED subtasks count as settled (matching the
>   blocker rule), though the `x/y` progress fraction still counts only DONE. Declining is
>   remembered per-parent on the `taskService` singleton for the session, and cleared when a new
>   subtask is added to that parent.

## Handoff: changes needed in files I do not own

Only the one delegate line in `## Draft wiring` above. Nothing else.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| high | `PUT /api/tasks/:id` applied `title.trim()` with no empty check — `{"title":""}` silently blanked a task's title, and a non-string title threw a 500. POST guards this; PUT never did. | `server/routes/tasks.js:458` (pre-change) | fixed here — 400 `Title is required` |
| high | `toggleSubtaskDone` called `API.tasks.updateStatus` directly, bypassing the shared incomplete-blocker guard. A blocked subtask could be checked off with no warning. Contradicts the `CLAUDE.md` claim that three paths cover all DONE transitions. | `TaskService.js:328-339` (pre-change) | fixed here — routed through `updateTaskStatus` |
| medium | `CLAUDE.md` states the DONE guard covers all paths via three functions. It did not; `toggleSubtaskDone` was a fourth. | `CLAUDE.md`, Task dependencies bullet | left, why: shared doc — replacement text in `## Draft for shared docs` |
| medium | A subtask's activity trail is written but unreachable in the UI: subtask rows are not clickable, so a subtask can never become `selectedTask`, and only the parent's `activities` render. Every subtask edit and status change was invisible. | `TaskDetailPanel.js:213-241`, `tasks.js:337` | partly fixed here — renames now mirror to the parent as `subtask_renamed`; subtask status changes are still not mirrored |
| medium | `updateSubtaskDueDate` does not call `loadTasks`, so changing a subtask's due date leaves the kanban's red "N overdue" subtask badge stale until the next reload. | `TaskService.js:341-350` | left, why: pre-existing and out of scope — proposed as CHIP-SUBTASK-REFRESH |
| low | `updateTaskInline`'s blocker guard reads `ctx.selectedTask` or `ctx.tasks.find(...)` and silently skips the check when neither carries `blockedBy`. The other two paths re-fetch. Not exploitable from the current UI (the panel always has `blockedBy`) but it is the weakest of the three. | `TaskService.js:233` | left, why: not in my feature's path |
| low | `deleteTask`'s confirm says "This will also delete all subtasks" — accurate (`onDelete: Cascade`), but it is the one control in the panel that can destroy a subtask's history, sitting two icons from Archive. | `TaskService.js:131`, `TaskDetailPanel.js:49` | left, why: existing behaviour, no ruling to change it |
| low | Two archived test rows remain in the live DB from my curl verification. | ids in §8 of *How I verified it* | left, why: instructed never to delete a task; flagged for a human call |

### What I saw outside my scope

- **The subtask surface is read-mostly by accident, not design.** Assignee avatars render on
  subtask rows (`TaskDetailPanel.js:230-239`) but there is no way to change them; the same is true
  of priority, description, comments and attachments, all of which a subtask row *has* in the
  database and none of which are reachable. Making the title editable closes the most obvious gap
  but the row is still a narrow window onto a full `Task`.
- **`getSubtaskProgress` and the panel's `x/y` badge disagree with the blocker semantics.** They
  count only `DONE` (`app-refactored.js:5143`, `TaskDetailPanel.js:197,208`), so a task with one
  DONE and one ARCHIVED subtask shows "1/2" and a half-full progress bar while my predicate — and
  `getOverdueSubtaskCount` at `:5148`, and every blocker check — treat it as fully settled. After
  this chip a user can see "1/2" and simultaneously be asked whether the task is complete. That is
  defensible (the fraction is a display ratio over the whole set) but it is a visible inconsistency
  I am creating a new occasion to notice. I did not change it: both files are owned by
  W4-TASK-COLUMNS this wave, and it is a judgement call about what the fraction means, not a bug.
- `DealModal.js` / `DealDetailPanel.js` are still in the tree and still unreferenced, matching the
  `CLAUDE.md` note. Not investigated further; §7 not applied.

### Risks in what I built

Ordered by how likely I think each is to actually bite.

1. **The "1/2 complete" vs "are you done?" contradiction described above.** This is the most likely
   thing a user notices first, and it will read as a bug even though both numbers are behaving as
   designed. It surfaces the moment anyone archives a subtask instead of completing it. Exposed by:
   archive one subtask, complete the other. Cheapest fix if Ben dislikes it is to make the fraction
   count ARCHIVED as done too — one line in `getSubtaskProgress` and two in the panel — but that
   file is not mine this wave.

2. **The dismissal is remembered on a module singleton, so it dies on page reload.** A user who
   declines, reloads, and re-completes a subtask will be asked again. I judged session-scope
   correct (the alternative is persisting a dismissal to the database, which is a schema change),
   but if Ben finds the prompt naggy in practice this is the mechanism to look at first. Exposed
   by: decline, hard-refresh, toggle a subtask off and on.

3. **The prompt fires after `loadTasks` has already repainted the board.** Because `confirm()` must
   not block an in-flight save, the whole save-and-refresh cycle completes first, so there is a
   visible beat where the subtask ticks green and the list re-renders *before* the dialog appears.
   On a slow connection that gap could be a second or more and may feel disconnected from the click.
   The alternative — prompting optimistically before the save — was rejected because it would let
   the dialog block a pending request and could prompt on a toggle that then failed.

4. **Two `confirm()` dialogs can appear back to back** when the completed parent also has incomplete
   blockers: "Mark this task as Done?" then "Still blocked by: … Mark done anyway?". Verified at the
   function-call level, never seen on screen. It is correct behaviour — the blocker check must not
   be bypassed — but stacked native dialogs are ugly and a user may click through the second one
   reflexively having just answered the first. This is the case I would most want eyes on in a
   browser before it reaches Ben.

5. **`subtask_renamed` writes a second activity row per rename.** If someone edits a subtask title
   repeatedly the parent's activity list fills with renames, and the panel caps at 50 activities
   (`tasks.js:342`), so a chatty rename session could push genuinely interesting history off the
   end of the parent's log. Bounded, but real.

6. **I changed a shared write path.** The empty-title guard is in `PUT /api/tasks/:id`, which every
   task edit in the app goes through — not just subtasks. If any existing caller relies on sending
   `title: ""` or a non-string title and getting a 200, it now gets a 400. I grepped the client:
   the only senders of `title` are `saveTask` (guarded by the modal's required field) and my new
   `updateSubtaskTitle` (guarded client-side). I believe the blast radius is nil, but this is the
   change with the widest reach in the chip and it is worth a second pair of eyes.

### Proposed follow-up chips

| Name | Job | Owns | Lane | Tier |
|---|---|---|---|---|
| `CHIP-SUBTASK-PROGRESS-SEMANTICS` | Decide and apply one rule for whether ARCHIVED counts as done in the `x/y` fraction and progress bar, so the badge stops contradicting the completion prompt. Needs a ruling from Ben first — it is a product call. | `app-refactored.js` (`getSubtaskProgress`), `TaskDetailPanel.js` | A | sonnet |
| `CHIP-SUBTASK-DETAIL` | Make subtask rows openable as a detail panel, so a subtask's own activity, comments and attachments become reachable and the parent-mirroring hack can be retired. | `TaskDetailPanel.js`, `TaskService.js` | A | opus |
| `CHIP-SUBTASK-REFRESH` | `updateSubtaskDueDate` and `updateSubtaskTitle` should refresh the parent list consistently so the kanban overdue badge is never stale. | `TaskService.js` | A | fable |
| `CHIP-CONFIRM-TO-MODAL` | Replace the three (now four) native `confirm()` dialogs in the task flow with the app's own modal styling, and collapse the stacked completion+blocker case into one dialog. | `TaskDetailPanel.js`, `TaskService.js`, wiring drafted | A | sonnet |

### Harness improvements

- **The spawn prompt was unusually good on the one thing that mattered**: naming the DONE-guard trap
  and telling me to verify *which* of the three hosts is right rather than picking one. I would have
  reached for `updateTaskInline` on instinct (it is the generic field-writer) and it would have been
  wrong in a way that only shows up for non-creator users — a 403 that no local test with an admin
  token would ever reveal. Pasting the `CLAUDE.md` sentence inline, per §6's *quote, don't cite*,
  is what made that checkable.
- **The instruction "leave the data as you found it" collides with "never delete a record."** Those
  cannot both hold once a chip creates a test row. I resolved it by archiving and reporting the ids,
  but the protocol should say which wins. Suggested wording for §9 or DECISIONS: *a chip that must
  create test data labels it with its chip name, archives rather than deletes it, and reports the
  ids; cleanup is the Command Center's call.*
- **`--outDir ../dist-subtaskedit` does not land where CHIP-PROTOCOL.md §9 implies.** Vite's `root`
  is `./client`, so `../dist-subtaskedit` resolves to `<repo>/dist-subtaskedit`, not a sibling of
  the repo. The instruction works, but I wasted a round trip grepping for the bundle at the path I
  expected. Worth one clarifying clause in the §9 table row.
- **Minting a JWT needs a documented recipe.** Bare-specifier resolution means a script in the
  scratchpad cannot `import { PrismaClient }`; it has to run as `node --input-type=module -e` with
  cwd at the repo root, or live inside the repo. Three chips have now needed a token; this belongs
  in §9 as a paste-ready snippet rather than being rediscovered each wave.
- **Model tier: opus was right, and not for the coding.** The implementation is about 120 lines and
  a cheaper tier would have written it. The expensive part was deciding which of three near-identical
  functions to host the new path in, and noticing that the checkbox was already an unguarded fourth
  path — both judgement calls where being wrong is invisible until a specific user hits a specific
  state. I would keep opus for any chip whose prompt contains the phrase "there is a trap here".
