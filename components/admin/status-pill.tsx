import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  NEW: "badge-brand",
  "UNDER REVIEW": "badge-warning",
  SHORTLISTED: "badge-success",
  INTERVIEW: "badge-success",
  SELECTED: "badge-success",
  REJECTED: "badge-muted",
};

export function ApplicantStatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span className={cn("badge", TONES[status.toUpperCase()] ?? "badge-muted", className)}>
      {status}
    </span>
  );
}
