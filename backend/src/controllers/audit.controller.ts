// src/controllers/audit.controller.ts

import { Request, Response } from "express";
import { getAuditLogs } from "../services/audit.service";

export async function listAuditLogs(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const smscId = req.query.smscId as string | undefined;
  const userId = req.query.userId as string | undefined;

  const result = await getAuditLogs({ page, limit, smscId, userId });
  res.json(result);
}
