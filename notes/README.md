# notes/

One file per chip: `notes/<CHIP-NAME>.md`.

**The owning chip writes its own file. Nobody else writes it — not other chips, not the
Integrator, not the Command Center.** The Command Center and Integrator read these; corrections go
into `ROADMAP.md` or `DECISIONS.md`, never by editing a chip's notes.

A chip writes here **and** in its owned files, and nowhere else.

These files are the system's memory. They carry three things that exist nowhere else:

1. **Drafted wiring** — code blocks for `app-refactored.js` and `client/index.html` that chips
   aren't allowed to apply themselves (D-001), which the Integrator applies serially.
2. **Drafted doc entries** — changelog and documentation text for the Integrator to merge.
3. **Reflections** — what the chip noticed outside its own scope. This is the highest-value output
   of the whole model. Do not trim it.

Copy `_TEMPLATE.md` to start. Format and required sections are specified in `CHIP-PROTOCOL.md` §10.
