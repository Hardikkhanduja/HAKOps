import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CloudUpload, FileText, Loader2, ChevronDown, ShieldCheck,
  CheckCircle2, FileImage, FlaskConical, Stethoscope,
  Circle, ArrowRight,
} from "lucide-react";
import { uploadDischargeDocument } from "../data/carePlanApi.js";
import { validateFile, LANGUAGES } from "../utils/validateUpload.js";
import AppShell from "../components/AppShell.jsx";
import TopBar   from "../components/TopBar.jsx";

/* ── Bilingual CTA (kept from previous pass) ───────────────── */
const BILINGUAL_CTA = {
  en: { primary: "Upload & Get My Care Plan", native: null },
  hi: { primary: "Upload & Get My Care Plan", native: "अपलोड करें और केयर प्लान पाएं" },
  pa: { primary: "Upload & Get My Care Plan", native: "ਅਪਲੋਡ ਕਰੋ ਅਤੇ ਕੇਅਰ ਪਲੈਨ ਪ੍ਰਾਪਤ ਕਰੋ" },
  kn: { primary: "Upload & Get My Care Plan", native: "ಅಪ್ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಕೇರ್ ಪ್ಲಾನ್ ಪಡೆಯಿರಿ" },
  ml: { primary: "Upload & Get My Care Plan", native: "അപ്‌ലോഡ് ചെയ്ത് കെയർ പ്ലാൻ നേടൂ" },
  ta: { primary: "Upload & Get My Care Plan", native: "பதிவேற்றி கேர் பிளான் பெறுங்கள்" },
  te: { primary: "Upload & Get My Care Plan", native: "అప్‌లోడ్ చేసి కేర్ ప్లాన్ పొందండి" },
};

/* ── Static right-column content ───────────────────────────── */
const STEPS = [
  {
    n: 1,
    title: "Upload your document",
    desc:  "Add a clear photo or PDF of your discharge paper.",
  },
  {
    n: 2,
    title: "We read and organise it",
    desc:  "Our system extracts key information like medicines, follow-ups, and care instructions.",
  },
  {
    n: 3,
    title: "Get your care plan",
    desc:  "View a simple, easy-to-follow plan in your chosen language.",
  },
];

const TIPS = [
  "Make sure the document is clear and readable",
  "Include all pages if multiple",
  "Photos should be well-lit and not blurred",
  "Supported formats: PDF, JPG, PNG (max 20 MB)",
];

/* ── Sample document cards (decorative — illustrate accepted types) ── */
const SAMPLE_DOCS = [
  { label: "Discharge Summary", icon: FileText,    color: "#0F6B5C", bg: "#E8F5F2" },
  { label: "Prescription",      icon: FileImage,   color: "#7C3AED", bg: "#F5F3FF" },
  { label: "Lab Report",        icon: FlaskConical,color: "#2563EB", bg: "#EFF6FF" },
  { label: "Doctor Notes",      icon: Stethoscope, color: "#92400E", bg: "#FFFBEB" },
];

/* ── Illustration card (static) ─────────────────────────────── */
function IllustrationCard() {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4 mb-5"
      style={{ background: "var(--brand-tint)", border: "1.5px solid var(--brand-tint-mid)" }}>
      {/* Mini document icon */}
      <div className="rounded-xl p-3 shrink-0" style={{ background: "var(--brand)", boxShadow: "0 4px 12px rgba(15,107,92,0.3)" }}>
        <FileText className="h-7 w-7 text-white" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)" }}>
          From hospital papers to a clear care plan
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
          {["Medicines", "Follow-ups", "Daily tasks", "Care instructions"].map(label => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="rounded-full shrink-0"
                style={{ width: 6, height: 6, background: "var(--brand)", display: "inline-block" }} />
              <span style={{ fontSize: "11px", color: "var(--brand-dark)", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main component
   ══════════════════════════════════════════════════════════════ */
export default function UploadScreen() {
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile]                   = useState(null);
  const [language, setLanguage]           = useState("en");
  const [submitting, setSubmitting]       = useState(false);
  const [validationMsg, setValidationMsg] = useState(null);
  const [error, setError]                 = useState(null);

  const cta = BILINGUAL_CTA[language] ?? BILINGUAL_CTA.en;

  /* ── Existing logic — unchanged ──────────────────────────── */
  function handleFileChange(e) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setValidationMsg(null);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationMsg(null);
    setError(null);
    const validation = validateFile(file);
    if (!validation.valid) { setValidationMsg(validation.message); return; }
    setSubmitting(true);
    try {
      const data = await uploadDischargeDocument(file, language);
      navigate(`/status/${data.id}`);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
      setSubmitting(false);
    }
  }

  /* ── Top bar (stub search + language selector) ─────────────── */
  const topBar = (
    <TopBar language={language} onLanguageChange={setLanguage} />
  );

  return (
    <AppShell topBar={topBar}>
      <div className="min-h-full pb-10">

        {/* ── Page header ────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-4 pb-2">
          <div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Operations &rsaquo; <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Upload Document</span>
            </p>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
              Upload Your Discharge Paper
            </h1>
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.5, maxWidth: "480px" }}>
              We will read your hospital papers and turn them into a simple,
              easy-to-follow health plan — in your language.
            </p>
          </div>
          {/* Tagline pill */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 ml-4 mt-1">
            <div className="rounded-xl px-4 py-1.5 text-sm font-semibold text-white"
              style={{ background: "var(--brand)", whiteSpace: "nowrap" }}>
              Small steps every day make a big difference.
            </div>
          </div>
        </div>

        {/* ── Two-column body ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pt-4">

          {/* ══ LEFT: Upload form ════════════════════════════════ */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Drop zone */}
            <div>
              <label className="flex items-center gap-1.5 font-bold mb-2"
                style={{ fontSize: "15px", color: "var(--text-primary)" }}>
                <span style={{ fontSize: "16px" }}>🔒</span> Select your document
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2"
                style={{
                  minHeight: "170px",
                  borderColor: file ? "var(--brand)" : "#A7D7CF",
                  background:  file ? "var(--brand-tint)" : "#FAFFFE",
                }}
                aria-label="Click to select a file"
              >
                {file ? (
                  <>
                    <div className="rounded-xl p-3" style={{ background: "var(--brand-tint-mid)" }}>
                      <FileText className="h-8 w-8" style={{ color: "var(--brand)" }} aria-hidden="true" />
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand)" }}>{file.name}</span>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB &mdash; tap to change
                    </span>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    >
                      <CloudUpload className="h-10 w-10" style={{ color: "var(--brand)" }} aria-hidden="true" />
                    </motion.div>
                    <div className="text-center">
                      <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                        Tap to upload or drag and drop
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        PDF, Photo (JPEG, PNG) &bull; Max 20 MB
                      </p>
                    </div>
                    {/* Choose File pill button */}
                    <div className="flex items-center gap-2 rounded-full px-4 py-1.5 font-semibold text-sm"
                      style={{ background: "var(--brand)", color: "#ffffff" }}>
                      <CloudUpload className="h-3.5 w-3.5" aria-hidden="true" />
                      Choose File
                    </div>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                id="document-input"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
                aria-label="Select discharge document"
              />

              {validationMsg && (
                <p role="alert" className="mt-2 font-medium rounded-xl px-3 py-2.5"
                  style={{ fontSize: "14px", color: "var(--status-danger)", background: "var(--status-danger-bg)", border: "1px solid var(--status-danger-border)" }}>
                  ⚠ {validationMsg}
                </p>
              )}
            </div>

            {/* Language selector */}
            <div>
              <label htmlFor="language-select" className="flex items-center gap-1.5 font-bold mb-2"
                style={{ fontSize: "15px", color: "var(--text-primary)" }}>
                <span style={{ fontSize: "16px" }}>🌐</span> Your language
              </label>
              <div className="relative">
                <select
                  id="language-select"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  disabled={submitting}
                  className="w-full appearance-none rounded-xl border px-4 pr-10 font-semibold focus:outline-none focus:ring-2"
                  style={{
                    fontSize: "15px", minHeight: "48px",
                    borderColor: "var(--border)",
                    background: "var(--card)",
                    color: "var(--text-primary)",
                  }}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
              </div>
            </div>

            {/* API error */}
            {error && (
              <p role="alert" className="font-medium rounded-xl px-3 py-2.5"
                style={{ fontSize: "14px", color: "var(--status-danger)", background: "var(--status-danger-bg)", border: "1px solid var(--status-danger-border)" }}>
                ⚠ {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: "var(--brand)", color: "#ffffff",
                minHeight: "56px",
                boxShadow: "0 4px 14px rgba(15,107,92,0.3)",
                paddingTop: "10px", paddingBottom: "10px",
              }}
              aria-label={submitting ? "Uploading…" : cta.primary}
            >
              {submitting ? (
                <span className="flex items-center gap-2 font-bold" style={{ fontSize: "16px" }}>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Uploading…
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-2 font-bold" style={{ fontSize: "16px" }}>
                    <CloudUpload className="h-5 w-5" aria-hidden="true" /> {cta.primary}
                  </span>
                  {cta.native && (
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.78)", fontWeight: 500 }}>
                      {cta.native}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Secure reassurance */}
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--brand)" }} aria-hidden="true" />
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Your document is kept secure. We only show what is in your papers — nothing is added or changed.
              </p>
            </div>
          </form>

          {/* ══ RIGHT: Static informational content ═════════════ */}
          <div className="space-y-5">

            {/* Illustration card */}
            <IllustrationCard />

            {/* What happens next */}
            <div className="rounded-2xl p-5"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontSize: "16px" }}>🔒</span>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                  What happens next?
                </h2>
              </div>
              <ol className="space-y-4 list-none p-0 m-0">
                {STEPS.map(s => (
                  <li key={s.n} className="flex gap-3">
                    <div className="rounded-full shrink-0 flex items-center justify-center font-bold text-xs"
                      style={{ width: 24, height: 24, background: "var(--brand)", color: "#fff", marginTop: "1px" }}>
                      {s.n}
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{s.title}</p>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px", lineHeight: 1.5 }}>{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips for best results */}
            <div className="rounded-2xl p-5"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: "16px" }}>💡</span>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Tips for best results
                </h2>
              </div>
              <ul className="space-y-2 list-none p-0 m-0">
                {TIPS.map(t => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--brand)" }} aria-hidden="true" />
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Sample documents (decorative) ───────────────────── */}
        <div className="px-6 pt-8">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: "16px" }}>🔒</span>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Sample documents
            </h2>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
            You can upload discharge summaries, prescription sheets, test reports or any hospital document.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SAMPLE_DOCS.map(({ label, icon: Icon, color, bg }) => (
              /* Decorative only — illustrates accepted document types, not clickable */
              <div key={label}
                className="rounded-2xl flex flex-col items-center justify-center gap-3 py-5 px-3"
                style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                aria-hidden="true"
              >
                {/* Mini document lines mock */}
                <div className="w-full rounded-lg flex flex-col gap-1.5 px-3 py-3"
                  style={{ background: bg, minHeight: "60px" }}>
                  <div className="rounded" style={{ height: 4, background: color, opacity: 0.4, width: "80%" }} />
                  <div className="rounded" style={{ height: 4, background: color, opacity: 0.25, width: "60%" }} />
                  <div className="rounded" style={{ height: 4, background: color, opacity: 0.25, width: "70%" }} />
                  <div className="rounded" style={{ height: 4, background: color, opacity: 0.15, width: "50%" }} />
                </div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}