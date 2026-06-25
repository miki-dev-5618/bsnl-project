// src/middleware/auth.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../types/enums";
import { env } from "../config/env";

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed Authorization header" });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (req.user.role !== Role.ADMIN) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
