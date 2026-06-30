// src/services/alert.service.ts

import { Resend } from "resend";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

const resend = new Resend(env.RESEND_API_KEY);



export async function notifySubscribers(
  smscName: string,
  city: string,
  newStatus: string,
  note?: string,
) {
  const subscribers = await prisma.alertSubscriber.findMany();
  if (subscribers.length === 0) {
    console.log("[Alert] No subscribers to notify");
    return;
  }

  const statusColor =
    newStatus === "DOWN" ? "#dc2626" : newStatus === "DEGRADED" ? "#f59e0b" : "#16a34a";
  const subject = `[BSNL Status] SSTP ${smscName} (${city}) is ${newStatus}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: ${statusColor};">
        SSTP Status Update
      </h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">SSTP</td>
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
        ${note
      ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Note</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${note}</td>
        </tr>
        `
      : ""
    }
      </table>
      <p style="color: #6b7280; margin-top: 16px; font-size: 12px;">
        This is an automated alert from BSNL Status Hub.
      </p>
    </div>
  `;

  const emails = subscribers.map((s: { email: string }) => s.email);
  try {
    console.log(`[Mailer] Sending subscriber notification using Resend...`);

    const batchMessages = emails.map((email: string) => ({
      from: env.SMTP_FROM,
      to: [email],
      subject,
      html,
    }));

    const { data, error } = await resend.batch.send(batchMessages);
    console.log("[Alert] Resend batch data:", data);
    console.log("[Alert] Resend batch error:", error);

    if (error) {
      console.error("[Alert] Resend API error occurred:", error.message || error);
    } else {
      console.log(`[Alert] Notification sent to ${emails.length} subscriber(s)`);
    }
  } catch (err) {
    console.error("[Alert] Network/System error sending email via Resend:", err);
  }
}

export async function notifyPoiStatus(
  poiName: string,
  smscName: string,
  newStatus: string,
  note?: string,
) {
  const subscribers = await prisma.alertSubscriber.findMany();
  if (subscribers.length === 0) {
    console.log("[Alert] No subscribers to notify for POI");
    return;
  }

  const statusColor =
    newStatus === "BROKEN" ? "#dc2626" : newStatus === "ACTIVE" ? "#16a34a" : "#f59e0b";
  const subject = `TEST [BSNL Status] POI ${poiName} (SSTP: ${smscName}) is ${newStatus}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: ${statusColor};">
        TEST POI Status Update
      </h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">POI</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${poiName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">SSTP</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${smscName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status</td>
          <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor};">
            ${newStatus}
          </td>
        </tr>
        ${note
      ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Note</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${note}</td>
        </tr>
        `
      : ""
    }
      </table>
      <p style="color: #6b7280; margin-top: 16px; font-size: 12px;">
        This is an automated alert from BSNL Status Hub.
      </p>
    </div>
  `;

  const emails = subscribers.map((s: { email: string }) => s.email);
  try {
    console.log(`[Mailer] Sending POI notification using Resend...`);

    const batchMessages = emails.map((email: string) => ({
      from: env.SMTP_FROM,
      to: [email],
      subject,
      html,
    }));

    const { data, error } = await resend.batch.send(batchMessages);
    console.log("[Alert] Resend POI batch data:", data);
    console.log("[Alert] Resend POI batch error:", error);

    if (error) {
      console.error("[Alert] Resend API error occurred for POI:", error.message || error);
    } else {
      console.log(`[Alert] Notification sent to ${emails.length} subscriber(s) for POI ${poiName}`);
    }
  } catch (err) {
    console.error("[Alert] Network/System error sending email for POI via Resend:", err);
  }
}
