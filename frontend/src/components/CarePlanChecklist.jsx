import { AlertCircle, Calendar, CheckSquare, Utensils } from "lucide-react";
import { format, parseISO } from "date-fns";
import MedicationCard from "./MedicationCard.jsx";
import { Separator } from "@/components/ui/separator";

/**
 * CarePlanChecklist -- condensed full care-plan view.
 *
 * Used in the DocumentView right panel so patients can read the
 * simplified checklist side-by-side with the original document.
 *
 * Renders all 5 care plan sections in a scrollable column.
 * Uses MedicationCard for medications so the ReviewRequired guardrail
 * is automatically applied -- this component never checks reviewRequired.
 *
 * Never calls any API function.
 * Never invents, infers, or supplements medical content.
 * Renders only what is present in the carePlan prop.
 */
export default function CarePlanChecklist({ carePlan }) {
  const {
    medications = [],
    followUps = [],
    dailyTasks = [],
    warningSigns = [],
    dietActivityRestrictions = [],
  } = carePlan.carePlan;

  return (
    <div className="overflow-y-auto h-full space-y-5 pr-1">

      {/* Medications */}
      <section aria-labelledby="checklist-meds">
        <h3
          id="checklist-meds"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2"
        >
          Medications
        </h3>
        {medications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No medications listed.</p>
        ) : (
          <ul className="space-y-2 list-none p-0 m-0">
            {medications.map((med, i) => (
              <li key={i}>
                <MedicationCard medication={med} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      {/* Follow-ups */}
      <section aria-labelledby="checklist-followups">
        <h3
          id="checklist-followups"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2"
        >
          Follow-ups
        </h3>
        {followUps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No follow-ups listed.</p>
        ) : (
          <ul className="space-y-1 list-none p-0 m-0">
            {followUps.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm py-1 border-b last:border-0">
                <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p>{f.description}</p>
                  <p className="text-muted-foreground text-xs">
                    {format(parseISO(f.date), "MMMM dd, yyyy")} &middot; {f.type}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      {/* Daily Tasks */}
      <section aria-labelledby="checklist-tasks">
        <h3
          id="checklist-tasks"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2"
        >
          Daily Tasks
        </h3>
        {dailyTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No daily tasks listed.</p>
        ) : (
          <ul className="space-y-1 list-none p-0 m-0">
            {dailyTasks.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm py-1 border-b last:border-0">
                <CheckSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p>{t.description}</p>
                  <p className="text-muted-foreground text-xs">{t.frequency}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      {/* Warning Signs */}
      <section aria-labelledby="checklist-warnings">
        <h3
          id="checklist-warnings"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2"
        >
          Warning Signs
        </h3>
        {warningSigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No warning signs listed.</p>
        ) : (
          <ul className="space-y-1 list-none p-0 m-0">
            {warningSigns.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm py-1 text-destructive border-b last:border-0"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      {/* Diet & Activity */}
      <section aria-labelledby="checklist-diet">
        <h3
          id="checklist-diet"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2"
        >
          Diet &amp; Activity
        </h3>
        {dietActivityRestrictions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No restrictions listed.</p>
        ) : (
          <ul className="space-y-1 list-none p-0 m-0">
            {dietActivityRestrictions.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm py-1 border-b last:border-0">
                <Utensils className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}