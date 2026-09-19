/**
 * Formats an ISO 8601 timestamp for use in the WhatsApp message (UTC, timezone-safe).
 * e.g. "2026-09-15T09:00:00Z" -> "2026-09-15 09:00"
 */
export function formatUploadedAt(isoString) {
  const d = new Date(isoString);
  const yyyy = d.getUTCFullYear();
  const mm   = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd   = String(d.getUTCDate()).padStart(2, "0");
  const hh   = String(d.getUTCHours()).padStart(2, "0");
  const min  = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

/**
 * Constructs the wa.me click-to-chat URL for a pharmacy card.
 * Plain anchor link — no WhatsApp Business API, no Meta approval needed.
 * Returns null when uploadedAt is falsy so caller can disable the link.
 *
 * WhatsApp automated reminders: future roadmap item (requires Meta Business API approval).
 */
export function buildWhatsAppUrl(pharmacy, patientName, uploadedAt) {
  if (!uploadedAt) return null;

  const dateStr = formatUploadedAt(uploadedAt);
  const message =
    `Hi ${pharmacy.name}, I have a prescription for ${patientName} ` +
    `(via CareSetu) uploaded on ${dateStr}. Could you please check availability?`;

  return `https://wa.me/${pharmacy.phone}?text=${encodeURIComponent(message)}`;
}