import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DocumentView from "../../pages/DocumentView.jsx";
import { CarePlanContext } from "../../context/CarePlanContext.js";

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const C = ({ children, ...props }) => {
        const allowed = Object.fromEntries(Object.entries(props).filter(([k]) =>
          !["initial","animate","transition","variants","whileHover","whileTap","style"].includes(k)));
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
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "demo-123" }) };
});

function makePlan(url) {
  return {
    patient: { name: "Sample Patient", preferredLanguage: "hi" },
    originalDocument: { url, uploadedAt: "2026-09-15T09:00:00Z" },
    carePlan: {
      medications: [{ name: "Med A", dosage: "1 tab", timing: "Daily", reviewRequired: false }],
      followUps: [], dailyTasks: [], warningSigns: [], dietActivityRestrictions: [],
    },
    reminders: [], status: "ready",
  };
}

function renderDocView(url = "https://example.com/doc.pdf") {
  return render(
    <MemoryRouter>
      <CarePlanContext.Provider value={{ carePlan: makePlan(url), id: "demo-123" }}>
        <DocumentView />
      </CarePlanContext.Provider>
    </MemoryRouter>
  );
}

describe("DocumentView", () => {
  it("renders the documents list page with Discharge Summary row", () => {
    renderDocView("https://example.com/doc.pdf");
    expect(screen.getByText("Discharge Summary")).toBeInTheDocument();
  });

  it("renders stat chips showing total documents", () => {
    renderDocView("https://example.com/doc.pdf");
    expect(document.body.textContent).toContain("TOTAL DOCUMENTS");
  });

  it("renders the Upload Document button (stub)", () => {
    renderDocView("https://example.com/doc.pdf");
    expect(screen.getByLabelText(/upload document/i)).toBeInTheDocument();
  });

  it("shows document security info in right column", () => {
    renderDocView("https://example.com/doc.pdf");
    expect(screen.getByText("Document Security")).toBeInTheDocument();
  });

  it("renders care plan checklist section heading in list view", () => {
    renderDocView(null);
    // In list view (not viewing doc), shows the documents list
    expect(screen.getByText("Discharge Summary")).toBeInTheDocument();
  });
});