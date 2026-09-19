import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl, formatUploadedAt } from "../../utils/buildWhatsAppUrl.js";

const mockPharmacy = {
  id: "ph-001",
  name: "MedPlus Pharmacy",
  address: "Marathahalli, Bangalore",
  phone: "918041234567",
};

describe("formatUploadedAt", () => {
  it("formats an ISO string to yyyy-MM-dd HH:mm", () => {
    expect(formatUploadedAt("2026-09-15T09:00:00Z")).toBe("2026-09-15 09:00");
  });

  it("formats another date correctly", () => {
    expect(formatUploadedAt("2026-12-31T23:59:00Z")).toBe("2026-12-31 23:59");
  });
});

describe("buildWhatsAppUrl", () => {
  it("returns null when uploadedAt is null", () => {
    expect(buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", null)).toBeNull();
  });

  it("returns null when uploadedAt is undefined", () => {
    expect(buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", undefined)).toBeNull();
  });

  it("returns null when uploadedAt is empty string", () => {
    expect(buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", "")).toBeNull();
  });

  it("returns a URL starting with https://wa.me/", () => {
    const url = buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", "2026-09-15T09:00:00Z");
    expect(url).toMatch(/^https:\/\/wa\.me\//);
  });

  it("includes the pharmacy phone number in the URL", () => {
    const url = buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", "2026-09-15T09:00:00Z");
    expect(url).toContain("918041234567");
  });

  it("URL-encodes the text parameter (no raw spaces)", () => {
    const url = buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", "2026-09-15T09:00:00Z");
    const textParam = url.split("?text=")[1];
    expect(textParam).not.toContain(" ");
  });

  it("decoded text contains the patient name", () => {
    const url = buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", "2026-09-15T09:00:00Z");
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toContain("Rahul Sharma");
  });

  it("decoded text contains the formatted date", () => {
    const url = buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", "2026-09-15T09:00:00Z");
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toContain("2026-09-15 09:00");
  });

  it("decoded text contains the pharmacy name", () => {
    const url = buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", "2026-09-15T09:00:00Z");
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toContain("MedPlus Pharmacy");
  });

  it("decoded text asks about availability", () => {
    const url = buildWhatsAppUrl(mockPharmacy, "Rahul Sharma", "2026-09-15T09:00:00Z");
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toMatch(/availability/i);
  });
});