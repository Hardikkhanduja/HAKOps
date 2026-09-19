import { useState } from "react";
import { CheckSquare, Heart } from "lucide-react";
import { useCarePlan } from "../context/CarePlanContext.js";
import PageHeader         from "../components/PageHeader.jsx";
import TabbedFilter       from "../components/TabbedFilter.jsx";
import ProgressStatCard   from "../components/ProgressStatCard.jsx";
import ContactProviderCTA from "../components/ContactProviderCTA.jsx";
import { primaryTimeLabel } from "../utils/taskHelpers.js";

const TASK_TIPS = [
  "Follow the tasks as recommended in your discharge paper.",
  "Set reminders so you do not miss them.",
  "Contact your doctor if you are unable to complete a task.",
  "Progress may vary for each person.",
];

export default function DailyTasks() {
  const { carePlan } = useCarePlan();
  const { patient, carePlan: plan } = carePlan;
  // daily tasks have no date — all go into Today tab (known simplification)
  // local state only — not persisted, backend has no write endpoints yet
  const tasks = plan.dailyTasks ?? [];
  const [checked, setChecked] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const checkedCount = Object.values(checked).filter(Boolean).length;

  function toggleTask(idx) {
    // local state only — not persisted, backend has no write endpoints yet
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  function markAllComplete() {
    // local state only — not persisted, backend has no write endpoints yet
    const all = {};
    tasks.forEach((_, i) => { all[i] = true; });
    setChecked(all);
  }

  const tabs = [
    { label:"Today",     count: tasks.length },
    { label:"This Week", count: 0 }, // no date field in contract — known simplification
    { label:"Upcoming",  count: 0 },
    { label:"Completed", count: checkedCount },
  ];

  const visibleTasks = activeTab === 3
    ? tasks.filter((_, i) => checked[i])
    : activeTab === 0
    ? tasks
    : []; // This Week / Upcoming — no date data, shown empty

  return (
    <div className="min-h-full pb-8">
      <PageHeader breadcrumb="Daily Tasks" patientName={patient.name} />

      {/* Title row */}
      <div className="flex items-center justify-between px-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl p-2.5" style={{ background:"var(--brand)" }}>
            <CheckSquare className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-primary)" }}>Daily Tasks</h2>
            <p style={{ fontSize:"13px", color:"var(--text-secondary)" }}>Complete these tasks every day to help your recovery.</p>
          </div>
        </div>
        <button onClick={markAllComplete}
          className="rounded-xl px-3 py-2 text-sm font-bold transition-all active:scale-95"
          style={{ background:"var(--brand)", color:"#ffffff", border:"none" }}
          aria-label="Mark all tasks as complete">
          ✓ Mark All Complete
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-6 pb-6">
        {/* Left: tasks list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress cards */}
          <div className="flex gap-3">
            <ProgressStatCard
              done={checkedCount} total={tasks.length}
              label="Today's Progress" sublabel={`${checkedCount} of ${tasks.length} tasks completed`} />
            <ProgressStatCard
              done={0} total={0}
              label="This Week" sublabel="0 of 0 tasks completed"
              color="#2563EB" />
            {/* Encouragement */}
            <div className="flex-1 rounded-2xl p-4 flex flex-col justify-center items-center text-center gap-1"
              style={{ background:"var(--brand-tint)", border:"1.5px solid var(--brand-tint-mid)" }}>
              <span className="text-2xl">🌟</span>
              <p style={{ fontSize:"13px", fontWeight:700, color:"var(--brand)" }}>Keep Going!</p>
              <p style={{ fontSize:"11px", color:"var(--text-secondary)", lineHeight:1.4 }}>Small steps every day make a big difference.</p>
            </div>
          </div>

          {/* Tabs */}
          <TabbedFilter tabs={tabs} active={activeTab} onChange={setActiveTab} />

          {/* Task list */}
          <div className="space-y-2">
            {visibleTasks.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background:"var(--muted-fill)", border:"2px dashed var(--border)" }}>
                <p style={{ fontSize:"14px", color:"var(--text-secondary)" }}>
                  {activeTab === 3 ? "No completed tasks yet." : "No tasks for this period."}
                </p>
              </div>
            ) : visibleTasks.map((task, rawIdx) => {
              const idx = activeTab === 3
                ? tasks.findIndex(t => t.description === task.description)
                : rawIdx;
              const isDone = !!checked[idx];
              return (
                <div key={idx} className="flex items-start gap-3 rounded-2xl px-4 py-3"
                  style={{ background:"var(--card)", border:"1.5px solid var(--border)",
                    borderLeft: isDone ? "4px solid #059669" : "4px solid var(--border)",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <input type="checkbox" checked={isDone} onChange={() => toggleTask(idx)}
                    style={{ accentColor:"var(--brand)", width:17, height:17, marginTop:"2px" }}
                    aria-label={`Mark "${task.description}" as done`} />
                  <div className="flex-1 min-w-0">
                    {isDone && (
                      <p style={{ fontSize:"11px", color:"#059669", fontWeight:600, marginBottom:"2px" }}>✓ Completed</p>
                    )}
                    <p style={{ fontSize:"15px", fontWeight:700, color:"var(--text-primary)",
                      textDecoration: isDone ? "line-through" : "none",
                      opacity: isDone ? 0.6 : 1 }}>{task.description}</p>
                    <p style={{ fontSize:"13px", color:"var(--text-secondary)" }}>{task.frequency}</p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold shrink-0"
                    style={{ background: isDone ? "#D1FAE5" : "var(--muted-fill)",
                      color: isDone ? "#059669" : "var(--text-secondary)" }}>
                    {primaryTimeLabel(task.frequency)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Encouragement footer */}
          <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
            style={{ background:"var(--brand-tint)", border:"1.5px solid var(--brand-tint-mid)" }}>
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5" style={{ color:"var(--brand)" }} aria-hidden="true" />
              <div>
                <p style={{ fontSize:"14px", fontWeight:700, color:"var(--brand)" }}>You are doing great!</p>
                <p style={{ fontSize:"12px", color:"var(--text-secondary)" }}>Consistency today leads to a healthier tomorrow.</p>
              </div>
            </div>
            <p style={{ fontSize:"11px", color:"var(--text-secondary)", textAlign:"right" }}>Small stops —<br/>brighter tomorrows</p>
          </div>
        </div>

        {/* Right: tips + CTA */}
        <div className="space-y-4">
          <div className="rounded-2xl p-4"
            style={{ background:"var(--card)", border:"1.5px solid var(--border)", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)", marginBottom:"10px" }}>💡 Task Tips</p>
            <ul className="space-y-2 list-none p-0 m-0">
              {TASK_TIPS.map(t => (
                <li key={t} className="flex items-start gap-2">
                  <span className="rounded-full shrink-0 mt-1.5" style={{ width:6, height:6, background:"var(--brand)", display:"inline-block" }} />
                  <span style={{ fontSize:"13px", color:"var(--text-secondary)", lineHeight:1.5 }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <ContactProviderCTA message="Have questions about your daily tasks? Reach out to your doctor or care provider." />
        </div>
      </div>
    </div>
  );
}