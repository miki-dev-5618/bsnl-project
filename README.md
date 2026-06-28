# BSNL SMS Status Hub

An internal full-stack dashboard for monitoring **BSNL Short Message Service Centres (SMSCs)** and their **Points of Interconnect (POIs)** across India. React frontend + Express/TypeScript/Prisma/PostgreSQL backend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Backend API](#backend-api)
- [Frontend Pages & Routes](#frontend-pages--routes)
- [Data Model](#data-model)
- [Authentication & Roles](#authentication--roles)
- [Alert System](#alert-system)
- [Scripts](#scripts)

---

## Overview

BSNL operates 16 SMSCs in major Indian cities (Delhi, Mumbai, Chennai, Kolkata, etc.). Each SMSC has POIs that can be healthy or broken. This dashboard lets operations teams:

1. **See at a glance** which SMSCs are Up, Degraded, or Down
2. **Drill into any SMSC** to toggle POI status, change overall status, and leave notes
3. **View all SMSCs on a map** of India with colour-coded markers
4. **Track every change** in an immutable audit log
5. **Manage alert subscribers** who get notified when something goes Down/Degraded
6. **Receive email alerts** when any SMSC status changes to DOWN or DEGRADED

---

## Features

| Feature               | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| **Dashboard**         | Card grid of all 16 SMSCs showing status, POI health, and last update time  |
| **SMSC Detail Sheet** | Slide-over panel to change status, toggle individual POIs, and add notes    |
| **Interactive Map**   | Leaflet map of India with colour-coded circle markers per SMSC              |
| **Audit Log**         | Chronological table of every status change (admin-only)                     |
| **Alert Subscribers** | Manage email addresses that receive alerts on status changes (admin-only)   |
| **Email Alerts**      | Resend-powered alerts to all subscribers on SMSC and POI status changes    |
| **Health Check Cron** | Automated 5-minute health check of all SMSCs via node-cron                  |
| **Dark / Light Mode** | Toggle between themes, preference saved to localStorage                     |
| **Role-based Access** | Admin sees everything; regional users see Dashboard + Map only              |
| **Responsive Layout** | Collapsible sidebar, mobile-friendly cards and tables                       |

---

## Tech Stack

### Frontend

| Layer         | Technology                                                                       |
| ------------- | -------------------------------------------------------------------------------- |
| Framework     | [React](https://react.dev/) 19 (SPA via Vite)                                    |
| UI Library    | React 19                                                                         |
| Build Tool    | Vite 8                                                                           |
| Styling       | Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com) components (Radix primitives)|
| Routing       | [React Router](https://reactrouter.com/) 7                                       |
| Map           | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/)|
| Icons         | [Lucide React](https://lucide.dev/)                                              |
| Toasts        | [Sonner](https://sonner.emilkowal.dev/)                                          |
| Language      | TypeScript 5                                                                     |

### Backend

| Layer         | Technology                                                      |
| ------------- | --------------------------------------------------------------- |
| Runtime       | Node.js 22 + Express 4                                          |
| Language      | TypeScript 5 (strict mode)                                      |
| ORM           | [Prisma](https://www.prisma.io/) 6.10                           |
| Database      | PostgreSQL (Neon cloud)                                          |
| Auth          | JWT (jsonwebtoken) + bcrypt password hashing                     |
| Validation    | [Zod](https://zod.dev/) on all request bodies                   |
| Emails        | [Resend](https://resend.com/) SDK                                |
| Scheduling    | [node-cron](https://github.com/node-cron/node-cron) (5-min health checks) |
| Dev Server    | ts-node-dev (hot-reload)                                         |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (recommended: latest LTS)
- **npm** (comes with Node) or **bun**
- **PostgreSQL** — local instance or cloud (e.g. [Neon](https://neon.tech), free tier)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd bsnl-status-hub

# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="8h"
PORT=4000

SMTP_FROM="BSNL Status Hub <alerts@navyaa-dev.me>"
RESEND_API_KEY="your-resend-api-key"
```

### 3. Set Up Database

```bash
cd backend

# Push schema to database
npx prisma db push

# Seed with demo data
npx ts-node prisma/seed.ts
```

### 4. Run

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### Demo Credentials

| Role     | Email                               | Password   |
| -------- | ----------------------------------- | ---------- |
| Admin    | `admin@bsnl.in`                     | `admin123` |
| Regional | `user01@bsnl.in` … `user16@bsnl.in` | `user123`  |

---

## Project Structure

```
bsnl-status-hub/
├── frontend/                         # Frontend (React + React Router)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui primitives
│   │   │   ├── AppHeader.tsx         # Header bar
│   │   │   ├── AppSidebar.tsx        # Sidebar navigation
│   │   │   ├── IndiaMap.tsx          # Leaflet map
│   │   │   ├── SmscCard.tsx          # Dashboard card
│   │   │   ├── SmscSheet.tsx         # SMSC detail panel
│   │   │   └── StatusBadge.tsx       # Status pill
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── store.ts              # Core data layer
│   │   │   ├── format.ts             # Date helpers
│   │   │   └── utils.ts              # Utility functions
│   │   ├── routes/                   # Router views/components
│   │   │   └── README.md
│   │   ├── App.tsx                   # Router & routes setup
│   │   ├── main.tsx                  # Application entry point
│   │   └── styles.css
│   ├── package.json                  # Frontend package
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                          # Backend (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma             # 6 models, 3 enums
│   │   └── seed.ts                   # Database seeder
│   ├── src/
│   │   ├── config/env.ts             # Environment config
│   │   ├── lib/prisma.ts             # Prisma client singleton
│   │   ├── types/
│   │   │   ├── enums.ts              # Role, SmscStatusType, PoiStatus
│   │   │   └── express.d.ts          # Express type augmentation
│   │   ├── schemas/                  # Zod validation schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   ├── smsc.schema.ts
│   │   │   ├── poi.schema.ts
│   │   │   └── subscriber.schema.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts               # requireAuth + requireAdmin
│   │   │   ├── validate.ts           # Zod validation middleware
│   │   │   └── errorHandler.ts       # Global error handler
│   │   ├── services/
│   │   │   ├── audit.service.ts      # Audit log operations
│   │   │   ├── alert.service.ts      # Email alert service
│   │   │   └── cron.service.ts       # 5-min health check
│   │   ├── controllers/              # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── smsc.controller.ts
│   │   │   ├── poi.controller.ts
│   │   │   ├── subscriber.controller.ts
│   │   │   └── audit.controller.ts
│   │   ├── routes/                   # Express routers
│   │   ├── app.ts                    # Express app setup
│   │   └── server.ts                 # Entry point
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
└── start-dev.bat                     # Full stack dev launcher
```

---

## Backend API

All endpoints are under `/api`. JWT Bearer token required unless noted.

### Auth

| Method | Route           | Auth  | Description                |
|--------|-----------------|-------|----------------------------|
| POST   | `/auth/login`   | —     | Login → returns JWT token  |
| GET    | `/auth/me`      | ✅    | Get current user profile   |

### Users (Admin only)

| Method | Route           | Description        |
|--------|-----------------|-------------------|
| GET    | `/users`        | List all users     |
| POST   | `/users`        | Create user        |
| PUT    | `/users/:id`    | Update user        |
| DELETE | `/users/:id`    | Delete user        |

### SMSCs

| Method | Route                 | Auth   | Description                          |
|--------|-----------------------|--------|--------------------------------------|
| GET    | `/smscs`              | ✅     | List all SMSCs with latest status    |
| PUT    | `/smscs/:id/status`   | ✅     | Update status (triggers alerts)      |
| GET    | `/smscs/:id/history`  | ✅     | Paginated status history             |

### POIs (Points of Interconnect)

| Method | Route               | Auth  | Description         |
|--------|---------------------|-------|---------------------|
| GET    | `/smscs/:id/pois`   | ✅    | List POIs for SMSC  |
| POST   | `/smscs/:id/pois`   | ✅    | Create POI          |
| PUT    | `/pois/:id`         | ✅    | Update POI          |
| DELETE | `/pois/:id`         | ✅    | Delete POI          |

### Alert Subscribers (Admin only)

| Method | Route              | Description          |
|--------|--------------------|----------------------|
| GET    | `/subscribers`     | List subscribers     |
| POST   | `/subscribers`     | Add subscriber       |
| DELETE | `/subscribers/:id` | Remove subscriber    |

### Audit Log (Admin only)

| Method | Route    | Description                              |
|--------|----------|------------------------------------------|
| GET    | `/audit` | Paginated audit logs (filter by smsc/user) |

---

## Frontend Pages & Routes

The app uses **React Router** for routing, defined in `App.tsx`. Routes prefixed with `_app` are nested under the authenticated layout.

```
/                   → Auto-redirect to /login or /dashboard
/login              → Public login form
/dashboard          → SMSC card grid (all roles)
/map                → Interactive India map (all roles)
/audit              → Change audit log (admin only)
/subscribers        → Alert subscriber management (admin only)
```

### Route Layout Hierarchy

```
App.tsx                       ← Router & routes configuration
├── index.tsx                 ← redirect logic
├── login.tsx                 ← standalone login page
└── _app.tsx                  ← authenticated layout (sidebar + header + auth guard)
    ├── _app.dashboard.tsx
    ├── _app.map.tsx
    ├── _app.audit.tsx
    └── _app.subscribers.tsx
```

---

## Data Model

### Prisma Schema (6 models)

| Model             | Key Fields                                                    |
|-------------------|---------------------------------------------------------------|
| **User**          | id, name, email, passwordHash, role (ADMIN/REGIONAL), region  |
| **SMSC**          | id, name, city, lat, lng                                      |
| **SMSCStatus**    | id, smscId, status (UP/DOWN/DEGRADED), note, updatedById      |
| **POI**           | id, smscId, name, status (ACTIVE/BROKEN/RESOLVED), note       |
| **AlertSubscriber** | id, email, phone (nullable)                                 |
| **AuditLog**      | id, userId, smscId, action, oldValue, newValue                |

### Seed Data

On running `npx ts-node prisma/seed.ts`:
- **16 SMSCs** across major Indian cities (Delhi, Mumbai, Chennai, Kolkata, Bengaluru, Hyderabad, Ahmedabad, Pune, Jaipur, Lucknow, Patna, Bhopal, Guwahati, Chandigarh, Thiruvananthapuram, Ranchi)
- **1 admin** account + **16 regional** user accounts
- **3 default alert subscribers** (`noc@bsnl.in`, `ops-lead@bsnl.in`, `cto-office@bsnl.in`)
- **Initial UP status** for all 16 SMSCs

---

## Authentication & Roles

### Backend Auth

- Passwords hashed with **bcrypt** (12 salt rounds)
- Login returns a **JWT** with `{ id, email, role }` payload
- Two middleware guards:
  - `requireAuth` — validates JWT from `Authorization: Bearer <token>`
  - `requireAdmin` — checks `role === 'ADMIN'`

### Role Permissions

| Role       | Permissions                                          |
| ---------- | ---------------------------------------------------- |
| `ADMIN`    | All endpoints — users, SMSCs, POIs, subscribers, audit |
| `REGIONAL` | SMSCs (list, update status, history), POIs (CRUD)    |

---

## Alert System

When an SMSC status is changed to **DOWN** or **DEGRADED** (or when a POI status is toggled):

1. The `alert.service.ts` fetches all `AlertSubscriber` records.
2. Sends an HTML email via **Resend** with the status details, using a colour-coded template.
3. Emails are batched and delivered using Resend's batch send API.

Configure Resend in `.env`:
```env
SMTP_FROM="BSNL Status Hub <alerts@navyaa-dev.me>"
RESEND_API_KEY="your-resend-api-key"
```

### Health Check Cron

A **node-cron** job runs every 5 minutes, querying all SMSCs and logging their current status. This is a stub for future integration with actual SMSC health probes.

---

## Scripts

### Frontend

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start Vite dev server with HMR             |
| `npm run build`      | Production build                           |
| `npm run preview`    | Preview the production build locally       |
| `npm run lint`       | Run ESLint                                 |
| `npm run format`     | Format code with Prettier                  |

### Backend

| Command                        | Description                            |
| ------------------------------ | -------------------------------------- |
| `npm run dev`                  | Start Express dev server with hot-reload |
| `npm run build`                | Compile TypeScript to `dist/`          |
| `npm start`                    | Run compiled production server         |
| `npm run prisma:generate`      | Regenerate Prisma Client               |
| `npm run prisma:migrate`       | Run database migrations                |
| `npm run prisma:seed`          | Seed database with demo data           |

---

