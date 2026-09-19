export const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Validates a File object before upload.
 * Pure function — no side effects, fully testable.
 *
 * @param {File|null} file
 * @returns {{ valid: boolean, message: string|null }}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, message: "Please select a file before uploading." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      valid: false,
      message: "Unsupported file type. Please upload a PDF, JPEG, PNG, or WebP image.",
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      valid: false,
      message: "File is too large. Maximum allowed size is 20 MB.",
    };
  }
  return { valid: true, message: null };
}

/**
 * The 7 supported languages for the care plan.
 * Code values match what the backend/pipeline expects (ISO 639-1).
 */
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "pa", label: "Punjabi" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
];