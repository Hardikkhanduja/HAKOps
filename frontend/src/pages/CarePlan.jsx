import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pill, Calendar, CheckSquare, AlertCircle, Utensils, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCarePlan } from "../context/CarePlanContext.js";
import PageHeader        from "../components/PageHeader.jsx";
import ContactProviderCTA from "../components/ContactProviderCTA.jsx";

const CHIP_CFG = [
  { key:"medications",             label:"MEDICINES",      color:"#0F6B5C", bg:"#E8F5F2", border:"#A7D7CF", icon:Pill,         path:"medications" },
  { key:"followUps",               label:"FOLLOW-UPS",     color:"#7C3AED", bg:"#F5F3FF", border:"#C4B5FD", icon:Calendar,     path:"followups"   },
  { key:"dailyTasks",              label:"DAILY TASKS",    color:"#2563EB", bg:"#EFF6FF", border:"#BFDBFE", icon:CheckSquare,  path:"tasks"       },
  { key:"warningSigns",            label:"WARNING SIGNS",  color:"#C0392B", bg:"#FEF2F2", border:"#FCA5A5", icon:AlertCircle,  path:"warnings"    },
  { key:"dietActivityRestrictions",label:"DIET & ACTIVITY",color:"#92400E", bg:"#FFFBEB", border:"#FCD34D", icon:Utensils,     path:"diet"        },
];

const QUICK_LINKS = [
  { key:"medications",              label:"Medicines",      color:"#0F6B5C", path:"medications", desc:"Take each medicine exactly as written. Confirm with your doctor or pharmacist if unsure." },
  { key:"followUps",                label:"Follow-ups",     color:"#7C3AED", path:"followups",   desc:"Attend all appointments and tests as scheduled. Mark them in your calendar." },
  { key:"dailyTasks",               label:"Daily Tasks",    color:"#2563EB", path:"tasks",       desc:"Complete these tasks every day to help your recovery." },
  { key:"warningSigns",             label:"Warning Signs",  color:"#C0392B", path:"warnings",    desc:"If you notice any of these, contact your doctor or go to the hospital immediately." },
  { key:"dietActivityRestrictions", label:"Diet & Activity",color:"#92400E", path:"diet",        desc:"Follow these restrictions carefully to support your recovery." },
];

const countOf = (cp, key) => {
  if (key === "followUps")                return cp.followUps?.length ?? 0;
  if (key === "warningSigns")             return cp.warningSigns?.length ?? 0;
  if (key === "dailyTasks")               return cp.dailyTasks?.length ?? 0;
  if (key === "medications")              return cp.medications?.length ?? 0;
  if (key === "dietActivityRestrictions") return cp.dietActivityRestrictions?.length ?? 0;
  return 0;
};

const VIEW_LABELS = {
  medications:"View Medicines", followUps:"View Follow-ups →", dailyTasks:"View Daily Tasks →",
  warningSigns:"View Warning Signs →", dietActivityRestrictions:"View Diet & Activity →",
};

export default function CarePlan() {
  const { carePlan } = useCarePlan();
  const navigate      = useNavigate();
  const { patient, carePlan: plan, originalDocument } = carePlan;

  const uploadedDate = originalDocument?.uploadedAt
    ? format(parseISO(originalDocument.uploadedAt), "dd MMM yyyy") : "—";

  const cardAnim = { hidden:{opacity:0,y:12}, show:{opacity:1,y:0,transition:{duration:0.28,ease:"easeOut"}} };
  const container = { hidden:{}, show:{transition:{staggerChildren:0.06}} };

  return (
    <div className="min-h-full pb-8">
      <PageHeader breadcrumb="Care Plan" patientName={patient.name} />

      {/* Title */}
      <div className="px-6 pb-3">
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Your Care Plan</h2>
      </div>

      {/* Stat chip row */}
      <div className="flex gap-2 px-6 pb-4 overflow-x-auto">
        {CHIP_CFG.map(c => {
          const Icon  = c.icon;
          const count = countOf(plan, c.key);
          return (
            <button key={c.key} onClick={() => navigate(c.path)}
              className="flex-1 min-w-[110px] rounded-2xl px-3 py-2.5 text-left transition-all hover:shadow-md active:scale-95"
              style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
              aria-label={`${c.label}: ${count} items`}>
              <div className="flex items-center justify-between mb-1">
                <div className="rounded-lg p-1.5" style={{ background: c.color }}>
                  <Icon className="h-3 w-3 text-white" aria-hidden="true" />
                </div>
                <ChevronRight className="h-3 w-3" style={{ color: c.color }} aria-hidden="true" />
              </div>
              <p style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: c.color }}>{c.label}</p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>{count}</p>
              <p style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{count === 1 ? "Item" : "Items"}</p>
            </button>
          );
        })}
      </div>

      {/* Care Plan Summary */}
      <div className="mx-6 mb-5 rounded-2xl px-5 py-3 flex items-center gap-3 flex-wrap"
        style={{ background:"var(--muted-fill)", border:"1.5px solid var(--border)" }}>
        <div className="rounded-lg p-1.5" style={{ background:"var(--brand-tint)" }}>
          <CheckSquare className="h-4 w-4" style={{ color:"var(--brand)" }} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text-primary)" }}>Care Plan Summary</p>
          <p style={{ fontSize:"12px", color:"var(--text-secondary)" }}>
            Here is a quick overview of your care plan. Use the sections below to see full details.
          </p>
        </div>
        <div className="flex gap-4">
          {[["Start Date", uploadedDate], ["Last Updated", uploadedDate]].map(([lbl, val]) => (
            <div key={lbl} className="text-center">
              <p style={{ fontSize:"10px", color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{lbl}</p>
              <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text-primary)" }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-6 mb-5">
        <h3 style={{ fontSize:"15px", fontWeight:700, color:"var(--text-primary)", marginBottom:"12px" }}>
          Quick Links →
        </h3>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" variants={container} initial="hidden" animate="show">
          {QUICK_LINKS.map(ql => {
            const count = countOf(plan, ql.key);
            return (
              <motion.button key={ql.key} variants={cardAnim} onClick={() => navigate(ql.path)}
                className="text-left rounded-2xl p-4 transition-all hover:shadow-md active:scale-95"
                style={{ background:"var(--card)", border:`1.5px solid var(--border)`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg p-1.5" style={{ background:ql.color }}>
                      <CheckSquare className="h-3 w-3 text-white" aria-hidden="true" />
                    </div>
                    <span style={{ fontSize:"12px", color:"var(--text-secondary)" }}>{count} Items</span>
                  </div>
                  <span style={{ fontSize:"11px", fontWeight:700, color:ql.color }}>
                    {VIEW_LABELS[ql.key]}
                  </span>
                </div>
                <p style={{ fontSize:"15px", fontWeight:700, color:ql.color }}>{ql.label}</p>
                <p style={{ fontSize:"12px", color:"var(--text-secondary)", marginTop:"4px", lineHeight:1.5 }}>{ql.desc}</p>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <ContactProviderCTA />
    </div>
  );
}