// src/controllers/auth.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { LoginInput } from "../schemas/auth.schema";

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const secret: Secret = env.JWT_SECRET;
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
  const token = jwt.sign(payload, secret, options);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      region: user.region,
    },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      region: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
}
