# CHIP-W6-ORG-TZ-DEFAULTS

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:**
  - `client/src/js/services/CRUDService.js`
  - `client/src/js/utils/constants.js`
  - `client/src/js/services/TaskService.js` (one item: `todayYmd()`)
  - `server/services/emailDigest.js` (one item: re-export shared `ymdInTz`, conditional)
  - `notes/W6-ORG-TZ-DEFAULTS.md`
- **Wave:** 6

## What I was asked to do

Stop the app writing wrong calendar dates. Four sites default a new record's date field to
`new Date().toISOString().split('T')[0]` — **today in UTC** — so a record created after 18:00
Mountain (17:00 in winter) pre-fills, and then persists, **tomorrow's** date. Replace the default
with the organisation's calendar date using the existing `shared/orgTimezone.js`.

Plus two verified-not-pasted handoffs from `W5-STARTDATE-TZ`, and two audit-only items.

Explicitly **not** in scope: repairing existing rows (D-016, Ben's "do not delete existing data",
extended here to "do not repair either"), and the wider `formatDateSafe` / calendar-view sweep.

## What I did

### The four sites — confirmed, and a fifth found

Line numbers held exactly as given. Confirmed by re-measuring before editing:

| # | Site | Field | In prompt? |
|---|---|---|---|
| 1 | `CRUDService.js:1155` `duplicateShipment` | `shipmentDate` | yes |
| 2 | `CRUDService.js:1269` `duplicateMicronization` | `date` | yes |
| 3 | `CRUDService.js:1358` `duplicateMCB` | `combinedDate` | yes |
| 4 | `constants.js:319` `DEFAULT_FORMS.mcb` | `combinedDate` | yes |
| **5** | **`CRUDService.js:1304` `openMCBForm` (edit path)** | **`combinedDate` fallback** | **no — found here** |

Site 5 is the ternary's *else* branch: opening an existing MCB whose `combinedDate` is null
pre-fills UTC-today, and saving the form persists it. Same defect, same fix, same file.

### `constants.js:319` had a *second*, independent defect

`DEFAULT_FORMS` is a module-level object literal, so a plain value there is evaluated **once when
the bundle loads** and then frozen for the life of the page. This is a long-lived SPA: a tab left
open overnight handed every new MCB the date the tab was opened, in any timezone. Fixing only the
timezone would have left that.

Both are fixed by making it a **getter** — `get combinedDate() { return orgYmd(new Date()); }`.
Both consumers spread it (`{ ...DEFAULT_FORMS.mcb }` at `CRUDService.js:1316,1369` and
`app-refactored.js:687`), and spread invokes getters and copies the result as a plain data
property, so the Alpine state that comes out is an ordinary reactive object with no accessor on
it. Verified rather than assumed — see Verification §2.

I rejected the alternative of defaulting to `''` and setting the date at open time: the MCB modal's
input is `required` (`MCBModal.js:57`), so an empty default is a visible UX regression, and one of
the three consumers is `app-refactored.js`, which I do not own.

### The two handoffs — both verified against current code before applying

**`TaskService.todayYmd()` → `orgYmd(new Date())`.** Applied. W5's block was accurate. Worth noting
the value is stored as an *explicit* `startDate` on every new task, so unlike a derived date it
never self-corrects — a browser-local "today" persists the wrong day for anyone outside Mountain
Time creating a task near midnight.

**`emailDigest.js` re-exports the shared `ymdInTz`.** Applied, but only after clearing the gate my
prompt set — *if re-exporting would change any digest's behaviour, do not do it*. It does not; the
evidence is in Verification §4. The two implementations are not textually identical, and the
differences are real but unreachable:

| Divergence | Current | Shared | Reachable? |
|---|---|---|---|
| `timezone` omitted/`undefined` | server's **system** tz | `ORG_TIMEZONE` | **No** — `UserEmailPreferences.timezone` is `String @default("America/Los_Angeles")`, non-nullable (`schema.prisma:1304`), and the lazy fallback object hardcodes the same value (`emailDigest.js:69`). All three digests read `prefs.timezone` |
| Invalid `Date` in | throws `RangeError` | returns `null` | **No** — inputs are `new Date()` or a Prisma `DateTime`; the only nullable one, `dueDate`, is guarded by `if (!dueDate) return 0` |

Both are latent robustness differences, not behaviour changes. I flagged the second one in the
findings table anyway, because *returning null where the old code threw* is arguably the wrong
direction for an idempotency key — a silent `weekly-digest-<id>-null` would be worse than a loud
crash. It cannot happen today; it is a trap for whoever makes `dueDate` reachable.

## How I verified it

Lane A bar (CHIP-PROTOCOL §4, D-007). Database is staging (`trolley.proxy.rlwy.net:51966`),
confirmed per D-017. **No server needed:** every change is a pure function of the clock, so it is
exercised directly under `TZ=` overrides rather than through the UI — which is a stronger test than
clicking, because a browser cannot be put into January.

### 4. `emailDigest.js` — the live-mail gate, cleared

Two independent differentials, both against a pristine copy of the committed file (saved to
scratchpad before editing, with only its `@prisma/client` specifier rewritten to an absolute path
so it loads from outside the repo).

**(a) The helper, exhaustively.** 9 timezones × 360 instants spanning both DST states and every
hour of the day, including the day-flip window:

```
REACHABLE INPUTS: compared=3240 diffs=0
```

**(b) The real digest builders, end to end, against live staging rows.** All three builders, 4
timezones × 5 instants:

```
PAYLOADS: compared=60  non-empty=8  diffs=0
HELPERS (daysOverdue/isoWeekKey): compared=80 diffs=0
export surface unchanged: true
  exports: buildDueTomorrow, buildOverduePayloads, buildWeeklyDigest, daysOverdue,
           isoWeekKey, listEligibleUsers, ymdInTz
AFTER.ymdInTz === shared.ymdInTz : true      <- the re-export is identity-equal
BEFORE.ymdInTz === shared.ymdInTz: false     <- and was not, before
```

The first run of (b) returned only `null` payloads, because staging's lone eligible user has
`onlyMyTasks` and no assigned tasks — a comparison of nothing against nothing. I re-ran it with a
synthetic **manager-view** user (`onlyMyTasks: false`, never persisted, read-only) to force real
content. 8 payloads then carried real tasks, all `identical=true`:

```
### buildWeeklyDigest  tz=America/Los_Angeles  now=2026-09-11T06:01:00.000Z  identical=true
{"to":"admin@hgraphene.com","data":{"user_name":"Benjamin Tyson",
 "week_label":"Week of 2026-09-10","overdue":[{…"days_overdue":1},{…"days_overdue":1}],
 "overdue_count":2,…}}

### buildWeeklyDigest  tz=America/Denver       now=2026-09-11T06:01:00.000Z  identical=true
{"to":"admin@hgraphene.com","data":{"user_name":"Benjamin Tyson",
 "week_label":"Week of 2026-09-11","overdue":[{…"days_overdue":2},{…"days_overdue":2}],
 "overdue_count":2,…}}
```

**Those two rows are the point.** Same instant, different `prefs.timezone`, and the payload
genuinely differs — `week_label` moves a day and `days_overdue` goes 1 → 2. The harness is
therefore *demonstrably sensitive* to the exact thing under test; the 0-diff result is a real
negative, not a degenerate one. **Conclusion: re-exporting changes no digest behaviour. Applied.**

The per-user timezone behaviour is fully preserved — which is correct and deliberate. The digest
should stay per-user (a person wants their 9am digest at 9am where they are); only the *UI* is
fixed to `ORG_TIMEZONE`.

## Measurements

<!-- in progress -->

## Draft wiring

## Draft for shared docs

## Handoff: changes needed in files I do not own

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| | | | |

### What I saw outside my scope

### Risks in what I built

### Proposed follow-up chips

### Harness improvements
