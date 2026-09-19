import { RefreshCw } from "lucide-react";

/**
 * PageHeader — shared breadcrumb + greeting + tagline pill used on every page.
 * Extracted so it is not duplicated across CarePlan, Medicines, Daily Tasks, etc.
 */
export default function PageHeader({ breadcrumb, patientName, onRefresh }) {
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="flex items-start justify-between px-6 pt-4 pb-2 gap-3">
      <div className="min-w-0">
        {breadcrumb && (
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
            Operations &rsaquo; <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{breadcrumb}</span>
          </p>
        )}
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.25 }}>
          {greeting}, {patientName} 👋
        </h1>
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-1">
        <div className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white hidden sm:block"
          style={{ background: "var(--brand)", whiteSpace: "nowrap", fontSize: "11px" }}>
          Small steps every day make a big difference.
        </div>
        {onRefresh && (
          <button onClick={onRefresh}
            className="rounded-xl p-1.5 border transition-colors hover:bg-gray-50"
            style={{ border: "1px solid var(--border)" }}
            aria-label="Refresh page">
            <RefreshCw className="h-3.5 w-3.5" style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}