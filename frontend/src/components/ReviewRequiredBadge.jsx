import { AlertTriangle } from "lucide-react";

/**
 * ReviewRequiredBadge — the Responsible AI guardrail component.
 *
 * THIS MUST BE THE LOUDEST ELEMENT ON THE MEDICATION CARD.
 *
 * Design:
 * - Filled amber (#92400E on #FFFBEB background strip) — NOT an outline pill
 * - Large icon (h-4 w-4, strokeWidth 2.5) + bold uppercase text
 * - Contrast: #92400E on white = ~7.3:1 (WCAG AAA)
 * - role="img" + aria-label so screen readers announce it as one unit
 * - aria-hidden on the icon — the aria-label on the wrapper covers it
 * - Text "Review Required" (16 chars >= 12 minimum). No conditionals inside.
 */
export default function ReviewRequiredBadge() {
  return (
    <span
      role="img"
      aria-label="Review Required"
      className="inline-flex items-center gap-1.5 rounded-lg font-bold shrink-0"
      style={{
        background: "#92400E",
        color: "#FFFFFF",
        fontSize: "13px",
        lineHeight: "1",
        padding: "5px 10px",
        letterSpacing: "0.02em",
        boxShadow: "0 2px 6px rgba(146,64,14,0.4)",
      }}
    >
      <AlertTriangle
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
        style={{ strokeWidth: 2.5 }}
      />
      <span>Review Required</span>
    </span>
  );
}