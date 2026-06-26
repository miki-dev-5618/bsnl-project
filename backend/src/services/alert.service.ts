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

  const subscribers = await prisma.alertSubscriber.findMany();
  if (subscribers.length === 0) {
    console.log("[Alert] No subscribers to notify");
    return;
  }

  const statusColor = newStatus === "DOWN" ? "#dc2626" : newStatus === "DEGRADED" ? "#f59e0b" : "#16a34a";
  const subject = `[BSNL Status] SMSC ${smscName} (${city}) is ${newStatus}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: ${statusColor};">
        SMSC Status Update
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
          <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor};">
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

  const emails = ["navyaataneja5618@gmail.com"];
  try {
    console.log(`[Mailer] Sending subscriber notification to ${emails.join(", ")} via ${env.SMTP_HOST}:${env.SMTP_PORT}...`);
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

export async function notifyPoiStatus(
  poiName: string,
  smscName: string,
  newStatus: string,
  note?: string
) {
  const subscribers = await prisma.alertSubscriber.findMany();
  if (subscribers.length === 0) {
    console.log("[Alert] No subscribers to notify for POI");
    return;
  }

  const statusColor = newStatus === "BROKEN" ? "#dc2626" : newStatus === "ACTIVE" ? "#16a34a" : "#f59e0b";
  const subject = `[BSNL Status] POI ${poiName} (SMSC: ${smscName}) is ${newStatus}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: ${statusColor};">
        POI Status Update
      </h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">POI</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${poiName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">SMSC</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${smscName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status</td>
          <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor};">
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

  const emails = ["navyaataneja5618@gmail.com"];
  try {
    console.log(`[Mailer] Sending POI notification to ${emails.join(", ")} via ${env.SMTP_HOST}:${env.SMTP_PORT}...`);
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: emails.join(","),
      subject,
      html,
    });
    console.log(`[Alert] Notification sent to ${emails.length} subscriber(s) for POI ${poiName}`);
  } catch (err) {
    console.error("[Alert] Failed to send email for POI:", err);
  }
}
