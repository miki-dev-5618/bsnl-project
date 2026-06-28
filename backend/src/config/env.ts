// src/config/env.ts

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || "fallback-secret-do-not-use",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",

  SMTP_HOST: process.env.SMTP_HOST || "smtp.example.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "BSNL Status Hub <alerts@navyaa-dev.me>",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
} as const;
