// src/types/enums.ts
// Locally-defined enums matching the Prisma schema.
// This avoids version-specific import issues with @prisma/client enum exports.

export const Role = {
  ADMIN: "ADMIN",
  REGIONAL: "REGIONAL",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const SmscStatusType = {
  UP: "UP",
  DOWN: "DOWN",
  DEGRADED: "DEGRADED",
} as const;
export type SmscStatusType = (typeof SmscStatusType)[keyof typeof SmscStatusType];

export const PoiStatus = {
  ACTIVE: "ACTIVE",
  BROKEN: "BROKEN",
  RESOLVED: "RESOLVED",
} as const;
export type PoiStatus = (typeof PoiStatus)[keyof typeof PoiStatus];
