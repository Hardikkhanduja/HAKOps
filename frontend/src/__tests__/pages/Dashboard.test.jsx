import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../../pages/Dashboard.jsx";
import { CarePlanContext } from "../../context/CarePlanContext.js";

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const Tag = ["button","a","ul","li","section","main","div"].includes(tag) ? tag : "div";
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

const BASE_PLAN = {
  patient: { name: "Sample Patient", preferredLanguage: "hi" },
  originalDocument: { url: "https://example.com/doc.pdf", uploadedAt: "2026-09-15T09:00:00Z" },
  carePlan: {
    medications: [
      { name: "Amoxicillin 500mg", dosage: "1 tablet", timing: "Every 8 hours", reviewRequired: true },
      { name: "Paracetamol 650mg", dosage: "1 tablet", timing: "As needed",     reviewRequired: false },
    ],
    followUps: [
      { type: "appointment", description: "Follow-up with Dr. Sharma", date: "2026-09-22T10:00:00Z" },
      { type: "test",        description: "Blood test CBC",            date: "2026-09-20T09:00:00Z" },
    ],
    dailyTasks:              [{ description: "Change dressing", frequency: "Once daily" }],
    warningSigns:            ["Fever above 101F", "Difficulty breathing"],
    dietActivityRestrictions:["No heavy lifting"],
  },
  reminders: [],
  status: "ready",
};

function renderDashboard(cpOverride = {}) {
  const plan = { ...BASE_PLAN, carePlan: { ...BASE_PLAN.carePlan, ...cpOverride } };
  return render(
    <MemoryRouter>
      <CarePlanContext.Provider value={{ carePlan: plan, id: "demo-123" }}>
        <Dashboard />
      </CarePlanContext.Provider>
    </MemoryRouter>
  );
}

describe("Dashboard", () => {
  it("displays the patient name in the greeting", () => {
    renderDashboard();
    expect(screen.getByText(/Sample Patient/)).toBeInTheDocument();
  });

  it("shows medication count in the stat chip", () => {
    renderDashboard();
    // "2 ACTIVE" is unique to the stat chip (sidebar just has "Medicines" label)
    expect(document.body.textContent).toContain("2 ACTIVE");
  });

  it("shows 0 medications chip correctly for empty array", () => {
    renderDashboard({ medications: [] });
    expect(document.body.textContent).toContain("0 ACTIVE");
  });

  it("shows medication names in the medicines card", () => {
    renderDashboard();
    expect(screen.getByText("Amoxicillin 500mg")).toBeInTheDocument();
    expect(screen.getByText("Paracetamol 650mg")).toBeInTheDocument();
  });

  it("renders ReviewRequiredBadge for medicines with reviewRequired:true", () => {
    renderDashboard();
    expect(screen.getByRole("img", { name: "Review Required" })).toBeInTheDocument();
  });

  it("shows Follow-up with Dr. Sharma in upcoming appointments card", () => {
    renderDashboard();
    // Appears in both Today tabs and right column — use getAllByText
    expect(screen.getAllByText("Follow-up with Dr. Sharma").length).toBeGreaterThanOrEqual(1);
  });

  it("shows warning signs in the safety card", () => {
    renderDashboard();
    expect(document.body.textContent).toContain("Fever above 101F");
  });

  it("shows 3 WARNINGS badge", () => {
    renderDashboard({ warningSigns: ["A", "B", "C"] });
    expect(document.body.textContent).toContain("3 WARNINGS");
  });

  it("shows None scheduled when no appointments exist", () => {
    renderDashboard({ followUps: [] });
    expect(document.body.textContent).toMatch(/None|No appointment/i);
  });

  it("renders the Today tab with daily tasks", () => {
    renderDashboard();
    expect(screen.getByText("Change dressing")).toBeInTheDocument();
  });

  it("renders Quick Actions with Find Pharmacy", () => {
    renderDashboard();
    expect(screen.getByText("Find Pharmacy")).toBeInTheDocument();
  });

  it("renders Quick Actions with Reminders", () => {
    renderDashboard();
    expect(screen.getByText("Reminders")).toBeInTheDocument();
  });

  it("renders Quick Actions with Open WhatsApp", () => {
    renderDashboard();
    expect(screen.getByText("Open WhatsApp")).toBeInTheDocument();
  });
});