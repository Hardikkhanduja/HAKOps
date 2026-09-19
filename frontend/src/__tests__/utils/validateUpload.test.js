import { describe, it, expect } from "vitest";
import {
  validateFile,
  MAX_BYTES,
  LANGUAGES,
} from "../../utils/validateUpload.js";

describe("validateFile", () => {
  it("returns invalid when file is null", () => {
    const result = validateFile(null);
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it("returns invalid when file is undefined", () => {
    expect(validateFile(undefined).valid).toBe(false);
  });

  it("returns invalid for a disallowed MIME type", () => {
    const result = validateFile({ type: "text/plain", size: 1000 });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/unsupported/i);
  });

  it("returns invalid for video/mp4", () => {
    expect(validateFile({ type: "video/mp4", size: 1000 }).valid).toBe(false);
  });

  it("returns valid for application/pdf under 20MB", () => {
    const result = validateFile({ type: "application/pdf", size: 1024 * 1024 });
    expect(result.valid).toBe(true);
    expect(result.message).toBeNull();
  });

  it("returns valid for image/jpeg", () => {
    expect(validateFile({ type: "image/jpeg", size: 500000 }).valid).toBe(true);
  });

  it("returns valid for image/png", () => {
    expect(validateFile({ type: "image/png", size: 500000 }).valid).toBe(true);
  });

  it("returns valid for image/webp", () => {
    expect(validateFile({ type: "image/webp", size: 500000 }).valid).toBe(true);
  });

  it("returns valid for file exactly at 20MB boundary", () => {
    expect(validateFile({ type: "application/pdf", size: MAX_BYTES }).valid).toBe(true);
  });

  it("returns invalid for file one byte over 20MB", () => {
    const result = validateFile({ type: "application/pdf", size: MAX_BYTES + 1 });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/20 MB|too large/i);
  });
});

describe("LANGUAGES", () => {
  it("has exactly 7 entries", () => {
    expect(LANGUAGES).toHaveLength(7);
  });

  it("every entry has a code and label", () => {
    LANGUAGES.forEach((lang) => {
      expect(typeof lang.code).toBe("string");
      expect(typeof lang.label).toBe("string");
    });
  });

  it("contains all required languages", () => {
    const labels = LANGUAGES.map((l) => l.label);
    ["English","Hindi","Punjabi","Kannada","Malayalam","Tamil","Telugu"].forEach((l) =>
      expect(labels).toContain(l)
    );
  });

  it("contains all required language codes", () => {
    const codes = LANGUAGES.map((l) => l.code);
    ["en","hi","pa","kn","ml","ta","te"].forEach((c) =>
      expect(codes).toContain(c)
    );
  });
});