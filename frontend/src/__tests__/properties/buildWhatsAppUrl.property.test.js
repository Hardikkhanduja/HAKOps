// Feature: discharge-companion-frontend
// Property 4: WhatsApp URL always encodes patient name and formatted date
// Validates: Requirements 7.2, 7.3
import { describe, it } from "vitest";
import * as fc from "fast-check";
import { buildWhatsAppUrl, formatUploadedAt } from "../../utils/buildWhatsAppUrl.js";

const pharmacyArb = fc.record({
  id:      fc.string({ minLength: 1 }),
  name:    fc.string({ minLength: 1, maxLength: 80 }),
  address: fc.string({ minLength: 1 }),
  phone:   fc.stringMatching(/^[0-9]{10,15}$/),
});

const isoDateArb = fc
  .integer({ min: 0, max: 1893456000000 }) // 0 = epoch, max = 2030-01-01 in ms
  .map((ms) => new Date(ms).toISOString());

// Restrict to names that survive a URL encode/decode round-trip intact.
// Chars like %, &, + have special meaning in query strings and would
// make the include-check unreliable without double-decoding.
const safeNameArb = fc
  .string({ minLength: 1, maxLength: 60 })
  .filter((s) => s === decodeURIComponent(encodeURIComponent(s)) && s.trim().length > 0);

describe("Property 4 - buildWhatsAppUrl always encodes name and date", () => {
  it("result starts with https://wa.me/", () => {
    fc.assert(
      fc.property(pharmacyArb, safeNameArb, isoDateArb, (ph, name, dt) => {
        const url = buildWhatsAppUrl(ph, name, dt);
        return url !== null && url.startsWith("https://wa.me/");
      }),
      { numRuns: 100 }
    );
  });

  it("decoded text always contains patient name", () => {
    fc.assert(
      fc.property(pharmacyArb, safeNameArb, isoDateArb, (ph, name, dt) => {
        const url = buildWhatsAppUrl(ph, name, dt);
        if (!url) return true;
        const text = decodeURIComponent(url.split("?text=")[1]);
        return text.includes(name);
      }),
      { numRuns: 100 }
    );
  });

  it("decoded text always contains the formatted date", () => {
    fc.assert(
      fc.property(pharmacyArb, safeNameArb, isoDateArb, (ph, name, dt) => {
        const url = buildWhatsAppUrl(ph, name, dt);
        if (!url) return true;
        const text = decodeURIComponent(url.split("?text=")[1]);
        return text.includes(formatUploadedAt(dt));
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for any falsy uploadedAt", () => {
    fc.assert(
      fc.property(
        pharmacyArb,
        safeNameArb,
        fc.oneof(fc.constant(null), fc.constant(undefined), fc.constant("")),
        (ph, name, dt) => buildWhatsAppUrl(ph, name, dt) === null
      ),
      { numRuns: 100 }
    );
  });
});