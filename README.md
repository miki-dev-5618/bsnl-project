# BSNL SMS Status Hub

An internal dashboard for monitoring **BSNL Short Message Service Centres (SMSCs)** and their **Points of Interconnect (POIs)** across India. Built with React, TanStack Start, and a fully client-side localStorage store — no backend required.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Data Model](#data-model)
- [Authentication & Roles](#authentication--roles)
- [How It Works](#how-it-works)
- [Scripts](#scripts)

---

## Overview

BSNL operates 16 SMSCs in major Indian cities (Delhi, Mumbai, Chennai, Kolkata, etc.). Each SMSC has 4 POIs (A–D) that can be healthy or broken. This dashboard lets operations teams:

1. **See at a glance** which SMSCs are Up, Degraded, or Down
2. **Drill into any SMSC** to toggle POI status, change overall status, and leave notes
3. **View all SMSCs on a map** of India with colour-coded markers
4. **Track every change** in an immutable audit log
5. **Manage alert subscribers** who get notified when something goes Down/Degraded

All data lives in **localStorage** — there is no backend server or database. The seed data (16 SMSCs, demo users) is created automatically on first visit.

---

## Features

| Feature              | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| **Dashboard**        | Card grid of all 16 SMSCs showing status, POI health, and last update time  |
| **SMSC Detail Sheet** | Slide-over panel to change status, toggle individual POIs, and add notes   |
| **Interactive Map**  | Leaflet map of India with colour-coded circle markers per SMSC              |
| **Audit Log**        | Chronological table of every status change (admin-only)                     |
| **Alert Subscribers**| Manage email addresses that receive alerts on status changes (admin-only)   |
| **Dark / Light Mode**| Toggle between themes, preference saved to localStorage                     |
| **Role-based Access**| Admin sees everything; regional users see Dashboard + Map only              |
| **Responsive Layout**| Collapsible sidebar, mobile-friendly cards and tables                       |

---

## Tech Stack

| Layer         | Technology                                                                       |
| ------------- | -------------------------------------------------------------------------------- |
| Framework     | [TanStack Start](https://tanstack.com/start) (SSR + file-based routing)          |
| UI Library    | React 19                                                                         |
| Build Tool    | Vite 8                                                                           |
| Styling       | Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com) components (Radix primitives)|
| Routing       | TanStack Router (file-based, type-safe)                                          |
| Map           | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/)|
| State         | `localStorage` with `useSyncExternalStore` (no external state library)           |
| Icons         | [Lucide React](https://lucide.dev/)                                              |
| Toasts        | [Sonner](https://sonner.emilkowal.dev/)                                          |
| Hosting       | [Lovable](https://lovable.dev) (connected)                                       |
| Language      | TypeScript 5                                                                     |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (recommended: latest LTS)
- **npm** (comes with Node) or **bun**

### Install

```bash
# Clone the repo
git clone <your-repo-url>
cd bsnl-status-hub

# Install dependencies
npm install
# or
bun install
```

### Run Development Server

```bash
npm run dev
```

The app will start at **http://localhost:5173** (or the next available port). Open it in your browser.

### Build for Production

```bash
npm run build
npm run preview   # serves the production build locally
```

### Demo Credentials

The app seeds demo accounts automatically on first load:

| Role     | Email                              | Password   |
| -------- | ---------------------------------- | ---------- |
| Admin    | `admin@bsnl.in`                    | `admin123` |
| Regional | `user01@bsnl.in` … `user16@bsnl.in`| `user123` |

---

## Project Structure

```
bsnl-status-hub/
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (Button, Card, Sheet, Sidebar, etc.)
│   │   ├── AppHeader.tsx        # Top header bar (title, theme toggle, user info, logout)
│   │   ├── AppSidebar.tsx       # Sidebar navigation (role-aware menu items)
│   │   ├── IndiaMap.tsx         # Leaflet map with colour-coded SMSC markers
│   │   ├── SmscCard.tsx         # Dashboard card for a single SMSC
│   │   ├── SmscSheet.tsx        # Slide-over detail panel for editing SMSC status/POIs
│   │   └── StatusBadge.tsx      # Coloured status pill (Up / Degraded / Down)
│   │
│   ├── hooks/
│   │   └── use-mobile.tsx       # Responsive breakpoint hook
│   │
│   ├── lib/
│   │   ├── store.ts             # ⭐ Core data layer — localStorage CRUD, seed data, auth
│   │   ├── format.ts            # Date/time formatting helpers
│   │   ├── utils.ts             # cn() classname merge utility
│   │   ├── error-capture.ts     # Error capture utilities
│   │   ├── error-page.ts        # Error page rendering
│   │   └── lovable-error-reporting.ts  # Lovable platform error reporting
│   │
│   ├── routes/
│   │   ├── __root.tsx           # Root layout (HTML shell, QueryClientProvider, meta tags)
│   │   ├── index.tsx            # "/" → redirects to /dashboard or /login
│   │   ├── login.tsx            # Login page with demo credential hints
│   │   ├── _app.tsx             # Authenticated layout (sidebar + header + auth guard)
│   │   ├── _app.dashboard.tsx   # Dashboard page — SMSC card grid
│   │   ├── _app.map.tsx         # Map page — full-screen Leaflet map
│   │   ├── _app.audit.tsx       # Audit log page (admin-only)
│   │   └── _app.subscribers.tsx # Alert subscribers management (admin-only)
│   │
│   ├── router.tsx               # Router instance creation
│   ├── server.ts                # SSR server entry point
│   ├── start.ts                 # TanStack Start entry point
│   ├── styles.css               # Global styles + Tailwind directives + CSS custom properties
│   └── routeTree.gen.ts         # Auto-generated route tree (do not edit manually)
│
├── components.json              # shadcn/ui configuration
├── vite.config.ts               # Vite config (uses @lovable.dev/vite-tanstack-config)
├── tsconfig.json                # TypeScript config (@ path alias → src/)
├── package.json                 # Dependencies and scripts
└── AGENTS.md                    # Lovable sync instructions
```

---

## Pages & Routes

The app uses **TanStack Router's file-based routing**. Routes prefixed with `_app` are nested under the authenticated layout.

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
__root.tsx                    ← HTML shell, providers, error boundaries
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

All data is stored in `localStorage` under `bsnl.*` keys and managed through `src/lib/store.ts`.

### SMSC

```typescript
interface SMSC {
  id: string;           // "smsc-01"
  name: string;         // "SMSC-01"
  city: string;         // "Delhi"
  lat: number;          // 28.6139
  lng: number;          // 77.2090
  status: Status;       // "Up" | "Down" | "Degraded"
  lastUpdatedAt: string;// ISO timestamp
  lastUpdatedBy: string;// email of last editor
  pois: POI[];          // array of 4 POIs (A–D)
}
```

### POI (Point of Interconnect)

```typescript
interface POI {
  id: string;     // "smsc-01-poi-A"
  name: string;   // "POI-A"
  broken: boolean;// true = this POI is down
}
```

### AuditEntry

```typescript
interface AuditEntry {
  id: string;     // UUID
  ts: string;     // ISO timestamp
  user: string;   // email of the user who made the change
  smsc: string;   // SMSC name
  action: string; // description of what changed
  note: string;   // optional note left by the user
}
```

### Seed Data

On first load, the store seeds:
- **16 SMSCs** across major Indian cities (Delhi, Mumbai, Chennai, Kolkata, Hyderabad, Bengaluru, Ahmedabad, Jaipur, Bhopal, Bhubaneswar, Guwahati, Chandigarh, Lucknow, Patna, Pune, Srinagar)
- **1 admin** account + **16 regional** user accounts
- **2 default alert subscribers** (`ops-lead@bsnl.in`, `noc@bsnl.in`)

To reset all data, clear your browser's localStorage for the site.

---

## Authentication & Roles

Authentication is simulated entirely on the client side using localStorage.

| Role       | Permissions                                          |
| ---------- | ---------------------------------------------------- |
| `admin`    | Dashboard, Map, Audit Log, Subscribers, SMSC editing |
| `regional` | Dashboard, Map, SMSC editing                         |

- On login, a base64-encoded session token is stored in `localStorage`
- The `_app.tsx` layout checks for a valid session; if none exists, it redirects to `/login`
- Admin-only pages (Audit, Subscribers) check `session.role` and show an access-denied card for non-admins
- The sidebar dynamically hides admin-only menu items for regional users

---

## How It Works

### State Management

Instead of Redux or Zustand, the app uses React's built-in `useSyncExternalStore` to subscribe to `localStorage` changes. When any write happens:

1. Data is serialized to JSON and written to `localStorage`
2. A `bsnl:store` custom event is dispatched on `window`
3. All subscribed React hooks re-render with the new data

This gives you reactive, real-time updates across all components without any external library.

### Alert System

When an SMSC status is changed to **Down** or **Degraded**, the app logs a console alert listing all subscriber emails. In a production version, this would dispatch actual email/SMS notifications.

### Map Rendering

The Leaflet map is **lazy-loaded** (dynamic `import()`) to avoid SSR issues since Leaflet requires the `window` object. Circle markers are colour-coded:
- 🟢 Green → Up
- 🟡 Amber → Degraded
- 🔴 Red → Down

---

## Scripts

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start Vite dev server with HMR             |
| `npm run build`      | Production build                           |
| `npm run build:dev`  | Development-mode build (unminified)        |
| `npm run preview`    | Preview the production build locally       |
| `npm run lint`       | Run ESLint                                 |
| `npm run format`     | Format code with Prettier                  |

---

> **Note**: This project is connected to [Lovable](https://lovable.dev). Avoid force-pushing or rewriting published git history.
