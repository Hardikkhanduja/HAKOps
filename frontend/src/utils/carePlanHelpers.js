import { format, parseISO } from "date-fns";

/**
 * Finds the earliest date in a followUps array for a given type.
 *
 * ISO 8601 date strings sort correctly as plain strings (lexicographic order
 * matches chronological order), so we can compare them with < directly.
 *
 * @param {Array<{ type: string, date: string }>} followUps
 * @param {"appointment"|"test"} type
 * @returns {string|null}  ISO date string of the earliest match, or null
 */
export function earliestDateByType(followUps, type) {
  if (!followUps || followUps.length === 0) return null;
  const matches = followUps.filter((f) => f.type === type);
  if (matches.length === 0) return null;
  return matches.reduce(
    (min, f) => (f.date < min ? f.date : min),
    matches[0].date
  );
}

/**
 * Formats an ISO date string for display in the UI.
 * e.g. "2026-09-22T10:00:00Z" -> "September 22, 2026"
 *
 * Returns "None scheduled" when the date is missing — used on the
 * Dashboard when no appointment or test has been found.
 *
 * @param {string|null|undefined} isoDate
 * @returns {string}
 */
export function formatDisplayDate(isoDate) {
  if (!isoDate) return "None scheduled";

  const parsed = parseISO(isoDate);
  if (Number.isNaN(parsed.getTime())) return "None scheduled";

  return format(parsed, "MMMM dd, yyyy");
}