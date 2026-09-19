import LogoMark from "./LogoMark.jsx";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

/** Bridge arc SVG — "Setu" means bridge in Hindi/Sanskrit */


/**
 * NavBar — CareSetu branded top bar.
 *
 * Props:
 *   backTo       — if set, renders a back chevron link on the left
 *   backLabel    — accessible label + visible text for the back link
 *   patientName  — shown as sub-label under the wordmark when present
 *   actions      — JSX slot for right-side buttons (e.g. "Dashboard")
 */
export default function NavBar({ backTo, backLabel = "Dashboard", patientName, actions }) {
  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-20 border-b"
      style={{
        background: "linear-gradient(135deg, #0F6B5C 0%, #0A4F44 100%)",
        borderColor: "rgba(255,255,255,0.12)",
        boxShadow: "0 2px 12px rgba(15,107,92,0.3)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-3" style={{ minHeight: "64px" }}>

        {/* Back link */}
        {backTo && (
          <Link
            to={backTo}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold transition-all shrink-0"
            style={{ color: "rgba(255,255,255,0.92)" }}
            aria-label={`Back to ${backLabel}`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>
        )}

        {/* Wordmark */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <LogoMark size={34} white={true} />
          <div className="min-w-0">
            <p className="font-extrabold text-lg leading-none text-white tracking-tight">
              CareSetu
            </p>
            <p className="leading-none mt-0.5 truncate" style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)" }}>
              {patientName ? `${patientName}'s care plan` : "Your bridge from hospital to home recovery"}
            </p>
          </div>
        </div>

        {/* Right action slot */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </nav>
  );
}