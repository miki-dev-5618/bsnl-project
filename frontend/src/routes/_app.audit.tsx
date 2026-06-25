import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_app/audit")({
  head: () => ({ meta: [{ title: "Audit log · BSNL SMS" }] }),
  component: AuditPage,
});

function AuditPage() {
  const session = useSession();
  const audit = useAudit();

  if (session?.role !== "admin") {
    return (
      <div className="p-6">
        <Card className="p-6 text-sm text-muted-foreground">
          You don't have access to this page.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Audit log</h2>
        <p className="text-sm text-muted-foreground">Every POI status change made by any user.</p>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">When</TableHead>
              <TableHead>User</TableHead>
              <TableHead>SMSC</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audit.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No changes yet.
                </TableCell>
              </TableRow>
            )}
            {audit.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">{formatDateTime(a.ts)}</TableCell>
                <TableCell>{a.user}</TableCell>
                <TableCell>{a.smsc}</TableCell>
                <TableCell>{a.action}</TableCell>
                <TableCell className="text-muted-foreground">{a.note || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
