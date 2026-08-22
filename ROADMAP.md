# ROADMAP.md

The plan. Waves of chips, what each owns, its status, and its model tier.

Maintained by the **Command Center** only. Chips propose follow-ups in their Reflections; the
Command Center places them here. Read `CHIP-PROTOCOL.md` for the rules and `DECISIONS.md` for
rulings that override everything else.

**Status values:** `proposed` · `blocked` · `ready` · `running` · `merged` · `dropped`

---

## Where this project actually is

Grounding facts, measured 2026-08-21, not recalled:

| | |
|---|---|
| Client JS | 127 files, 45,927 lines |
| Server JS | 46 files, 17,178 lines |
| Shared (client+server) | 6 files, 2,926 lines |
| Docs | 45 files, 15,635 lines |
| Largest file | `client/src/js/app-refactored.js` — 6,274 lines |
| Test runner | none |
| Linter / typechecker | none |
| CI | none |
| Automated checks that exist | `npm run build` (Vite), `node --check` |
| Branches | `main`, `staging` (same commit, 8 weeks old), 2 stale feature branches |

Three structural facts shape every wave below:

1. **`app-refactored.js` is the throughput bottleneck.** All Alpine state and every delegate
   method live in one 6,274-line object literal. Every feature touches it. This is why D-001
   exists, and why reducing it is a standing roadmap goal rather than a nice-to-have.
2. **There is no verification suite.** Merge discipline is only as good as the checks behind it,
   so building those checks is Wave 1 work (D-007).
3. **The production API is readable without a login.** See D-006. This outranks everything else on
   this page.

---

## Wave 0 — Land the working tree (human + Command Center, no chips)

**Nothing spawns until this is done.** Chips branch off `staging` (D-003); `staging` is 8 weeks
stale and the working tree holds uncommitted work that chips would otherwise fork away from and
collide with later.

| # | Item | Owner | Status |
|---|---|---|---|
| 0.1 | Commit the Graphene CSV export fix (`services/api.js`, `app-refactored.js`, `server/routes/graphene.js`) | Command Center | **committed** `68b7eb7` |
| 0.2 | Commit the Test Matrix **wiring** as-is — it is already complete and building (D-008); only the data is unfinished | Command Center | **committed** `27f1f22` |
| 0.3 | Commit the four command-center documents + `notes/` | Command Center | **committed** — the commit that introduced this file |
| 0.4 | Push `staging`, verify on the staging Railway environment | human | **done** — `origin/staging` at `06b6035` |
| 0.5 | Merge `staging` → `main` so chips fork from current code | human | blocked on 0.4 |

All three commits verified reachable from `staging` by ancestry (`git branch --contains`), not by
command silence. Post-split tree verified byte-identical to the pre-commit snapshot, `npm run build`
passes, and `node --check` passes on all five changed JS files.

Item 0.2 is not a shortcut around the "finish it as its own chip" decision. The wiring lives in
`app-refactored.js` and `client/index.html`, which no chip may write (D-001), so it has to land
here regardless. What the chips finish is the matrix **content** — see W1-MATRIX-RESEARCH and
W1-MATRIX-WRITE below.

---

## Wave 1 — Foundations

Grouped by **subsystem**, not by severity — collisions come from which file a change lives in, not
how important it is. The five concurrent chips below own strictly disjoint file sets.
W1-MATRIX-WRITE waits on W1-MATRIX-RESEARCH; the Integrator runs alone, last.

| Chip | Job | Owns | Lane | Model | Status |
|---|---|---|---|---|---|
| **W1-AUTH-GUARD** | Require auth on all `/api/*` GETs per D-006 | `server/index.js`, `server/routes/auth.js`, `notes/W1-AUTH-GUARD.md` | A | **opus** | **parked** — branch `chip/w1-auth-guard`, blocked |
| **W1-CHECK-SUITE** | Build `npm run check`; establish the D-007 verification floor | `package.json`, `scripts/check/**` (new), `notes/W1-CHECK-SUITE.md` | A | **opus** | **merged** — verified |
| **W1-APP-DEDUPE** | Fix the 7 remaining shadowed duplicate method keys | `client/src/js/app-refactored.js`, `notes/W1-APP-DEDUPE.md` | A | **opus** | **merged** — verified |
| **W1-MATRIX-RESEARCH** | Source every Test Matrix cell; produce a verified fact file. Writes no app code | `notes/W1-MATRIX-RESEARCH.md`, `notes/facts/test-matrix-facts.md` | B | **fable** | **delivered** — fact file + notes verified |
| **W1-RECON-DEAD** | Gather dead-code evidence. Deletes nothing, concludes nothing | `notes/W1-RECON-DEAD.md` only | B | **sonnet** | **merged** — verified |
| **W1-MATRIX-WRITE** | Transcribe the fact file into the matrix data module | `client/src/js/data/testMatrix.js`, `notes/W1-MATRIX-WRITE.md` | A | **sonnet** | **merged** — verified |
| **W1-INTEGRATOR** | Merge drafted doc entries, reconcile docs against the repo | `docs/**`, `CLAUDE.md`, `README.md`, `DECISIONS.md` (bookkeeping only) | B | **opus** | runs last |

Five chips run concurrently. W1-MATRIX-WRITE is serialized behind W1-MATRIX-RESEARCH by the
research/writing split (D-008); the Integrator runs alone, last.

### Port slots for Wave 1

Express hardcodes `3001` and Vite hardcodes `5174`; concurrent chips running `npm run dev` collide,
and they collide with whatever the human has open. Each chip gets a pair, passed in its spawn
prompt as `PORT=<express> vite --port <vite>`.

| Chip | Express | Vite |
|---|---|---|
| Command Center / human | 3001 | 5174 |
| W1-AUTH-GUARD | 3011 | 5184 |
| W1-CHECK-SUITE | 3012 | 5185 |
| W1-APP-DEDUPE | 3013 | 5186 |
| W1-MATRIX-WRITE | 3014 | 5187 |
| W1-INTEGRATOR | 3015 | 5188 |

W1-MATRIX-RESEARCH and W1-RECON-DEAD start no servers and get no slot. Note that moving the Express
port breaks the Vite proxy target in `vite.config.js`, which chips may not edit — so prefer `curl`
against the Express port directly over testing through Vite.


### Why these chips

**W1-AUTH-GUARD** — `server/index.js:165-168` returns `next()` for every `GET` before the auth
middleware runs, and 23 of 33 route files add no auth of their own. Production returns full
material, shipment, and dashboard data to an unauthenticated request. Owns `server/index.js`
exclusively this wave because route-registration order there is load-bearing (the proforma share
router must stay mounted before `/api/proforma`, and the write-guard must keep skipping it).

**W1-CHECK-SUITE** — without this, "verify every merge by running the check suite" is a rule about
a suite that doesn't exist. Scope: `node --check` across all JS, the Vite build, and a
duplicate-object-key detector. Per the *measure-before-choosing-a-threshold* rule, the detector
ships **reporting-only** in Wave 1 and records the real baseline count; it is promoted to
failing in Wave 2 once W1-APP-DEDUPE has landed. Owns `package.json` exclusively.

**W1-APP-DEDUPE** — the main Alpine object defines the same method key twice in 8 places; the
earlier definition is silently dead in each. One is already fixed (`exportData`, which had broken
12 of 13 "Export CSV" buttons). Another is live and user-visible: `init()` at line 230 is shadowed
by `init()` at line 1228, so `initSidebarState()` and `handleInitialRoute()` never run — the
sidebar's saved collapse state is not restored on load. This chip owns a shared wiring file under
§8 of the protocol; no other Wave 1 chip owns or drafts into it, so it parallelizes safely.

**W1-RECON-DEAD** — deliberately produces **evidence, not verdicts**. Candidates include
`client/src/js/app.js` and `app-original.js` (828 lines each, no inbound references found),
`DealModal.js` / `DealDetailPanel.js` (documented as dead), 14 root-level `test-*.js` scripts, the
14 files under `docs/archive/`, and the unused `criticalBlock` / `advancedAccordion` helpers. Cheap
tier is correct *because* the chip doesn't decide anything: it runs the §7 four-way search and
tabulates what it found. The Command Center rules on deletion. This inverts the usual risk — three
dead-code reports in the origin project were wrong, and one wouldn't have compiled if acted on.

**W1-MATRIX-RESEARCH / W1-MATRIX-WRITE** — the Test Matrix is finished as content, not as code:
the feature is already wired and building; what's missing is sourced data. Split across two chips
under D-008 because its rows become commitments made to customers about what their material has to
pass. The research chip has web access, runs at the highest tier, and produces a fact file with a
source per claim, splitting rows into Confident and Verify. The writing chip is cheap, has no web
access, and may write nothing that is not in that file. Auditing the 8 existing rows — which
currently have no recorded provenance — ranks above adding new ones.

---

## Open questions needing a human ruling

| # | Question | Raised by | Why it needs you |
|---|---|---|---|
| Q1 | **Was `ProductionPulse.js` dropped on purpose?** A 313-line material-flow visualisation (hemp → graphene → stock) in the proforma Production section. Verified unreferenced by any code — `ProductionSection.js:1` imports only `./helpers.js`. But `docs/features/PROFORMA-SYSTEM.md` names it in three places including line 170, which states it renders "between the section header and the Critical block". That doc describes the pre-journey-pills architecture, so this looks like a casualty of that refactor. Restore it, or delete it and correct the doc? | W1-RECON-DEAD | Investor-facing surface, and only you know whether the visualisation was wanted. |
| Q4 | **Safari CSV exports are untested.** The download now happens after an `await`, i.e. outside the user gesture. Chrome verified across all 7 exports; Safari is stricter. Symptom if wrong: click Export, nothing happens, no error. | W2-AUTH-CLIENT | Needs one person with Safari to click Export once. |
| Q3 | ~~Can you save a record in production?~~ **ANSWERED 2026-08-22: yes.** Ben confirmed a graphene record saves and the CSV downloads from a logged-in session. D-011 closed; the eight-month write outage is fixed and verified in production. | W1-AUTH-GUARD | resolved |
| Q2 | The **17 Verify rows** in the Test Matrix fact file — requirements that could not be sourced to a standard. Parked, not shipped. | W1-MATRIX-RESEARCH | Each is a commitment to a customer if shipped. |

---

## Wave 2 — Running

Spawned 2026-08-21 under D-010 (main repo, no worktree isolation). Base verified per D-009 before
release. Ports swept clean beforehand, per W1-APP-DEDUPE's recommendation.

| Chip | Job | Owns | Lane | Model | Status |
|---|---|---|---|---|---|
| **W2-AUTH-CLIENT** | Fix the live production write outage (D-011): one token-injecting interception point, blob-based CSV download, login-screen `x-init` gate | `services/api.js`, `app-refactored.js` (§8), `client/index.html` (§8), new `services/` module | A | **opus** | **merged** — verified with the server guard |
| **W2-MATRIX-RULINGS** | Apply D-014's rulings to the Test Matrix — 24 cells ship, 2 dropped, no numeric targets | `data/testMatrix.js` | A | **sonnet** | **merged** — verified |
| **W2-DEADCODE-PURGE** | Delete 6 confirmed-dead files per D-012, re-verifying each under §7 first; draft doc corrections | the 6 files (delete only) | A | **sonnet** | **merged** — verified |
| **W2-INTEGRATOR** | Apply drafted doc corrections, reconcile docs against the repo | `docs/**`, `CLAUDE.md`, `README.md` | B | **opus** | **ready** — doc debt from 2 waves waiting |

**W2-AUTH-CLIENT is the wave.** The other two are cheap parallel cleanup that happen to be
collision-free against it. If only one thing lands this wave, it is the outage fix.

Note W2-AUTH-CLIENT owns *two* shared wiring files under §8 — the only way a request-path fix can
reach the whole app. No sibling drafts wiring into either this wave, so the §8 constraint holds.

---

## Wave 3 — Candidates (not yet scoped)

Placed by subsystem so that the eventual wave is collision-free. None of these are ready; several
depend on Wave 1 findings.

| Candidate | Subsystem | Why | Likely model |
|---|---|---|---|
| **Search-aware exports for the other 12 tabs** | server routes (12 files) | **Re-scoped after measurement, 2026-08-21.** Originally written as a feature wave by generalizing from Graphene. Graphene is in fact the *only* tab with filters beyond a search box — the other 12 have a single `<x>Search` field each. All 12 export routes contain zero `req.query` references, so each ignores its tab's search term. That makes this ~12 one-parameter changes: mechanical cleanup, not a feature build. See note below on the client half. | sonnet |
| **Local dev database that works** | `docker-compose.yml`, seed scripts | Unblocks D-005 option 1 and removes production from every chip's blast radius. | opus |
| **Docs truth pass** | `docs/**` | 45 doc files, ~15,600 lines, with a full duplicate set under `docs/archive/`. At least one doc describes a Graphene filter panel that isn't rendered. Must be Integrator-lane or run alone. | sonnet after an opus audit |
| **`app-refactored.js` decomposition** | client core | The bottleneck behind D-001. MOVE work — serialized, runs alone, one domain at a time into `services/`. | opus |
| **Investor-facing number provenance** | proforma | The share-token embed puts computed financials in front of outside readers. This is the repo's highest-risk output and the *public factual copy* rule applies: every displayed figure needs a Confident/Verify fact table. | fable |
| **Route-level auth consistency** | server routes | Follow-on from W1-AUTH-GUARD: per-route role enforcement rather than one global guard. Depends on its findings. | opus |

### Note on the export wave's shape

The server half parallelizes perfectly — 12 disjoint route files, one small change each. The
**client half does not**: all 13 `exportCSV` helpers live in `client/src/js/services/api.js`, and
all 34 `load*Records()` functions live in `app-refactored.js`. Both are shared files, so the client
side is either drafted wiring applied by the Integrator, or — better for a wave this size — a
single chip that owns `api.js` and `app-refactored.js` outright under §8 and runs after the server
chips land. Do not fan out client-side export work across chips.


---

## Model tiering used here

| Tier | Use for | This project |
|---|---|---|
| **fable** | Ambiguous product/design thinking, novel architecture, spec-writing with real judgment, investor-facing voice | Proforma number provenance, Test Matrix research, anything an outside reader will see |
| **opus** | Well-scoped implementation, careful refactors, anything touching auth or money | Auth guard, check suite, dedupe, export work, proforma engine |
| **sonnet** | Mechanical work: evidence-gathering, regeneration from verified sources, cleanup | Dead-code recon, doc rewrites from an audited outline |

Chips report in Reflections if the work needed a different tier than assigned, in either direction.

---

## Log

| Date | Event |
|---|---|
| 2026-08-21 | Command-center model established. Wave 0 opened. D-005 and D-006 raised as open rulings. |
| 2026-08-21 | D-005, D-006 ruled. Wave 1 finalised at 6 chips + Integrator. Test Matrix split into research/writing chips under D-008. |
| 2026-08-21 | Wave 0 committed on `staging`. Awaiting human push before Wave 1 spawns. |
| 2026-08-21 | Export wave re-scoped from "feature" to "cleanup" after measuring filter state across tabs. Graphene is the only tab with non-search filters. |
| 2026-08-21 | D-003 amended: worktree provisioning is the harness's job, not a hand-rolled path. Wave 1 spawned — 5 chips concurrent (3× opus, 1× fable, 1× sonnet). |
| 2026-08-21 | Wave 1 env fault: host machine slept, killing W1-MATRIX-RESEARCH and W1-RECON-DEAD at the write-up step. Both resumed with context intact. CHIP-PROTOCOL.md §5a added — write incrementally; Lane B notes-only chips should not get worktree isolation. |
| 2026-08-21 | **Wave 1 aborted.** All five chips forked from `main` @ 3fd0b30, not `staging` — the harness forks worktrees from the default branch. Chips had no CHIP-PROTOCOL.md. Work salvaged as patches; D-009 written. Root cause is that `staging` → `main` was never merged. |
| 2026-08-21 | W1-MATRIX-RESEARCH delivered despite the wave abort: 320-line fact file, 112 cells dispositioned, 41 Confident / 17 Verify. Caught a Command Center error — D-008 said 25 tests, the file has 14. Corrected. |
| 2026-08-21 | Wave 1 re-spawned under D-010 — 5 chips in the main repo, no worktree isolation, base verified per D-009 before release. All five created their notes file as first action (§5a holding). Orphaned worktrees from the aborted run removed. |
| 2026-08-21 | W1-MATRIX-WRITE and W1-RECON-DEAD delivered and independently verified. 41 matrix cells shipped, 0 invalid ids. Recon found ProductionPulse.js orphaned but documented as live — raised as Q1. Zero write-ownership violations across the wave so far. |
| 2026-08-21 | **Wave 1 closed.** 4 of 5 merged to `staging` and independently verified; W1-AUTH-GUARD parked on `chip/w1-auth-guard` because it white-screens the app without client-side token injection. Dedupe found 17 duplicate keys, not the 7 briefed. Auth chip found production writes have been 401-ing since December. Zero write-ownership violations all wave. |
| 2026-08-21 | **Wave 2 spawned.** 3 chips, base verified, ports swept. W2-AUTH-CLIENT carries the production outage fix; the parked `chip/w1-auth-guard` branch merges only once it lands. |
| 2026-08-21 | **Wave 2 closed.** All 3 chips merged and verified. `chip/w1-auth-guard` merged on top of the client layer; the pair verified end-to-end — unauth GET 401, authed GET 200, THIRD_PARTY reads 200 / writes 403, share route 404-from-its-own-router with no JWT, filtered CSV export intact at 242/209/33. The production write outage is fixed in code. |
| 2026-08-22 | **The write outage is closed.** Ben confirmed in production: a graphene record saves, and the CSV exports. Together those verify login, token injection, the blob download and the write path — the step no chip could test. D-011 resolved. |
