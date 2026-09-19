import { useState } from "react";
import { MapPin, Phone, MessageCircle, Navigation, Search, Star } from "lucide-react";
import { useCarePlan } from "../context/CarePlanContext.js";
import { PHARMACIES } from "../data/pharmacies.js";
import { buildWhatsAppUrl } from "../utils/buildWhatsAppUrl.js";
import PageHeader from "../components/PageHeader.jsx";

/**
 * PharmacyScreen — Find Pharmacy.
 *
 * Uses real Chandigarh pharmacy data with valid phone numbers and Google Maps links.
 * WhatsApp share button uses the existing wa.me click-to-chat flow (no Business API).
 * Get Directions opens Google Maps directions to the pharmacy.
 * Map area is a static placeholder — live map integration is a separate spec.
 *
 * Filter chips (Within 5km, Open Now, All Services) filter the displayed list.
 */

const FILTER_TABS = ["Within 5km", "Open Now", "All Services"];

export default function PharmacyScreen() {
  const { carePlan }   = useCarePlan();
  const patientName    = carePlan.patient.name;
  const uploadedAt     = carePlan.originalDocument?.uploadedAt ?? null;
  const missingDate    = !uploadedAt;

  const [activeFilter, setActiveFilter] = useState(2); // "All Services" default
  const [selected, setSelected]         = useState(0);
  const [search, setSearch]             = useState("");

  // Apply filters
  const filtered = PHARMACIES.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.address.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 0) return parseFloat(p.distance) <= 1.5;
    if (activeFilter === 1) return p.isOpen;
    return true;
  });

  const sel    = filtered[selected] ?? PHARMACIES[0];
  const waUrl  = missingDate ? null : buildWhatsAppUrl(sel, patientName, uploadedAt);

  return (
    <div className="min-h-full pb-8">
      <PageHeader breadcrumb="Find Pharmacy" patientName={patientName} />

      {/* Title */}
      <div className="flex items-start justify-between px-6 pb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl p-2.5" style={{ background: "var(--brand)" }}>
            <MapPin className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Find Pharmacy</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Locate nearby pharmacies to get your medicines and healthcare products.
            </p>
          </div>
        </div>
        {/* Location pill */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 shrink-0"
          style={{ background: "var(--brand-tint)", border: "1px solid var(--brand-tint-mid)" }}>
          <MapPin className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} aria-hidden="true" />
          <span style={{ fontSize: "12px", color: "var(--brand)", fontWeight: 600 }}>Sector 35, Chandigarh</span>
          <button style={{ fontSize: "12px", color: "var(--brand)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
            Change
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 px-6">

        {/* ── LEFT: search + filters + list ── */}
        <div className="lg:col-span-2 space-y-3 lg:pr-4">

          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}>
            <Search className="h-4 w-4 shrink-0" style={{ color: "var(--text-secondary)" }} aria-hidden="true" />
            <input value={search} onChange={e => { setSearch(e.target.value); setSelected(0); }}
              placeholder="Search pharmacy name or area..."
              className="bg-transparent outline-none flex-1"
              style={{ fontSize: "13px", color: "var(--text-primary)" }} />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2">
            {FILTER_TABS.map((t, i) => (
              <button key={t} onClick={() => { setActiveFilter(i); setSelected(0); }}
                className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
                style={{ background: activeFilter===i ? "var(--brand)" : "var(--muted-fill)", color: activeFilter===i ? "#ffffff" : "var(--text-secondary)", border: "none", cursor: "pointer" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Missing date warning */}
          {missingDate && (
            <div role="alert" className="rounded-xl px-3 py-2.5"
              style={{ background: "var(--status-attention-bg)", border: "1px solid var(--status-attention-border)", fontSize: "12px", color: "var(--status-attention)", fontWeight: 600 }}>
              ⚠ Prescription date unavailable — WhatsApp sharing disabled.
            </div>
          )}

          {/* Pharmacy list */}
          {filtered.length === 0 ? (
            <div className="text-center py-8 rounded-2xl" style={{ background: "var(--muted-fill)", border: "2px dashed var(--border)" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No pharmacies match your search.</p>
            </div>
          ) : (
            <ul className="space-y-2 list-none p-0 m-0" aria-label="Nearby pharmacies">
              {filtered.map((p, i) => (
                <li key={p.id}>
                  <button onClick={() => setSelected(i)} className="w-full text-left rounded-2xl px-4 py-3 transition-all"
                    style={{
                      background: i===selected ? "var(--brand-tint)" : "var(--card)",
                      border: `1.5px solid ${i===selected ? "var(--brand)" : "var(--border)"}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-full w-2 h-2 shrink-0"
                            style={{ background: p.isOpen ? "#059669" : "#C0392B", display: "inline-block" }} />
                          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</p>
                          {p.isOpen && (
                            <span style={{ fontSize: "10px", color: "#059669", fontWeight: 700 }}>Open Now</span>
                          )}
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {p.address.split(",").slice(0, 2).join(",")}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                          {p.services.join(" + ")}
                        </p>
                        {/* Rating */}
                        {p.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3" style={{ color: "#F59E0B", fill: "#F59E0B" }} aria-hidden="true" />
                            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)" }}>{p.rating}</span>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>({p.reviews} reviews)</span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)" }}>{p.distance}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap justify-end">
                          {/* Call button */}
                          {p.displayPhone !== "No number listed" ? (
                            <a href={`tel:+${p.phone}`}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                              style={{ background: "var(--muted-fill)", color: "var(--text-secondary)" }}
                              aria-label={`Call ${p.name}`}>
                              <Phone className="h-3 w-3" aria-hidden="true" /> Call
                            </a>
                          ) : (
                            <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                              style={{ background: "var(--muted-fill)", color: "var(--text-secondary)", opacity: 0.5 }}>
                              No phone
                            </span>
                          )}
                          {/* Directions button — opens Google Maps */}
                          <a href={p.directionsUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                            style={{ background: "var(--brand-tint)", color: "var(--brand)" }}
                            aria-label={`Get directions to ${p.name}`}>
                            <Navigation className="h-3 w-3" aria-hidden="true" /> Directions
                          </a>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Can't find banner */}
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: "var(--brand-tint)", border: "1.5px solid var(--brand-tint-mid)" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)" }}>Can't find a medicine?</p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Try another nearby pharmacy or ask for generic alternatives.
              </p>
            </div>
            <button style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
              Search Alternative
            </button>
          </div>
        </div>

        {/* ── RIGHT: map placeholder + selected pharmacy detail ── */}
        <div className="lg:col-span-3 space-y-3 mt-4 lg:mt-0 lg:pl-4">

          {/* Static map placeholder */}
          <div className="rounded-2xl overflow-hidden relative"
            style={{ background: "#E8F5F2", border: "1.5px solid var(--border)", minHeight: "200px" }}>
            <svg width="100%" height="200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {[0,40,80,120,160,200].map(y => <line key={`h${y}`} x1="0" y1={y} x2="100%" y2={y} stroke="#C7E9E2" strokeWidth="1" />)}
              {[0,100,200,300,400,500].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke="#C7E9E2" strokeWidth="1" />)}
              <line x1="0" y1="100" x2="100%" y2="100" stroke="#A7D7CF" strokeWidth="3" />
              <line x1="200" y1="0" x2="200" y2="200" stroke="#A7D7CF" strokeWidth="3" />
              <circle cx="200" cy="100" r="14" fill="var(--brand)" />
              <text x="200" y="105" textAnchor="middle" fontSize="14" fill="white">📍</text>
            </svg>
            <div className="absolute top-2 right-2 rounded-lg px-2 py-1"
              style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: "10px", color: "var(--text-secondary)" }}>
              Static map — live map in future release
            </div>
          </div>

          {/* Selected pharmacy detail card */}
          <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full w-2.5 h-2.5 shrink-0"
                    style={{ background: sel.isOpen ? "#059669" : "#C0392B", display: "inline-block" }} />
                  <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{sel.name}</p>
                </div>
                <p style={{ fontSize: "12px", color: sel.isOpen ? "#059669" : "#C0392B", fontWeight: 700, marginTop: "1px" }}>
                  {sel.isOpen ? "Open Now" : "Currently Closed"}
                </p>
              </div>
              <p style={{ fontSize: "15px", fontWeight: 800, color: "var(--brand)" }}>{sel.distance}</p>
            </div>

            {/* Details */}
            <div className="space-y-1 mb-3">
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>📍 {sel.address}</p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>⏰ {sel.hours}</p>
              {sel.displayPhone !== "No number listed" && (
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>📞 {sel.displayPhone}</p>
              )}
              {sel.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" style={{ color: "#F59E0B", fill: "#F59E0B" }} aria-hidden="true" />
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>{sel.rating} · {sel.reviews} reviews</span>
                </div>
              )}
            </div>

            {/* Services */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {sel.services.map(s => (
                <span key={s} className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: "var(--brand-tint)", color: "var(--brand)" }}>
                  {s}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* Call button */}
              {sel.displayPhone !== "No number listed" ? (
                <a href={`tel:+${sel.phone}`}
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm"
                  style={{ background: "var(--muted-fill)", color: "var(--text-primary)", border: "1.5px solid var(--border)", textDecoration: "none" }}
                  aria-label={`Call ${sel.name}`}>
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm opacity-40"
                  style={{ background: "var(--muted-fill)", color: "var(--text-secondary)", border: "1.5px solid var(--border)" }}>
                  <Phone className="h-4 w-4" aria-hidden="true" /> No Phone
                </div>
              )}

              {/* Get Directions — opens Google Maps */}
              <a href={sel.directionsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm"
                style={{ background: "var(--brand)", color: "#ffffff", textDecoration: "none", boxShadow: "0 3px 10px rgba(15,107,92,0.3)" }}
                aria-label={`Get directions to ${sel.name} on Google Maps`}>
                <Navigation className="h-4 w-4" aria-hidden="true" /> Get Directions
              </a>
            </div>

            {/* WhatsApp share — send prescription to pharmacy */}
            <div className="mt-2">
              {waUrl ? (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 font-bold text-sm"
                  style={{ background: "#25D366", color: "#ffffff", boxShadow: "0 3px 10px rgba(37,211,102,0.3)", textDecoration: "none" }}
                  aria-label={`Share prescription with ${sel.name} via WhatsApp`}>
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Share Prescription on WhatsApp
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 font-bold text-sm opacity-40"
                  style={{ background: "#25D366", color: "#ffffff" }}>
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Share Prescription on WhatsApp
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}