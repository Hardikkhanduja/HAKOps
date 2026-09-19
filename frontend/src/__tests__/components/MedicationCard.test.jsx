import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MedicationCard from "../../components/MedicationCard.jsx";

const baseMed = {
  name: "Amoxicillin 500mg",
  dosage: "1 tablet",
  timing: "Every 8 hours for 5 days",
};

describe("MedicationCard", () => {
  it("renders the medication name", () => {
    render(<MedicationCard medication={{ ...baseMed, reviewRequired: false }} />);
    expect(screen.getByText("Amoxicillin 500mg")).toBeInTheDocument();
  });

  it("renders the dosage", () => {
    render(<MedicationCard medication={{ ...baseMed, reviewRequired: false }} />);
    expect(screen.getByText("1 tablet")).toBeInTheDocument();
  });

  it("renders the timing", () => {
    render(<MedicationCard medication={{ ...baseMed, reviewRequired: false }} />);
    expect(screen.getByText("Every 8 hours for 5 days")).toBeInTheDocument();
  });

  it("shows ReviewRequiredBadge when reviewRequired is true", () => {
    render(<MedicationCard medication={{ ...baseMed, reviewRequired: true }} />);
    expect(screen.getByRole("img", { name: "Review Required" })).toBeInTheDocument();
  });

  it("does NOT show ReviewRequiredBadge when reviewRequired is false", () => {
    render(<MedicationCard medication={{ ...baseMed, reviewRequired: false }} />);
    expect(screen.queryByRole("img", { name: "Review Required" })).not.toBeInTheDocument();
  });

  it("does NOT show ReviewRequiredBadge when reviewRequired is null", () => {
    render(<MedicationCard medication={{ ...baseMed, reviewRequired: null }} />);
    expect(screen.queryByRole("img", { name: "Review Required" })).not.toBeInTheDocument();
  });

  it("does NOT show ReviewRequiredBadge when reviewRequired is undefined", () => {
    render(<MedicationCard medication={{ ...baseMed }} />);
    expect(screen.queryByRole("img", { name: "Review Required" })).not.toBeInTheDocument();
  });
});