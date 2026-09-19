import { HeartHandshake, Phone } from "lucide-react";

/**
 * ContactProviderCTA — "Need help?" banner + "Contact Provider" button.
 * Reused at the bottom of CarePlan, Medicines, DailyTasks, FollowUps, WarningSigns.
 */
export default function ContactProviderCTA({ message = "If you have any questions about your care plan, please contact your doctor or healthcare provider." }) {
  return (
    <div className="mx-6 mb-6 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
      style={{ background: "var(--brand-tint)", border: "1.5px solid var(--brand-tint-mid)" }}>
      <div className="flex items-start gap-3">
        <HeartHandshake className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--brand)" }} aria-hidden="true" />
        <div>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--brand)" }}>Need help?</p>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px", lineHeight: 1.5 }}>{message}</p>
        </div>
      </div>
      <button
        className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-sm shrink-0 transition-all active:scale-95"
        style={{ background: "var(--brand)", color: "#ffffff", minHeight: "40px" }}
        aria-label="Contact your healthcare provider">
        <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Contact Provider
      </button>
    </div>
  );
}