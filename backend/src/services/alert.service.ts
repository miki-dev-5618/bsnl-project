// src/services/alert.service.ts

import nodemailer from "nodemailer";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { SmscStatusType } from "../types/enums";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function notifySubscribers(
  smscName: string,
  city: string,
  newStatus: string,
  note?: string
) {
  if (newStatus !== SmscStatusType.DOWN && newStatus !== SmscStatusType.DEGRADED) {
    return;
  }

  const subscribers = await prisma.alertSubscriber.findMany();
  if (subscribers.length === 0) {
    console.log("[Alert] No subscribers to notify");
    return;
  }

  const subject = `⚠️ BSNL SMSC Alert: ${smscName} (${city}) is ${newStatus}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: ${newStatus === "DOWN" ? "#dc2626" : "#f59e0b"};">
        SMSC Status Alert
      </h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">SMSC</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${smscName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">City</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${city}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status</td>
          <td style="padding: 8px; border: 1px solid #ddd; color: ${newStatus === "DOWN" ? "#dc2626" : "#f59e0b"};">
            ${newStatus}
          </td>
        </tr>
        ${note ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Note</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${note}</td>
        </tr>
        ` : ""}
      </table>
      <p style="color: #6b7280; margin-top: 16px; font-size: 12px;">
        This is an automated alert from BSNL Status Hub.
      </p>
    </div>
  `;

  const emails = subscribers.map((s: { email: string }) => s.email);
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: emails.join(","),
      subject,
      html,
    });
    console.log(`[Alert] Notification sent to ${emails.length} subscriber(s)`);
  } catch (err) {
    console.error("[Alert] Failed to send email:", err);
  }
}
