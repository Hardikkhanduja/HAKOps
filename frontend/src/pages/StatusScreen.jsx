import LogoMark from "../components/LogoMark.jsx";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { getProcessingStatus } from "../data/carePlanApi.js";

const INTERVAL_MS = 3_000;
const MAX_MS      = 120_000;

const STEPS = [
  { label: "Reading your document",          icon: "📄" },
  { label: "Understanding the instructions", icon: "🧠" },
  { label: "Simplifying into plain language",icon: "✍️" },
  { label: "Translating to your language",   icon: "🌐" },
  { label: "Building your care checklist",   icon: "✅" },
];



export default function StatusScreen() {
  const { id }    = useParams();
  const navigate   = useNavigate();
  const [phase, setPhase]       = useState("processing");
  const [errorMsg, setErrorMsg] = useState("");
  const [stepIdx, setStepIdx]   = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStepIdx((i) => (i + 1) % STEPS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!id) { navigate("/", { replace: true }); return; }
    const startTime = Date.now();
    let cancelled   = false;
    const intervalId = setInterval(async () => {
      if (cancelled) return;
      if (Date.now() - startTime >= MAX_MS) {
        clearInterval(intervalId);
        if (!cancelled) setPhase("timeout");
        return;
      }
      try {
        const data = await getProcessingStatus(id);
        if (cancelled) return;
        if (data.status === "ready")
          { clearInterval(intervalId); navigate(`/plan/${id}`); }
        else if (data.status === "error")
          { clearInterval(intervalId); setPhase("error"); setErrorMsg("The document could not be processed."); }
      } catch {
        clearInterval(intervalId);
        if (!cancelled) { setPhase("error"); setErrorMsg("Network error. Check your connection and try again."); }
      }
    }, INTERVAL_MS);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [id, navigate]);

  const BrandBar = (
    <div className="px-4 flex items-center gap-2.5 border-b"
      style={{ background: "linear-gradient(135deg, #0F6B5C 0%, #0A4F44 100%)", minHeight: "56px", borderColor: "rgba(255,255,255,0.12)" }}>
      <LogoMark size={30} white={true} />
      <div>
        <p className="font-extrabold text-base leading-none text-white">CareSetu</p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", lineHeight: 1 }}>Your bridge from hospital to home recovery</p>
      </div>
    </div>
  );

  if (phase === "error" || phase === "timeout") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--surface)" }}>
        {BrandBar}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="rounded-full p-5" style={{ background: "var(--status-danger-bg)" }}>
            <AlertCircle className="h-12 w-12" style={{ color: "var(--status-danger)" }} />
          </div>
          <div className="text-center max-w-xs space-y-2">
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
              {phase === "timeout" ? "Taking longer than expected" : "Something went wrong"}
            </h2>
            <p style={{ fontSize: "17px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              {phase === "timeout" ? "Please go back and try uploading again." : errorMsg}
            </p>
          </div>
          <button onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-xl px-6 font-bold transition-all active:scale-95"
            style={{ background: "var(--brand)", color: "#ffffff", minHeight: "52px", fontSize: "17px" }}>
            <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Return to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--surface)" }}>
      {BrandBar}
      <motion.div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-12"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

        {/* Pulsing ring */}
        <div className="relative flex items-center justify-center">
          <motion.div className="absolute rounded-full"
            style={{ width: 112, height: 112, background: "var(--brand-tint)" }}
            animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} />
          <motion.div className="absolute rounded-full"
            style={{ width: 80, height: 80, background: "var(--brand-tint)" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0.4, ease: "easeInOut" }} />
          <div role="status" aria-label="Processing document…"
            className="relative z-10 rounded-full p-4"
            style={{ background: "var(--card)", boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px var(--border)" }}>
            <Loader2 className="h-11 w-11 animate-spin" style={{ color: "var(--brand)" }} aria-hidden="true" />
          </div>
        </div>

        <div className="text-center space-y-2 max-w-sm">
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>Reading Your Document</h2>
          <p style={{ fontSize: "17px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
            We are turning your hospital papers into a simple care plan.
          </p>
        </div>

        {/* Animated step indicator */}
        <motion.div key={stepIdx}
          className="flex items-center gap-3 rounded-2xl px-5 py-3"
          style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="text-2xl">{STEPS[stepIdx].icon}</span>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>{STEPS[stepIdx].label}…</span>
        </motion.div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className="h-2 rounded-full transition-all duration-500"
              style={{ width: i === stepIdx ? 24 : 8, background: i === stepIdx ? "var(--brand)" : "var(--border)" }} />
          ))}
        </div>

        <div className="flex items-center gap-2" style={{ fontSize: "15px", color: "var(--text-secondary)" }}>
          <Clock className="h-4 w-4" aria-hidden="true" />
          <span>This usually takes 20–40 seconds</span>
        </div>
      </motion.div>
    </div>
  );
}