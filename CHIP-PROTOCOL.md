# CHIP-PROTOCOL.md

**If you are an agent session working on this repo and you were given a chip name, read this
file completely before you touch anything. It is the contract.**

This project runs a command-center model. One session (the Command Center) plans, spawns,
merges, and rules. All actual work happens in **chips**: focused agent sessions, each with one
scoped job, each in its own git worktree. You are almost certainly a chip.

> **Naming collision — be aware of it.** The IDE also calls its clickable background-task
> suggestions "chips". Those are a different thing: a UI affordance that starts a fresh interactive
> session. A *protocol chip* is spawned by the Command Center, runs on its own, and reports back
> through its notes file — the human never clicks anything to start one. If a suggestion chip
> appears in the UI proposing work already on the roadmap, it is stale: its prompt predates the
> protocol and carries no owned-files list. The Command Center dismisses those.

This document is **living**. Each wave's lessons get folded back into it by the Command Center.
If a rule here cost you time or was wrong for this repo, say so in your Reflections — that is
how this file got good.

---

## 0. The five things that get chips killed

1. Writing a file you don't own.
2. Committing or pushing.
3. Spawning another chip.
4. Editing shared docs or shared wiring files (§3) directly.
5. Skipping Reflections, or burying a blocker in prose instead of the findings table.
6. Composing your whole notes file in one final action. Write it incrementally — see §5a.

---

## 1. Write-ownership

Your spawn prompt contains an **OWNED FILES** list and a **DO-NOT-TOUCH** list. The owned list is
exhaustive: those files, and no others, are yours to modify. New files you create must sit inside
a path your prompt authorizes.

This one rule is why concurrent chips don't collide. It matters more than being right about
anything else. If your task appears to require editing a file you don't own:

- **Do not edit it.**
- Write the exact change you would have made — as a diff or a paste-ready block — into your notes
  file, under `## Handoff: changes needed in files I do not own`.
- Continue with everything else in your scope.
- Flag it in the findings table as `left, why: not owned`.

The Command Center places that change in a later chip or applies it during integration. A chip
that silently "just quickly fixed" an unowned file is the single most expensive failure mode in
this system, because the collision surfaces at merge time when three other chips are also in
flight.

Your prompt lists sibling chips' owned files explicitly. Treat that list as radioactive.

---

## 2. Never commit, never push, never spawn

- **You do not commit.** Leave your work as uncommitted changes in your worktree. The Command
  Center reviews, commits, and merges. The human pushes.
- **You do not spawn chips.** You lack the global view. A chip you spawn cannot be handed the
  sibling do-not-touch list, so it will collide with work it never knew existed. Propose it in
  Reflections instead; the Command Center places it in a wave.
- **You do not create branches or switch branches.** Your worktree is already on the right one.

---

## 3. Shared docs and shared wiring files

### 3a. Shared docs — never write these
No chip writes to:

- `README.md`
- `CLAUDE.md`
- `ROADMAP.md`, `CHIP-PROTOCOL.md`, `DECISIONS.md`
- anything under `docs/`

Instead, write a **pre-drafted entry** into your own notes file under
`## Draft for shared docs`, saying which doc, which section, and the exact text. Only the
serialized **Integrator** chip merges those into the real files, and it runs alone, last, after a
wave finishes.

### 3b. Shared wiring files — this repo's special case

This codebase has no component framework. Every tab, modal, and service is wired through two
files that *every* feature touches:

- `client/src/js/app-refactored.js` — ~6,300 lines. All Alpine state and all delegate methods.
- `client/index.html` — the SPA shell: sidebar nav, tab containers, modal containers.

If chips edited these directly, every parallel feature chip would collide on every wave. So they
are treated **exactly like shared docs**: chips do not edit them.

If your feature needs state, a delegate method, a nav entry, or a `<div x-html="...">` mount,
write the exact block into your notes under `## Draft wiring` with:

- the target file,
- the anchor (the existing line or method your block goes after),
- the literal code.

The Integrator applies wiring blocks serially. Your feature will not run end-to-end in your own
worktree until then — that is expected. Verify what you can (your own module's logic, its HTML
output as a string, server routes via curl) and say plainly in your notes what you could not
verify because the wiring wasn't applied.

**Exception:** a chip whose *entire job* is one of these files owns it exclusively, and no other
chip runs concurrently with it. See §8.

### 3c. Other serialization points in this repo

| Resource | Why it serializes | Rule |
|---|---|---|
| `prisma/schema.prisma` | One shared remote database; `prisma db push` has no migration history (`prisma/migrations/` is gitignored) | Never run `db push`. Draft the model change into notes. See DECISIONS.md on database access. |
| `shared/proformaEngine.js`, `shared/proformaDefaults.js` | Imported by client **and** server; assumption blobs are stored as jsonb and must stay backward-compatible via `migrateAssumptions()` | Single owner per wave. Never break an old blob; always reshape it. |
| `package.json` | Every chip's tooling | Single owner per wave. |
| `server/index.js` | Route registration + global middleware; ordering is load-bearing | Single owner per wave. |
| Listmonk template IDs, email cron secrets | External system, integer IDs assigned outside the repo | Never invent an ID. Ask via notes. |

If a wave has chips touching a numbered or slotted resource, your prompt assigns you a specific
slot. Use only your slot.

---

## 4. Verification lanes

Your prompt names your lane. The bar differs; meeting the wrong bar wastes a wave.

### Lane A — Implementation
Code that ships. You must:
- `npm run build` — must pass, and you must read the output, not just the exit code.
- `node --check <file>` on every JS file you changed.
- Exercise the change for real: hit server routes with `curl` against a locally-run
  `node server/index.js`, or drive the UI in a browser. A change you have not *run* is not done.
- Report actual observed values (row counts, HTTP status, rendered text) in your notes, not
  "verified working".

If the project has grown a `npm run check` script by the time you read this, run that too and
paste the output.

### Lane B — Spec / docs / research
No production code changes. You must:
- Check every claim you make about the code **against the code**, with a `file:line` citation.
- State internal consistency: does your doc contradict `DECISIONS.md` or an existing doc?
- If you assert something is unused, dead, or safe to delete, apply §7.

### Lane C — Prototype / spike
Exploratory. You must:
- State explicitly and prominently that production code was untouched (or name exactly what was).
- Judge by visual or output inspection, and show the output.
- Say what would need to be true to promote this to Lane A.

---

## 5. Reflections — mandatory, and the point of the whole system

Every chip ends its notes file with a `## Reflections` section. This is not paperwork. In the
project this model came from, nearly every serious discovery came from a chip noticing something
nobody asked it to look at — a dead code path, a broken assumption, its own unmerged branch.

**Reflections opens with a findings table.** Table first, prose underneath. Without the table,
blockers get buried in two thousand lines of notes and nobody sees them for three waves.

```markdown
## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| blocker | GET /api/* requires no auth at all | server/index.js:165 | left, why: not owned — proposed as CHIP-AUTH-GET |
| high | `applySortingToGraphene` sorts nulls last; server sorts nulls first | app-refactored.js:1670 | fixed here |
| medium | `app.js` and `app-original.js` appear unreferenced | client/src/js/ | proposed as CHIP-DEADCODE-RECON |
| low | docs/GRAPHENE-FILTERING.md describes a filter panel that isn't rendered | docs/features/ | left, why: shared doc |
```

Severity: `blocker` (unsafe to ship / data or security exposure) · `high` (wrong behavior users
will hit) · `medium` (real but bounded) · `low` (hygiene).
Status: `fixed here` · `left, why: <reason>` · `proposed as CHIP-<NAME>`.

Then, in prose, four required subsections:

1. **What I saw outside my scope.** Anything odd you noticed in files you read but didn't own.
2. **Risks in what I built.** Where your own work is most likely to be wrong, and what would
   expose it. Be specific; "might have bugs" is not a risk.
3. **Proposed follow-up chips.** Name, one-line job, which files it would own, which lane, model
   tier. Do not spawn them.
4. **Harness improvements.** What about this protocol, your spawn prompt, or the environment cost
   you time. Wrong file paths, missing context, a rule that didn't fit. This is how the protocol
   improves.

Also report if your work turned out to need a **different model tier** than you were given —
in either direction.

---

## 5a. Write early, write often — earned in Wave 1

**Create your notes file within the first few minutes and append to it as you work.** Do not
research or build for an hour and then compose the document in one final action.

This is not a style preference. In Wave 1, two of five chips were killed by an environment fault —
the host machine slept mid-response — and both died at exactly the same point: having finished
their work and being about to write it up. Everything they had done existed only in their context.
One of them lost its worktree entirely, because the harness auto-cleans a worktree that contains no
changed files, and a chip that has written nothing has changed nothing.

Both were recoverable only because they could be resumed. Assume you will not be.

Practical shape:

- Write the file skeleton first, with the section headings, before you have anything to put in them.
- Append findings to the table as you find them, not at the end.
- After any expensive step — a long search, a web-research pass, a measurement — save the result
  immediately, even in rough form. Prose can be tidied later; a lost measurement has to be redone.
- If you are partway through and something is incomplete, write it down as incomplete and say which
  parts you did not reach. A partial notes file with honest gaps is worth far more than nothing.

A corollary for the Command Center: **Lane B chips that only produce notes gain nothing from
worktree isolation** — they touch no source, so there is nothing to isolate — and they are actively
harmed by it, because the auto-clean destroys the vehicle for their only output. Spawn them against
the main repo with a notes-only ownership list.

---

## 6. Rules learned the hard way

**Quote rulings, don't cite them.** If your prompt refers to a ruling, it pastes the actual text.
Your worktree may hold a copy of `DECISIONS.md` that predates it. If you need to cite a ruling in
your notes, paste its text too, so the reference is self-verifying.

**Measure before choosing a threshold.** Any number that gates behavior — a limit, a timeout, a
page size, a "too big" cutoff — gets measured against the real distribution first, and the
measurement goes in your notes. This turns taste calls into arithmetic. Example: don't pick a
500-row export cap; count the rows first and say what you counted.

**Verify by ancestry, never by silence.** A command that printed nothing is not a success signal.
When you need to confirm something landed, prove it positively (`git branch --contains <sha>`, a
grep that finds the string, an HTTP response body). Applies to the Command Center's merges and to
your own edits.

**Don't trust "dead code" reports — including your own.** See §7.

**Trust the repo over the notes.** Notes are written in good faith and are sometimes wrong about
filenames, counts, and what shipped. If a note and the code disagree, the code wins; say so.

**Never self-assign a version, phase, or release number.** Concurrent chips can't see each other
and will pick the same one. Write a title; the Integrator numbers it.

**Refactoring splits in two, and the halves never run concurrently.**
- *MOVE* work — renames, reorganization, file splits — touches many files shallowly and conflicts
  with everything. Serialized into one chip running alone.
- *EXTRACT* work — deduplication, pulling a module out — touches few files deeply and
  parallelizes safely in disjoint zones.
If your task turns out to be MOVE work when it was scoped as EXTRACT, stop and say so in notes.

**Public factual copy ships with a fact table.** Anything that reaches an outside audience —
investor-facing proforma numbers and their explanatory copy, the shared proforma embed page, AI
insight summaries, news summaries, competitive analysis, marketing text — carries a table of
claims split into **Confident** (with the in-repo or external source) and **Verify** (unsourced).
Unverified rows block the copy from shipping. Numbers a user can screenshot and send to an
investor are the highest-risk output this repo produces.

**Split research from writing.** A web-capable research chip produces a verified fact file; a
separate, cheaper writing chip may write nothing that is not in that file. This repo already has
this pattern in the `test-matrix-research` skill — follow it.

---

## 7. The dead-code rule

Before you claim anything is unused, or delete it:

1. Search by **basename** (`grep -rn "TaskModal"`).
2. Search by **relative path** (`grep -rn "components/modals/TaskModal"`).
3. Search across **source, tests, scripts, docs, and HTML** — this repo wires modules from
   `client/index.html` and from string templates, so a symbol can be live without a JS import.
4. Check **dynamic references**: `x-html="getFooTabHtml()"`, `window.foo = ...`, `switchTab()`
   allowlists, and route registration in `server/index.js`.

Then **prefer un-exporting to deleting**, and prefer moving to `docs/archive/` or leaving a
one-line tombstone comment over removal. Three dead-code reports in the origin project were
wrong; one wouldn't have compiled if acted on.

---

## 8. When a chip owns a shared file

Occasionally a chip's whole job *is* a shared wiring file — deduplicating `app-refactored.js`,
reordering `server/index.js`, restructuring `client/index.html`. Such a chip:

- owns that file exclusively,
- runs **alone with respect to that file** — no other chip in the wave may own it, and no other
  chip in the wave may draft wiring into it (§3b). Chips working in unrelated zones may run
  concurrently; the constraint is the file, not the wave,
- is MOVE work by definition (see §6), and
- must leave the file's public surface unchanged unless the ruling says otherwise, because other
  chips' drafted wiring blocks were written against the old anchors.

---

## 9. Environment traps in this repo

Record new ones in Reflections so the next chip doesn't rediscover them.

| Trap | Detail |
|---|---|
| **Fixed ports** | Express hardcodes `3001` (`PORT` in `.env`), Vite hardcodes `5174` (`vite.config.js`). Two chips running `npm run dev` collide. Your prompt assigns you a port pair; override with `PORT=<n>` and `vite --port <n>`. |
| **Vite proxies to 3001** | If you move the Express port, the Vite proxy target in `vite.config.js` no longer matches. Prefer testing server routes with `curl` directly rather than through Vite. |
| **`.env` points at a live remote database** | `DATABASE_URL` is a Railway Postgres, not localhost. Any write you make is real and shared with every other chip and with the deployed app. See DECISIONS.md. |
| **`prisma migrate dev` is broken** | Shadow-DB issues. The repo uses `prisma db push`. Chips run neither. |
| **`prisma/migrations/` is gitignored** | There is no migration history to reason from. Schema archaeology means reading `schema.prisma` and the live DB. |
| **Do not use `:3001` in a browser** | Express serves raw client files with no CSS processing in dev. Use the Vite port. |
| **Agent worktrees live at `.claude/worktrees/`** | Inside the repo, not beside it. Gitignored. Tailwind's content globs are `./client/**` and Vite's root is `./client`, so neither walks into them — measured, not assumed. But `npm run server:dev` uses nodemon watching from the repo root, which *will* see chip file changes and restart. Prefer `PORT=<n> node server/index.js` over `npm run dev`. |
| **The host machine sleeping kills chips** | Two of five Wave 1 chips died this way, both at the write-up step. It presents as `API Error: Your computer went to sleep mid-response`. Nothing you can do about the cause; mitigate by writing incrementally (§5a). A killed chip can sometimes be resumed with its context intact — that is the Command Center's job, not yours. |
| **An unchanged worktree is auto-cleaned** | A chip that has written no file has changed nothing, so its worktree is removed when it dies — taking any unsaved work's destination with it. Another reason to create your notes file early. |
| **You share a working directory with other chips (D-010)** | There is no worktree isolating you. Your owned-files list is the only thing preventing a collision. Never run `git checkout`, `git stash`, `git restore`, or any branch operation — you would destroy a sibling chip's uncommitted work. |
| **Build to your own output directory** | `npx vite build --outDir ../dist-<your-chip-name>`, never plain `npm run build`, or concurrent chips race on the same `dist/`. |
| **zsh eats unquoted globs** | `grep --include=*.js` fails; quote it: `--include="*.js"`. |
| **`uploads/` and `public/news-images/`** | Gitignored, written at runtime in dev. Don't commit, don't assume contents. |
| **No test runner, no linter, no typechecker, no CI** | As of the first wave, `npm run build` and `node --check` are the only automated checks. Don't claim you ran tests. |

---

## 10. Your notes file

One file per chip: `notes/<CHIP-NAME>.md`. You write here; nobody else does. You write **only**
here plus your owned files.

```markdown
# CHIP-<NAME>

- **Lane:** A (implementation) | B (spec/docs) | C (prototype)
- **Model tier used:** fable | opus | sonnet
- **Owned files:** ...
- **Wave:** N

## What I was asked to do

## What I did

## How I verified it
<!-- real commands, real output, real numbers -->

## Draft wiring
<!-- blocks for app-refactored.js / client/index.html / index.js — see §3b. Omit if none. -->

## Draft for shared docs
<!-- pre-drafted changelog/doc entries for the Integrator — see §3a. Omit if none. -->

## Handoff: changes needed in files I do not own
<!-- see §1. Omit if none. -->

## Reflections
<!-- findings table first, then the four subsections — see §5. Never omit. -->
```
