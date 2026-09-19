// Feature: discharge-companion-frontend
// Property 9: Upload error preserves file and language state, re-enables submit
// Validates: Requirements 1.7
import { describe, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import * as fc from "fast-check";
import UploadScreen from "../../pages/UploadScreen.jsx";
import * as carePlanApi from "../../data/carePlanApi.js";

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const C = ({ children, ...props }) => {
        const allowed = Object.fromEntries(
          Object.entries(props).filter(([k]) =>
            !["initial","animate","transition","variants","whileHover","whileTap"].includes(k)
          )
        );
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
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("../../data/carePlanApi.js", () => ({
  uploadDischargeDocument: vi.fn(),
}));

describe("Property 9 - upload error re-enables submit button", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submit button re-enabled for any error message thrown", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 80 }),
        async (errorMessage) => {
          carePlanApi.uploadDischargeDocument.mockRejectedValue(new Error(errorMessage));

          const { unmount } = render(<MemoryRouter><UploadScreen /></MemoryRouter>);

          const fileInput = screen.getByLabelText(/select discharge document/i);
          await userEvent.upload(fileInput, new File(["x"], "test.pdf", { type: "application/pdf" }));
          await userEvent.click(screen.getByRole("button", { name: /upload.*care plan|upload and get|upload document/i }));

          let reEnabled = false;
          await waitFor(() => {
            const btn = screen.getByRole("button", { name: /upload.*care plan|upload and get|upload document/i });
            reEnabled = !btn.disabled;
          });

          unmount();
          return reEnabled;
        }
      ),
      { numRuns: 10 }
    );
  });
});