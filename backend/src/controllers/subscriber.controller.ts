// src/controllers/subscriber.controller.ts

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { CreateSubscriberInput } from "../schemas/subscriber.schema";

function paramId(req: Request): string {
  return req.params.id as string;
}

export async function listSubscribers(_req: Request, res: Response): Promise<void> {
  const subscribers = await prisma.alertSubscriber.findMany({
    orderBy: { email: "asc" },
  });
  res.json(subscribers);
}

export async function createSubscriber(req: Request, res: Response): Promise<void> {
  const { email, phone } = req.body as CreateSubscriberInput;

  const existing = await prisma.alertSubscriber.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Subscriber with this email already exists" });
    return;
  }

  const subscriber = await prisma.alertSubscriber.create({
    data: { email, phone },
  });

  res.status(201).json(subscriber);
}

export async function deleteSubscriber(req: Request, res: Response): Promise<void> {
  const id = paramId(req);

  const existing = await prisma.alertSubscriber.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }

  await prisma.alertSubscriber.delete({ where: { id } });
  res.status(204).send();
}
