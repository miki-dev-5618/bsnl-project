import type { Status } from "@/lib/store";
import { cn } from "@/lib/utils";

const styles: Record<Status, string> = {
  Up: "bg-[var(--color-status-up)]/15 text-[var(--color-status-up)] border-[var(--color-status-up)]/30",
  Down: "bg-[var(--color-status-down)]/15 text-[var(--color-status-down)] border-[var(--color-status-down)]/30",
  Degraded:
    "bg-[var(--color-status-degraded)]/15 text-[var(--color-status-degraded)] border-[var(--color-status-degraded)]/40",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
