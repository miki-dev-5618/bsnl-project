import { useEffect, useState } from "react";
import { SmscCard } from "@/components/SmscCard";
import { SmscSheet } from "@/components/SmscSheet";
import { useSmscs, type SMSC } from "@/lib/store";

export default function Dashboard() {
  const smscs = useSmscs();
  const [selected, setSelected] = useState<SMSC | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = "Dashboard · BSNL SMS";
  }, []);

  const counts = smscs.reduce(
    (acc, s) => ({ ...acc, [s.status]: (acc[s.status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">SMSC Overview</h2>
        <p className="text-sm text-muted-foreground">
          {smscs.length} SMSCs · {counts.Up ?? 0} Up · {counts.Degraded ?? 0} Degraded ·{" "}
          {counts.Down ?? 0} Down
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {smscs.map((s) => (
          <SmscCard
            key={s.id}
            smsc={s}
            onClick={() => {
              setSelected(s);
              setOpen(true);
            }}
          />
        ))}
      </div>
      <SmscSheet smsc={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
