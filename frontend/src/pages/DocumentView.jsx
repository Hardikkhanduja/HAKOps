import { useState } from "react";
import { FileText, AlertCircle, List, RefreshCw, Upload, ShieldCheck, LayoutPanelLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCarePlan } from "../context/CarePlanContext.js";
import { useNavigate } from "react-router-dom";
import CarePlanChecklist from "../components/CarePlanChecklist.jsx";
import PageHeader from "../components/PageHeader.jsx";

/**
 * DocumentView — Original Documents page.
 *
 * Scope decision: shows only the ONE real uploaded document from the care plan.
 * Additional document rows shown in the Figma design (X-Ray, Insurance Card, etc.)
 * are decorative placeholder rows — marked visually but not functional.
 * Multi-document storage is a future spec.
 *
 * The real document is displayed via presigned S3 GET URL to prevent AccessDenied.
 */

const FILTER_TABS = [
  { label: "All"          },
  { label: "Reports"      },
  { label: "Prescriptions"},
  { label: "Bills"        },
  { label: "Others"       },
];

const SORT_OPTIONS = ["Recent First", "Oldest First", "File Size"];

// Placeholder rows — decorative, not functional (multi-doc is future scope)
const PLACEHOLDER_DOCS = [
  { name: "X-Ray Chest",          date: "15 Sep 2026", size: "2.4 MB",  status: "Verified",        statusColor: "#059669", statusBg: "#D1FAE5", type: "pdf" },
  { name: "Prescription – Dr. Sharma", date: "22 Aug 2026", size: "420 KB", status: "Verified",   statusColor: "#059669", statusBg: "#D1FAE5", type: "pdf" },
  { name: "Insurance Card",        date: "05 Aug 2026", size: "640 KB", status: "Needs Attention",  statusColor: "#C0392B", statusBg: "#FEF2F2", type: "img" },
  { name: "Vaccination Record",    date: "18 Jul 2026", size: "1.3 MB", status: "Verified",        statusColor: "#059669", statusBg: "#D1FAE5", type: "pdf" },
];

export default function DocumentView() {
  const { carePlan }    = useCarePlan();
  const navigate        = useNavigate();
  const { patient, originalDocument } = carePlan;
  const docUrl          = originalDocument?.url;
  const uploadedAt      = originalDocument?.uploadedAt;

  const [iframeError, setIframeError] = useState(false);
  const [iframeKey, setIframeKey]     = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);
  const [sortBy, setSortBy]           = useState(0);
  const [viewingDoc, setViewingDoc]   = useState(false);

  const hasValidUrl = Boolean(docUrl) && !iframeError;

  // Total = 1 real + 4 placeholder
  const totalDocs     = 5;
  const verifiedCount = 4; // 1 real (assumed verified) + 3 placeholder verified
  const pendingCount  = 1; // discharge summary shown as pending
  const attentionCount = 1;

  if (viewingDoc) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setViewingDoc(false)}
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}>
            ← Back to Documents
          </button>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
            {patient.name} — Discharge Summary
          </p>
          <button onClick={() => { setIframeError(false); setIframeKey(k => k + 1); }}
            className="flex items-center gap-1 text-xs rounded-lg px-2 py-1"
            style={{ background: "var(--muted-fill)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}>
            <RefreshCw className="h-3 w-3" aria-hidden="true" /> Retry
          </button>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
          {/* Document panel */}
          <div className="flex flex-col border-r p-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Original Document</p>
            {!docUrl || iframeError ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center"
                style={{ border: "2px dashed var(--border)", background: "var(--muted-fill)" }}>
                <AlertCircle className="h-10 w-10" style={{ color: "var(--text-secondary)" }} />
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)" }}>
                  {!docUrl ? "Document URL not available." : "Document failed to load. The link may have expired."}
                </p>
                {iframeError && (
                  <button onClick={() => { setIframeError(false); setIframeKey(k => k+1); }}
                    className="rounded-xl px-4 py-2 font-bold text-sm"
                    style={{ background: "var(--brand)", color: "#fff", border: "none", cursor: "pointer" }}>
                    Try Again
                  </button>
                )}
              </div>
            ) : (
              <iframe key={iframeKey} src={docUrl}
                title="Original discharge document"
                className="flex-1 rounded-xl"
                style={{ border: "1.5px solid var(--border)", minHeight: "60vh" }}
                onError={() => setIframeError(true)}
                aria-label="Original discharge document viewer" />
            )}
          </div>
          {/* Checklist panel */}
          <div className="flex flex-col p-4 overflow-y-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Simplified Care Plan</p>
            <CarePlanChecklist carePlan={carePlan} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-8">
      <PageHeader breadcrumb="Original Document" patientName={patient.name} />

      {/* Title + Upload button (stub) */}
      <div className="flex items-center justify-between px-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl p-2.5" style={{ background: "var(--brand)" }}>
            <FileText className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Original Documents</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Keep all your important medical documents in one safe place.
            </p>
          </div>
        </div>
        {/* Upload button — stub, multi-doc is future scope */}
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-sm transition-all active:scale-95"
          style={{ background: "var(--brand)", color: "#ffffff", border: "none", cursor: "not-allowed", opacity: 0.7 }}
          title="Coming soon — multi-document upload is a future feature"
          aria-label="Upload document (coming soon)">
          <Upload className="h-4 w-4" aria-hidden="true" /> + Upload Document
        </button>
      </div>

      {/* Stat chips */}
      <div className="flex gap-3 px-6 pb-4 overflow-x-auto">
        {[
          { label: "TOTAL DOCUMENTS",   value: totalDocs,      color: "var(--brand)",        bg: "var(--brand-tint)",         border: "var(--brand-tint-mid)" },
          { label: "VERIFIED",          value: verifiedCount,  color: "#059669",             bg: "#D1FAE5",                   border: "#6EE7B7" },
          { label: "PENDING REVIEW",    value: pendingCount,   color: "#92400E",             bg: "var(--status-attention-bg)",border: "var(--status-attention-border)" },
          { label: "NEEDS ATTENTION",   value: attentionCount, color: "var(--status-danger)", bg: "var(--status-danger-bg)",   border: "var(--status-danger-border)" },
        ].map(c => (
          <div key={c.label} className="flex-1 min-w-[100px] rounded-2xl px-3 py-2.5" style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
            <p style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: c.color }}>{c.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1, marginTop: "2px" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + sort */}
      <div className="flex items-center justify-between px-6 pb-4 flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TABS.map((t, i) => (
            <button key={t.label} onClick={() => setActiveFilter(i)}
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: activeFilter===i ? "var(--brand)" : "var(--muted-fill)", color: activeFilter===i ? "#fff" : "var(--text-secondary)", border: "none", cursor: "pointer" }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Sort by</span>
          <select value={sortBy} onChange={e => setSortBy(Number(e.target.value))}
            className="rounded-lg px-2 py-1 text-xs font-semibold"
            style={{ background: "var(--muted-fill)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
            {SORT_OPTIONS.map((s, i) => <option key={s} value={i}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Document list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-6">
        <div className="lg:col-span-2 space-y-2">
          {/* REAL document row */}
          <button onClick={() => setViewingDoc(true)} className="w-full text-left rounded-2xl px-4 py-3 transition-all hover:shadow-md"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2 shrink-0" style={{ background: "var(--brand-tint)" }}>
                <FileText className="h-5 w-5" style={{ color: "var(--brand)" }} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Discharge Summary</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {uploadedAt ? new Date(uploadedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"}
                  {" · "}Original document
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: "#FFFBEB", color: "#92400E" }}>Pending</span>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>→</span>
              </div>
            </div>
          </button>

          {/* Placeholder rows — decorative */}
          {PLACEHOLDER_DOCS.map(d => (
            <div key={d.name}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", opacity: 0.65 }}
              title="Coming soon — multi-document storage is a future feature">
              <div className="rounded-xl p-2 shrink-0" style={{ background: "var(--muted-fill)" }}>
                <FileText className="h-5 w-5" style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{d.date} · {d.size}</p>
              </div>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0"
                style={{ background: d.statusBg, color: d.statusColor }}>
                {d.status}
              </span>
            </div>
          ))}
        </div>

        {/* Right: security info */}
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4" style={{ color: "var(--brand)" }} aria-hidden="true" />
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Document Security</p>
            </div>
            <ul className="space-y-2 list-none p-0 m-0">
              {["Your documents are stored securely", "Accessible only to you", "Share with your doctor when needed", "We never share without your permission"].map(t => (
                <li key={t} className="flex items-start gap-2">
                  <span className="rounded-full shrink-0 mt-1.5" style={{ width: 6, height: 6, background: "var(--brand)", display: "inline-block" }} />
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "var(--brand-tint)", border: "1.5px solid var(--brand-tint-mid)" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)", marginBottom: "4px" }}>
              Your health records, always with you.
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Safe. Simple. Secure.</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Need Help?</p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px" }}>Not sure what to upload or facing an issue?</p>
            <button className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-sm w-full justify-center"
              style={{ background: "var(--brand)", color: "#fff", border: "none", cursor: "pointer" }}>
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Upload zone — stub */}
      <div className="mx-6 mt-6 rounded-2xl px-5 py-6 flex flex-col items-center gap-2 text-center"
        style={{ background: "var(--muted-fill)", border: "2px dashed var(--border)" }}>
        <Upload className="h-6 w-6 mb-1" style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Upload a Document</p>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          Drag and drop files here or{" "}
          <span style={{ color: "var(--brand)", fontWeight: 600, cursor: "default" }}>click to browse</span>
          {" "}— coming soon
        </p>
        <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Supported Formats: PDF, JPG, PNG (Max size: 10 MB)</p>
      </div>
    </div>
  );
}