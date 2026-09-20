import { motion } from "framer-motion";
import { AlertCircle, Calendar, CheckSquare, Utensils, Pill, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCarePlan } from "../context/CarePlanContext.js";
import MedicationCard from "./MedicationCard.jsx";

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } } };

/*
  CareSetu Detail Row design:
  - min-height 56px (tap-friendly)
  - White card, neutral border, semantic LEFT border only for urgency
  - Chevron on right to signal tappability on detail rows? No — these are
    informational, not navigable further. Chevron reserved for dashboard cards.
  - Warning rows: thick red left border + red text, bold emphasis
  - Body text: 17px var(--text-primary). Metadata: 14-15px var(--text-secondary)
*/
const SECTION_CONFIG = {
  medications: {
    title: "Medicines", titleHi: "दवाइयाँ",
    subtitle: "Take each medicine exactly as written. Confirm with your doctor or pharmacist if any are marked Review Required.",
    icon: Pill, iconColor: "var(--brand)", iconBg: "var(--brand-tint)",
    headerBg: "var(--brand-tint)", headerBorder: "var(--brand)",
    getItems: (cp) => cp.carePlan.medications ?? [],
    renderItem: (item, i) => (
      <motion.li key={i} variants={itemVariants} className="list-none">
        <MedicationCard medication={item} />
      </motion.li>
    ),
  },
  followups: {
    title: "Follow-ups", titleHi: "फॉलो-अप",
    subtitle: "Attend all appointments and tests as scheduled. Add them to your calendar.",
    icon: Calendar, iconColor: "#6D28D9", iconBg: "#EDE9FE",
    headerBg: "#EDE9FE", headerBorder: "#8B5CF6",
    getItems: (cp) => cp.carePlan.followUps ?? [],
    renderItem: (item, i) => (
      <motion.li key={i} variants={itemVariants}
        className="list-none flex items-center gap-4 rounded-xl px-4"
        style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderLeft: "4px solid #8B5CF6", minHeight: "64px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <Calendar className="h-5 w-5 shrink-0" style={{ color: "#6D28D9" }} aria-hidden="true" />
        <div className="flex-1 py-3 min-w-0">
          <p style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.35 }}>{item.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#6D28D9" }}>
              {item.date
                ? format(parseISO(item.date), "MMMM dd, yyyy")
                : (item.when || "Date not specified")}
            </span>
            <span className="text-xs rounded-full px-2 py-0.5 font-bold capitalize"
              style={{ background: "#EDE9FE", color: "#5B21B6" }}>{item.type}</span>
          </div>
        </div>
      </motion.li>
    ),
  },
  tasks: {
    title: "Daily Tasks", titleHi: "दैनिक कार्य",
    subtitle: "Complete these tasks every day to support your recovery.",
    icon: CheckSquare, iconColor: "#1D4ED8", iconBg: "#DBEAFE",
    headerBg: "#DBEAFE", headerBorder: "#3B82F6",
    getItems: (cp) => cp.carePlan.dailyTasks ?? [],
    renderItem: (item, i) => (
      <motion.li key={i} variants={itemVariants}
        className="list-none flex items-center gap-4 rounded-xl px-4"
        style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderLeft: "4px solid #3B82F6", minHeight: "64px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <CheckSquare className="h-5 w-5 shrink-0" style={{ color: "#1D4ED8" }} aria-hidden="true" />
        <div className="flex-1 py-3 min-w-0">
          <p style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>{item.description}</p>
          <span className="inline-block text-xs font-bold rounded-full px-2.5 py-0.5 mt-1"
            style={{ background: "#DBEAFE", color: "#1D4ED8" }}>{item.frequency}</span>
        </div>
      </motion.li>
    ),
  },
  warnings: {
    title: "Warning Signs", titleHi: "चेतावनी के संकेत",
    subtitle: "If you notice ANY of these, go to a hospital or call your doctor immediately. Do not wait.",
    icon: AlertCircle, iconColor: "var(--status-danger)", iconBg: "var(--status-danger-bg)",
    headerBg: "var(--status-danger-bg)", headerBorder: "var(--status-danger)",
    getItems: (cp) => cp.carePlan.warningSigns ?? [],
    renderItem: (item, i) => (
      <motion.li key={i} variants={itemVariants}
        className="list-none flex items-center gap-4 rounded-xl px-4"
        style={{ background: "#FFF5F5", border: "1.5px solid var(--status-danger-border)", borderLeft: "4px solid var(--status-danger)", minHeight: "64px", boxShadow: "0 1px 4px rgba(192,57,43,0.08)" }}>
        <AlertCircle className="h-5 w-5 shrink-0" style={{ color: "var(--status-danger)" }} aria-hidden="true" />
        <p style={{ fontSize: "17px", fontWeight: 700, color: "#7F1D1D", paddingTop: "12px", paddingBottom: "12px" }}>{item}</p>
      </motion.li>
    ),
  },
  diet: {
    title: "Diet & Activity", titleHi: "खान-पान और गतिविधि",
    subtitle: "Follow these restrictions carefully to help your recovery.",
    icon: Utensils, iconColor: "#92400E", iconBg: "#FEF3C7",
    headerBg: "#FEF3C7", headerBorder: "#D97706",
    getItems: (cp) => cp.carePlan.dietActivityRestrictions ?? [],
    renderItem: (item, i) => (
      <motion.li key={i} variants={itemVariants}
        className="list-none flex items-center gap-4 rounded-xl px-4"
        style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderLeft: "4px solid #D97706", minHeight: "64px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <Utensils className="h-5 w-5 shrink-0" style={{ color: "#92400E" }} aria-hidden="true" />
        <p style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", paddingTop: "12px", paddingBottom: "12px" }}>{item}</p>
      </motion.li>
    ),
  },
};

export default function DetailSection({ section }) {
  const { carePlan } = useCarePlan();
  const cfg = SECTION_CONFIG[section];
  const SectionIcon = cfg.icon;
  const items = cfg.getItems(carePlan);

  return (
    <motion.main className="max-w-3xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      aria-labelledby="section-title">

      {/* Section hero — semantic header, not arbitrary pastel */}
      <div className="rounded-2xl px-6 py-5 mb-6 flex items-start gap-4"
        style={{ background: cfg.headerBg, border: `1.5px solid ${cfg.headerBorder}` }}>
        <div className="rounded-2xl p-3 shrink-0" style={{ background: cfg.iconColor }}>
          <SectionIcon className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 id="section-title" style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            {cfg.title}
          </h1>
          {cfg.titleHi && (
            <p style={{ fontSize: "15px", fontWeight: 600, color: cfg.iconColor, marginTop: "2px" }}>{cfg.titleHi}</p>
          )}
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.55, marginTop: "6px" }}>
            {cfg.subtitle}
          </p>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-secondary)" }}>
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--muted-fill)", border: "2px dashed var(--border)" }}>
          <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-secondary)" }}>No items recorded</p>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginTop: "4px" }}>Your doctor has not listed anything here.</p>
        </div>
      ) : (
        <motion.ul className="space-y-2.5 p-0 m-0" variants={listVariants} initial="hidden" animate="show">
          {items.map((it, i) => cfg.renderItem(it, i))}
        </motion.ul>
      )}
    </motion.main>
  );
}