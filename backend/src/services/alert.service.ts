// src/services/alert.service.ts

import nodemailer from "nodemailer";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Reusable helper function to send an email to a single recipient.
 * Fully awaited and logs any individual success/error.
 */
async function sendGmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
      console.warn("[Alert] Gmail user or App Password is not configured in .env. Skipping email.");
      return false;
    }
    
    await transporter.sendMail({
      from: `"BSNL Status Hub" <${env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Alert] Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Alert] Failed to send email to ${to}:`, error);
    return false;
  }
}

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

  const emails = subscribers.map((s: { email: string }) => s.email);
  console.log(`[Alert] Sending SMSC status updates to ${emails.length} subscribers...`);
  
  const sendPromises = emails.map(email => sendGmail(email, subject, html));
  await Promise.all(sendPromises);
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

  const emails = subscribers.map((s: { email: string }) => s.email);
  console.log(`[Alert] Sending POI status updates to ${emails.length} subscribers...`);
  
  const sendPromises = emails.map(email => sendGmail(email, subject, html));
  await Promise.all(sendPromises);
}
