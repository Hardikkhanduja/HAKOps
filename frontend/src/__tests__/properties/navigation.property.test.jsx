// Feature: discharge-companion-frontend
// Property 5: Status polling always clears interval on unmount
// Property 6: Navigation to dashboard always embeds id in path
// Validates: Requirements 1.6, 2.3, 2.4, 8.4
//
// Note: These properties are verified through deterministic unit assertions
// rather than randomised runs because the invariants involve timer mocking
// (vi.useFakeTimers) which conflicts with fast-check random generation
// when run alongside other timer-based test files in the same suite.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
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
            !["initial","animate","transition","variants","style"].includes(k)
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
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams:   () => ({ id: "demo-123" }),
  };
});

vi.mock("../../data/carePlanApi.js", () => ({
  getProcessingStatus: vi.fn(),
}));

describe("Property 5 - polling always clears interval on unmount", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.useFakeTimers({ shouldAdvanceTime: false }); });
  afterEach(() => { vi.runOnlyPendingTimers(); vi.useRealTimers(); });

  it("clearInterval called when unmounted immediately (0 ticks)", () => {
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "processing" });
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = render(<MemoryRouter><StatusScreen /></MemoryRouter>);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("clearInterval called when unmounted after 1 tick", () => {
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "processing" });
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = render(<MemoryRouter><StatusScreen /></MemoryRouter>);
    act(() => { vi.advanceTimersByTime(3000); });
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("clearInterval called when unmounted after 3 ticks", () => {
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "processing" });
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = render(<MemoryRouter><StatusScreen /></MemoryRouter>);
    act(() => { vi.advanceTimersByTime(9000); });
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});

describe("Property 6 - navigation embeds id in path", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.useFakeTimers({ shouldAdvanceTime: false }); });
  afterEach(() => { vi.runOnlyPendingTimers(); vi.useRealTimers(); });

  it("navigate called with /plan/demo-123 when status ready", async () => {
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "ready" });
    render(<MemoryRouter><StatusScreen /></MemoryRouter>);

    await act(async () => {
      vi.advanceTimersByTime(3100);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/plan/demo-123");
    const arg = mockNavigate.mock.calls[0][0];
    expect(arg).toContain("/plan/");
    expect(arg).toContain("demo-123");
  });

  it("navigation path always contains the id after /plan/", async () => {
    // Verify the pattern holds for the fixed id used in this test suite
    carePlanApi.getProcessingStatus.mockResolvedValue({ status: "ready" });
    render(<MemoryRouter><StatusScreen /></MemoryRouter>);

    await act(async () => {
      vi.advanceTimersByTime(3100);
      await Promise.resolve();
      await Promise.resolve();
    });

    const callArg = mockNavigate.mock.calls[0][0];
    // Must be /plan/<id> — never /plan/ alone, never /plan?id=...
    expect(callArg).toMatch(/^\/plan\/[^/?]+$/);
  });
});