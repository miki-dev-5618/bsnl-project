import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import type { SMSC, Location, Status } from "@/lib/store";
import { formatDistanceToNow } from "@/lib/format";
import { MapPin, ServerCrash, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const locationStyles: Record<Location, string> = {
  North: "bg-blue-50/60 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30",
  South: "bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30",
  East: "bg-violet-50/60 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/30",
  West: "bg-amber-50/60 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30",
};

const statusGlow: Record<Status, string> = {
  Up: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]",
  Degraded: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.45)]",
  Down: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.45)]",
};

export function SmscCard({ smsc, onClick }: { smsc: SMSC; onClick: () => void }) {
  const brokenCount = smsc.pois.filter((p) => p.broken).length;
  const isHealthy = smsc.status === "Up";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden cursor-pointer p-5 border border-white/60 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm rounded-3xl",
        "transition-all duration-300 hover:translate-y-[-3px] hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30",
      )}
    >
      {/* Sleek left-side status glow indicator */}
      <div className={cn("absolute left-0 top-4 bottom-4 w-1 rounded-r-full", statusGlow[smsc.status])} />

      <div className="flex items-start justify-between gap-2 pl-2">
        <div className="space-y-2">
          <div>
            <div className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
              {smsc.name}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground font-medium">
              <MapPin className="h-3 w-3 shrink-0" />
              {smsc.city}
            </div>
          </div>
          
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase",
              locationStyles[smsc.location],
            )}
          >
            {smsc.location}
          </span>
        </div>

        <StatusBadge status={smsc.status} />
      </div>

      {/* Stats Divider Line */}
      <div className="h-px bg-border/50 my-4 pl-2" />

      {/* Grid containing secondary specs */}
      <div className="grid grid-cols-2 gap-y-1.5 pl-2 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1">
          {brokenCount > 0 ? (
            <ServerCrash className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          )}
          <span>
            POIs <strong className="text-foreground">{smsc.pois.length - brokenCount}</strong>/{smsc.pois.length}
          </span>
        </div>

        <div className="text-right flex items-center justify-end gap-1 font-mono text-[10px]">
          <RefreshCw className="h-3 w-3 text-muted-foreground animate-[spin_4s_linear_infinite]" />
          <span>{formatDistanceToNow(smsc.lastUpdatedAt)}</span>
        </div>

        <div className="col-span-2 truncate text-[10px] text-muted-foreground/80 mt-1">
          Updated by <span className="font-semibold text-foreground/75">{smsc.lastUpdatedBy}</span>
        </div>
      </div>
    </Card>
  );
}
