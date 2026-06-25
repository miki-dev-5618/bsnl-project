// src/controllers/smsc.controller.ts

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { UpdateSmscStatusInput } from "../schemas/smsc.schema";
import { createAuditLog } from "../services/audit.service";
import { notifySubscribers } from "../services/alert.service";

function paramId(req: Request): string {
  return req.params.id as string;
}

export async function listSmscs(_req: Request, res: Response): Promise<void> {
  const smscs = await prisma.sMSC.findMany({
    include: {
      statuses: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          updatedBy: { select: { id: true, name: true, email: true } },
        },
      },
      _count: { select: { pois: true } },
      pois: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = smscs.map((smsc: any) => ({
    id: smsc.id,
    name: smsc.name,
    city: smsc.city,
    lat: smsc.lat,
    lng: smsc.lng,
    createdAt: smsc.createdAt,
    currentStatus: smsc.statuses[0] ?? null,
    poiCount: smsc._count.pois,
    pois: smsc.pois.map((poi: any) => ({
      id: poi.id,
      name: poi.name,
      broken: poi.status === "BROKEN",
    })),
  }));

  res.json(result);
}

export async function updateSmscStatus(req: Request, res: Response): Promise<void> {
  const id = paramId(req);
  const { status, note } = req.body as UpdateSmscStatusInput;
  const userId = req.user!.id;

  const smsc = await prisma.sMSC.findUnique({ where: { id } });
  if (!smsc) {
    res.status(404).json({ error: "SMSC not found" });
    return;
  }

  // Get previous status for audit
  const prevStatus = await prisma.sMSCStatus.findFirst({
    where: { smscId: id },
    orderBy: { createdAt: "desc" },
  });

  const newStatus = await prisma.sMSCStatus.create({
    data: { smscId: id, status, note: note ?? null, updatedById: userId },
    include: {
      updatedBy: { select: { id: true, name: true, email: true } },
    },
  });

  // Audit log
  await createAuditLog({
    userId,
    smscId: id,
    action: "SMSC_STATUS_UPDATE",
    oldValue: prevStatus?.status ?? null,
    newValue: JSON.stringify({ status, note }),
  });

  // Alert subscribers on DOWN/DEGRADED
  notifySubscribers(smsc.name, smsc.city, status, note).catch((err: unknown) =>
    console.error("[Alert] Background notification failed:", err)
  );

  res.json(newStatus);
}

export async function getSmscHistory(req: Request, res: Response): Promise<void> {
  const id = paramId(req);
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;

  const smsc = await prisma.sMSC.findUnique({ where: { id } });
  if (!smsc) {
    res.status(404).json({ error: "SMSC not found" });
    return;
  }

  const [data, total] = await Promise.all([
    prisma.sMSCStatus.findMany({
      where: { smscId: id },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.sMSCStatus.count({ where: { smscId: id } }),
  ]);

  res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
}
