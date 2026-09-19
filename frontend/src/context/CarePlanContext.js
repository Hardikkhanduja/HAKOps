import { createContext, useContext } from "react";

/**
 * CarePlanContext provides the fetched care plan data to all screens
 * under the /plan/:id route subtree.
 *
 * The data is fetched ONCE in PlanLayout and shared downward — no child
 * component ever calls getCarePlan() directly. This means navigating
 * between Dashboard, DetailSection, DocumentView, and PharmacyScreen is
 * instant with zero extra network requests.
 *
 * Value shape: { carePlan: object|null, id: string }
 */
export const CarePlanContext = createContext(null);

/**
 * useCarePlan — convenience hook for consuming the context.
 *
 * Throws a clear error if called outside PlanLayout's provider so that
 * mis-placed components are caught immediately in development.
 */
export function useCarePlan() {
  const ctx = useContext(CarePlanContext);
  if (ctx === null) {
    throw new Error(
      "useCarePlan must be used inside a CarePlanContext.Provider " +
      "(i.e. within a /plan/:id route rendered by PlanLayout)."
    );
  }
  return ctx;
}