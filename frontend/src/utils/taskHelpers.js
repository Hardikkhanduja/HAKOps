/**
 * taskHelpers.js
 *
 * Parses a free-text frequency string from the care plan API
 * (e.g. "Twice daily", "Once daily", "Every 8 hours for 5 days")
 * and returns an array of human-readable suggested time slots.
 *
 * This is a best-effort parser for the demo. The API contract only
 * provides { description, frequency } with no structured time fields.
 * Kamal / future spec: add a structured schedule field to the contract
 * to make this deterministic.
 */

const TIME_SLOTS = {
  1: ["Morning (with breakfast)"],
  2: ["Morning (with breakfast)", "Evening (after dinner)"],
  3: ["Morning (with breakfast)", "Afternoon (after lunch)", "Evening (after dinner)"],
  4: ["Morning", "Noon", "Evening", "Night (before bed)"],
};

/**
 * Extracts how many times per day a frequency string implies.
 * @param {string} frequency
 * @returns {number}
 */
function extractTimesPerDay(frequency) {
  if (!frequency) return 1;
  const f = frequency.toLowerCase();

  if (f.includes("every 8 hour"))  return 3;
  if (f.includes("every 6 hour"))  return 4;
  if (f.includes("every 12 hour")) return 2;
  if (f.includes("every 4 hour"))  return 6;
  if (f.includes("four times"))    return 4;
  if (f.includes("4 times"))       return 4;
  if (f.includes("three times"))   return 3;
  if (f.includes("3 times"))       return 3;
  if (f.includes("twice"))         return 2;
  if (f.includes("two times"))     return 2;
  if (f.includes("2 times"))       return 2;
  if (f.includes("once"))          return 1;
  if (f.includes("1 time"))        return 1;
  if (f.includes("daily"))         return 1;
  if (f.includes("as needed"))     return 0; // PRN — no fixed schedule
  return 1;
}

/**
 * Returns suggested time slot labels for a given frequency string.
 * @param {string} frequency
 * @returns {string[]}
 */
export function getTimeSlotsForFrequency(frequency) {
  const n = extractTimesPerDay(frequency);
  if (n === 0) return ["Any time (as needed)"];
  return TIME_SLOTS[n] || TIME_SLOTS[Math.min(n, 4)];
}

/**
 * Returns a short display string for the primary time slot.
 * Used in list rows where only one time needs to be shown.
 * @param {string} frequency
 * @returns {string}
 */
export function primaryTimeLabel(frequency) {
  return getTimeSlotsForFrequency(frequency)[0] || "Any time";
}

/**
 * Buckets a followUp item into Today / This Week / Upcoming.
 * @param {string} isoDate
 * @param {Date}   now
 * @returns {"today"|"week"|"upcoming"}
 */
export function bucketFollowUp(isoDate, now = new Date()) {
  const d    = new Date(isoDate);
  const diff = d - now; // ms
  if (diff < 0)                    return "upcoming"; // past — still show in upcoming
  if (diff < 24 * 60 * 60 * 1000) return "today";
  if (diff < 7  * 24 * 60 * 60 * 1000) return "week";
  return "upcoming";
}