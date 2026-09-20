import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Pill, Calendar, MapPin, FileText, Bell, MessageCircle,
  CheckSquare, AlertTriangle, ChevronRight, RefreshCw, Clock,
} from "lucide-react";
import { format, parseISO, differenceInDays, differenceInHours } from "date-fns";
import { useCarePlan } from "../context/CarePlanContext.js";
import { earliestDateByType } from "../utils/carePlanHelpers.js";
import { primaryTimeLabel, bucketFollowUp } from "../utils/taskHelpers.js";
import ReviewRequiredBadge from "../components/ReviewRequiredBadge.jsx";
import { getUITranslations } from "../utils/uiTranslations.js";
import { getAuthSession } from "../utils/session.js";

/* ─── Greeting ────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
}

/* ─── Stat chip colours (compact, at-a-glance — decorative colour OK here) ── */
const CHIP_STYLES = [
  { bg: "#F0FBF4", border: "#86EFAC", iconBg: "#D1FAE5", iconColor: "#059669" },  // green — medicines
  { bg: "#F5F3FF", border: "#C4B5FD", iconBg: "#EDE9FE", iconColor: "#7C3AED" },  // purple — appointment
  { bg: "#EFF6FF", border: "#BFDBFE", iconBg: "#DBEAFE", iconColor: "#2563EB" },  // blue — test
  { bg: "#FFF7ED", border: "#FED7AA", iconBg: "#FFEDD5", iconColor: "#EA580C" },  // orange — reminder
];

/* ─── Today's Care tabs ───────────────────────────────────── */
const TABS = ["Today", "This Week", "Upcoming"];

function buildCareTabs(dailyTasks, followUps) {
  const now = new Date();
  const today = [], week = [], upcoming = [];

  // dailyTasks: no due date → all go into Today
  dailyTasks.forEach(t => {
    today.push({
      id: `task-${t.description}`,
      description: t.description,
      time: primaryTimeLabel(t.frequency),
      kind: "task",
    });
  });

  // followUps: bucket by date proximity
  followUps.forEach(f => {
    const item = {
      id: `fu-${f.description}`,
      description: f.description,
      time: f.date
        ? format(parseISO(f.date), "dd MMM yyyy")
        : (f.when || "Date not specified"),
      kind: "followup",
    };
    const bucket = bucketFollowUp(f.date, now);
    if (bucket === "today")    today.push(item);
    else if (bucket === "week") week.push(item);
    else                        upcoming.push(item);
  });

  return { today, week, upcoming };
}

/* ─── Next reminder helper ───────────────────────────────── */
function nearestReminderDays(reminders, followUps) {
  const now   = new Date();
  const dates = [];

  // From reminders[] field
  (reminders || []).forEach(r => {
    if (r.sendAt) dates.push(new Date(r.sendAt));
  });
  // Fallback: nearest followUp date
  (followUps || []).forEach(f => {
    if (f.date) dates.push(new Date(f.date));
  });

  const future = dates.filter(d => d > now).sort((a, b) => a - b);
  if (!future.length) return null;
  const days = differenceInDays(future[0], now);
  return { days, date: future[0] };
}

/* ─── Main component ─────────────────────────────────────── */
export default function Dashboard() {
  const { carePlan, id } = useCarePlan();
  const navigate          = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});

const { patient, carePlan: plan } = carePlan;

const authSession = getAuthSession();
const loggedInUser = authSession?.user;

const displayName =
  loggedInUser?.name ||
  patient?.name ||
  "Patient";

const t = getUITranslations(patient?.preferredLanguage || "en");
  const meds       = plan.medications              || [];
  const followUps  = plan.followUps                || [];
  const tasks      = plan.dailyTasks               || [];
  const warnings   = plan.warningSigns             || [];
  const reminders  = carePlan.reminders            || [];

  const greetingKey =
    new Date().getHours() < 12
      ? "goodMorning"
      : new Date().getHours() < 17
        ? "goodAfternoon"
        : "goodEvening";

  const greeting = t[greetingKey];
  const careTabs   = buildCareTabs(tasks, followUps);
  const tabItems   = [careTabs.today, careTabs.week, careTabs.upcoming];
  const tabLabels  = [`Today (${careTabs.today.length})`, `This Week (${careTabs.week.length})`, `Upcoming (${careTabs.upcoming.length})`];

  // Stat chips
  const nearestAppt = followUps
    .filter(f => f.type === "appointment" || f.type === "follow-up")
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    })[0];
  const nearestTest = followUps.filter(f => f.type === "test").sort((a,b) => a.date < b.date ? -1 : 1)[0];
  const nextRemind  = nearestReminderDays(reminders, followUps);

  const chips = [
    {
      label: t.medicines,
      value: meds.length.toString(),
      sub: `${meds.length} active`,
      icon: Pill,
      ...CHIP_STYLES[0],
    },
    {
      label: t.nextAppointment,
      value: nearestAppt
        ? (nearestAppt.date ? format(parseISO(nearestAppt.date), "dd MMM yyyy") : (nearestAppt.when || "Date not specified"))
        : "None",
      sub: nearestAppt ? nearestAppt.description : "No appointment",
      icon: Calendar,
      ...CHIP_STYLES[1],
    },
    {
      label: t.nextTest,
      value: nearestTest
        ? (nearestTest.date ? format(parseISO(nearestTest.date), "dd MMM yyyy") : (nearestTest.when || "Date not specified"))
        : "None",
      sub: nearestTest ? nearestTest.description : "No test",
      icon: CheckSquare,
      ...CHIP_STYLES[2],
    },
    {
      label: t.nextReminder,
      value: nextRemind ? `${nextRemind.days} day${nextRemind.days !== 1 ? "s" : ""}` : "None",
      sub: nextRemind ? format(nextRemind.date, "dd MMM yyyy") : "No reminders",
      icon: Bell,
      ...CHIP_STYLES[3],
    },
  ];

  function toggle(itemId) {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  return (
    <div className="min-h-full pb-8" style={{ background: "var(--surface)" }}>

      {/* ── Breadcrumb + tagline ── */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          {t.overview} &rsaquo; <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{t.dashboard}</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="rounded-xl px-4 py-1.5" style={{ background: "var(--brand)", color: "#fff", fontSize: "12px", fontWeight: 600 }}>
            {t.smallSteps}
          </div>
          <button onClick={() => window.location.reload()}
            className="rounded-xl p-1.5 border transition-colors hover:bg-gray-50"
            style={{ border: "1px solid var(--border)" }}
            aria-label="Refresh">
            <RefreshCw className="h-3.5 w-3.5" style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Greeting ── */}
      <div className="px-6 pb-4">
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          {greeting}, {displayName} 👋
        </h1>
      </div>

      <div className="px-6 space-y-5">

        {/* ── Today's Update — stat chips ── */}
        <section aria-labelledby="update-heading">
          <h2 id="update-heading" style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>
            {t.todaysUpdate}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {chips.map((c) => {
              const Icon = c.icon;
              return (
                <motion.div key={c.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4"
                  style={{ background: c.bg, border: `1.5px solid ${c.border}`, minHeight: "80px" }}>
                  <div className="flex items-start justify-between mb-2">
                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: c.iconColor }}>
                      {c.label}
                    </p>
                    <div className="rounded-lg p-1.5" style={{ background: c.iconBg }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: c.iconColor }} aria-hidden="true" />
                    </div>
                  </div>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>{c.value}</p>
                  <p style={{ fontSize: "12px", color: c.iconColor, marginTop: "2px", fontWeight: 500 }}>{c.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

          {/* ── Left: Today's Care tabs ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" style={{ color: "var(--brand)" }} aria-hidden="true" />
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{t.todaysCare}</h2>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>
                {format(new Date(), "EEE, dd MMM yyyy")}
              </p>
            </div>
            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-0">
              {tabLabels.map((t, i) => (
                <button key={i} onClick={() => setActiveTab(i)}
                  className="rounded-full px-3 py-1 text-sm font-semibold transition-all"
                  style={{
                    background:  activeTab === i ? "var(--brand)" : "var(--muted-fill)",
                    color:       activeTab === i ? "#ffffff"      : "var(--text-secondary)",
                    fontSize:    "12px",
                    border:      "none",
                  }}>
                  {t}
                </button>
              ))}
            </div>
            {/* Items */}
            <ul className="divide-y px-0 py-2 m-0 list-none" style={{ borderColor: "var(--border)", minHeight: "160px" }}>
              {tabItems[activeTab].length === 0 ? (
                <li className="px-5 py-6 text-center">
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{t.noItems}</p>
                </li>
              ) : tabItems[activeTab].map(item => (
                <li key={item.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "var(--border)" }}>
                  <input
                    type="checkbox"
                    checked={!!checkedItems[item.id]}
                    onChange={() => toggle(item.id)}
                    className="rounded shrink-0 cursor-pointer"
                    style={{ accentColor: "var(--brand)", width: 16, height: 16 }}
                    aria-label={`Mark "${item.description}" as done`}
                  />
                  <div className="flex-1 min-w-0">
                    <p style={{
                      fontSize: "14px", fontWeight: 600, color: "var(--text-primary)",
                      textDecoration: checkedItems[item.id] ? "line-through" : "none",
                      opacity: checkedItems[item.id] ? 0.5 : 1,
                    }}>{item.description}</p>
                    {item.kind === "task" && (
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {item.description.toLowerCase().includes("tablet") || item.description.toLowerCase().includes("medicine") ? "1 tablet" : ""}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: "var(--muted-fill)", color: "var(--text-secondary)", fontSize: "11px" }}>
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
            {/* Footer */}
            <div className="px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => navigate("tasks")}
                style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}>
                {t.viewAllTasks}
              </button>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4">

            {/* Medicines card */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4" style={{ color: "var(--brand)" }} aria-hidden="true" />
                  <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t.medicines}</h2>
                </div>
                <span className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: "#D1FAE5", color: "#059669" }}>
                  {meds.length} ACTIVE
                </span>
              </div>
              <ul className="divide-y list-none p-0 m-0" style={{ borderColor: "var(--border)" }}>
                {meds.slice(0, 2).map((med, i) => (
                  <li key={i} className="px-5 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{med.name}</p>
                      {med.reviewRequired === true && <ReviewRequiredBadge />}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {med.dosage} &middot; {med.timing}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="px-5 py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => navigate("medications")}
                  style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}>
                  {t.viewAllMedicines}
                </button>
              </div>
            </div>

            {/* Upcoming Appointments & Tests */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" style={{ color: "#7C3AED" }} aria-hidden="true" />
                  <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t.upcomingAppointmentsTests}</h2>
                </div>
                <span className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: "#EDE9FE", color: "#7C3AED" }}>
                  {followUps.length} UPCOMING
                </span>
              </div>
              <ul className="divide-y list-none p-0 m-0" style={{ borderColor: "var(--border)" }}>
                {followUps.slice(0, 2).map((f, i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="rounded-lg p-1.5 shrink-0"
                      style={{ background: f.type === "appointment" ? "#EDE9FE" : "#DBEAFE" }}>
                      <Calendar className="h-3.5 w-3.5"
                        style={{ color: f.type === "appointment" ? "#7C3AED" : "#2563EB" }}
                        aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{f.description}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {f.date
                          ? `${format(parseISO(f.date), "dd MMM yyyy")} · ${f.type === "test" ? "Medical Test" : "Appointment"}`
                          : `${f.when || "Date not specified"} · ${f.type === "test" ? "Medical Test" : "Appointment"}`}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
                  </li>
                ))}
              </ul>
              <div className="px-5 py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => navigate("followups")}
                  style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}>
                  View all follow-ups +
                </button>
              </div>
            </div>

            {/* {t.importantSafety} */}
            {warnings.length > 0 && (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "#FEF2F2", border: "1.5px solid var(--status-danger-border)", boxShadow: "0 2px 8px rgba(192,57,43,0.08)" }}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "#FCA5A5" }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" style={{ color: "var(--status-danger)" }} aria-hidden="true" />
                    <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--status-danger)" }}>{t.importantSafety}</h2>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: "var(--status-danger)", color: "#fff" }}>
                    {warnings.length} WARNINGS
                  </span>
                </div>
                <div className="px-5 pt-3 pb-2">
                  <p style={{ fontSize: "12px", color: "#7F1D1D", marginBottom: "8px", lineHeight: 1.5 }}>
                    {t.contactPhysician}
                  </p>
                </div>
                <ul className="divide-y list-none p-0 m-0" style={{ borderColor: "#FCA5A5" }}>
                  {warnings.slice(0, 3).map((w, i) => (
                    <li key={i} className="flex items-center gap-3 px-5 py-2.5">
                      <span style={{ color: "var(--status-danger)", fontSize: "12px" }}>&bull;</span>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#7F1D1D", flex: 1 }}>{w}</p>
                      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#FCA5A5" }} aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── {t.quickActions} ── */}
        <section aria-labelledby="qa-heading">
          <h2 id="qa-heading" style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>
            {t.quickActions}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: t.findPharmacy,
                sub:   t.locateStore,
                icon:  MapPin,
                color: "#059669",
                bg:    "#D1FAE5",
                border:"#A7F3D0",
                action: () => navigate("pharmacy"),
              },
              {
                label: t.originalPdf,
                sub:   t.downloadPaper,
                icon:  FileText,
                color: "#2563EB",
                bg:    "#DBEAFE",
                border:"#BFDBFE",
                action: () => navigate("document"),
              },
              {
                label: "{t.reminders}",
                sub:   t.alertTriggers,
                icon:  Bell,
                color: "#7C3AED",
                bg:    "#EDE9FE",
                border:"#C4B5FD",
                action: () => navigate("reminders"),
              },
              {
                label: t.openWhatsApp,
                sub:   t.directSupport,
                icon:  MessageCircle,
                color: "#EA580C",
                bg:    "#FFEDD5",
                border:"#FED7AA",
                action: () => navigate("pharmacy"),
              },
            ].map(({ label, sub, icon: Icon, color, bg, border, action }) => (
              <motion.button key={label} onClick={action} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl py-4 px-3 transition-all"
                style={{ background: bg, border: `1.5px solid ${border}`, minHeight: "90px" }}>
                <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.6)" }}>
                  <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
                </div>
                <p style={{ fontSize: "13px", fontWeight: 700, color }}>{label}</p>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{sub}</p>
              </motion.button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
