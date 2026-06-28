import type { Status } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const styles: Record<Status, string> = {
  Up: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/30",
  Down: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-900/30",
  Degraded:
    "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/30",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all duration-300",
        styles[status],
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <motion.span
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.2, 0.9] }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
          className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75"
        />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
      </span>
      <span>{status}</span>
    </span>
  );
}
