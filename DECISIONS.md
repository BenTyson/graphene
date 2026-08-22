# DECISIONS.md

A numbered log of rulings for the Graphene Production Control System.

**This file overrides every spec, doc, and comment in the repo.** If `docs/`, `CLAUDE.md`, a code
comment, or your own spawn prompt contradicts a ruling here, the ruling wins — and you should say
so in your Reflections so the contradicting text gets fixed.

Written by the **Command Center**. The **Integrator** only does bookkeeping: closing resolved
items, correcting file paths, and marking superseded rulings. Chips never write here.

**A ruling records its reasoning, and what was rejected.** Future chips need the reasoning more
than the verdict — a verdict without a rationale gets re-litigated every wave.

Status values: `ACTIVE` · `OPEN — needs ruling` · `SUPERSEDED by D-NNN`

---

## D-001 — Shared wiring files are treated as shared docs
**Status:** ACTIVE · **Date:** 2026-08-21 · **Scope:** all chips

`client/src/js/app-refactored.js` (~6,300 lines) and `client/index.html` are the wiring points for
every tab, modal, and service in the app. Chips do **not** edit them. Chips draft their state
block, delegate methods, nav entry, and mount `<div>` into their notes file; the Integrator applies
those blocks serially. Same rule as the changelog.

**Reasoning.** This codebase has no component framework — there is no file where a feature can be
self-contained. Adding a tab requires touching both wiring files (per the "Adding a new tab"
recipe in `CLAUDE.md`), so *every* parallel feature chip would collide on *every* wave on the same
two files. The write-ownership rule that makes this whole model work is unenforceable here unless
these two files are removed from chip ownership entirely.

**Rejected: anchored regions** (giving each chip a fenced block inside `app-refactored.js`). Git
still merges by hunk, and the file has no stable structure to anchor against — it is one object
literal thousands of lines long. Two chips appending near the same method still conflict.

**Rejected: letting chips edit them and resolving conflicts at merge.** This is the failure mode
the model exists to prevent. Conflict resolution in a 6,300-line object literal, across three
concurrent chips, is exactly where a silently-dropped hunk becomes a shipped bug.

**Consequence, accepted:** feature chips cannot run their own feature end-to-end in their worktree.
They verify their module in isolation and say what they couldn't verify. Integration is where
features first run whole. This makes the Integrator slower and more important.

**Consequence, accepted:** this makes `app-refactored.js` a throughput bottleneck. Reducing it is a
roadmap item, not a reason to weaken the rule.

---

## D-002 — Chips never commit, never push, never spawn
**Status:** ACTIVE · **Date:** 2026-08-21 · **Scope:** all chips

Chips leave uncommitted changes in their worktree. The Command Center reviews, commits, and
merges. The human pushes. Chips never create branches and never spawn other chips.

**Reasoning.** Push authority is the one thing that must stay with a person on a repo that
auto-deploys to production on merge to `main`. Spawning is withheld because a chip cannot be given
the sibling do-not-touch list — it has no global view — so a chip-spawned chip collides with work
it never knew existed.

---

## D-003 — Chips branch off `staging`, in isolated worktrees
**Status:** ACTIVE · **Date:** 2026-08-21 · **Scope:** all chips
**Supersedes** the "NEVER create additional feature branches" rule in
`docs/session-start/GIT-WORKFLOW.md` for chip work only.

- Base branch: `staging`. Never `main`.
- **The harness provisions the worktree.** A chip does not create it, does not create or switch
  branches, and does not need to know where it lives. You are already in the right place. Run
  `git status` if you want to confirm; otherwise ignore git entirely.
- Chips leave work **uncommitted** (D-002). The Command Center collects it.
- Merge target: `staging`. `staging` → `main` stays a human-approved step.

**Reasoning.** `GIT-WORKFLOW.md` forbids feature branches because ad-hoc branches were previously
left dangling and diverging. The chip model has the opposite property: branches are created by one
authority, tracked in `ROADMAP.md`, and deleted at merge. The original rule's *intent* — no
untracked divergence — is preserved. `GIT-WORKFLOW.md` must be updated by the Integrator to say
so; until then, this ruling governs.

**Rejected: worktrees inside the repo** (`./worktrees/<name>`) — *and this reasoning was partly
wrong; see the correction below.*

**Amended 2026-08-21, before Wave 1 spawned.** The original ruling had chips working in
`../graphene-chips/<chip-name>/`, created by hand. The harness provisions isolated worktrees
itself, so hand-rolling them would be fragile and would leave this ruling describing a mechanism
nobody uses — and chips read D-003 directly. Worktree mechanics are now the harness's job. What
still binds a chip is unchanged: fork from `staging`, never create or switch branches, never
commit.

**Corrected 2026-08-21, after Wave 1 spawned.** The harness places worktrees at
`.claude/worktrees/agent-<id>/` — *inside* the repo, the layout this ruling had rejected. Measured
rather than assumed: Tailwind's content globs are `./client/index.html` and `./client/src/**` and
Vite's `root` is `./client`, so neither tool walks into `.claude/`. The predicted phantom-rebuild
problem does not occur, and the original rejection overstated it. One real effect remains:
`npm run server:dev` runs nodemon watching from the repo root, which does see chip file changes and
will restart on them — so the Command Center should use `node server/index.js` directly rather than
`npm run dev` while chips are in flight. `.claude/worktrees/` is now gitignored so a careless
`git add -A` cannot commit five checkouts of the repo into itself.

---

## D-004 — No chip runs a schema change, a seed, or a migration
**Status:** ACTIVE · **Date:** 2026-08-21 · **Scope:** all chips

Chips do not run `prisma db push`, `prisma migrate`, `db:seed`, `auth:seed`, `news:seed`, or the
`seed-staging` / `data-import` routes. A chip that needs a schema change drafts the
`schema.prisma` model into its notes and stops there.

**Reasoning.** `DATABASE_URL` in `.env` points at a live remote Railway Postgres, not localhost.
`prisma/migrations/` is gitignored and the project uses `db push`, so there is no migration history
and no rollback path. A `db push` from a chip worktree rewrites the schema for every other chip
*and* for whatever environment that database serves. Combined with parallel chips, one careless
push is unrecoverable data loss.

See **D-005** for what chips are allowed to do with the database.

---

## D-005 — Chips get read-only access to the shared database
**Status:** ACTIVE · **Date:** 2026-08-21 · **Scope:** all chips

Chips inherit `DATABASE_URL` from `.env` as-is — the live Railway Postgres. They may **read**:
`SELECT` via Prisma, `GET` requests against a locally started `node server/index.js`, `prisma
studio` in read-only use. They may **not write anything**, by any route: no `POST`/`PUT`/`DELETE`
against a local server pointed at it, no Prisma `create`/`update`/`delete`, and nothing barred by
D-004 (schema pushes, migrations, seeds).

**Reasoning.** Wave 1 is read-heavy — an auth guard, a check-suite build, a dedupe of one client
file, and evidence-gathering — so realistic data is worth more than isolation, and standing up a
working local seed path is itself a chip's worth of work that would delay everything.

**Accepted risk, stated plainly.** The blast radius of a chip that ignores this rule is production
data. That is a real cost of choosing speed here, not a hypothetical. Two mitigations: D-004
already blocks the irreversible operations (schema and seeds), and the moment a chip's task
requires a write, it stops and reports rather than improvising.

**Revisit trigger.** The first Wave 2 chip that needs to write data. At that point, "make
`docker-compose` + a seed path actually work" becomes a prerequisite chip and this ruling is
superseded by per-chip local Postgres.

---

## D-006 — All `/api/*` GET requests must require authentication
**Status:** ACTIVE · **Date:** 2026-08-21 · **Severity: blocker** · **Scope:** W1-AUTH-GUARD

Read access was never intended to be public. `GET` requests under `/api/` must carry a valid JWT.
The THIRD_PARTY role keeps its read permission, but *inside* the authenticated path — the role is
allowed through the token check, not around it.

**The defect.** `server/index.js:165-168` returns `next()` for any `GET` before the auth middleware
runs, and 23 of the 33 route files apply no auth of their own. Confirmed against production with no
credentials: `GET /api/graphene/export/csv` returns all 242 graphene records; `/api/biochar`,
`/api/shipments`, and `/api/dashboard/stats` return 200. The comment on that branch reads
`// Skip GET requests - Third Party users can read data`, which is the correct *intent*
implemented as a token-check bypass rather than a role allowance.

**The proforma share link is not affected. Verified, not assumed.** The share flow was the one
public surface in doubt. It is exempted by the condition *above* the GET branch —
`req.path.startsWith('/proforma/share')` at `server/index.js:161` returns `next()` before the
`GET` skip is ever evaluated — so it reaches `server/routes/proformaShare.js`, which authenticates
by share token. `client/src/js/proforma-embed.js:85,124` confirms the embed page calls exactly one
API path, `/api/proforma/share/:token`, for both its GET and its PUT. Requiring auth on the GET
branch cannot reach it. The chip must keep that ordering intact and must prove the share flow
still works after its change.

**Rejected: a public allowlist.** No endpoint was identified as needing public read. An allowlist
with nothing on it is a mechanism for a future mistake to hide in.

**Rejected: hotfixing it outside the chip system.** Faster to close, but the fix touches the
middleware that guards every mutating request in the app, on a repo with no test suite. Doing it as
a verified chip is the ruling; the exposure has existed for months and a few days of correctness is
the better trade.

**In scope for the chip, beyond the main fix:** `/uploads` and `/news-images` are served by
`express.static` outside the `/api` prefix and are therefore also unauthenticated. The chip
reports on them; it does not change them without a further ruling.

---

## D-007 — Verification floor
**Status:** ACTIVE · **Date:** 2026-08-21 · **Scope:** Command Center and all chips

Until a real check suite exists, the merge bar is: `npm run build` passes with its output read,
`node --check` passes on every changed JS file, and the change has been *run* — a `curl` against a
locally started server, or the UI driven in a browser — with observed values recorded.

**Reasoning.** The model this project is adopting says "run the project's full check suite and read
the output." This repo has no test runner, no linter, no typechecker, and no CI. Adopting a rule
that references a suite that does not exist would make merge verification theatre. Building that
suite is Wave 1 work; this ruling is what governs until it lands, and it is deliberately
un-skippable rather than aspirational.

The root-level `test-*.js` files are ad-hoc one-off scripts, not a test suite. Do not cite them as
verification.

---

## D-008 — Test Matrix content is public factual copy
**Status:** ACTIVE · **Date:** 2026-08-21 · **Scope:** Test Matrix chips

The Test Matrix tells the sales and science team which characterization and QC tests a material
must pass before it can be used in a customer application. Its rows become commitments made to
customers. It is therefore **public factual copy** under CHIP-PROTOCOL.md §6 and ships with a
Confident/Verify fact table; unverified rows do not ship.

**Research and writing are split across chips.** A web-capable research chip produces a verified
fact file with a source per claim. A separate, cheaper writing chip transcribes it into
`client/src/js/data/testMatrix.js` and **may write nothing that is not in that file**. The repo
already has the research half as the `test-matrix-research` skill — use it rather than
reinventing it.

**The existing 8 application rows have no recorded provenance.** They are treated as unverified
until the research chip sources them. Auditing what is already there ranks above adding new rows.

**No D-001 wiring debt.** Measured 2026-08-21: the feature is already wired — `test-matrix` is in
both `validTabs` arrays (`app-refactored.js:256,268`), the sidebar and both subtab pill rows are in
`client/index.html`, `getTestMatrixTabHtml()` is mounted at `client/index.html:628`, and 11
`getTestMatrix*` helpers exist. `npm run build` passes with the tab included. What is unfinished is
the **data**. Because `client/src/js/data/testMatrix.js` is a self-contained data module, a chip can
own it outright and draft no wiring at all.

**Corrected 2026-08-21 by W1-MATRIX-RESEARCH — this ruling originally said "25 tests" and it was
wrong.** `TEST_MATRIX_TESTS` defines **14** tests (`testMatrix.js:57-79`), not 25. The Command
Center's original count matched every `id:` in the file rather than only those inside the tests
array. Verified independently before accepting the correction: 14 test ids, 8 application rows, so
the cell space is **112**, of which **17 were populated**. The error mattered — a chip trusting the
ruling over the repo would have misreported coverage by roughly 2×, which is precisely the failure
mode CHIP-PROTOCOL.md §6 *trust the repo over the notes* exists to catch. The chip caught it and
was right.

---

## D-009 — Verify the base a chip actually forked from, before the wave runs
**Status:** ACTIVE · **Date:** 2026-08-21 · **Scope:** Command Center
**Written after Wave 1 was aborted for this exact failure.**

Immediately after spawning, and before letting chips run, the Command Center must confirm what
base they received:

```
git worktree list          # what commit is each chip actually on?
```

and confirm that `CHIP-PROTOCOL.md` and `DECISIONS.md` exist in that checkout. A chip whose first
instruction is "read CHIP-PROTOCOL.md" and whose worktree has no such file is not running the
protocol, whatever the roadmap says.

**What happened.** Wave 1 spawned five chips. All five forked from `3fd0b30` — the tip of `main` —
not from `staging` at `39f8f4a` where the work was. `main` was stale because merging `staging` →
`main` was the one Wave 0 step deliberately left to the human, since it auto-deploys to production.
The harness forks worktrees from the repository's default branch, not from the branch the spawning
session has checked out.

So every chip received a pre-Wave-0 checkout: no `CHIP-PROTOCOL.md`, no `DECISIONS.md`, no
`ROADMAP.md`, no `notes/_TEMPLATE.md`, no Graphene export fix, no Test Matrix data module. Three of
them worked for roughly 25 minutes against it and produced real changes that would have conflicted
with Wave 0 on merge.

**This was a Command Center failure, and specifically a failure to apply an existing rule.**
CHIP-PROTOCOL.md §6 already says *verify by ancestry, never by silence*. That was applied to the
main repository — clean tree, pushed, correct tip — and never to the thing that actually mattered,
which is what the chips got. A successful spawn call printed no warning, and the silence was read
as success. Same failure mode as the unmerged branch the rule was written about.

**What saved it from being a total loss:** the *quote rulings, don't cite them* rule. Every spawn
prompt pasted the full text of D-001, D-006, D-007 and D-008 inline rather than referencing them,
so the chips had their governing rulings even though the file was absent from their checkout. That
rule was written for stale worktree copies; it turned out to cover missing ones too.

**Two ways to fix the base. Both work; they differ in what they cost.**

1. **Merge `staging` → `main`.** Restores the intended layout and keeps worktree isolation. Cost:
   `main` auto-deploys to admin.hgraphene.com, so this is a production deploy and therefore the
   human's decision, not the Command Center's.
2. **Spawn without worktree isolation**, chips working directly in the main repository on
   `staging`. The Command Center controls and can verify the base absolutely. Cost: chips share one
   working directory, so physical isolation is gone and **write-ownership becomes the only
   protection** — which is what it always actually was; the worktree was belt-and-braces. Minor
   friction: concurrent `npm run build` writes the same gitignored `dist/`.

**Related, already established:** Lane B chips that only produce notes should never get worktree
isolation regardless (see CHIP-PROTOCOL.md §5a) — they touch no source, and an unchanged worktree
is auto-cleaned, destroying their only output.

---

## D-010 — Chips run in the main repository, not in harness worktrees
**Status:** ACTIVE · **Date:** 2026-08-21 · **Scope:** Command Center and all chips
**Chosen over the alternative in D-009 after Wave 1 was aborted.**

Chips are spawned **without worktree isolation**. They work directly in the main repository on
`staging`, sharing one working directory. **Write-ownership is now the only thing keeping them
apart** — which is what it always actually was; the worktree was belt-and-braces that turned out to
be worse than nothing.

**Reasoning.** D-009 left two fixes. Merging `staging` → `main` would restore worktree isolation,
but `main` auto-deploys to admin.hgraphene.com, so it is a production deploy and belongs to the
human on their own schedule — not to a recovery step. Running in the main repo needs no deploy, and
it lets the Command Center **verify the exact base** before spawning rather than inferring it from
a mechanism it does not control. Wave 1 failed precisely because the base was inferred.

**Rejected: fixing the worktree base by merging to main.** Correct in principle, wrong as a
recovery action — it would ship the export fix, the Test Matrix tab, and four documents to
production to unblock an internal tooling problem. Reversing course on a bad deploy is far more
expensive than losing worktree isolation.

**What this costs, stated plainly.**
- A chip that writes outside its owned files corrupts the shared tree directly, with no worktree to
  contain it. Mitigation: the tree is committed clean before every spawn, so any unowned change
  shows up in `git status` and is revertable. The Command Center checks after every wave.
- Concurrent `npm run build` runs would race on the same `dist/`. Each chip therefore builds to its
  own directory: `npx vite build --outDir ../dist-<chip-name>`. `dist-*/` is gitignored.
- Chips must not run `git checkout`, `git stash`, `git restore`, or any branch operation. This was
  already true (D-002/D-003); it is now load-bearing rather than tidy.

**Revisit trigger.** Once `main` is current, worktree isolation becomes available again and is
preferable for Lane A chips. Lane B notes-only chips should stay un-isolated permanently — see
CHIP-PROTOCOL.md §5a.
