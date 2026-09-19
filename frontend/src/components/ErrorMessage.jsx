import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * ErrorMessage -- reusable error display component.
 *
 * Used everywhere an async operation fails: upload errors, polling
 * errors, care plan load failures, document iframe failures.
 *
 * The Alert component already sets role="alert" internally in this
 * shadcn version, so screen readers announce the message immediately.
 */
export default function ErrorMessage({ message, actionLabel, onAction }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        {onAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="self-start mt-1"
          >
            {actionLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}