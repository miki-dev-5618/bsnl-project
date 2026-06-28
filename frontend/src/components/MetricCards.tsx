import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useSmscs } from "@/lib/store";
import { Server, ShieldCheck, AlertTriangle, AlertOctagon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

// Helper for counting up numbers smoothly
function CountUp({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1000; // ms
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      
      // Easing out quad
      const easeProgress = progressRatio * (2 - progressRatio);
      
      const current = Math.floor(easeProgress * (end - start) + start);
      setDisplayValue(current);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}</span>;
}

// Custom sparkline component that renders an inline SVG graph
function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (points.length === 0) return null;
  const width = 100;
  const height = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 6) - 3;
    return { x, y };
  });

  const pathD = coords.reduce(
    (acc, c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`),
    ""
  );

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const gradId = `sparkline-grad-${color.replace("#", "")}`;

  return (
    <svg className="h-8 w-24 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MetricCards() {
  const smscs = useSmscs();

  const total = smscs.length;
  const up = smscs.filter((s) => s.status === "Up").length;
  const degraded = smscs.filter((s) => s.status === "Degraded").length;
  const down = smscs.filter((s) => s.status === "Down").length;

  const cardsData = [
    {
      title: "Total SMSCs",
      value: total,
      icon: Server,
      color: "#3971B8",
      trend: "Stable",
      trendUp: true,
      sparkPoints: [14, 15, 15, 16, 16, 16, 16],
      description: "Active SMS gateways",
    },
    {
      title: "Uptime (Up)",
      value: up,
      icon: ShieldCheck,
      color: "#10B981",
      trend: "+2 since yesterday",
      trendUp: true,
      sparkPoints: [12, 13, 14, 13, 14, 15, 16],
      description: "Nodes fully operational",
    },
    {
      title: "Degraded Status",
      value: degraded,
      icon: AlertTriangle,
      color: "#F59E0B",
      trend: "-1 since yesterday",
      trendUp: false,
      sparkPoints: [3, 2, 1, 2, 1, 1, 0],
      description: "Partial gateway issues",
    },
    {
      title: "System Outages (Down)",
      value: down,
      icon: AlertOctagon,
      color: "#EF4444",
      trend: "-1 since yesterday",
      trendUp: false,
      sparkPoints: [1, 1, 0, 1, 1, 0, 0],
      description: "Out of service gateways",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardsData.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className="group relative rounded-3xl border border-white/50 dark:border-zinc-800/40 bg-white/60 dark:bg-zinc-900/45 p-5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30"
          >
            {/* Soft backdrop glow on hover */}
            <div
              className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-5 dark:group-hover:opacity-[0.03] pointer-events-none"
              style={{
                background: `radial-gradient(circle at 80% 20%, ${card.color}, transparent 60%)`,
              }}
            />

            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className="rounded-xl p-2 bg-muted/50 dark:bg-zinc-800/30 text-foreground transition-transform group-hover:scale-105 duration-200"
                style={{ color: card.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                <CountUp value={card.value} />
              </span>
              <div className="flex items-center text-[10px] font-medium" style={{ color: card.color }}>
                {card.trendUp ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>{card.trend}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{card.description}</span>
              <div className="opacity-95 group-hover:opacity-100 transition-opacity">
                <Sparkline points={card.sparkPoints} color={card.color} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
