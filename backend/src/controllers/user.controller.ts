// src/controllers/user.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { CreateUserInput, UpdateUserInput } from "../schemas/user.schema";

const SALT_ROUNDS = 12;

function paramId(req: Request): string {
  return req.params.id as string;
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      region: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email, password, role, region } = req.body as CreateUserInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, region },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      region: true,
      createdAt: true,
    },
  });

  res.status(201).json(user);
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = paramId(req);
  const body = req.body as UpdateUserInput;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) {
    const dup = await prisma.user.findUnique({ where: { email: body.email } });
    if (dup && dup.id !== id) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    data.email = body.email;
  }
  if (body.password !== undefined) {
    data.passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
  }
  if (body.role !== undefined) data.role = body.role;
  if (body.region !== undefined) data.region = body.region;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      region: true,
      createdAt: true,
    },
  });

  res.json(user);
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = paramId(req);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Prevent deleting yourself
  if (req.user!.id === id) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
}
