# CHIP-W4-TASK-COLUMNS

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:**
  - `client/src/js/components/tabs/TasksTab.js`
  - `client/src/js/app-refactored.js` (§8 shared wiring file — purely additive)
  - `notes/W4-TASK-COLUMNS.md`
- **Wave:** 4

## What I was asked to do

Add a visual control on the Tasks tab to toggle which kanban columns are visible.
Default: TO DO, IN PROGRESS, IN REVIEW visible; DONE and ARCHIVED hidden. Persist to
localStorage. Reconcile with the existing "Show archived" checkbox. Kanban view only.

**§8 constraint:** my `app-refactored.js` change must be purely additive — no existing method or
state property moved, renamed, or reordered — because sibling chip W4-SUBTASK-EDIT is drafting
delegate methods anchored to today's method positions. Verified mechanically; see "§8 additivity
proof" below.

## What I did

### 1. One source of truth for the column list

`client/src/js/components/tabs/TasksTab.js:10` now exports `TASK_KANBAN_COLUMNS` — an ordered
array of `{ id, label, dotClass, bodyClass }` for all five statuses — and
`TASK_DEFAULT_VISIBLE_COLUMNS` at `:22`. `app-refactored.js:51` imports both from the same module,
so the rendered board, the toggle menu, and the SortableJS column-id list at
`app-refactored.js:5577` can no longer drift apart. Before this, the column list existed twice as
a hardcoded literal (`TasksTab.js:121` and `app-refactored.js:5505`) and the two **already
disagreed** — see finding H1.

Tailwind classes are stored as literal strings in the array so the JIT scanner still finds them.

### 2. Unified the ARCHIVED column into the main loop

The board previously rendered four columns from a `.map()` plus a bespoke, hand-written fifth
ARCHIVED column (50 lines) gated on `x-show="showArchivedTasks"`. That fifth column had a
*different* card: no goal pill, no tags, no cost chip, no blocker indicators, no subtask progress.
It also had no `+ Add task` button and no Sortable binding.

All five columns now come from one loop over `TASK_KANBAN_COLUMNS`
(`TasksTab.js:198`), each with `x-show="isTaskColumnVisible('<STATUS>')"`. The two
ARCHIVED-specific behaviours worth keeping are preserved by a compile-time conditional in the
template: `opacity-60` on the card, and no `+ Add task` button. Empty-state copy is still
"No archived tasks" for that column and "No tasks" for the rest. Net −84 lines in that file.

### 3. The control

A "Columns" dropdown in the existing filter row (`TasksTab.js:131`), rendered only when
`taskViewMode === 'kanban'`. It matches the neighbouring filter controls — `border-gray-300
rounded-md`, `text-sm`, `focus:ring-black` — with a small count badge, a checkbox per column
(colour dot + label + live task count), and a bronze `#B87333` "Reset to default" link. Closes on
click-away and on Escape. It sits `ml-auto` on the right, the same slot the list view's "Group by"
uses; the two are in mutually exclusive `x-if` blocks so they never collide.

### 4. What I did with the "Show archived" checkbox — kept as an alias, scoped to non-board views

**Decision: kept, not removed, and made mutually exclusive with the new control.**

The reason it could not simply be deleted: `showArchivedTasks` was never board-only. It was read by
`getFilteredTasks()` (`app-refactored.js:5073` before my change), which feeds **all four** views —
kanban, list, calendar and costs. Deleting the checkbox outright would have silently removed the
only way to see archived tasks in the list, calendar and costs views, which nobody asked for.

So:

- The single source of truth is `taskVisibleColumns.ARCHIVED`.
- On the **board**, that flag is driven by the Columns menu; the checkbox is not rendered.
- In **list / calendar / costs**, the checkbox is rendered and reads/writes the same flag via
  `:checked="isTaskColumnVisible('ARCHIVED')"` + `@change="toggleTaskColumn('ARCHIVED')"`.
- The two controls are therefore **never on screen at the same time**, which is the specific
  confusion the spawn prompt warned about, and they cannot diverge because there is only one flag.

The old `showArchivedTasks` state property is now unreferenced. Per CHIP-PROTOCOL.md §7 ("prefer
un-exporting to deleting… or leaving a one-line tombstone comment over removal") I left the
declaration in place with a same-line tombstone at `app-refactored.js:517`, which also keeps the
line count stable for §8. Removing it is proposed as a follow-up.

I also **dropped `showArchivedTasks` from the "Clear filters" control**. Column visibility is a
persisted view preference, like `taskListGroupBy` and the sidebar collapse state — not a filter.
"Clear filters" resetting it would have fought with localStorage on every click. "Reset to default"
inside the Columns menu is the deliberate way to undo it.

### 5. Persistence

Key `taskVisibleColumns`, a JSON object. Convention matched to what the file already does for
`taskListGroupBy` (`:455`), `taskCostsGroupBy` (`:456`) and `taskCalendarSubMode` (`:461`): read at
state-initialisation time, written by an explicit setter.

*Correction to my spawn prompt:* it told me to follow "the pattern already used in this file for
`taskViewMode`". `taskViewMode` is **not** persisted — it is a bare `taskViewMode: 'kanban'` at
`app-refactored.js:453`. I followed the three properties that genuinely are persisted instead.

`loadTaskVisibleColumns()` (`app-refactored.js:200`) falls back to the defaults on: absent key,
unparseable JSON, non-object, array, `null`, a string, unknown keys, non-boolean values, and a blob
where every column is `false`. Each case is tested below.

### 6. Zero visible columns

Two layers, because the menu checkbox alone is not a guarantee:

- `isTaskColumnLastVisible(status)` disables the checkbox for whichever column is the only one
  left, and greys the row.
- `toggleTaskColumn()` itself returns early in that case, so a direct call cannot empty the board
  either.
- A third layer exists as belt-and-braces: an "All columns are hidden / Reset columns to default"
  panel (`TasksTab.js`, after the board) that renders if the visible count ever reaches zero. It
  should be unreachable; it exists so a pathological state shows a way out rather than a blank page.

### 7. Drag and drop

`initKanbanDragDrop()` now derives `columnIds` from `getVisibleTaskColumns()` instead of a
hardcoded four-element literal, so Sortable binds to exactly the columns on screen. `_persistTaskColumns()`
calls it again on `$nextTick` after every toggle.

Note the columns are hidden with `x-show` (`display:none`), not `x-if`, so **the DOM node is never
removed** — there is no dangling-instance hazard of the kind the spawn prompt asked about. The
risk that did exist was the opposite one (Sortable bound to an invisible column), and filtering
`columnIds` closes it. Measured below.

### 8. Scope: board only, deliberately

`taskViewMode` is `kanban | list | calendar | costs`; only the board has columns, so the Columns
menu appears only there. The one place column state legitimately leaks past the board is the
ARCHIVED flag, because it is also the archived *data* filter in `getFilteredTasks()` — that was
already true of the checkbox it replaces, so it is not a behaviour change. Concretely: hiding the
DONE column does **not** hide DONE tasks from the list view (verified below), but turning ARCHIVED
off does hide archived tasks everywhere, exactly as unticking "Show archived" did before.

### 9. Hiding a column never touches task data — verified

Confirmed directly (see "Data safety" below): with DONE and ARCHIVED hidden, all eight fixture
tasks retained their original status, no PUT/PATCH/POST was issued, and the only network traffic
during the whole session was GETs. No Prisma call, no `db push`, no seed. D-004 and D-005 respected.

## How I verified it

Lane A bar (CHIP-PROTOCOL.md §4 + D-007): `npm run check`, a dedicated `vite build`, and the UI
driven in a real browser with observed values.

### Static checks

```
$ node --check client/src/js/components/tabs/TasksTab.js
$ node --check client/src/js/app-refactored.js
SYNTAX OK

$ npm run check
  PASS    self-test (does the checker still work?)        44ms
  PASS    syntax (node --check)                          406ms
  PASS    relative import resolution                      70ms
  REPORT  duplicate object keys                           74ms
  PASS    build (vite build)                              1.1s
check PASSED in 1.7s.

$ npx vite build --outDir ../dist-taskcolumns
✓ 127 modules transformed.
../dist-taskcolumns/index.html                     90.20 kB │ gzip:  12.99 kB
../dist-taskcolumns/assets/index-DHwo60wW.js    1,207.35 kB │ gzip: 186.60 kB
✓ built in 949ms
```

(Note for the next chip: vite's `root` is `./client`, so `--outDir ../dist-taskcolumns` lands at
`graphene/dist-taskcolumns`, not beside the repo. It is covered by `.gitignore:9  dist-*/`.)

All five grid widths are present in the emitted CSS, so `getTaskKanbanGridClass()` cannot return a
class Tailwind purged:

```
xl\:grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
xl\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
xl\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
xl\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
xl\:grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}
```

### Browser harness

Vite on **5244** (`npx vite --port 5244`). The app is login-gated and D-004/D-005 forbid creating a
user, so I mounted a second, isolated Alpine tree in the page:

```js
const app = window.grapheneApp();
app.init = () => {};          // Alpine auto-calls init(); this blocks the auth loaders
app.activeTab = 'tasks'; app.taskViewMode = 'kanban';
app.tasks = [ …8 fixture tasks: 2 TODO, 1 IN_PROGRESS, 1 IN_REVIEW, 3 DONE, 1 ARCHIVED ];
Alpine.data('__w4', () => app);
div.innerHTML = '<div x-html="getTasksTabHtml()"></div>';
Alpine.initTree(div);
```

**Gotcha for the next chip using this technique:** `window.grapheneApp()` returns the *raw* object.
Alpine wraps it in a reactivity Proxy, and writing to the raw object does **not** trigger a
re-render. Get the proxy with `Alpine.$data(el)` and mutate that. I lost time to this.

#### Default state on a fresh localStorage

`localStorage.removeItem('taskVisibleColumns')`, then a full page reload:

```
freshDefaults      {"TODO":true,"IN_PROGRESS":true,"IN_REVIEW":true,"DONE":false,"ARCHIVED":false}
rendered columns   ["TODO","IN_PROGRESS","IN_REVIEW"]
grid class         xl:grid-cols-3
localStorage       null      ← rendering alone writes nothing
Columns badge      "3"
```

Menu contents, read off the screenshot: To Do ☑ 2 · In Progress ☑ 1 · In Review ☑ 1 · Done ☐ 3 ·
Archived ☐ 1. The counts for the two *hidden* columns are correct (3 and 1), which is the point of
the `getTasksByStatus` change described in finding H2.

#### Toggling, by clicking the real checkboxes

| Action | rendered columns | grid | localStorage | Sortable columnIds |
|---|---|---|---|---|
| start | TODO, IN_PROGRESS, IN_REVIEW | `xl:grid-cols-3` | *(none)* | 3 |
| tick Done | + DONE | `xl:grid-cols-4` | `{"TODO":true,"IN_PROGRESS":true,"IN_REVIEW":true,"DONE":true,"ARCHIVED":false}` | 4 |
| tick Archived | + ARCHIVED | `xl:grid-cols-5` | `…"ARCHIVED":true}` | 5 |
| untick To Do | − TODO | `xl:grid-cols-4` | `{"TODO":false,…}` | `IN_PROGRESS, IN_REVIEW, DONE, ARCHIVED` |

#### Zero-column guard

Turned off everything but In Review, then tried to turn that off too:

```
visible with one left        ["IN_REVIEW"]      grid xl:grid-cols-1
last checkbox .disabled      true
after clicking it anyway     ["IN_REVIEW"]      (unchanged)
after direct toggleTaskColumn('IN_REVIEW')   ["IN_REVIEW"]      (unchanged)
```

#### Data safety — the load-bearing check

Same run, before/after the whole toggle sequence with DONE and ARCHIVED hidden:

```
taskStatusesUnchanged  true
statuses               t1:TODO, t2:TODO, t3:IN_PROGRESS, t4:IN_REVIEW,
                       t5:DONE, t6:DONE, t7:DONE, t8:ARCHIVED
```

All three DONE tasks and the one ARCHIVED task kept their status while their columns were hidden.
**Hiding a column is a view filter and nothing else.**

#### Corrupt / absent stored values

Each row is the map produced by a fresh `grapheneApp()` after planting that raw string:

| stored value | result |
|---|---|
| *(key absent)* | defaults |
| `{not json` | defaults |
| `["TODO"]` | defaults |
| `null` | defaults |
| `"hello"` | defaults |
| all-false object | defaults ← would otherwise be an empty board |
| `{"TODO":"yes","IN_PROGRESS":1,"DONE":true}` | `{TODO:true, IN_PROGRESS:true, IN_REVIEW:true, DONE:true, ARCHIVED:false}` — non-boolean values discarded, the valid `DONE:true` kept |
| `{"TODO":false,"BOGUS":true,"DONE":true}` | `{TODO:false, IN_PROGRESS:true, IN_REVIEW:true, DONE:true, ARCHIVED:false}` — unknown key ignored |
| `{"DONE":true,"ARCHIVED":true}` | `{TODO:true, IN_PROGRESS:true, IN_REVIEW:true, DONE:true, ARCHIVED:true}` — partial merge |

#### Persistence across a real page reload

Planted `{"TODO":true,"IN_PROGRESS":false,"IN_REVIEW":false,"DONE":true,"ARCHIVED":true}`, then
navigated the browser to `http://localhost:5244/` afresh:

```
restoredFromLocalStorage  {"TODO":true,"IN_PROGRESS":false,"IN_REVIEW":false,"DONE":true,"ARCHIVED":true}
renderedVisible           ["TODO","DONE","ARCHIVED"]
```

#### Drag and drop with a column hidden

Sortable binding, board = TODO + DONE + ARCHIVED visible, IN_PROGRESS + IN_REVIEW hidden:

```
Sortable attached?  TODO true · IN_PROGRESS false · IN_REVIEW false · DONE true · ARCHIVED true
```

Bound to exactly the visible three; no instance on a hidden column, none orphaned.

Then a **real mouse drag** (`left_click_drag` (137,98) → (399,285)) of "Alpha TODO" from the TODO
column into the DONE column, across the gap where the two hidden columns would be:

```
DOM before   TODO [t1,t2]   DONE [t5,t6,t7]
DOM after    TODO [t2]      DONE [t5,t6,t7,t1]
network      GET /api/tasks/t1  →  PATCH /api/tasks/reorder  →  loadTasks()
```

Both requests were caught by a `window.fetch` interceptor and never left the browser — D-005 says
chips do not write to the live database, and `PATCH /api/tasks/reorder` is a write.

#### The DONE-transition guard, with DONE hidden

`CLAUDE.md` says the blocker guard lives in three places. I exercised all three while the DONE
column was **not on screen**, using a fixture task blocked by an incomplete `IN_PROGRESS` task and
a stubbed `window.confirm` that returns `false` (i.e. the user clicks Cancel).

| path | board state | `confirm()` text observed | write issued after Cancel |
|---|---|---|---|
| kanban `onReorder` (real drag) | 2 columns: TODO + DONE | `Still blocked by:\n- Blocker task\n\nMark done anyway?` | none — `t1` stayed `TODO` |
| `updateTaskStatus('t1','DONE')` | 1 column: TODO only | same string | none (only the `GET /api/tasks/t1` blocker lookup) |
| `updateTaskInline('t1','status','DONE')` | 1 column: TODO only | same string | none |

The guard is intact on all three paths when DONE is hidden.

#### Alias behaviour across views

| step | Show-archived checkbox | Columns button | `getFilteredTasks()` rows |
|---|---|---|---|
| list view, ARCHIVED off | present, unchecked | absent | `t1, t5` |
| tick the checkbox | present, checked | absent | `t1, t5, t8` |
| → back to board | **absent** | present | ARCHIVED column now rendered |

`localStorage` after ticking: `…"ARCHIVED":true}`. One flag, two controls, never both visible.

Also note row 1: `t5` is `DONE` and appears in the list even though the DONE **column** is hidden.
That is the intended scoping — column visibility is a board concept.

#### Final visual

All five columns on, 1400×900 viewport: five equal columns in `xl:grid-cols-5`, headers To Do 2 /
In Progress 1 / In Review 1 / Done 1 / Archived 1, the Archived column dimmed at `opacity-60` with
no `+ Add task` button, badge reading 5.

### §8 additivity proof

Mechanical, not by eye. Extracted the ordered list of top-level methods from `HEAD` and from my
working copy and diffed them:

```
$ diff base-methods.txt new-methods.txt
409a410,417
> getTaskKanbanColumns
> isTaskColumnVisible
> getVisibleTaskColumns
> isTaskColumnLastVisible
> toggleTaskColumn
> resetTaskColumns
> _persistTaskColumns
> getTaskKanbanGridClass

$ comm on the sorted top-level state keys
ADDED:   taskColumnMenuOpen
ADDED:   taskVisibleColumns
(no REMOVED lines)
```

Eight methods inserted at a single point; **nothing removed, renamed, or reordered**; two state
keys added, none removed. Every anchor W4-SUBTASK-EDIT could have drafted against is still present
and still in the same relative position.

Three existing lines were edited **in place**, all of them one-line body changes that neither move
nor rename anything:

| file:line | change |
|---|---|
| `app-refactored.js:51` | import line gains two named exports from the module it already imported |
| `app-refactored.js:517` | tombstone comment appended to `showArchivedTasks: false,` (same line) |
| `app-refactored.js:5105-5107` | `getTasksByStatus` / `getFilteredTasks` bodies read the new flag |
| `app-refactored.js:5577` | `columnIds:` derives from visible columns instead of a literal |

`git status` shows only the two owned source files plus this notes file.

### What I could not verify

- **Not run against the real Express backend.** Nothing was listening on 3001, and the Vite proxy
  hardcodes 3001 (CHIP-PROTOCOL.md §9), so `/api/tasks` returned a proxy 500 in the browser. All
  task data in my verification is fixture data injected into an isolated Alpine tree. The change is
  100% client-side view state and issues no new requests, so I judged a real backend unnecessary —
  but the board has not been seen with real production tasks in it.
- **Not seen logged in.** No credentials, and D-004/D-005 forbid creating a user.
- **Mobile/tablet breakpoints.** The board keeps its existing `flex … overflow-x-auto` +
  `md:grid-cols-2` behaviour below `xl`; only the `xl:` column count is now dynamic. I checked
  desktop (1400px) and the default 800px viewport, not a phone width.

## Measurements

- **Column count distribution:** 5 possible columns → the grid class must cover 1–5. I did not
  guess a cap; I emitted all five literals and grepped the built CSS to confirm all five survive
  Tailwind's purge (output pasted above). `getTaskKanbanGridClass()` falls back to
  `xl:grid-cols-4` only for an out-of-range count that the guard makes unreachable.
- **Code removed vs added:** `TasksTab.js` net −84 lines despite gaining a 40-line dropdown,
  because unifying the bespoke ARCHIVED column removed 50 lines of duplicated card markup.
- **Duplication closed:** the kanban column list existed in 2 places and disagreed (4 ids vs 5
  rendered columns). Now 1.

## Draft wiring

None. My spawn prompt granted me §8 ownership of `app-refactored.js`, so the wiring is applied.
`client/index.html` needs no change — the Tasks tab is already mounted there and I added no new
tab, modal, or nav entry.

## Draft for shared docs

**Doc:** `CLAUDE.md` · **Section:** Gotchas · **Placement:** immediately after the existing
"Tasks tab views: `taskViewMode` is `kanban | list | calendar | costs`…" bullet.

> - Task kanban column visibility: `taskVisibleColumns` (Alpine state, persisted to `localStorage`
>   under the key `taskVisibleColumns` as a JSON `{ STATUS: boolean }` map). Defaults to TODO /
>   IN_PROGRESS / IN_REVIEW on, DONE / ARCHIVED off. The ordered column list and the defaults are
>   exported from `client/src/js/components/tabs/TasksTab.js` as `TASK_KANBAN_COLUMNS`
>   (`{ id, label, dotClass, bodyClass }`) and `TASK_DEFAULT_VISIBLE_COLUMNS`, and imported by
>   `app-refactored.js` — **adding a column means editing that one array**, which also feeds the
>   SortableJS `columnIds` in `initKanbanDragDrop()`, so drag-and-drop follows automatically.
>   Helpers: `isTaskColumnVisible`, `getVisibleTaskColumns`, `isTaskColumnLastVisible`,
>   `toggleTaskColumn`, `resetTaskColumns`, `getTaskKanbanGridClass` (returns a literal
>   `xl:grid-cols-N` for the JIT). Hiding a column is a **view filter only** — it never changes a
>   task's status. The board can never be emptied: `toggleTaskColumn()` refuses to hide the last
>   visible column. The old `showArchivedTasks` flag is gone; `taskVisibleColumns.ARCHIVED` is now
>   both the ARCHIVED column toggle *and* the archived-data gate in `getFilteredTasks()`, so it
>   still governs list/calendar/costs. The "Show archived" checkbox is rendered only when
>   `taskViewMode !== 'kanban'` and writes the same flag, so the two controls are never on screen
>   together.

**Doc:** `CLAUDE.md` · **Section:** Gotchas · **Correction to an existing bullet.** The bullet
beginning "Tasks and Pipeline both use KanbanService…" is still true, but the Tasks board's
`columnIds` are no longer a fixed list — worth a half-sentence if the Integrator is editing that
line anyway.

## Handoff: changes needed in files I do not own

None. Everything my feature needed was inside my owned files.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| high | The ARCHIVED kanban column was never a drag-and-drop target. `initKanbanDragDrop` bound Sortable to four hardcoded ids and omitted `kanban-col-ARCHIVED`, while the template rendered a fifth ARCHIVED column with a matching `data-status`. You could drag a card *out of* nothing and never *into* Archived; the column silently ignored drops. | `app-refactored.js:5505` (pre-change) vs `TasksTab.js:303` (pre-change) | fixed here — `columnIds` now derives from `getVisibleTaskColumns()`, so ARCHIVED becomes a real drop target when shown |
| high | `getTasksByStatus('ARCHIVED')` returned `[]` whenever the archived gate was off, because it filtered through `getFilteredTasks()` which had already stripped archived tasks. Harmless before (the only caller was inside the conditionally-rendered column) but it made the count in the new menu read 0 for a column holding tasks. | `app-refactored.js:5072` (pre-change) | fixed here — an explicit request for status `ARCHIVED` now bypasses the gate |
| medium | The ARCHIVED column rendered a different, poorer card than the other four: no goal pill, no tags, no cost chip, no blocker/subtask/attachment indicators, no `+ Add task`. Archived tasks were effectively second-class in the UI for no stated reason. | `TasksTab.js:294-407` (pre-change) | fixed here — one card template for all five columns; `opacity-60` and the suppressed add-button are the only remaining ARCHIVED-specific bits |
| medium | Dead duplicate binding: the kanban container carried both `:class="…"` and `x-bind:class="…"` with the identical expression. `:class` is shorthand for `x-bind:class`, so Alpine sets the same attribute twice. | `TasksTab.js:120` (pre-change) | fixed here — collapsed to a single `:class="getTaskKanbanGridClass()"` |
| medium | `showArchivedTasks` was a *data* filter dressed as a board control. It fed `getFilteredTasks()`, so unticking it also hid archived tasks from the list, calendar and costs views — not obvious from a checkbox sitting above a kanban board. My change preserves the behaviour but the coupling is still there under a new name. | `app-refactored.js:5107` | left, why: preserving existing behaviour was the safer call mid-wave; flagged for a ruling — see "Risks" |
| low | `showArchivedTasks` is now unreferenced. Left declared with a tombstone rather than deleted, per §7, so the line count stays stable for §8. | `app-refactored.js:517` | left, why: §8 — proposed as CHIP-TASKS-TIDY |
| low | `taskViewMode` is not persisted, unlike its three siblings `taskListGroupBy`, `taskCostsGroupBy` and `taskCalendarSubMode`. Switch to List, reload, and you are back on the Board. My spawn prompt asserted it *was* persisted. | `app-refactored.js:453` | left, why: not in scope — proposed as CHIP-TASKS-TIDY |
| medium | The costs view and its own summary tiles can disagree about archived tasks. `getCostsViewTasks()` reads `this.tasks` directly and never applies any archived gate, so a costed ARCHIVED task appears as a row; `GET /api/tasks/costs/summary` excludes ARCHIVED server-side, so it is absent from the tiles. Pre-existing, unaffected by my change, found while scoping risk #1. | `app-refactored.js:5297` vs `server/routes/tasks.js:104` | left, why: not owned (server route) — proposed as CHIP-COSTS-ARCHIVED |
| low | On a logged-out page with no Express backend, the Tasks tab throws `this.tasks.filter is not a function` ~13× plus `all.filter is not a function` ×2 on every load. Reproduced on the **untouched** page with my harness removed, so it is pre-existing, not mine. `all.filter` is `getCostsViewTasks()`: `this.tasks \|\| []` does not rescue a non-array truthy value like `{}`. Root cause in my environment is the Vite proxy returning 500 (nothing on 3001); whether the same shape occurs against a real 401 is unconfirmed. Related to D-011's note about `x-init` firing 46 unauthenticated calls at the login screen. | `app-refactored.js:5298` / `client/index.html:26` | left, why: not owned / pre-existing — proposed as CHIP-TASKS-EMPTYSTATE |

### What I saw outside my scope

**`getFilteredTasks()` does less than its name says.** It applies only search, tag and institution
filters client-side; priority, assignee, overdue and goal are round-tripped to the server via
`loadTasks()`. `CLAUDE.md` describes the calendar view as consuming `getFilteredTasks()` so that
"existing filters (priority, assignee, tag, institution, goal, overdue, search, archived) flow in
unchanged" — true in effect, but only because half of them were applied server-side before the data
arrived. Anyone reading that sentence and then reading the function will be confused. A doc
clarification, not a bug.

**`TaskService.loadTasks` does not use the app's own delegate.** `updateTaskStatus` calls
`this.loadTasks(ctx)` on the service, not `ctx.loadTasks()`. Fine in production; it bit me in
testing because stubbing `app.loadTasks` didn't intercept it. Worth knowing for the next chip that
tries to test this file in a browser.

**`GoalsTab.js` has the same "Show archived" pattern** (`showArchivedGoals`, `GoalsTab.js:32`), but
it round-trips to the server via `includeArchived` (`GoalService.js:17`) where tasks filter
client-side. Two different mechanisms for the same-looking checkbox. Not touched.

**The `+ Add task` button under each column calls `openTaskFormWithStatus(status)`** — which, before
my change, could never be reached for ARCHIVED because that column had no button. It still can't,
because I kept the button suppressed there. Deliberate: "create a task that is already archived" is
not a thing anyone wants.

### Risks in what I built

**1. The ARCHIVED flag does double duty, and that is the sharpest edge.** `taskVisibleColumns.ARCHIVED`
is simultaneously "show the Archived column on the board" and "include archived tasks in
list/calendar/costs". A user who turns the Archived column on to check something, then switches to
List, will find archived rows in their list. This is *exactly* what the old checkbox did, so it is
not a regression — but it is now reachable from a control labelled "Columns", which makes the
coupling less obvious than a checkbox labelled "Show archived" did. **What would expose it:** a user
turning the Archived column on and then not understanding why their List and Calendar views changed.
Scope check I ran before writing this: the **costs view is not affected** — `getCostsViewTasks()`
(`app-refactored.js:5297`) reads `this.tasks` directly and never goes through `getFilteredTasks()`,
so archived costed tasks were always in it and still are. If Ben dislikes the coupling, the fix is
to split the two concepts into `taskVisibleColumns.ARCHIVED` (board) and a separate
`includeArchivedTasks` (data), which is a small change but needs a ruling on what the list view's
default should then be.

**2. `x-show`, not `x-if`.** Hidden columns stay in the DOM and their `x-for` bodies keep evaluating
on every reactive tick — a hidden DONE column with 400 tasks still renders 400 card nodes. I chose
`x-show` deliberately (it is what the old archived column used, it avoids Sortable re-binding churn,
and toggling is instant), but on a large board the hidden columns are not free. **What would expose
it:** a noticeably sluggish Tasks tab once the DONE column has a few hundred cards. If that happens,
`x-if` is the fix and `columnIds` already handles the binding correctly.

**3. Untested against real data volume and against the real API.** See "What I could not verify".
The specific thing I'd want a second look at is `getTasksByStatus('ARCHIVED')` now bypassing the
gate: it means archived tasks are always in memory and always counted, which is correct but was
previously masked.

**4. The `_persistTaskColumns()` → `$nextTick(initKanbanDragDrop)` sequencing.** It works (measured:
`columnIds` matched the visible set after every toggle), but it assumes one `$nextTick` is enough for
Alpine to have applied the `x-show` changes. If a future change makes column rendering async — say
an `x-if` conversion or a transition — that assumption breaks quietly, leaving Sortable bound to a
stale set. It would present as "drag stops working after you toggle a column", not as an error.

### Proposed follow-up chips

- **CHIP-TASKS-TIDY** — delete the now-unreferenced `showArchivedTasks` tombstone; persist
  `taskViewMode` to localStorage for consistency with its three siblings. Owns
  `client/src/js/app-refactored.js` alone (§8, must run with no sibling drafting into that file).
  Lane A, sonnet.
- **CHIP-TASKS-EMPTYSTATE** — diagnose and fix the `this.tasks.filter is not a function` /
  `all.filter is not a function` storm on the logged-out or backend-less Tasks tab; likely the same
  root as D-011's `x-init` gate at `client/index.html:26`. Owns `client/index.html`,
  `client/src/js/services/TaskService.js`. Lane A, opus (it touches a shared wiring file and an
  auth-adjacent path).
- **CHIP-ARCHIVED-SPLIT** — *only if Ben rules for it.* Separate "Archived column visible" from
  "archived tasks included in list/calendar/costs". Owns `TasksTab.js`, `app-refactored.js`. Lane A,
  sonnet. Needs a ruling first on the list view's default.
- **CHIP-COSTS-ARCHIVED** — reconcile the costs view with its own tiles.
  `getCostsViewTasks()` (`app-refactored.js:5297`) reads `this.tasks` with no archived gate, so a
  costed ARCHIVED task shows as a row; `GET /api/tasks/costs/summary` (`server/routes/tasks.js:104`)
  excludes ARCHIVED, so it is missing from the tiles above it. Pre-existing. Decide which side is
  right and make both match. Owns `app-refactored.js` **or** `server/routes/tasks.js` depending on
  the direction — not both. Lane A, sonnet.

### Harness improvements

**The spawn prompt contained one wrong fact and it cost me a detour.** It said to persist "following
the pattern already used in this file for `taskViewMode` and the sidebar collapse state".
`taskViewMode` is not persisted at all (`app-refactored.js:453`). I found three properties that
genuinely are and followed those. This is the second time a Wave-N prompt has asserted something
about the code that the code contradicts (D-008's test count, D-014's arithmetic). The protocol
already has the rule that catches it — §6 *trust the repo over the notes* — and it worked. Worth
extending the rule's wording explicitly to **spawn prompts**, not just notes and rulings: a chip
reading "follow the pattern used for X" will naturally treat it as given.

**§8 needs a definition of "additive" that covers in-place body edits.** My prompt said "purely
additive — no method moved, renamed, reordered or reformatted", but my job genuinely required
changing four existing lines (an import, a tombstone, two method bodies). Those are additive in the
sense that matters — every anchor a sibling could target is still present and in the same relative
position — but the literal wording doesn't obviously permit them. I resolved it by proving
additivity mechanically (diff of the ordered method list + comm of the state keys) rather than
asserting it. **Suggestion: make that diff the required artefact.** "A §8 chip pastes a diff of the
ordered top-level method list and the set of state keys; additive means the diff contains only
insertions." That turns a judgement call into a check, which is the same move §6 makes for
thresholds.

**Two environment traps worth adding to §9:**

1. `npx vite build --outDir ../dist-<chip>` resolves relative to vite's `root`, which is `./client` —
   so the output lands at `graphene/dist-<chip>`, *inside* the repo, not beside it. It is covered by
   `.gitignore:9  dist-*/`, so the instruction is fine, but the path in the protocol reads as though
   it goes to the parent directory and a chip may look for it in the wrong place. Mine did.
2. `window.grapheneApp()` returns the **raw** object; Alpine wraps it in a reactivity Proxy. Writing
   to the raw object does not re-render. Use `Alpine.$data(el)`. The protocol recommends the
   `window.grapheneApp()` technique for verification without credentials, so this belongs next to
   that recommendation.

**Model tier: opus was right, but not for the reason I expected.** The feature itself is
sonnet-sized. What needed the tier was the reconciliation work the prompt asked for — deciding what
to do about `showArchivedTasks` required tracing one flag through four view modes, two files and a
service, and noticing that the "obvious" removal would silently break the list view. A cheaper model
told to "remove the redundant checkbox" would very plausibly have done exactly that. Two of the
three findings above `low` also came out of that trace rather than out of building the toggle. If
this chip is ever re-run as a template, the reconciliation clause in the prompt is the part that
earns the tier.
