# CHIP-W3-CSV-SWEEP

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:** `server/routes/bet.js`, `biochar.js`, `compoundBatch.js`, `conductivity.js`,
  `mcb.js`, `micronization.js`, `particleSize.js`, `raman.js`, `shipments.js`, `tem.js`, `xps.js`,
  `xrd.js`, plus `server/utils/csv.js` (new, authorised by spawn prompt) and this notes file.
- **Wave:** 3

## What I was asked to do

Propagate the CSV correctness work done in `server/routes/graphene.js` (W3-CSV-COMPLETE) across the
other twelve `/export/csv` handlers.

1. **Urgent:** fix `raman.js` — 8 columns built as `` `${a},${b}` `` unquoted, corrupting 5 of 14
   rows in production today.
2. Route every field in all twelve exports through **one shared** RFC 4180 escaping helper, placed
   in `server/utils/` and imported (not copy-pasted twelve times).
3. Close missing-column gaps in `biochar`, `raman`, `micronization`, `tem` — data visible on screen,
   absent from the export. Read the client tab component as spec; never edit it.
4. Grouped headers only where the tab's own table is grouped. Judgement call per route, reasoning
   recorded.
5. Reproduce derived columns exactly where a tab computes one in its template.

Only each file's `/export/csv` handler may change. Everything else in these routers is out of scope.

## Progress log

<!-- appended as I go, per CHIP-PROTOCOL.md §5a -->

Server: `PORT=3071 nohup node server/index.js` — restart command if the session is killed.
JWT minted from `.env` `JWT_SECRET` into scratchpad `jwt.txt`; `/api/auth/login` never called (D-005).

- [x] Read graphene.js reference implementation
- [x] Create `server/utils/csv.js` — `csvField` / `csvRow` / `CSV_EOL` / `csvDateOnly` / `sendCsv`
- [x] **raman.js (URGENT) — DONE, 5 ragged rows -> 0. See "The raman fix" below.**
- [ ] biochar.js
- [ ] micronization.js
- [ ] tem.js
- [ ] bet.js
- [ ] compoundBatch.js
- [ ] conductivity.js
- [ ] mcb.js
- [ ] particleSize.js
- [ ] shipments.js
- [ ] xps.js
- [ ] xrd.js
- [ ] npm run check

## What I did

### The shared helper

`server/utils/csv.js` — new file, authorised by the spawn prompt despite not being in the owned
list. Exports `csvField()` (RFC 4180 escaping), `csvRow()`, `CSV_EOL` (`\r\n`), `csvDateOnly()`, and
`sendCsv(res, filename, columns, rows)` which builds the body and sets `Content-Type:
text/csv; charset=utf-8`. `csvField` is lifted verbatim from the graphene reference so the two
cannot drift; `sendCsv` accepts either a flat array of labels (single header row) or an array of
`[group, sub]` pairs (two-row grouped header), so each route mirrors its own table.

Every one of the twelve routes now imports from this module. No route defines its own escaping.

### The raman fix — the urgent one

**Confirmed corrupt before the change, measured against live data rather than trusted:** I
re-ran the *old* export code verbatim against the same database and parsed it with Python's `csv`
module — 19-field header, 5 of 14 rows carrying 22–27 fields.

**The eight paired values are NOT two measurements.** This is the finding that changed the design,
and it contradicts the spawn prompt's steer ("two sibling columns each … almost certainly right").
The pairs are the integer part and the fractional digits of **one number in German decimal
notation**. Measured across all 14 live records:

```
Integral Typ A D/G : 1,422  1,451  1,337  1,278  1,94   -> 1.422 1.451 1.337 1.278 1.94
Integral Typ B D/G : 1,352                              -> 1.352
Peak High Typ J D/G: 0,905                              -> 0.905
Integral Typ A G   : 226,6  228,0  217,1  223,0  216,4
Integral Typ A D   : 322,3  330,8  290,3  285,0  236,7
```

A graphene D/G ratio of 1.2–1.5 is the textbook range. A pair of independent measurements reading
`(1, 422)` is not a quantity at all. Corroborating: the research team on every record is
`Curia - Germany`, the testing lab is `Clariant`, and `RAMANModal.js:210-215` ships placeholders
`1` and `451` — i.e. 1,451.

So these ship as **one quoted field each**, not as sibling columns:

- **Splitting was rejected** because it produces two numeric-looking columns that mean nothing
  apart. Someone averaging a `D/G 2` column would get 336 from values whose real mean is 1.4 —
  silently, and it would look right. That is a worse defect than the raggedness being fixed.
- **Reconstructing the decimal (`1.422`) was rejected** because the storage is lossy: a fractional
  part of `05` is stored as Decimal `5`, so 9.05 and 9.5 are indistinguishable in the database.
  Emitting a reconstructed number would invent precision that is not recoverable.
- The comma form is exactly what the screen shows and splits losslessly for anyone who knows the
  convention. Quoting is what makes it safe — the old code emitted this same string **unquoted**,
  which is the entire bug.

The four **Integration Range** cells are a different animal and are split into sibling Low/High
columns: they are stored as `...Low`/`...High`, are genuinely two independent numbers, and are
hyphen-joined on screen so they were never corrupt. That is the graphene composite case exactly.

Also for raman: **Integral Typ B added** (all four cells rendered at `TestResultsRAMANTab.js:61`,
present in the CSV nowhere), `compoundBatchNumber` added (the sample cell shows
`grapheneSample || compoundBatchNumber` behind a G/CB badge, `TestResultsRAMANTab.js:96`),
`updatedAt` added, and the export now honours the same `search`/`sortBy`/`order` params as `GET /`.

**Grouped header: yes.** The RAMAN table's `<thead>` carries `colspan=4` band cells over 2D / G /
D / D/G sub-labels (`TestResultsRAMANTab.js:55-83`). This is one of the few tabs where a two-row
header genuinely mirrors the screen.

## How I verified it

Lane A bar (CHIP-PROTOCOL.md §4 + D-007). Express on port 3071, JWT minted locally from
`JWT_SECRET`; `/api/auth/login` deliberately not called (D-005 — it writes `lastLogin`).
Every export parsed with Python's `csv` module, a real RFC 4180 parser, asserting a single
field-count across all rows. Histograms reported, not eyeballed.

### raman — before / after, the headline result

```
BEFORE (old code verbatim, same live data, Python csv parser)
  header fields: 19
  total lines  : 15
  histogram    : {19: 10, 25: 1, 27: 1, 26: 1, 23: 1, 22: 1}
  ragged rows  : 5 -> [(1, 25), (2, 27), (3, 26), (4, 23), (5, 22)]

AFTER (live endpoint http://localhost:3071/api/raman/export/csv)
  raman   OK   cols=29  hdr_rows=2  data_rows=14  bytes=2204  hist={29: 16}
```

**5 ragged rows -> 0.** Field-count histogram has exactly one key.

Header rows and a data row as parsed:

```
row0 ['Test Date','Sample','','Testing Lab','Research Team','Integration Range','','','','','','','',
      'Integral Typ A','','','','Integral Typ B','','','','Peak High Typ J','','','',
      'RAMAN Report','Comments','Record','']
row1 ['','Graphene','Compound Batch','','','2D Low','2D High','G Low','G High','D Low','D High',
      'D/G Low','D/G High','2D','G','D','D/G','2D','G','D','D/G','2D','G','D','D/G','','','Created','Updated']
row2 ['2025-07-16','','HG102S2','Clariant','Curia - Germany','2791','2557','1753','1474','1474','959',
      '','','9,690','226,6','322,3','1,422','','','','','','1,895','1,708','','Yes','',
      '2025-09-05T01:48:16.550Z','2025-09-05T20:52:17.729Z']
```

Raw bytes of that line — the composites are quoted and the record ends CRLF:

```
2025-07-16,,HG102S2,Clariant,Curia - Germany,2791,2557,1753,1474,1474,959,,,"9,690","226,6","322,3","1,422",,,,,,"1,895","1,708",,Yes,,2025-09-05T01:48:16.550Z,2025-09-05T20:52:17.729Z
od: ... , 1 4 7 4 , 9 5 9 , , , " 9 , 6 9 0 " , " 2 2 6 , 6 " , " 3 2 2 , 3 " , " 1 , 4 2 2 " , ...
    ... : 1 7 . 7 2 9 Z \r \n
```

Cell-by-cell against the database for record `HG102S2` — every CSV cell equals its DB column:

```
integrationRange2DLow "2791"  2DHigh "2557"  GLow "1753"  GHigh "1474"
integrationRangeDLow  "1474"  DHigh  "959"   DGLow null   DGHigh null
integralTypA2D1 "9"   A2D2 "690"   -> CSV "9,690"
integralTypAG1  "226" AG2  "6"     -> CSV "226,6"
integralTypAD1  "322" AD2  "3"     -> CSV "322,3"
integralTypADG1 "1"   ADG2 "422"   -> CSV "1,422"
peakHighTypJ2D1 null  J2D2 "123"   -> CSV ""       (one half absent -> empty, as the table does)
```

Filter scoping matches `GET /api/raman` exactly:

```
  <none>               GET=14   CSV=14   MATCH
  ?search=Clariant     GET=14   CSV=14   MATCH
  ?search=HG10         GET=0    CSV=0    MATCH
  ?search=zzznone      GET=0    CSV=0    MATCH
```

## Measurements

## Draft wiring

<!-- none expected — server routes only -->

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
