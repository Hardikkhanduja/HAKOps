import { AlertTriangle, Phone, AlertCircle } from "lucide-react";
import { useCarePlan } from "../context/CarePlanContext.js";
import PageHeader         from "../components/PageHeader.jsx";
import ContactProviderCTA from "../components/ContactProviderCTA.jsx";

/**
 * Emergency phone number.
 * NOTE: +91 98765 43210 shown in the Figma is a placeholder.
 * Replace with the patient's actual care provider number once that
 * data is available in the care plan contract. Safety-critical content —
 * do not fabricate real-looking numbers.
 */
const EMERGENCY_NUMBER = "+91 98765 43210";

const WHEN_TO_SEEK = [
  "Go to the nearest emergency room if you experience severe symptoms.",
  "Call your doctor if symptoms persist or worsen.",
  "Do not ignore any sudden changes in your health.",
];
const KEEP_SAFE = [
  "Follow your care plan and medications.",
  "Check your symptoms regularly.",
  "Reach out early if something feels different.",
  "Keep your follow-up appointments.",
  "Have a family member or caregiver informed.",
];

/** Split a warning string into a title and description where possible */
function parseWarning(str) {
  // "Fever above 101F" → title = "Fever above 101F", desc from known map
  const KNOWN = {
    "Fever above 101F":  "High temperature may indicate an infection.",
    "Increased redness or swelling at incision site": "Around incision or wound site.",
    "Difficulty breathing": "Shortness of breath or chest pain.",
  };
  const title = str.split(".")[0].split(";")[0].trim();
  const desc  = KNOWN[title] || str.length > title.length ? str.slice(title.length).replace(/^[.;,\s]+/, "") : "";
  return { title, desc };
}

export default function WarningSigns() {
  const { carePlan } = useCarePlan();
  const { patient, carePlan: plan } = carePlan;
  const warnings = plan.warningSigns ?? [];

  return (
    <div className="min-h-full pb-8">
      <PageHeader breadcrumb="Warning Signs" patientName={patient.name} />

      {/* Red header banner */}
      <div className="mx-6 mb-4 rounded-2xl px-5 py-4 flex items-start justify-between gap-4 flex-wrap"
        style={{ background:"#FEF2F2", border:"1.5px solid #FCA5A5" }}>
        <div className="flex items-start gap-3">
          <div className="rounded-xl p-2 shrink-0" style={{ background:"#C0392B" }}>
            <AlertTriangle className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p style={{ fontSize:"16px", fontWeight:800, color:"#C0392B" }}>Warning Signs</p>
            <p style={{ fontSize:"13px", color:"#7F1D1D", lineHeight:1.5 }}>
              If you notice any of these symptoms, contact your doctor or go to the hospital immediately.
            </p>
          </div>
        </div>
        <div className="rounded-xl px-3 py-2 text-right" style={{ background:"rgba(255,255,255,0.7)" }}>
          <p style={{ fontSize:"12px", color:"#C0392B", fontWeight:600 }}>Early action can prevent complications.</p>
          <p style={{ fontSize:"12px", color:"#7F1D1D" }}>When in doubt, reach out to your healthcare provider.</p>
        </div>
      </div>

      {/* "OK to seek help" banner */}
      <div className="mx-6 mb-5 rounded-2xl px-5 py-3 flex items-center justify-between gap-3"
        style={{ background:"#FEF2F2", border:"1px solid #FCA5A5" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize:"16px" }}>🔒</span>
          <div>
            <p style={{ fontSize:"13px", fontWeight:700, color:"#C0392B" }}>It is okay to seek help</p>
            <p style={{ fontSize:"12px", color:"#7F1D1D" }}>Noticing a warning sign does not always mean something is serious, but it is better to be safe.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-sm shrink-0"
          style={{ background:"#C0392B", color:"#fff", border:"none" }}>
          <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Contact Provider →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-6 pb-6">
        {/* Warning signs grid */}
        <div className="lg:col-span-2">
          <p style={{ fontSize:"15px", fontWeight:700, color:"var(--text-primary)", marginBottom:"4px" }}>Warning Signs for You</p>
          <p style={{ fontSize:"13px", color:"var(--text-secondary)", marginBottom:"14px" }}>
            These are based on your discharge papers and medical condition.
          </p>
          {warnings.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background:"var(--muted-fill)", border:"2px dashed var(--border)" }}>
              <p style={{ fontSize:"14px", color:"var(--text-secondary)" }}>No warning signs listed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {warnings.map((w, i) => {
                const { title, desc } = parseWarning(w);
                return (
                  <div key={i} className="flex items-start gap-3 rounded-2xl px-4 py-4"
                    style={{ background:"#FFF5F5", border:"1.5px solid #FCA5A5", borderLeft:"4px solid #C0392B" }}>
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color:"#C0392B" }} aria-hidden="true" />
                    <div>
                      <p style={{ fontSize:"14px", fontWeight:700, color:"#7F1D1D" }}>{title}</p>
                      {desc && <p style={{ fontSize:"12px", color:"#C0392B", marginTop:"2px", lineHeight:1.5 }}>{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* When to seek immediate help */}
          <div className="rounded-2xl p-4" style={{ background:"var(--card)", border:"1.5px solid var(--border)" }}>
            <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)", marginBottom:"10px" }}>
              🚨 When to seek immediate help?
            </p>
            <ul className="space-y-2 list-none p-0 m-0">
              {WHEN_TO_SEEK.map(t => (
                <li key={t} className="flex items-start gap-2">
                  <span className="rounded-full shrink-0 mt-1.5" style={{ width:6, height:6, background:"#C0392B", display:"inline-block" }} />
                  <span style={{ fontSize:"12px", color:"var(--text-secondary)", lineHeight:1.5 }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency contact — placeholder number from Figma */}
          <div className="rounded-2xl p-4" style={{ background:"var(--card)", border:"1.5px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4" style={{ color:"var(--brand)" }} aria-hidden="true" />
              <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)" }}>Emergency Contact</p>
            </div>
            <p style={{ fontSize:"12px", color:"var(--text-secondary)", marginBottom:"8px" }}>Need immediate assistance?</p>
            {/* NOTE: Placeholder number from Figma — replace with patient's real provider number */}
            <div className="rounded-xl px-3 py-2 text-center"
              style={{ background:"#FEF2F2", border:"1.5px solid #FCA5A5" }}>
              <p style={{ fontSize:"18px", fontWeight:800, color:"#C0392B" }}>{EMERGENCY_NUMBER}</p>
              <p style={{ fontSize:"11px", color:"var(--text-secondary)" }}>Available 24/7</p>
            </div>
          </div>

          {/* Keep yourself safe */}
          <div className="rounded-2xl p-4" style={{ background:"var(--card)", border:"1.5px solid var(--border)" }}>
            <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)", marginBottom:"10px" }}>🛡 Keep Yourself Safe</p>
            <ul className="space-y-2 list-none p-0 m-0">
              {KEEP_SAFE.map(t => (
                <li key={t} className="flex items-start gap-2">
                  <span className="rounded-full shrink-0 mt-1.5" style={{ width:6, height:6, background:"var(--brand)", display:"inline-block" }} />
                  <span style={{ fontSize:"12px", color:"var(--text-secondary)", lineHeight:1.5 }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Safety footer */}
      <div className="mx-6 mb-2 rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
        style={{ background:"var(--brand-tint)", border:"1.5px solid var(--brand-tint-mid)" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize:"20px" }}>💚</span>
          <div>
            <p style={{ fontSize:"14px", fontWeight:700, color:"var(--brand)" }}>Your safety matters</p>
            <p style={{ fontSize:"12px", color:"var(--text-secondary)", lineHeight:1.5 }}>
              We are here to support you at every step. If you are unsure about any symptom, it is always best to contact your doctor or healthcare provider.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-sm shrink-0"
          style={{ background:"var(--brand)", color:"#fff", border:"none" }}>
          <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Contact Provider
        </button>
      </div>
    </div>
  );
}