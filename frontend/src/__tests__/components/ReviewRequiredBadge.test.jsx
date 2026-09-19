import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReviewRequiredBadge from "../../components/ReviewRequiredBadge.jsx";

describe("ReviewRequiredBadge", () => {
  it("renders the text Review Required", () => {
    render(<ReviewRequiredBadge />);
    expect(screen.getByText("Review Required")).toBeInTheDocument();
  });

  it("the visible text is at least 12 characters long", () => {
    render(<ReviewRequiredBadge />);
    const text = screen.getByText("Review Required").textContent.trim();
    expect(text.length).toBeGreaterThanOrEqual(12);
  });

  it("has role=img on the outer element", () => {
    render(<ReviewRequiredBadge />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("has aria-label=Review Required on the outer element", () => {
    render(<ReviewRequiredBadge />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Review Required");
  });

  it("the SVG icon has aria-hidden=true", () => {
    const { container } = render(<ReviewRequiredBadge />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});