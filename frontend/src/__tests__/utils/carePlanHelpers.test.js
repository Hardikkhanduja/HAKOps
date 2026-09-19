import { describe, it, expect } from "vitest";
import { earliestDateByType, formatDisplayDate } from "../../utils/carePlanHelpers.js";

describe("earliestDateByType", () => {
  it("returns null for an empty array", () => {
    expect(earliestDateByType([], "appointment")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(earliestDateByType(null, "appointment")).toBeNull();
  });

  it("returns null when no items match the type", () => {
    const followUps = [{ type: "test", date: "2026-09-20T09:00:00Z" }];
    expect(earliestDateByType(followUps, "appointment")).toBeNull();
  });

  it("returns the date for a single matching item", () => {
    const followUps = [{ type: "appointment", date: "2026-09-22T10:00:00Z" }];
    expect(earliestDateByType(followUps, "appointment")).toBe("2026-09-22T10:00:00Z");
  });

  it("returns the earliest date when multiple items match", () => {
    const followUps = [
      { type: "appointment", date: "2026-10-15T10:00:00Z" },
      { type: "appointment", date: "2026-09-22T10:00:00Z" },
      { type: "appointment", date: "2026-11-01T10:00:00Z" },
    ];
    expect(earliestDateByType(followUps, "appointment")).toBe("2026-09-22T10:00:00Z");
  });

  it("ignores items of a different type", () => {
    const followUps = [
      { type: "test", date: "2026-09-01T09:00:00Z" },
      { type: "appointment", date: "2026-09-22T10:00:00Z" },
      { type: "appointment", date: "2026-10-15T10:00:00Z" },
    ];
    expect(earliestDateByType(followUps, "appointment")).toBe("2026-09-22T10:00:00Z");
  });

  it("works for type=test", () => {
    const followUps = [
      { type: "test", date: "2026-09-20T09:00:00Z" },
      { type: "test", date: "2026-09-18T09:00:00Z" },
      { type: "appointment", date: "2026-09-10T10:00:00Z" },
    ];
    expect(earliestDateByType(followUps, "test")).toBe("2026-09-18T09:00:00Z");
  });
});

describe("formatDisplayDate", () => {
  it("returns None scheduled for null", () => {
    expect(formatDisplayDate(null)).toBe("None scheduled");
  });

  it("returns None scheduled for undefined", () => {
    expect(formatDisplayDate(undefined)).toBe("None scheduled");
  });

  it("returns None scheduled for empty string", () => {
    expect(formatDisplayDate("")).toBe("None scheduled");
  });

  it("formats a valid ISO date", () => {
    expect(formatDisplayDate("2026-09-22T10:00:00Z")).toBe("September 22, 2026");
  });

  it("formats another date correctly", () => {
    expect(formatDisplayDate("2026-10-15T00:00:00Z")).toBe("October 15, 2026");
  });
});