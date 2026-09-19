import { Card, CardContent } from "@/components/ui/card";

/**
 * SectionCard -- a clickable summary card on the Patient Dashboard.
 *
 * Rendered as a <button> wrapping a Card so that:
 * - It is keyboard-focusable by default (Tab key)
 * - Enter/Space keys activate it
 * - Screen readers announce it as a button with the full aria-label
 *
 * The aria-label is constructed as "View [label], [count] items" so
 * assistive technology users get the full context in one announcement
 * without needing to navigate into the card.
 *
 * The optional icon prop accepts any lucide-react icon component.
 */
export default function SectionCard({ label, count, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={`View ${label}, ${count} item${count !== 1 ? "s" : ""}`}
      className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="pt-4 pb-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            <span className="text-xs font-medium uppercase tracking-wide">
              {label}
            </span>
          </div>
          <span className="text-2xl font-bold">{count}</span>
          <span className="text-xs text-muted-foreground">
            {count === 1 ? "item" : "items"}
          </span>
        </CardContent>
      </Card>
    </button>
  );
}