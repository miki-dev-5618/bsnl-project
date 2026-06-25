// src/controllers/poi.controller.ts

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { CreatePoiInput, UpdatePoiInput } from "../schemas/poi.schema";
import { createAuditLog } from "../services/audit.service";

function paramId(req: Request): string {
  return req.params.id as string;
}

export async function listPois(req: Request, res: Response): Promise<void> {
  const smscId = paramId(req);

  const smsc = await prisma.sMSC.findUnique({ where: { id: smscId } });
  if (!smsc) {
    res.status(404).json({ error: "SMSC not found" });
    return;
  }

  const pois = await prisma.pOI.findMany({
    where: { smscId },
    include: {
      updatedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  res.json(pois);
}

export async function createPoi(req: Request, res: Response): Promise<void> {
  const smscId = paramId(req);
  const { name, status, note } = req.body as CreatePoiInput;
  const userId = req.user!.id;

  const smsc = await prisma.sMSC.findUnique({ where: { id: smscId } });
  if (!smsc) {
    res.status(404).json({ error: "SMSC not found" });
    return;
  }

  const poi = await prisma.pOI.create({
    data: { smscId, name, status, note: note ?? null, updatedById: userId },
    include: {
      updatedBy: { select: { id: true, name: true, email: true } },
    },
  });

  await createAuditLog({
    userId,
    smscId,
    action: "POI_CREATED",
    newValue: JSON.stringify({ name, status, note }),
  });

  res.status(201).json(poi);
}

export async function updatePoi(req: Request, res: Response): Promise<void> {
  const id = paramId(req);
  const body = req.body as UpdatePoiInput;
  const userId = req.user!.id;

  const existing = await prisma.pOI.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "POI not found" });
    return;
  }

  const oldValue = JSON.stringify({
    name: existing.name,
    status: existing.status,
    note: existing.note,
  });

  const poi = await prisma.pOI.update({
    where: { id },
    data: { ...body, updatedById: userId },
    include: {
      updatedBy: { select: { id: true, name: true, email: true } },
    },
  });

  await createAuditLog({
    userId,
    smscId: existing.smscId,
    action: "POI_UPDATED",
    oldValue,
    newValue: JSON.stringify({ name: poi.name, status: poi.status, note: poi.note }),
  });

  res.json(poi);
}

export async function deletePoi(req: Request, res: Response): Promise<void> {
  const id = paramId(req);
  const userId = req.user!.id;

  const existing = await prisma.pOI.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "POI not found" });
    return;
  }

  await prisma.pOI.delete({ where: { id } });

  await createAuditLog({
    userId,
    smscId: existing.smscId,
    action: "POI_DELETED",
    oldValue: JSON.stringify({
      name: existing.name,
      status: existing.status,
      note: existing.note,
    }),
  });

  res.status(204).send();
}
