import { useState } from "react";
import LogoMark from "./LogoMark.jsx";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Upload, FileText, Pill, CheckSquare,
  Calendar, AlertCircle, Utensils, BookOpen, Bell, MapPin,
  ChevronDown, ChevronRight, Heart, Menu, X,
} from "lucide-react";


const SIDEBAR_BG    = "#0A4F44";
const SIDEBAR_ACTIVE= "rgba(255,255,255,0.15)";
const SIDEBAR_ACCENT= "#1DB88E";

function SideLink({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all`
      }
      style={({ isActive }) => ({
        color:       isActive ? "#ffffff"        : "rgba(255,255,255,0.65)",
        background:  isActive ? SIDEBAR_ACTIVE   : "transparent",
        borderLeft:  isActive ? `3px solid ${SIDEBAR_ACCENT}` : "3px solid transparent",
      })}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function SideGroup({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg transition-colors"
        style={{ background: "transparent" }}
        aria-expanded={open}>
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
          {label}
        </span>
        {open
          ? <ChevronDown className="h-3 w-3" style={{ color: "rgba(255,255,255,0.4)" }} />
          : <ChevronRight className="h-3 w-3" style={{ color: "rgba(255,255,255,0.4)" }} />
        }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden space-y-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * AppShell — persistent sidebar used on every page.
 *
 * Props:
 *   id          — care plan id (optional; undefined on upload screen)
 *   patientName — shown in the footer (optional)
 *   topBar      — JSX slot for the top search/language bar
 *   children    — page content
 */
export default function AppShell({ id, patientName, topBar, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use the passed id, or fall back to the last plan the user visited (persisted
  // in sessionStorage by PlanLayout). This makes sidebar links work from any page,
  // including the Upload screen, as long as a plan was previously loaded this session.
  const resolvedId = id
    || sessionStorage.getItem("caresetu_last_plan_id")
    || "demo-123"; // final fallback for dev (mock server always has demo-123)

  const base = `/plan/${resolvedId}`;

  const Sidebar = (
    <aside className="flex flex-col h-full select-none"
      style={{ background: SIDEBAR_BG, width: "220px", minWidth: "220px" }}
      aria-label="Application navigation">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 shrink-0">
        <LogoMark size={34} white={true} />
        <div>
          <p className="font-extrabold text-white leading-none" style={{ fontSize: "16px" }}>CareSetu</p>
          <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", lineHeight: 1.3, marginTop: "2px" }}>
            Your bridge from hospital to home
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-4 pb-2">
        <SideGroup label="Overview">
          {/* Dashboard only active when a care plan is loaded */}
          <SideLink to={base} icon={LayoutDashboard} label="Dashboard" end />
        </SideGroup>

        <SideGroup label="Operations">
          {/* Upload always links to / and is highlighted via end exact match */}
          <SideLink to="/"                                       icon={Upload}         label="Upload Document" end />
          <SideLink to={`${base}/careplan`}    icon={LayoutDashboard} label="Care Plan" />
          <SideLink to={`${base}/medications`} icon={Pill}            label="Medicines" />
          <SideLink to={`${base}/tasks`}     icon={CheckSquare}  label="Daily Tasks" />
          <SideLink to={`${base}/warnings`}     icon={AlertCircle}  label="Warning Signs" />
          <SideLink to={`${base}/diet`}     icon={Utensils}     label="Diet & Activity" />
          <SideLink to={`${base}/document`}     icon={BookOpen}     label="Original Document" />
          <SideLink to={`${base}/reminders`}     icon={Bell}         label="Reminders" />
          <SideLink to={`${base}/pharmacy`}     icon={MapPin}       label="Find Pharmacy" />
        </SideGroup>
      </nav>

      {/* Support card */}
      <div className="mx-3 mb-3 rounded-xl p-3 shrink-0"
        style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Heart className="h-3 w-3 text-white" aria-hidden="true" />
          </div>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>Your health.</p>
        </div>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
          Our support. A smoother tomorrow.
        </p>
      </div>

      {/* Patient footer */}
      <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
        <div className="flex items-center gap-2.5">
          <div className="rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ width: 30, height: 30, background: SIDEBAR_ACCENT, color: "#ffffff" }}>
            {patientName ? patientName.charAt(0).toUpperCase() : "G"}
          </div>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
            {patientName || "Guest"}
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col h-full shrink-0" style={{ width: "220px" }}>
        {Sidebar}
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-30 bg-black/50 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} />
            <motion.div className="fixed left-0 top-0 h-full z-40 md:hidden flex flex-col"
              style={{ width: "220px" }}
              initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              {Sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile hamburger */}
        <div className="flex items-center gap-3 px-4 py-3 md:hidden border-b"
          style={{ background: SIDEBAR_BG, borderColor: "rgba(255,255,255,0.12)" }}>
          <button onClick={() => setMobileOpen(o => !o)} aria-label="Open menu" className="text-white">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-extrabold text-white text-base">CareSetu</span>
        </div>

        {/* Top bar */}
        {topBar && (
          <div className="shrink-0 border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {topBar}
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
