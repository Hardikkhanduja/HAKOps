import { useState } from "react";
import { Printer, Pill, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useCarePlan } from "../context/CarePlanContext.js";
import PageHeader         from "../components/PageHeader.jsx";
import ReviewRequiredBadge from "../components/ReviewRequiredBadge.jsx";
import ContactProviderCTA from "../components/ContactProviderCTA.jsx";

export default function Medicines() {
  const { carePlan } = useCarePlan();
  const { patient, carePlan: plan } = carePlan;
  const meds = plan.medications ?? [];

  const totalCount      = meds.length;
  const activeCount     = meds.length; // all are active in current contract
  const reviewCount     = meds.filter(m => m.reviewRequired === true).length;
  const completedCount  = 0; // no completion tracking in contract

  const chips = [
    { label:"TOTAL",       value:totalCount,     color:"#0F6B5C", bg:"#E8F5F2", border:"#A7D7CF" },
    { label:"ACTIVE",      value:activeCount,    color:"#2563EB", bg:"#EFF6FF", border:"#BFDBFE" },
    { label:"NEED REVIEW", value:reviewCount,    color:"#92400E", bg:"#FFFBEB", border:"#FCD34D" },
    { label:"COMPLETED",   value:completedCount, color:"#5B6560", bg:"var(--muted-fill)", border:"var(--border)" },
  ];

  return (
    <div className="min-h-full pb-8">
      <PageHeader breadcrumb="Medicines" patientName={patient.name} />

      {/* Title + Print */}
      <div className="flex items-center justify-between px-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl p-2.5" style={{ background:"var(--brand)" }}>
            <Pill className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-primary)" }}>Medicines</h2>
            <p style={{ fontSize:"13px", color:"var(--text-secondary)" }}>Take as prescribed. Do not skip doses.</p>
          </div>
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-sm transition-all hover:bg-gray-50"
          style={{ border:"1.5px solid var(--border)", background:"var(--card)", color:"var(--text-primary)" }}
          aria-label="Print medicine list">
          <Printer className="h-4 w-4" aria-hidden="true" /> Print List
        </button>
      </div>

      {/* Stat chips */}
      <div className="flex gap-2 px-6 pb-4 overflow-x-auto">
        {chips.map(c => (
          <div key={c.label} className="flex-1 min-w-[90px] rounded-2xl px-3 py-2.5"
            style={{ background:c.bg, border:`1.5px solid ${c.border}` }}>
            <p style={{ fontSize:"9px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:c.color }}>{c.label}</p>
            <p style={{ fontSize:"22px", fontWeight:800, color:"var(--text-primary)", lineHeight:1.1, marginTop:"2px" }}>{c.value}</p>
            <p style={{ fontSize:"10px", color:"var(--text-secondary)" }}>{c.value === 1 ? "Item" : "Items"}</p>
          </div>
        ))}
      </div>

      {/* Important banner */}
      <div className="mx-6 mb-4 rounded-2xl px-4 py-3 flex items-start gap-2"
        style={{ background:"#FFFBEB", border:"1.5px solid #FCD34D" }}>
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color:"#92400E" }} aria-hidden="true" />
        <p style={{ fontSize:"13px", color:"#92400E", lineHeight:1.5 }}>
          <strong>Important:</strong> Always take medicines as prescribed. Confirm with your doctor or pharmacist before making any changes.
        </p>
      </div>

      {/* Medicine list */}
      <div className="px-6 space-y-3 mb-6">
        {meds.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background:"var(--muted-fill)", border:"2px dashed var(--border)" }}>
            <p style={{ fontSize:"16px", fontWeight:700, color:"var(--text-secondary)" }}>No medicines listed</p>
          </div>
        ) : meds.map((med, i) => (
          <div key={i} className="rounded-2xl overflow-hidden"
            style={{ background:"var(--card)", border: med.reviewRequired === true ? "2px solid #FCD34D" : "1.5px solid var(--border)", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
            {/* Review banner */}
            {med.reviewRequired === true && (
              <div className="px-4 py-2 flex items-center gap-2"
                style={{ background:"#FFFBEB", borderBottom:"1px solid #FCD34D" }}>
                <ReviewRequiredBadge />
                <p style={{ fontSize:"12px", color:"#92400E", fontWeight:500 }}>
                  Confirm with your doctor or pharmacist before taking
                </p>
              </div>
            )}
            <div className="px-4 py-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl" aria-hidden="true">💊</span>
                  <div>
                    <p style={{ fontSize:"16px", fontWeight:800, color:"var(--text-primary)" }}>{med.name}</p>
                    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-bold mt-0.5"
                      style={{ background:"#D1FAE5", color:"#059669" }}>Active</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl px-3 py-2" style={{ background:"var(--muted-fill)" }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color:"var(--text-secondary)" }}>Dose</p>
                  <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text-primary)" }}>{med.dosage}</p>
                </div>
                <div className="rounded-xl px-3 py-2" style={{ background:"var(--brand-tint)" }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color:"var(--brand)" }}>When</p>
                  <p style={{ fontSize:"14px", fontWeight:600, color:"var(--brand-dark)" }}>{med.timing}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 mt-3 rounded-xl px-3 py-2" style={{ background:"#EFF6FF" }}>
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color:"#2563EB" }} aria-hidden="true" />
                <p style={{ fontSize:"12px", color:"#1D4ED8", lineHeight:1.5 }}>
                  Follow the timing exactly. If you miss a dose, ask your doctor or pharmacist what to do.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ContactProviderCTA message="Have questions about your medicines? Contact your doctor or pharmacist." />
    </div>
  );
}