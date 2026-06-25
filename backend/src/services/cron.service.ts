// src/services/cron.service.ts

import cron from "node-cron";
import { prisma } from "../lib/prisma";

export function startCronJobs() {
  // Health check every 5 minutes — stub implementation
  cron.schedule("*/5 * * * *", async () => {
    console.log(`[Cron] Health check started at ${new Date().toISOString()}`);
    try {
      const smscs = await prisma.sMSC.findMany({
        include: {
          statuses: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      for (const smsc of smscs) {
        const latestStatus = smsc.statuses[0];
        console.log(
          `[Cron]   ${smsc.name} (${smsc.city}): ${latestStatus?.status ?? "NO_STATUS"}`
        );
      }

      console.log(`[Cron] Health check complete. ${smscs.length} SMSCs checked.`);
    } catch (err) {
      console.error("[Cron] Health check failed:", err);
    }
  });

  console.log("[Cron] Scheduled health check every 5 minutes");
}
