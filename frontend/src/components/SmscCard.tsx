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
        "group relative overflow-hidden cursor-pointer p-[17px] border border-white/60 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm rounded-[20.4px]",
        "transition-all duration-300 hover:translate-y-[-2.55px] hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30",
      )}
    >
      {/* Sleek left-side status glow indicator */}
      <div className={cn("absolute left-0 top-[13.6px] bottom-[13.6px] w-[3.4px] rounded-r-full", statusGlow[smsc.status])} />

      <div className="flex items-start justify-between gap-[6.8px] pl-[6.8px]">
        <div className="space-y-[6.8px]">
          <div>
            <div className="text-[11.9px] font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
              {smsc.name}
            </div>
            <div className="flex items-center gap-[3.4px] mt-[3.4px] text-[9.35px] text-muted-foreground font-medium">
              <MapPin className="h-[10.2px] w-[10.2px] shrink-0" />
              {smsc.city}
            </div>
          </div>
          
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-[6.8px] py-[1.7px] text-[7.65px] font-bold tracking-wide uppercase",
              locationStyles[smsc.location],
            )}
          >
            {smsc.location}
          </span>
        </div>

        <StatusBadge status={smsc.status} className="px-[6.8px] py-[1.7px] text-[10.2px] gap-[5.1px]" />
      </div>

      {/* Stats Divider Line */}
      <div className="h-px bg-border/50 my-[13.6px] pl-[6.8px]" />

      {/* Grid containing secondary specs */}
      <div className="grid grid-cols-2 gap-y-[5.1px] pl-[6.8px] text-[10.2px] font-medium text-muted-foreground">
        <div className="flex items-center gap-[3.4px]">
          {brokenCount > 0 ? (
            <ServerCrash className="h-[11.9px] w-[11.9px] text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 className="h-[11.9px] w-[11.9px] text-emerald-500 shrink-0" />
          )}
          <span>
            POIs <strong className="text-foreground">{smsc.pois.length - brokenCount}</strong>/{smsc.pois.length}
          </span>
        </div>

        <div className="text-right flex items-center justify-end gap-[3.4px] font-mono text-[8.5px]">
          <RefreshCw className="h-[10.2px] w-[10.2px] text-muted-foreground animate-[spin_4s_linear_infinite]" />
          <span>{formatDistanceToNow(smsc.lastUpdatedAt)}</span>
        </div>

        <div className="col-span-2 truncate text-[8.5px] text-muted-foreground/80 mt-[3.4px]">
          Updated by <span className="font-semibold text-foreground/75">{smsc.lastUpdatedBy}</span>
        </div>
      </div>
    </Card>
  );
}
