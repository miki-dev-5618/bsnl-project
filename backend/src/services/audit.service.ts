// src/services/audit.service.ts

import { prisma } from "../lib/prisma";

interface AuditEntry {
  userId: string;
  smscId?: string;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
}

export async function createAuditLog(entry: AuditEntry) {
  return prisma.auditLog.create({
    data: {
      userId: entry.userId,
      smscId: entry.smscId,
      action: entry.action,
      oldValue: entry.oldValue ?? null,
      newValue: entry.newValue ?? null,
    },
  });
}

export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  smscId?: string;
  userId?: string;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const skip = (page - 1) * limit;

  const where: Record<string, string> = {};
  if (params.smscId) where.smscId = params.smscId;
  if (params.userId) where.userId = params.userId;

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        smsc: { select: { id: true, name: true, city: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
