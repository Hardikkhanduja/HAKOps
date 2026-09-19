import LogoMark from "./LogoMark.jsx";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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