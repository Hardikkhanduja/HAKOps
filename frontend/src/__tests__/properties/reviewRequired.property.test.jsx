// Feature: discharge-companion-frontend
// Property 2: ReviewRequired badge renders exactly when reviewRequired === true
// Property 3: ReviewRequiredBadge always has icon + text >= 12 chars
// Validates: Requirements 4.1, 4.2, 4.4, 5.1, 6.3, 10.3
import { describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import MedicationCard from "../../components/MedicationCard.jsx";
import ReviewRequiredBadge from "../../components/ReviewRequiredBadge.jsx";

const medArb = fc.record({
  name:           fc.string({ minLength: 1, maxLength: 50 }),
  dosage:         fc.string({ minLength: 1, maxLength: 30 }),
  timing:         fc.string({ minLength: 1, maxLength: 50 }),
  reviewRequired: fc.oneof(
    fc.constant(true),
    fc.constant(false),
    fc.constant(null),
    fc.constant(undefined)
  ),
});

describe("Property 2 - badge renders iff reviewRequired === true", () => {
  it("badge present iff reviewRequired is strictly true", () => {
    fc.assert(
      fc.property(medArb, (medication) => {
        const { unmount } = render(<MedicationCard medication={medication} />);
        const badge = screen.queryByRole("img", { name: "Review Required" });
        const should = medication.reviewRequired === true;
        const has    = badge !== null;
        unmount();
        return should === has;
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 3 - ReviewRequiredBadge always has icon + text >= 12 chars", () => {
  it("aria-label present and text length >= 12 on every render", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount } = render(<ReviewRequiredBadge />);
        const el   = screen.getByRole("img");
        const text = screen.getByText("Review Required").textContent.trim();
        const ok   = el.getAttribute("aria-label") === "Review Required" && text.length >= 12;
        unmount();
        return ok;
      }),
      { numRuns: 100 }
    );
  });
});