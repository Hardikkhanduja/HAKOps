// Feature: discharge-companion-frontend
// Property 1: File type validation rejects non-whitelisted MIME types
// Validates: Requirements 1.1, 1.3
import { describe, it } from "vitest";
import * as fc from "fast-check";
import { validateFile, ALLOWED_TYPES, MAX_BYTES } from "../../utils/validateUpload.js";

describe("Property 1 - validateFile rejects non-whitelisted MIME types", () => {
  it("always valid:false for any MIME not in the allowed set", () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.string().filter((t) => !ALLOWED_TYPES.has(t)),
          size: fc.integer({ min: 0, max: MAX_BYTES }),
        }),
        (file) => validateFile(file).valid === false
      ),
      { numRuns: 100 }
    );
  });

  it("always valid:true for whitelisted types under the size limit", () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constantFrom(...Array.from(ALLOWED_TYPES)),
          size: fc.integer({ min: 0, max: MAX_BYTES }),
        }),
        (file) => validateFile(file).valid === true
      ),
      { numRuns: 100 }
    );
  });

  it("always valid:false when size exceeds MAX_BYTES regardless of type", () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constantFrom(...Array.from(ALLOWED_TYPES)),
          size: fc.integer({ min: MAX_BYTES + 1, max: MAX_BYTES * 2 }),
        }),
        (file) => validateFile(file).valid === false
      ),
      { numRuns: 100 }
    );
  });
});