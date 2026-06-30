import { useEffect, useState } from "react";
import { SmscCard } from "@/components/SmscCard";
import { SmscSheet } from "@/components/SmscSheet";
import { useSmscs, type SMSC } from "@/lib/store";
import { LiveStatusTicker } from "@/components/LiveStatusTicker";
import { MetricCards } from "@/components/MetricCards";
import { motion } from "framer-motion";

const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function Dashboard() {
  const smscs = useSmscs();
  const [selected, setSelected] = useState<SMSC | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = "Dashboard · BSNL SMS";
  }, []);

  const totalPois = smscs.reduce((acc, s) => acc + s.pois.length, 0);
  const activePois = smscs.reduce(
    (acc, s) => acc + s.pois.filter((p) => !p.broken).length,
    0
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Dynamic scrolling status ticker */}
      <LiveStatusTicker />

      {/* Main system statistics cards */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Infrastructure Metrics</h2>
        <MetricCards />
      </div>

      {/* SMSC Nodes Grid Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">SMS Gateways (SSTPs)</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/45">
              {activePois}/{totalPois} POIs Up
            </span>
            <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/45">
              {smscs.length} Node{smscs.length !== 1 ? "s" : ""} Monitored
            </span>
          </div>
        </div>

        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {smscs.map((s) => (
            <motion.div key={s.id} variants={cardItemVariants}>
              <SmscCard
                smsc={s}
                onClick={() => {
                  setSelected(s);
                  setOpen(true);
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <SmscSheet smsc={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
