/**
 * StatChipRow — row of small colored stat tiles.
 * chips: [{ label, value, icon?, color, bg, border }]
 */
export default function StatChipRow({ chips }) {
  return (
    <div className="flex gap-3 flex-wrap px-6 pb-4">
      {chips.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div key={label}
          className="flex-1 min-w-[110px] rounded-2xl px-4 py-3"
          style={{ background: bg, border: `1.5px solid ${border}` }}>
          <div className="flex items-center justify-between mb-1">
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.06em", color }}>{label}</p>
            {Icon && <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />}
          </div>
          <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "1px" }}>
            {value === 1 ? "Item" : "Items"}
          </p>
        </div>
      ))}
    </div>
  );
}