/**
 * TopBar.jsx — inner top bar (inside the main content area, above the page).
 *
 * Contains:
 *   - Search input (UI stub)
 *   - Language selector
 *   - Notification bell icon (UI stub)
 *   - Patient avatar
 *   - Logged-in account name
 *   - Logout button
 */

import { Search, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { LANGUAGES } from "../utils/validateUpload.js";
import { getCurrentUser, clearAuthSession } from "../utils/session.js";

export default function TopBar({
  patientName = "",
  language = "en",
  onLanguageChange,
}) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const patientInitial = patientName
    ? patientName.charAt(0).toUpperCase()
    : "P";

  const handleLogout = () => {
    clearAuthSession();
    sessionStorage.removeItem("caresetu_last_plan_id");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center gap-3 px-5 py-2.5">

      {/* Search — stub */}
      <div
        className="flex items-center gap-2 flex-1 max-w-xs rounded-xl px-3 py-2"
        style={{
          background: "var(--muted-fill)",
          border: "1px solid var(--border)",
        }}
      >
        <Search
          className="h-4 w-4 shrink-0"
          style={{ color: "var(--text-secondary)" }}
          aria-hidden="true"
        />

        <input
          type="search"
          placeholder="Global Search"
          className="bg-transparent outline-none w-full"
          style={{ fontSize: "13px", color: "var(--text-secondary)" }}
          aria-label="Search (coming soon)"
          disabled
        />

        <span
          className="text-xs rounded px-1.5 py-0.5 font-mono shrink-0"
          style={{
            background: "var(--border)",
            color: "var(--text-secondary)",
            fontSize: "10px",
          }}
        >
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-3 ml-auto">

        {/* Language selector */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="appearance-none rounded-lg px-3 py-1.5 pr-7 text-sm font-semibold focus:outline-none"
            style={{
              background: "var(--muted-fill)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: "13px",
            }}
            aria-label="Select language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            ▾
          </span>
        </div>

        {/* Notification bell — stub */}
        <button
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          style={{ border: "1px solid var(--border)" }}
          aria-label="Notifications (coming soon)"
        >
          <Bell
            className="h-4 w-4"
            style={{ color: "var(--text-secondary)" }}
            aria-hidden="true"
          />
        </button>

        {/* Account name */}
        {user?.name && (
          <div
            className="hidden sm:block text-right"
            title={user.email}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              {user.name}
            </p>

            <p
              style={{
                fontSize: "10px",
                color: "var(--text-secondary)",
                marginTop: "2px",
              }}
            >
              Account
            </p>
          </div>
        )}

        {/* Patient avatar */}
        <div
          className="rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            width: 32,
            height: 32,
            background: "var(--brand)",
            color: "#ffffff",
          }}
          aria-hidden="true"
          title={patientName}
        >
          {patientInitial}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 transition-all hover:bg-red-50 hover:text-red-600"
          style={{ border: "1px solid var(--border)" }}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut
            className="h-4 w-4"
            style={{ color: "var(--text-secondary)" }}
            aria-hidden="true"
          />
        </button>

      </div>
    </div>
  );
}
