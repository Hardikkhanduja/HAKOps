/**
 * TopBar.jsx — inner top bar (inside the main content area, above the page).
 *
 * Contains:
 *   - Search input (UI stub — non-functional, pending a future search spec)
 *   - Language selector (reuses the 7-language list from validateUpload.js)
 *   - Notification bell icon (UI stub — no real notification system yet)
 *   - Patient avatar (decorative, shows initials from patient.name)
 */
import { Search, Bell } from "lucide-react";
import { LANGUAGES } from "../utils/validateUpload.js";

export default function TopBar({ patientName = "", language = "en", onLanguageChange }) {
  const initial = patientName ? patientName.charAt(0).toUpperCase() : "P";

  return (
    <div className="flex items-center gap-3 px-5 py-2.5">

      {/* Search — stub, non-functional */}
      {/* TODO(future-spec): wire to a real search feature when specced */}
      <div className="flex items-center gap-2 flex-1 max-w-xs rounded-xl px-3 py-2"
        style={{ background: "var(--muted-fill)", border: "1px solid var(--border)" }}>
        <Search className="h-4 w-4 shrink-0" style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
        <input
          type="search"
          placeholder="Global Search"
          className="bg-transparent outline-none w-full"
          style={{ fontSize: "13px", color: "var(--text-secondary)" }}
          aria-label="Search (coming soon)"
          disabled
        />
        <span className="text-xs rounded px-1.5 py-0.5 font-mono shrink-0"
          style={{ background: "var(--border)", color: "var(--text-secondary)", fontSize: "10px" }}>
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Language selector */}
        <div className="relative">
          <select
            value={language}
            onChange={e => onLanguageChange?.(e.target.value)}
            className="appearance-none rounded-lg px-3 py-1.5 pr-7 text-sm font-semibold focus:outline-none"
            style={{ background: "var(--muted-fill)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "13px" }}
            aria-label="Select language"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--text-secondary)" }}>▾</span>
        </div>

        {/* Notification bell — stub */}
        {/* TODO(future-spec): wire to real notification system when specced */}
        <button
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          style={{ border: "1px solid var(--border)" }}
          aria-label="Notifications (coming soon)"
        >
          <Bell className="h-4 w-4" style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
        </button>

        {/* Patient avatar — decorative initials */}
        <div className="rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ width: 32, height: 32, background: "var(--brand)", color: "#ffffff" }}
          aria-hidden="true"
          title={patientName}>
          {initial}
        </div>
      </div>
    </div>
  );
}