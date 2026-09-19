import { useState } from "react";
import { Utensils, Activity, Droplets, TrendingUp } from "lucide-react";
import { useCarePlan } from "../context/CarePlanContext.js";
import PageHeader from "../components/PageHeader.jsx";

/**
 * DietActivity — demo content layered over real dietActivityRestrictions strings.
 * The API contract only provides flat strings (e.g. "No heavy lifting for 2 weeks").
 * Meal plan and activity plan sections are illustrative demo content, not real
 * nutritional data. Code comments mark demo vs real content throughout.
 */

// Demo meal plan — illustrative, not from contract
const DEMO_MEALS = [
  { time:"06:00 AM", label:"Breakfast", desc:"Oats with fruits", detail:"Oats, banana, almonds and low-fat milk", emoji:"🥣" },
  { time:"01:00 PM", label:"Lunch",     desc:"Dal, brown rice and vegetables", detail:"Mung dal, brown rice, steamed vegetables, salad...", emoji:"🍚" },
  { time:"07:30 PM", label:"Dinner",    desc:"Light Khichdi", detail:"Mung dal khichdi with vegetables and a glass of warm...", emoji:"🫕" },
];

// Demo activity plan — illustrative, not from contract
const DEMO_ACTIVITIES = [
  { label:"Walking",            desc:"Brisk walk at a comfortable pace",  dur:"20 min",  icon:"🚶" },
  { label:"Breathing Exercise", desc:"Deep breathing to reduce stress",   dur:"5 min",   icon:"🌬" },
  { label:"Light Stretching",   desc:"Gentle stretches for flexibility",  dur:"10 min",  icon:"🧘" },
];

const TABS = ["Overview", "Diet Plan", "Activity Plan"];

export default function DietActivity() {
  const { carePlan } = useCarePlan();
  const { patient, carePlan: plan } = carePlan;
  const restrictions = plan.dietActivityRestrictions ?? [];
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-full pb-8">
      <PageHeader breadcrumb="Diet & Activity" patientName={patient.name} />

      {/* Title + tabs */}
      <div className="px-6 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-2xl p-2.5" style={{ background:"#92400E" }}>
            <Utensils className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-primary)" }}>Diet &amp; Activity</h2>
            <p style={{ fontSize:"13px", color:"var(--text-secondary)" }}>Follow these recommendations to support your recovery and overall well-being.</p>
          </div>
          <div className="ml-auto rounded-xl px-3 py-1.5 flex items-center gap-2 shrink-0"
            style={{ background:"var(--brand-tint)", border:"1px solid var(--brand-tint-mid)" }}>
            <span style={{ fontSize:"11px", color:"var(--brand)", fontWeight:600 }}>🌱 Healthy choices today, a stronger tomorrow.</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)}
              className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
              style={{ background: activeTab===i ? "var(--brand)" : "var(--muted-fill)", color: activeTab===i ? "#fff" : "var(--text-secondary)", border:"none" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 0 && (
        <div className="px-6 space-y-5">
          {/* Stat chips */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon:Utensils,   label:"Meals Today",    value:"3 / 4",  sub:"Remaining",   color:"#92400E", bg:"#FFFBEB", border:"#FCD34D" },
              { icon:Activity,   label:"Activity Goal",  value:"20",     sub:"30 min",       color:"#2563EB", bg:"#EFF6FF", border:"#BFDBFE" },
              { icon:Droplets,   label:"Water Intake",   value:"4",      sub:"8 glasses",    color:"#0369A1", bg:"#E0F2FE", border:"#93C5FD" },
              { icon:TrendingUp, label:"Daily Progress", value:"Good",   sub:"Keep it up!",  color:"#059669", bg:"#D1FAE5", border:"#6EE7B7" },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="rounded-2xl px-4 py-3" style={{ background:c.bg, border:`1.5px solid ${c.border}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:c.color }}>{c.label}</p>
                    <Icon className="h-3.5 w-3.5" style={{ color:c.color }} aria-hidden="true" />
                  </div>
                  <p style={{ fontSize:"20px", fontWeight:800, color:"var(--text-primary)", lineHeight:1 }}>{c.value}</p>
                  <p style={{ fontSize:"11px", color:"var(--text-secondary)", marginTop:"1px" }}>{c.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Today's Meal Plan — demo content */}
            <div className="rounded-2xl overflow-hidden" style={{ background:"var(--card)", border:"1.5px solid var(--border)", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)" }}>📋 Today's Meal Plan</p>
                <button style={{ fontSize:"12px", color:"var(--brand)", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>View Full Plan →</button>
              </div>
              <p style={{ fontSize:"12px", color:"var(--text-secondary)", paddingLeft:"16px", paddingBottom:"8px" }}>
                Nutritious meals to keep you healthy and energised.
              </p>
              {/* Demo meals — illustrative, not from contract */}
              <ul className="divide-y list-none p-0 m-0" style={{ borderColor:"var(--border)" }}>
                {DEMO_MEALS.map(m => (
                  <li key={m.label} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-2xl shrink-0">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text-primary)" }}>{m.label}</p>
                        <span style={{ fontSize:"11px", color:"var(--text-secondary)" }}>⏰ {m.time}</span>
                      </div>
                      <p style={{ fontSize:"12px", color:"var(--text-secondary)", marginTop:"1px" }}>{m.desc}</p>
                      <p style={{ fontSize:"11px", color:"var(--text-secondary)", opacity:0.7 }}>{m.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 flex items-start gap-2" style={{ background:"#D1FAE5" }}>
                <span style={{ fontSize:"16px" }}>💡</span>
                <p style={{ fontSize:"12px", color:"#059669", fontWeight:500 }}>
                  Nutrition Tip: Choose fresh, home-cooked meals and limit processed or fried foods for better recovery.
                </p>
              </div>
            </div>

            {/* Activity Plan — demo content */}
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden" style={{ background:"var(--card)", border:"1.5px solid var(--border)", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)" }}>⚡ Activity Plan</p>
                  <button style={{ fontSize:"12px", color:"var(--brand)", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>View Full Plan →</button>
                </div>
                <p style={{ fontSize:"12px", color:"var(--text-secondary)", paddingLeft:"16px", paddingBottom:"8px" }}>
                  Simple activities to keep you active and strong
                </p>
                <ul className="divide-y list-none p-0 m-0" style={{ borderColor:"var(--border)" }}>
                  {DEMO_ACTIVITIES.map(a => (
                    <li key={a.label} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-xl shrink-0">{a.icon}</span>
                      <div className="flex-1">
                        <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text-primary)" }}>{a.label}</p>
                        <p style={{ fontSize:"12px", color:"var(--text-secondary)" }}>{a.desc}</p>
                      </div>
                      <span style={{ fontSize:"12px", color:"var(--brand)", fontWeight:600 }}>⏱ {a.dur}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Motivational pill */}
              <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background:"var(--brand)", color:"#fff" }}>
                <span style={{ fontSize:"20px" }}>🌟</span>
                <div>
                  <p style={{ fontSize:"13px", fontWeight:700 }}>Small steps every day</p>
                  <p style={{ fontSize:"12px", opacity:0.8 }}>make a big difference.</p>
                </div>
                <span style={{ fontSize:"20px", marginLeft:"auto" }}>✓</span>
              </div>

              {/* Real restrictions from contract */}
              {restrictions.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background:"var(--card)", border:"1.5px solid var(--border)" }}>
                  <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)", marginBottom:"8px" }}>💡 Things to Keep in Mind</p>
                  <ul className="space-y-2 list-none p-0 m-0">
                    {restrictions.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="rounded-full shrink-0 mt-1.5" style={{ width:6, height:6, background:"var(--brand)", display:"inline-block" }} />
                        <span style={{ fontSize:"12px", color:"var(--text-secondary)", lineHeight:1.5 }}>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="px-6 text-center py-16">
          <p style={{ fontSize:"16px", fontWeight:700, color:"var(--text-secondary)" }}>Full Diet Plan</p>
          <p style={{ fontSize:"14px", color:"var(--text-secondary)", marginTop:"6px" }}>
            Detailed diet plans will be available when your care provider adds structured meal data.
          </p>
        </div>
      )}
      {activeTab === 2 && (
        <div className="px-6 text-center py-16">
          <p style={{ fontSize:"16px", fontWeight:700, color:"var(--text-secondary)" }}>Full Activity Plan</p>
          <p style={{ fontSize:"14px", color:"var(--text-secondary)", marginTop:"6px" }}>
            Detailed activity plans will be available when your care provider adds structured activity data.
          </p>
        </div>
      )}
    </div>
  );
}