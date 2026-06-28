import { useSmscs, useAudit } from "@/lib/store";
import { formatDistanceToNow } from "@/lib/format";
import { motion } from "framer-motion";
import { useState } from "react";
import { Activity } from "lucide-react";

export function LiveStatusTicker() {
  const smscs = useSmscs();
  const audit = useAudit();
  const [isHovered, setIsHovered] = useState(false);

  // Compute status counts dynamically
  const upCount = smscs.filter((s) => s.status === "Up").length;
  const degradedCount = smscs.filter((s) => s.status === "Degraded").length;
  const downCount = smscs.filter((s) => s.status === "Down").length;

  // Extract the most recent status change event from the audit log
  const statusEvents = audit.filter((a) => a.action.includes("status"));
  const lastIncident = statusEvents.length > 0 ? statusEvents[0] : null;

  const tickerText = (
    <div className="flex items-center gap-12 pr-12 text-[11px] uppercase tracking-wider font-semibold text-foreground/80">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>{upCount} SMSCs Online</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {degradedCount > 0 && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span>{degradedCount} Degraded</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {downCount > 0 && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span>{downCount} Down</span>
      </div>

      {lastIncident ? (
        <div className="flex items-center gap-2 text-muted-foreground normal-case font-normal">
          <span className="text-primary font-bold">⚡ Status Alert:</span>
          <span>
            {lastIncident.smsc} {lastIncident.action}
          </span>
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">
            {formatDistanceToNow(lastIncident.ts)}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground normal-case font-normal">
          <span>⚡ Systems fully operational</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/60 dark:border-zinc-800/40 bg-white/45 dark:bg-zinc-900/40 py-2.5 backdrop-blur-md shadow-sm">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div
        className="flex"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          animate={{ x: isHovered ? undefined : ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 35,
            repeat: Infinity,
          }}
          className="flex whitespace-nowrap"
          style={{ width: "fit-content" }}
        >
          {tickerText}
          {tickerText}
          {tickerText}
          {tickerText}
        </motion.div>
      </div>
    </div>
  );
}
