import { Loader2 } from "lucide-react";

/**
 * LoadingSpinner — reusable animated loading indicator.
 *
 * Accessibility:
 * - role="status" tells screen readers this is a live region
 * - aria-label gives the text announcement ("Loading..." by default)
 * - aria-hidden on the icon so the SVG is not double-announced
 *
 * Loader2 from lucide-react has the right visual weight and the
 * animate-spin Tailwind class applies a smooth 360-degree CSS rotation.
 */
export default function LoadingSpinner({ label = "Loading\u2026" }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center justify-center gap-3 py-16"
    >
      <Loader2
        className="h-10 w-10 animate-spin text-primary"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}