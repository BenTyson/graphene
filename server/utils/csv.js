/**
 * Shared RFC 4180 CSV emitting helpers.
 *
 * Every `/export/csv` route in server/routes/ builds its file through these. Before
 * this module existed each route had its own hand-rolled string concatenation, and the
 * copies had drifted badly: graphene quoted 7 of 31 fields, mcb and micronization
 * quoted none, shipments quoted every field but never doubled interior quotes, and
 * raman actively injected literal commas into unquoted fields — corrupting 5 of 14 rows
 * in production, silently, because the file still opens cleanly in Excel and only the
 * column alignment is wrong.
 *
 * One helper, imported everywhere, so the next fix lands in thirteen exports instead of
 * one. Do not copy these functions into a route file.
 */

/**
 * Escape one value as a CSV field.
 *
 * Quotes only when the value needs it (comma, double quote, CR, LF, or leading/
 * trailing whitespace) rather than always, so numeric columns stay unquoted and the
 * file reads and diffs cleanly. That predicate is the complete RFC 4180 set.
 *
 * Handles uniformly the shapes these routes produce:
 *   null / undefined -> empty
 *   Date             -> ISO 8601
 *   Prisma Decimal   -> its decimal literal (String() calls toString(), not valueOf())
 *   array            -> comma-joined inside one quoted field
 *
 * @param {*} value
 * @returns {string} the field, escaped and quoted if required
 */
export function csvField(value) {
  if (value === null || value === undefined) return '';

  let s;
  if (value instanceof Date) {
    s = value.toISOString();
  } else if (Array.isArray(value)) {
    s = value.join(', ');
  } else {
    s = String(value);
  }

  if (s === '') return '';
  if (/[",\r\n]/.test(s) || s !== s.trim()) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Join one record's fields into a CSV line. Header rows go through this too — an
 * unescaped header is the same latent defect as an unescaped value.
 *
 * @param {Array<*>} fields
 * @returns {string}
 */
export function csvRow(fields) {
  return fields.map(csvField).join(',');
}

/**
 * Record separator, per RFC 4180.
 *
 * Free-text fields (comments, conclusions, peak assignments) carry embedded newlines,
 * so using CRLF between records keeps record boundaries unambiguous even for a parser
 * that handles quoting sloppily.
 */
export const CSV_EOL = '\r\n';

/**
 * Date-only rendering for the CSV.
 *
 * The tables show `Unknown` for a missing or epoch date (formatDateSafe in
 * app-refactored.js). The CSV emits an empty cell instead: a literal 'Unknown' in a
 * date column is unsortable and unfilterable, and an empty cell is exactly what a
 * spreadsheet reads as "no date".
 *
 * @param {Date|string|null|undefined} d
 * @returns {string} YYYY-MM-DD, or ''
 */
export function csvDateOnly(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  const t = date.getTime();
  if (Number.isNaN(t)) return '';
  return date.toISOString().slice(0, 10);
}

/**
 * Build the CSV body from a header spec and rows, and set the response headers.
 *
 * `columns` is either a flat array of labels (single header row, the common case) or
 * an array of `[groupLabel, subLabel]` pairs (two-row grouped header, used only where
 * the tab's own table has a grouped <thead> band — see graphene). Mirror the screen:
 * a two-row header on a flat table is ceremony that breaks parsers for nothing.
 *
 * @param {import('express').Response} res
 * @param {string} filename
 * @param {Array<string>|Array<[string,string]>} columns
 * @param {Array<Array<*>>} rows
 */
export function sendCsv(res, filename, columns, rows) {
  const grouped = Array.isArray(columns[0]);

  let csv = '';
  if (grouped) {
    csv += csvRow(columns.map(c => c[0])) + CSV_EOL;
    csv += csvRow(columns.map(c => c[1])) + CSV_EOL;
  } else {
    csv += csvRow(columns) + CSV_EOL;
  }

  for (const row of rows) {
    csv += csvRow(row) + CSV_EOL;
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
