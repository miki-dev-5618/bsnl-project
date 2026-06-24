import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import type { SMSC, Location } from "@/lib/store";
import { formatDistanceToNow } from "@/lib/format";
import { MapPin } from "lucide-react";

const locationStyles: Record<Location, string> = {
  North: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  South: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  East: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  West: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const statusBorder: Record<string, string> = {
  Up: "border-l-[var(--color-status-up)]",
  Degraded: "border-l-[var(--color-status-degraded)]",
  Down: "border-l-[var(--color-status-down)]",
};

export function SmscCard({ smsc, onClick }: { smsc: SMSC; onClick: () => void }) {
  const broken = smsc.pois.filter((p) => p.broken).length;
  return (
    <Card
      onClick={onClick}
      className={`group cursor-pointer border-l-[3px] p-4 transition-all hover:border-foreground/30 hover:shadow-lg hover:-translate-y-0.5 ${statusBorder[smsc.status]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <div className="text-sm font-semibold tracking-tight">{smsc.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {smsc.city}
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none ${locationStyles[smsc.location]}`}
          >
            {smsc.location}
          </span>
        </div>
        <StatusBadge status={smsc.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
        <div>
          POIs{" "}
          <span className="font-medium text-foreground">
            {smsc.pois.length - broken}
          </span>
          /{smsc.pois.length} up
        </div>
        <div className="text-right">{formatDistanceToNow(smsc.lastUpdatedAt)}</div>
        <div className="col-span-2 truncate opacity-70">by {smsc.lastUpdatedBy}</div>
      </div>
    </Card>
  );
}