import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { CheckCircle2, AlertOctagon } from "lucide-react";
import type { POI, SMSC, Status } from "@/lib/store";
import { updateSmsc, useSession } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export function SmscSheet({
  smsc,
  open,
  onOpenChange,
}: {
  smsc: SMSC | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const session = useSession();
  const [status, setStatus] = useState<Status>("Up");
  const [pois, setPois] = useState<POI[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (smsc) {
      setStatus(smsc.status);
      setPois(smsc.pois.map((p) => ({ ...p })));
      setNote("");
    }
  }, [smsc]);

  if (!smsc) return null;

  const togglePoi = (id: string) => {
    setPois((cur) => cur.map((p) => (p.id === id ? { ...p, broken: !p.broken } : p)));
  };

  const save = () => {
    if (!session) return;
    updateSmsc(smsc.id, { status, pois, note }, session.email);
    if (status !== smsc.status && (status === "Down" || status === "Degraded")) {
      toast.warning(`Alert dispatched: ${smsc.name} is ${status}`);
    } else {
      toast.success(`${smsc.name} updated`);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {smsc.name}
            <StatusBadge status={smsc.status} />
          </SheetTitle>
          <SheetDescription>
            {smsc.city} · last updated {formatDateTime(smsc.lastUpdatedAt)} by {smsc.lastUpdatedBy}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <div className="space-y-2">
            <Label>POI status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Up">Up</SelectItem>
                <SelectItem value="Degraded">Degraded</SelectItem>
                <SelectItem value="Down">Down</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Active POIs</Label>
            <div className="space-y-2">
              {pois.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border p-2.5"
                >
                  <div className="flex items-center gap-2">
                    {p.broken ? (
                      <AlertOctagon className="h-4 w-4 text-[var(--color-status-down)]" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-status-up)]" />
                    )}
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.broken ? "broken" : "ok"}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => togglePoi(p.id)}>
                    {p.broken ? "Mark resolved" : "Mark broken"}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Describe what changed…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save changes</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
