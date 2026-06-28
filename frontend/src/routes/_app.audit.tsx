import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAudit, useSession } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import { motion } from "framer-motion";
import { Info, ClipboardList } from "lucide-react";

export default function AuditPage() {
  const session = useSession();
  const audit = useAudit();

  useEffect(() => {
    document.title = "Audit log · BSNL SMS";
  }, []);

  if (session?.role !== "admin") {
    return (
      <div className="p-6">
        <Card className="rounded-3xl border border-red-500/10 bg-red-500/5 p-6 text-sm text-red-800 dark:text-red-400 flex items-center gap-3">
          <Info className="h-5 w-5 shrink-0" />
          <span>You do not have administrative clearance to access this log.</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 flex-1 flex flex-col min-h-0">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Audit Log</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          History of all point-of-interconnect (POI) and status transitions made by regional supervisors.
        </p>
      </div>

      <div className="rounded-3xl border border-white/60 dark:border-zinc-800/40 bg-white/50 dark:bg-zinc-900/45 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[300px]">
        <div className="overflow-y-auto flex-1 relative min-h-0">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.05)] border-b border-border/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-48 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground pl-5">Timestamp</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Operator</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Gateway (SMSC)</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Operation</TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground pr-5">Changelog Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <motion.div
                        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="mb-4 text-muted-foreground/60 p-4 bg-muted/40 rounded-full border border-border/40"
                      >
                        <ClipboardList className="h-10 w-10" />
                      </motion.div>
                      <h3 className="text-sm font-bold text-foreground">No updates logged</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[250px] leading-relaxed">
                        There are no point-of-interconnect system events recorded in the registry database yet.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                audit.map((a, index) => (
                  <TableRow
                    key={a.id}
                    className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.04] transition-colors duration-150 odd:bg-muted/10 dark:odd:bg-zinc-800/10"
                  >
                    <TableCell className="font-mono text-[10px] text-muted-foreground/80 pl-5">
                      {formatDateTime(a.ts)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground text-xs">{a.user}</TableCell>
                    <TableCell className="font-bold text-foreground text-xs">{a.smsc}</TableCell>
                    <TableCell className="text-xs">
                      <span className="inline-flex items-center rounded-md bg-primary/5 dark:bg-primary/10 border border-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                        {a.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-sm truncate pr-5 font-normal">
                      {a.note || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
