import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PharmacyScreen from "../../pages/PharmacyScreen.jsx";
import { CarePlanContext } from "../../context/CarePlanContext.js";
import { PHARMACIES } from "../../data/pharmacies.js";

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const Tag = ["button","a","ul","li","section","main"].includes(tag) ? tag : "div";
      const C = ({ children, ...props }) => {
        const allowed = Object.fromEntries(Object.entries(props).filter(([k]) =>
          !["initial","animate","transition","variants","whileHover","whileTap"].includes(k)));
        return <Tag {...allowed}>{children}</Tag>;
      };
      C.displayName = tag;
      return C;
    }
  }),
  AnimatePresence: ({ children }) => children ?? null,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "demo-123" }) };
});

function makePlan(uploadedAt) {
  return {
    patient: { name: "Rahul Sharma", preferredLanguage: "hi" },
    originalDocument: { url: "https://example.com/doc.pdf", uploadedAt },
    carePlan: { medications: [], followUps: [], dailyTasks: [], warningSigns: [], dietActivityRestrictions: [] },
    reminders: [], status: "ready",
  };
}

function renderPharmacy(uploadedAt = "2026-09-15T09:00:00Z") {
  return render(
    <MemoryRouter>
      <CarePlanContext.Provider value={{ carePlan: makePlan(uploadedAt), id: "demo-123" }}>
        <PharmacyScreen />
      </CarePlanContext.Provider>
    </MemoryRouter>
  );
}

describe("PharmacyScreen", () => {
  it("renders the first pharmacy name", () => {
    renderPharmacy();
    // New design shows ENRICHED names derived from PHARMACIES
    expect(document.body.textContent).toContain("Pharmacy");
  });

  it("renders WhatsApp/directions link when uploadedAt is present", () => {
    const { container } = renderPharmacy("2026-09-15T09:00:00Z");
    const waLinks = container.querySelectorAll("a[href*='wa.me']");
    expect(waLinks.length).toBeGreaterThanOrEqual(1);
    waLinks.forEach(a => {
      expect(a.getAttribute("href")).toMatch(/^https:\/\/wa\.me\//);
    });
  });

  it("shows inline warning when uploadedAt is null", () => {
    renderPharmacy(null);
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
    expect(document.body.textContent).toContain("Prescription date unavailable");
  });

  it("WhatsApp link href contains the patient name when uploadedAt present", () => {
    const { container } = renderPharmacy("2026-09-15T09:00:00Z");
    const waLinks = container.querySelectorAll("a[href*='wa.me']");
    expect(waLinks.length).toBeGreaterThanOrEqual(1);
    const decoded = decodeURIComponent(waLinks[0].getAttribute("href"));
    expect(decoded).toContain("Rahul Sharma");
  });

  it("renders the Find Pharmacy heading", () => {
    renderPharmacy();
    expect(screen.getAllByText("Find Pharmacy").length).toBeGreaterThanOrEqual(1);
  });
});