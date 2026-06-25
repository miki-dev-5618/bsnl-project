// src/server.ts

import app from "./app";
import { env } from "./config/env";
import { startCronJobs } from "./services/cron.service";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   BSNL Status Hub — Backend API Server        ║
║   Running on http://localhost:${PORT}             ║
║   Environment: ${process.env.NODE_ENV || "development"}                  ║
╚═══════════════════════════════════════════════╝
  `);

  // Start background cron jobs
  startCronJobs();
});
