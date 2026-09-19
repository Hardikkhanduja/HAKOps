import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DetailSection from "../../components/DetailSection.jsx";
import { CarePlanContext } from "../../context/CarePlanContext.js";

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const C = ({ children, ...props }) => {
        const allowed = Object.fromEntries(
          Object.entries(props).filter(([k]) =>
            !["initial","animate","transition","variants","whileHover","whileTap"].includes(k)
          )
        );
        return <div {...allowed}>{children}</div>;
      };
      C.displayName = tag;
      return C;
    }
  }),
  AnimatePresence: ({ children }) => children ?? null,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn() };
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
    ],
    dailyTasks:              [{ description: "Change wound dressing", frequency: "Once daily" }],
    warningSigns:            ["Fever above 101F", "Difficulty breathing"],
    dietActivityRestrictions:["No heavy lifting for 2 weeks", "Soft food diet"],
  },
  reminders: [],
  status: "ready",
};

function renderSection(section, cpOverride = {}) {
  const plan = { ...BASE_PLAN, carePlan: { ...BASE_PLAN.carePlan, ...cpOverride } };
  return render(
    <MemoryRouter>
      <CarePlanContext.Provider value={{ carePlan: plan, id: "demo-123" }}>
        <DetailSection section={section} />
      </CarePlanContext.Provider>
    </MemoryRouter>
  );
}

describe("DetailSection - medications", () => {
  it("renders medication names", () => {
    renderSection("medications");
    expect(screen.getByText("Amoxicillin 500mg")).toBeInTheDocument();
    expect(screen.getByText("Paracetamol 650mg")).toBeInTheDocument();
  });

  it("shows ReviewRequiredBadge for reviewRequired true", () => {
    renderSection("medications");
    expect(screen.getByRole("img", { name: "Review Required" })).toBeInTheDocument();
  });

  it("shows No items message for empty medications", () => {
    renderSection("medications", { medications: [] });
    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });
});

describe("DetailSection - followups", () => {
  it("renders follow-up description", () => {
    renderSection("followups");
    expect(screen.getByText("Follow-up with Dr. Sharma")).toBeInTheDocument();
  });

  it("formats date as Month DD, YYYY", () => {
    renderSection("followups");
    expect(screen.getByText(/September 22, 2026/)).toBeInTheDocument();
  });
});

describe("DetailSection - tasks", () => {
  it("renders description and frequency", () => {
    renderSection("tasks");
    expect(screen.getByText("Change wound dressing")).toBeInTheDocument();
    expect(screen.getByText("Once daily")).toBeInTheDocument();
  });
});

describe("DetailSection - warnings", () => {
  it("renders each warning sign", () => {
    renderSection("warnings");
    expect(screen.getByText("Fever above 101F")).toBeInTheDocument();
    expect(screen.getByText("Difficulty breathing")).toBeInTheDocument();
  });
});

describe("DetailSection - diet", () => {
  it("renders each diet restriction", () => {
    renderSection("diet");
    expect(screen.getByText("No heavy lifting for 2 weeks")).toBeInTheDocument();
    expect(screen.getByText("Soft food diet")).toBeInTheDocument();
  });

  it("shows No items for empty diet array", () => {
    renderSection("diet", { dietActivityRestrictions: [] });
    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });
});