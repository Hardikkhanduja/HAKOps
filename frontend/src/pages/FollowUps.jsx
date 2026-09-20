import { useState } from "react";
import { Calendar, Plus, CheckCircle, MapPin, Clock } from "lucide-react";
import { format, parseISO, isPast, isWithinInterval, addDays } from "date-fns";
import { useCarePlan } from "../context/CarePlanContext.js";
import PageHeader         from "../components/PageHeader.jsx";
import TabbedFilter       from "../components/TabbedFilter.jsx";
import ContactProviderCTA from "../components/ContactProviderCTA.jsx";

const TIPS = [
  "Add follow-ups to your calendar.",
  "Carry relevant documents and reports.",
  "Reach on time and inform if you need to reschedule.",
  "Ask your doctor any questions you may have.",
];

const WEEK_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/** Simple month-grid calendar highlighting follow-up dates */
function MonthCalendar({ followUps }) {
  const today   = new Date();
  const year    = today.getFullYear();
  const month   = today.getMonth();
  const first   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const fuDates = new Set(
    followUps.map(f => {
      const d = parseISO(f.date);
      return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : null;
    }).filter(Boolean)
  );
  const testDates = new Set(
    followUps.filter(f => f.type === "test").map(f => {
      const d = parseISO(f.date);
      return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : null;
    }).filter(Boolean)
  );

  const cells = Array(first).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <div className="rounded-2xl p-4" style={{ background:"var(--card)", border:"1.5px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)" }}>
          📅 {format(today, "MMMM yyyy")}
        </p>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEK_DAYS.map(d => (
          <div key={d} className="text-center" style={{ fontSize:"10px", fontWeight:700, color:"var(--text-secondary)" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const isToday   = day === today.getDate();
          const isFU      = fuDates.has(day) && !testDates.has(day);
          const isTest    = testDates.has(day);
          return (
            <div key={i} className="aspect-square flex items-center justify-center rounded-lg text-xs font-semibold"
              style={{
                background: isToday ? "var(--brand)" : isFU ? "#EDE9FE" : isTest ? "#EFF6FF" : "transparent",
                color: isToday ? "#fff" : isFU ? "#6D28D9" : isTest ? "#2563EB" : "var(--text-primary)",
                fontSize:"12px",
              }}>
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-2">
        {[["Today", "var(--brand)", "#fff"], ["Follow-up", "#EDE9FE", "#6D28D9"], ["Test", "#EFF6FF", "#2563EB"]].map(([lbl, bg, color]) => (
          <div key={lbl} className="flex items-center gap-1">
            <span className="rounded-full" style={{ width:8, height:8, background: bg === "#EDE9FE" ? "#6D28D9" : bg === "#EFF6FF" ? "#2563EB" : "var(--brand)", display:"inline-block" }} />
            <span style={{ fontSize:"10px", color:"var(--text-secondary)" }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Generate ICS calendar entry */
function downloadICS(fu) {
  const start = parseISO(fu.date);
  const fmt = d => format(d, "yyyyMMdd'T'HHmmss");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    `SUMMARY:${fu.description}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(new Date(start.getTime() + 60 * 60 * 1000))}`,
    `DESCRIPTION:${fu.type} — CareSetu care plan reminder`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\n");
  const blob = new Blob([ics], { type:"text/calendar" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `${fu.description.replace(/\s+/g,"-")}.ics`; a.click();
  URL.revokeObjectURL(url);
}

export default function FollowUps() {
  const { carePlan } = useCarePlan();
  const { patient, carePlan: plan } = carePlan;
  const now        = new Date();
  // local state only — not persisted, backend has no write endpoints yet
  const [extra, setExtra]       = useState([]);
  const [done, setDone]         = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const allFUs = [...(plan.followUps ?? []), ...extra];

  const upcoming  = allFUs.filter(f =>
    !done[f.description] && (!f.date || new Date(f.date) >= now)
  );
  const completed = allFUs.filter(f => done[f.description]);
  const overdue   = allFUs.filter(f =>
    !done[f.description] && f.date && new Date(f.date) < now
  );

  const tabs = [
    { label:"Upcoming",  count:upcoming.length  },
    { label:"Completed", count:completed.length },
    { label:"All",       count:allFUs.length    },
  ];

  const visible = [upcoming, completed, allFUs][activeTab];

  function markDone(desc) {
    // local state only — not persisted, backend has no write endpoints yet
    setDone(prev => ({ ...prev, [desc]: true }));
  }

  function addFollowUp() {
    // local state only — not persisted, backend has no write endpoints yet
    const desc = window.prompt("Follow-up description:");
    if (!desc) return;
    const date = window.prompt("Date (YYYY-MM-DD):", format(addDays(now, 7), "yyyy-MM-dd"));
    if (!date) return;
    setExtra(prev => [...prev, { description: desc, date: `${date}T09:00:00Z`, type:"appointment" }]);
  }

  return (
    <div className="min-h-full pb-8">
      <PageHeader breadcrumb="Follow-ups" patientName={patient.name} />

      {/* Title + add button */}
      <div className="flex items-center justify-between px-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl p-2.5" style={{ background:"#7C3AED" }}>
            <Calendar className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-primary)" }}>Follow-Ups</h2>
            <p style={{ fontSize:"13px", color:"var(--text-secondary)" }}>Complete these tasks every day to help your recovery.</p>
          </div>
        </div>
        <button onClick={addFollowUp}
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-sm transition-all active:scale-95"
          style={{ background:"var(--brand)", color:"#ffffff", border:"none" }}
          aria-label="Add a new follow-up">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add Follow-up
        </button>
      </div>

      {/* Stat chips */}
      <div className="flex gap-3 px-6 pb-4">
        {[
          { label:"Total Follow-ups", value:allFUs.length,     color:"#7C3AED", bg:"#F5F3FF", border:"#C4B5FD" },
          { label:"Upcoming",         value:upcoming.length,   color:"#2563EB", bg:"#EFF6FF", border:"#BFDBFE" },
          { label:"Completed",        value:completed.length,  color:"#059669", bg:"#D1FAE5", border:"#6EE7B7" },
          { label:"Overdue",          value:overdue.length,    color:"#C0392B", bg:"#FEF2F2", border:"#FCA5A5" },
        ].map(c => (
          <div key={c.label} className="flex-1 rounded-2xl px-3 py-2.5" style={{ background:c.bg, border:`1.5px solid ${c.border}` }}>
            <p style={{ fontSize:"9px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:c.color }}>{c.label}</p>
            <p style={{ fontSize:"22px", fontWeight:800, color:"var(--text-primary)", lineHeight:1.1, marginTop:"2px" }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-6">
        {/* Left: list */}
        <div className="lg:col-span-2 space-y-4">
          <TabbedFilter tabs={tabs} active={activeTab} onChange={setActiveTab} />
          <div className="space-y-3">
            {visible.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background:"var(--muted-fill)", border:"2px dashed var(--border)" }}>
                <p style={{ fontSize:"14px", color:"var(--text-secondary)" }}>No items here.</p>
              </div>
            ) : visible.map((f, i) => {
              const date = f.date ? parseISO(f.date) : null;
              const isDone = !!done[f.description];
              return (
                <div key={i} className="rounded-2xl overflow-hidden"
                  style={{ background:"var(--card)", border:"1.5px solid var(--border)", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div className="flex gap-4 p-4">
                    {/* Date badge */}
                    <div className="rounded-xl px-3 py-2 text-center shrink-0"
                      style={{ background: f.type === "test" ? "#EFF6FF" : "#EDE9FE", minWidth:"52px" }}>
                      <p style={{ fontSize:"20px", fontWeight:800, color: f.type === "test" ? "#2563EB" : "#7C3AED", lineHeight:1 }}>{date ? format(date, "dd") : "—"}</p>
                      <p style={{ fontSize:"10px", fontWeight:700, color: f.type === "test" ? "#2563EB" : "#7C3AED", textTransform:"uppercase" }}>{date ? format(date, "MMM") : ""}</p>
                      <p style={{ fontSize:"10px", color:"var(--text-secondary)" }}>{date ? format(date, "EEE") : "No date"}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p style={{ fontSize:"15px", fontWeight:700, color:"var(--text-primary)" }}>{f.description}</p>
                          <span className="inline-block rounded-full px-2 py-0.5 text-xs font-bold mt-1"
                            style={{ background: f.type === "test" ? "#EFF6FF" : "#EDE9FE", color: f.type === "test" ? "#2563EB" : "#7C3AED" }}>
                            {f.type === "test" ? "Test" : "Appointment"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!isDone && (
                            <button onClick={() => markDone(f.description)}
                              className="text-xs font-bold rounded-lg px-2.5 py-1 transition-all"
                              style={{ background:"var(--brand-tint)", color:"var(--brand)", border:"1px solid var(--brand-tint-mid)" }}>
                              ✓ Mark as Done
                            </button>
                          )}
                          <button onClick={() => downloadICS(f)}
                            className="text-xs font-bold rounded-lg px-2.5 py-1 transition-all"
                            style={{ background:"var(--muted-fill)", color:"var(--text-secondary)", border:"1px solid var(--border)" }}>
                            📅 Add to Calendar
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" style={{ color:"var(--text-secondary)" }} aria-hidden="true" />
                          <span style={{ fontSize:"12px", color:"var(--text-secondary)" }}>{date ? format(date, "hh:mm a") : (f.when || "Date not specified")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reminder prompt */}
          <div className="rounded-2xl px-5 py-3 flex items-center justify-between gap-3"
            style={{ background:"var(--brand-tint)", border:"1.5px solid var(--brand-tint-mid)" }}>
            <div>
              <p style={{ fontSize:"14px", fontWeight:700, color:"var(--brand)" }}>Never miss an important follow-up!</p>
              <p style={{ fontSize:"12px", color:"var(--text-secondary)" }}>Enable reminders to get notified before your appointments and tests.</p>
            </div>
            <button className="rounded-xl px-3 py-2 text-sm font-bold shrink-0"
              style={{ background:"var(--brand)", color:"#fff", border:"none" }}>
              Set Reminders
            </button>
          </div>
        </div>

        {/* Right: calendar + tips + CTA */}
        <div className="space-y-4">
          <MonthCalendar followUps={plan.followUps ?? []} />
          <div className="rounded-2xl p-4" style={{ background:"var(--card)", border:"1.5px solid var(--border)" }}>
            <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)", marginBottom:"10px" }}>💡 Important Tips</p>
            <ul className="space-y-2 list-none p-0 m-0">
              {TIPS.map(t => (
                <li key={t} className="flex items-start gap-2">
                  <span className="rounded-full shrink-0 mt-1.5" style={{ width:6, height:6, background:"var(--brand)", display:"inline-block" }} />
                  <span style={{ fontSize:"12px", color:"var(--text-secondary)", lineHeight:1.5 }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <ContactProviderCTA message="Contact your clinic or care provider for assistance." />
        </div>
      </div>
    </div>
  );
}