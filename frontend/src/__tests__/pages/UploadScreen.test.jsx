import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UploadScreen from "../../pages/UploadScreen.jsx";
import * as carePlanApi from "../../data/carePlanApi.js";

const mockNavigate = vi.fn();

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const Tag = ["button","a","span","p","h1","h2","h3","ul","li","section","nav","main","header","footer"].includes(tag) ? tag : "div";
      const C = ({ children, ...props }) => {
        const allowed = Object.fromEntries(Object.entries(props).filter(([k]) =>
          !["initial","animate","transition","variants","whileHover","whileTap"].includes(k)));
        return <Tag {...allowed}>{children}</Tag>;
      };
      C.displayName = tag;
      return C;
    }
  }),
  AnimatePresence: ({ children }) => children ?? null,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../data/carePlanApi.js", () => ({ uploadDischargeDocument: vi.fn() }));

function renderUpload() {
  return render(<MemoryRouter><UploadScreen /></MemoryRouter>);
}

describe("UploadScreen", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the language selector", () => {
    renderUpload();
    expect(document.getElementById("language-select")).toBeInTheDocument();
  });

  it("shows validation message when submitting without a file", async () => {
    renderUpload();
    // Click the submit button (Upload & Get My Care Plan)
    const btn = screen.getByRole("button", { name: /upload.*care plan|upload and get/i });
    await userEvent.click(btn);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(carePlanApi.uploadDischargeDocument).not.toHaveBeenCalled();
  });

  it("disables submit button while upload is in flight", async () => {
    carePlanApi.uploadDischargeDocument.mockReturnValue(new Promise(() => {}));
    renderUpload();
    const fileInput = screen.getByLabelText(/select discharge document/i);
    await userEvent.upload(fileInput, new File(["x"], "d.pdf", { type: "application/pdf" }));
    const btn = screen.getByRole("button", { name: /upload.*care plan|upload and get/i });
    await userEvent.click(btn);
    expect(screen.getByRole("button", { name: /uploading/i })).toBeDisabled();
  });

  it("navigates to /status/:id on successful upload", async () => {
    carePlanApi.uploadDischargeDocument.mockResolvedValue({ id: "abc-123", status: "processing" });
    renderUpload();
    const fileInput = screen.getByLabelText(/select discharge document/i);
    await userEvent.upload(fileInput, new File(["x"], "d.pdf", { type: "application/pdf" }));
    await userEvent.click(screen.getByRole("button", { name: /upload.*care plan|upload and get/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/status/abc-123"));
  });

  it("shows error and re-enables submit when upload fails", async () => {
    carePlanApi.uploadDischargeDocument.mockRejectedValue(new Error("Server error"));
    renderUpload();
    const fileInput = screen.getByLabelText(/select discharge document/i);
    await userEvent.upload(fileInput, new File(["x"], "d.pdf", { type: "application/pdf" }));
    await userEvent.click(screen.getByRole("button", { name: /upload.*care plan|upload and get/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /upload.*care plan|upload and get/i })).not.toBeDisabled();
  });

  it("rejects unsupported MIME type before calling API", async () => {
    renderUpload();
    const fileInput = screen.getByLabelText(/select discharge document/i);
    await userEvent.upload(fileInput, new File(["x"], "note.txt", { type: "text/plain" }));
    await userEvent.click(screen.getByRole("button", { name: /upload.*care plan|upload and get/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(carePlanApi.uploadDischargeDocument).not.toHaveBeenCalled();
  });
});