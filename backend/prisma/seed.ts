// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const Role = { ADMIN: "ADMIN", REGIONAL: "REGIONAL" } as const;
const SmscStatusType = { UP: "UP", DOWN: "DOWN", DEGRADED: "DEGRADED" } as const;

const INDIAN_CITIES: Array<{ name: string; city: string; lat: number; lng: number }> = [
  { name: "SMSC-DEL-01", city: "New Delhi", lat: 28.6139, lng: 77.209 },
  { name: "SMSC-MUM-01", city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "SMSC-CHN-01", city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "SMSC-KOL-01", city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "SMSC-BLR-01", city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "SMSC-HYD-01", city: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "SMSC-AHM-01", city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "SMSC-PUN-01", city: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "SMSC-JAI-01", city: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "SMSC-LKO-01", city: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { name: "SMSC-PAT-01", city: "Patna", lat: 25.6093, lng: 85.1376 },
  { name: "SMSC-BHP-01", city: "Bhopal", lat: 23.2599, lng: 77.4126 },
  { name: "SMSC-GUW-01", city: "Guwahati", lat: 26.1445, lng: 91.7362 },
  { name: "SMSC-CHD-01", city: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "SMSC-TVM-01", city: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366 },
  { name: "SMSC-RAN-01", city: "Ranchi", lat: 23.3441, lng: 85.3096 },
];

const REGIONS = [
  "North", "West", "South", "East",
  "South", "South", "West", "West",
  "North", "North", "East", "Central",
  "NorthEast", "North", "South", "East",
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.pOI.deleteMany();
  await prisma.sMSCStatus.deleteMany();
  await prisma.alertSubscriber.deleteMany();
  await prisma.sMSC.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      name: "BSNL Admin",
      email: "admin@bsnl.in",
      passwordHash: adminHash,
      role: Role.ADMIN,
      region: "HQ",
    },
  });
  console.log(`  ✓ Admin created: ${admin.email}`);

  // Create regional users
  const userHash = await bcrypt.hash("user123", SALT_ROUNDS);
  const users = [];
  for (let i = 1; i <= 16; i++) {
    const num = String(i).padStart(2, "0");
    const user = await prisma.user.create({
      data: {
        name: `Regional User ${num}`,
        email: `user${num}@bsnl.in`,
        passwordHash: userHash,
        role: Role.REGIONAL,
        region: REGIONS[i - 1],
      },
    });
    users.push(user);
  }
  console.log(`  ✓ ${users.length} regional users created`);

  // Create SMSCs
  const smscs = [];
  for (const city of INDIAN_CITIES) {
    const smsc = await prisma.sMSC.create({ data: city });
    smscs.push(smsc);
  }
  console.log(`  ✓ ${smscs.length} SMSCs created`);

  // Create initial statuses for all SMSCs
  for (let i = 0; i < smscs.length; i++) {
    await prisma.sMSCStatus.create({
      data: {
        smscId: smscs[i].id,
        status: SmscStatusType.UP,
        note: "Initial status after provisioning",
        updatedById: admin.id,
      },
    });
  }
  console.log(`  ✓ Initial SMSC statuses set`);

  // Create default POIs for each SMSC
  let poiCount = 0;
  for (let i = 0; i < smscs.length; i++) {
    const smsc = smscs[i];
    const operators = ["Jio", "Airtel", "Vi"];
    for (const op of operators) {
      const isBroken = (i === 1 && op === "Vi") || (i === 3 && op === "Jio");
      await prisma.pOI.create({
        data: {
          smscId: smsc.id,
          name: `${smsc.name}-${op}-POI`,
          status: isBroken ? "BROKEN" : "ACTIVE",
          note: isBroken ? "Link failure detected on interconnect trunk" : "Interconnect trunk healthy",
          updatedById: admin.id,
        },
      });
      poiCount++;
    }
  }
  console.log(`  ✓ ${poiCount} POIs created`);

  // Create some alert subscribers
  await prisma.alertSubscriber.createMany({
    data: [
      { email: "noc@bsnl.in", phone: "+911234567890" },
      { email: "ops-lead@bsnl.in", phone: "+911234567891" },
      { email: "cto-office@bsnl.in" },
    ],
  });
  console.log(`  ✓ 3 alert subscribers created`);

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
