/**
 * TabbedFilter — pill-tab row for filtering list views.
 * tabs: [{ label, count }]   active: number   onChange: (index) => void
 */
export default function TabbedFilter({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tabs.map((t, i) => (
        <button key={i} onClick={() => onChange(i)}
          className="rounded-full px-3 py-1 text-sm font-semibold transition-all"
          style={{
            background: active === i ? "var(--brand)" : "var(--muted-fill)",
            color:      active === i ? "#ffffff"      : "var(--text-secondary)",
            border:     "none",
            fontSize:   "13px",
            whiteSpace: "nowrap",
          }}>
          {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
        </button>
      ))}
    </div>
  );
}