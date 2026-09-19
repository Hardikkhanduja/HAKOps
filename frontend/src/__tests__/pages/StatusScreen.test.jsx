import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatusScreen from "../../pages/StatusScreen.jsx";
import * as carePlanApi from "../../data/carePlanApi.js";

const mockNavigate = vi.fn();

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const C = ({ children, ...props }) => {
        const allowed = Object.fromEntries(
          Object.entries(props).filter(([k]) =>
            !["initial","animate","transition","variants","whileHover","whileTap","style"].includes(k)
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
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: "demo-123" }) };
});

vi.mock("../../data/carePlanApi.js", () => ({ getProcessingStatus: vi.fn() }));

function renderStatus() {
  return render(<MemoryRouter><StatusScreen /></MemoryRouter>);
}

async function advanceAndFlush(ms) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("StatusScreen", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.useFakeTimers({ shouldAdvanceTime: false }); });
  afterEach(() => { vi.runOnlyPendingTimers(); vi.useRealTimers(); });

  it("shows a status indicator on mount", () => {
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "processing" });
    renderStatus();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("navigates to /plan/:id when status becomes ready", async () => {
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "ready" });
    renderStatus();
    await advanceAndFlush(3100);
    expect(mockNavigate).toHaveBeenCalledWith("/plan/demo-123");
  }, 10000);

  it("shows error message when status is error", async () => {
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "error" });
    renderStatus();
    await advanceAndFlush(3100);
    expect(screen.getAllByText(/could not be processed|processing failed/i).length).toBeGreaterThanOrEqual(1);
  }, 10000);

  it("shows error on network failure", async () => {
    carePlanApi.getProcessingStatus.mockRejectedValue(new Error("Network error"));
    renderStatus();
    await advanceAndFlush(3100);
    expect(screen.getByText(/network error|connection/i)).toBeInTheDocument();
  }, 10000);

  it("shows timeout message after 120 seconds", async () => {
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "processing" });
    renderStatus();
    await advanceAndFlush(121000);
    expect(screen.getByText(/longer than expected|timeout/i)).toBeInTheDocument();
  }, 20000);

  it("calls clearInterval when unmounted", () => {
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "processing" });
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = renderStatus();
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});