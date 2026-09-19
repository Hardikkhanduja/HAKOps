/**
 * ProgressStatCard — small card with a fraction + label.
 * done: number, total: number, label: string, sublabel: string
 */
export default function ProgressStatCard({ done, total, label, sublabel, color = "var(--brand)" }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const radius = 22;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex-1 rounded-2xl p-4 flex items-center gap-4"
      style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      {/* Ring */}
      <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0" aria-hidden="true">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--muted-fill)" strokeWidth="5" />
        <circle cx="28" cy="28" r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 28 28)" />
        <text x="28" y="33" textAnchor="middle" style={{ fontSize: "12px", fontWeight: 700, fill: "var(--text-primary)" }}>
          {done}/{total}
        </text>
      </svg>
      <div className="min-w-0">
        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{label}</p>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{sublabel}</p>
      </div>
    </div>
  );
}