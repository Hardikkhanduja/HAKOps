import ReviewRequiredBadge from "./ReviewRequiredBadge.jsx";

/**
 * MedicationCard
 *
 * When reviewRequired === true the amber banner spans the FULL top of the card.
 * This makes it impossible to miss — it outranks the drug name visually.
 * strict === true guard so null/false/absent never trigger the banner.
 */
export default function MedicationCard({ medication }) {
  const { name, dosage, timing, reviewRequired } = medication;
  const needsReview = reviewRequired === true;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: needsReview ? "2px solid #FCD34D" : "1.5px solid var(--border)",
        boxShadow: needsReview
          ? "0 2px 12px rgba(146,64,14,0.15)"
          : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Full-width Review Required banner — only when needed */}
      {needsReview && (
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ background: "var(--status-attention-bg)", borderBottom: "1.5px solid #FCD34D" }}
        >
          <ReviewRequiredBadge />
          <p className="text-sm font-semibold leading-snug" style={{ color: "var(--status-attention)" }}>
            Confirm with your doctor or pharmacist before taking
          </p>
        </div>
      )}

      {/* Card body */}
      <div className="px-4 py-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">💊</span>
          <p className="font-extrabold leading-snug" style={{ fontSize: "18px", color: "var(--text-primary)", paddingTop: "1px" }}>
            {name}
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "var(--muted-fill)" }}>
            <span className="text-xs font-extrabold uppercase tracking-widest shrink-0 w-12" style={{ color: "var(--text-secondary)" }}>Dose</span>
            <span className="font-semibold" style={{ fontSize: "16px", color: "var(--text-primary)" }}>{dosage}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "var(--brand-tint)" }}>
            <span className="text-xs font-extrabold uppercase tracking-widest shrink-0 w-12" style={{ color: "var(--brand)" }}>When</span>
            <span className="font-semibold" style={{ fontSize: "16px", color: "var(--brand-dark)" }}>{timing}</span>
          </div>
        </div>
      </div>
    </div>
  );
}