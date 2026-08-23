/**
 * The organisation's timezone — one definition, imported by the server and the client.
 *
 * Ben's instruction: *"I only ever want to use MST for the date time picker, although we really
 * only deal with dates, not times."* This is a single-site team, so everyone should read the same
 * calendar date for a record regardless of where they are or how their laptop is set. A shared
 * fixed zone is what makes that true, and it is also what lets the server derive a calendar date
 * at all — an instant has no calendar date until a zone is chosen, and the server never knows the
 * viewer's.
 *
 * `America/Denver`, NOT the literal string `MST` and NOT a hardcoded UTC-7 offset. Mountain Time
 * observes daylight saving, so a fixed offset is wrong from March to November, and for date-only
 * rendering a one-hour error is exactly the error that flips the calendar day either side of
 * midnight — the whole bug this module exists to prevent. `America/Denver` resolves MST and MDT
 * automatically.
 *
 * Imported as `@shared/orgTimezone.js` from the client (Vite alias in vite.config.js) and as
 * `../../shared/orgTimezone.js` from the server, the same way `shared/proformaEngine.js` is
 * consumed by both. Plain ESM with no dependencies so both runtimes can load it unbuilt.
 */
export const ORG_TIMEZONE = 'America/Denver';

/**
 * The YYYY-MM-DD calendar date an instant falls on, in a given IANA timezone.
 *
 * Identical in behaviour to the `ymdInTz()` that `server/services/emailDigest.js` has been using
 * to bucket "due tomorrow" per local day rather than per UTC day. That was the only place in this
 * codebase doing timezone-aware date conversion correctly; hoisting the idea here is what makes it
 * reusable instead of a one-subsystem habit. `emailDigest.js` should import this and drop its own
 * copy — see the Handoff section of notes/W5-STARTDATE-TZ.md; it is not this chip's file to edit.
 *
 * 'en-CA' is not decorative: it is the locale whose short date format IS `YYYY-MM-DD`.
 */
export function ymdInTz(date, timeZone = ORG_TIMEZONE) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    // An unknown zone or a bad date should degrade, not throw, in the middle of a serializer.
    return date instanceof Date && !Number.isNaN(date.getTime())
      ? date.toISOString().slice(0, 10)
      : null;
  }
}

/**
 * Null-safe `ymdInTz(value, ORG_TIMEZONE)`. Accepts a Date, an ISO string, or null.
 *
 * Use this for any calendar date derived from a TIMESTAMP (`createdAt`, `updatedAt`). Do not use
 * `toISOString().slice(0, 10)` for that — it answers in UTC, which is a different day from
 * Mountain Time between 18:00 and midnight every evening.
 *
 * Columns that already store a bare calendar date as UTC midnight (`dueDate`, `startDate`) are a
 * different case: their UTC date IS the date the user typed, so they do not go through here.
 */
export function orgYmd(value) {
  if (value === null || value === undefined || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : ymdInTz(d, ORG_TIMEZONE);
}
