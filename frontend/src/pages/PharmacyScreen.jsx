import { useState, useEffect } from "react";
import { MapPin, Phone, MessageCircle, Navigation, Search, Star } from "lucide-react";
import { useCarePlan } from "../context/CarePlanContext.js";
import { PHARMACIES } from "../data/pharmacies.js";
import { buildWhatsAppUrl } from "../utils/buildWhatsAppUrl.js";
import PageHeader from "../components/PageHeader.jsx";

// Leaflet is loaded lazily inside a try/catch so a map failure
// never crashes the whole pharmacy page.
let L, MapContainer, TileLayer, Marker, Popup, useMap;
let leafletReady = false;
try {
  L = (await import("leaflet")).default ?? (await import("leaflet"));
  const rl = await import("react-leaflet");
  ({ MapContainer, TileLayer, Marker, Popup, useMap } = rl);

  // Fix Vite asset handling for default Leaflet marker icons
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  leafletReady = true;
} catch (e) {
  console.warn("Leaflet failed to load:", e.message);
}

/** Fly map to selected pharmacy */
function MapFlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 15, { duration: 0.8 }); }, [lat, lng]);
  return null;
}

/** Live interactive map — only renders if Leaflet loaded successfully */
function PharmacyMap({ pharmacies, selected, onSelect }) {
  if (!leafletReady || !MapContainer) {
    return (
      <div className="rounded-2xl flex items-center justify-center"
        style={{ height: 260, background: "#E8F5F2", border: "1.5px solid var(--border)" }}>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Map unavailable — check your internet connection.
        </p>
      </div>
    );
  }

  const sel = pharmacies[selected] ?? pharmacies[0];

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ height: 260, border: "1.5px solid var(--border)" }}>
      <MapContainer
        center={[sel.lat, sel.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFlyTo lat={sel.lat} lng={sel.lng} />
        {pharmacies.map((p, i) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            eventHandlers={{ click: () => onSelect(i) }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 3px" }}>{p.name}</p>
                <p style={{ fontSize: 11, color: "#5B6560", margin: "0 0 2px" }}>{p.hours}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: p.isOpen ? "#059669" : "#C0392B", margin: 0 }}>
                  {p.isOpen ? "Open Now" : "Closed"}
                </p>
                <a href={p.directionsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 6, fontSize: 11, color: "#0F6B5C", fontWeight: 700 }}>
                  Get Directions →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

const FILTER_TABS = ["Within 5km", "Open Now", "All Services"];

export default function PharmacyScreen() {
  const { carePlan } = useCarePlan();
  const patientName  = carePlan.patient.name;
  const uploadedAt   = carePlan.originalDocument?.uploadedAt ?? null;
  const missingDate  = !uploadedAt;

  const [activeFilter, setActiveFilter] = useState(2);
  const [selected, setSelected]         = useState(0);
  const [search, setSearch]             = useState("");

  const filtered = PHARMACIES.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.address.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 0) return parseFloat(p.distance) <= 1.5;
    if (activeFilter === 1) return p.isOpen;
    return true;
  });

  const sel   = filtered[selected] ?? PHARMACIES[0];
  const waUrl = missingDate ? null : buildWhatsAppUrl(sel, patientName, uploadedAt);

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
        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 shrink-0"
          style={{ background: "var(--brand-tint)", border: "1px solid var(--brand-tint-mid)" }}>
          <MapPin className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} aria-hidden="true" />
          <span style={{ fontSize: "12px", color: "var(--brand)", fontWeight: 600 }}>Sector 35, Chandigarh</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 px-6">

        {/* ── LEFT: list ── */}
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

          {/* Filters */}
          <div className="flex gap-2">
            {FILTER_TABS.map((t, i) => (
              <button key={t} onClick={() => { setActiveFilter(i); setSelected(0); }}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: activeFilter===i ? "var(--brand)" : "var(--muted-fill)", color: activeFilter===i ? "#fff" : "var(--text-secondary)", border: "none", cursor: "pointer" }}>
                {t}
              </button>
            ))}
          </div>

          {missingDate && (
            <div role="alert" className="rounded-xl px-3 py-2.5"
              style={{ background: "var(--status-attention-bg)", border: "1px solid var(--status-attention-border)", fontSize: "12px", color: "var(--status-attention)", fontWeight: 600 }}>
              ⚠ Prescription date unavailable — WhatsApp sharing disabled.
            </div>
          )}

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
                          {p.isOpen && <span style={{ fontSize: "10px", color: "#059669", fontWeight: 700 }}>Open Now</span>}
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {(p.address ?? "").split(",").slice(0, 2).join(",")}
                        </p>
                        {p.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3" style={{ color: "#F59E0B", fill: "#F59E0B" }} aria-hidden="true" />
                            <span style={{ fontSize: "11px", fontWeight: 600 }}>{p.rating}</span>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>({p.reviews})</span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)" }}>{p.distance}</p>
                        <div className="flex gap-1.5 mt-1 justify-end">
                          {p.displayPhone !== "Open 24 hours" && (
                            <a href={`tel:+${p.phone}`}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                              style={{ background: "var(--muted-fill)", color: "var(--text-secondary)" }}>
                              <Phone className="h-3 w-3" aria-hidden="true" /> Call
                            </a>
                          )}
                          <a href={p.directionsUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                            style={{ background: "var(--brand-tint)", color: "var(--brand)" }}>
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
        </div>

        {/* ── RIGHT: map + detail ── */}
        <div className="lg:col-span-3 space-y-3 mt-4 lg:mt-0 lg:pl-4">

          {/* Live map */}
          <PharmacyMap pharmacies={filtered.length ? filtered : PHARMACIES} selected={selected} onSelect={setSelected} />

          {/* Selected detail */}
          <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
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

            <div className="space-y-1 mb-3">
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>📍 {sel.address}</p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>⏰ {sel.hours}</p>
              {sel.displayPhone !== "Open 24 hours" && (
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>📞 {sel.displayPhone}</p>
              )}
              {sel.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" style={{ color: "#F59E0B", fill: "#F59E0B" }} aria-hidden="true" />
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>{sel.rating} · {sel.reviews} reviews</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {sel.services.map(s => (
                <span key={s} className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: "var(--brand-tint)", color: "var(--brand)" }}>{s}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              {sel.displayPhone !== "Open 24 hours" ? (
                <a href={`tel:+${sel.phone}`}
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm"
                  style={{ background: "var(--muted-fill)", color: "var(--text-primary)", border: "1.5px solid var(--border)", textDecoration: "none" }}>
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm opacity-50"
                  style={{ background: "var(--muted-fill)", color: "var(--text-secondary)", border: "1.5px solid var(--border)" }}>
                  <Phone className="h-4 w-4" aria-hidden="true" /> 24 hrs
                </div>
              )}
              <a href={sel.directionsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm"
                style={{ background: "var(--brand)", color: "#fff", textDecoration: "none", boxShadow: "0 3px 10px rgba(15,107,92,0.3)" }}>
                <Navigation className="h-4 w-4" aria-hidden="true" /> Get Directions
              </a>
            </div>

            {waUrl ? (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 font-bold text-sm"
                style={{ background: "#25D366", color: "#fff", boxShadow: "0 3px 10px rgba(37,211,102,0.3)", textDecoration: "none" }}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Share Prescription on WhatsApp
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 font-bold text-sm opacity-40"
                style={{ background: "#25D366", color: "#fff" }}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Share Prescription on WhatsApp
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}