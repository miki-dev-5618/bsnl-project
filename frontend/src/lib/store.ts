import { useSyncExternalStore } from "react";

export type Role = "admin" | "regional";
export type Status = "Up" | "Down" | "Degraded";
export type Location = "North" | "South" | "East" | "West";

export interface User {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export interface POI {
  id: string;
  name: string;
  broken: boolean;
}

export interface SMSC {
  id: string;
  name: string;
  city: string;
  location: Location;
  lat: number;
  lng: number;
  status: Status;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  pois: POI[];
}

export interface AuditEntry {
  id: string;
  ts: string;
  user: string;
  smsc: string;
  action: string;
  note: string;
}

export interface Session {
  token: string;
  email: string;
  name: string;
  role: Role;
}

const KEYS = {
  users: "bsnl.users",
  session: "bsnl.session",
  smscs: "bsnl.smscs",
  audit: "bsnl.audit",
  subs: "bsnl.subscribers",
  theme: "bsnl.theme",
};

const CITIES: { city: string; location: Location; lat: number; lng: number }[] = [
  { city: "Hyderabad", location: "South", lat: 17.385, lng: 78.4867 },
  { city: "Bangalore", location: "South", lat: 12.9716, lng: 77.5946 },
  { city: "Ernakulam", location: "South", lat: 9.9816, lng: 76.2999 },
  { city: "Coimbatore", location: "South", lat: 11.0168, lng: 76.9558 },

  { city: "Kolkata", location: "East", lat: 22.5726, lng: 88.3639 },
  { city: "Patna", location: "East", lat: 25.5941, lng: 85.1376 },
  { city: "Guwahati", location: "East", lat: 26.1445, lng: 91.7362 },

  { city: "Pune", location: "West", lat: 18.5204, lng: 73.8567 },
  { city: "Ahmedabad", location: "West", lat: 23.0225, lng: 72.5714 },
  { city: "Bhopal", location: "West", lat: 23.2599, lng: 77.4126 },

  { city: "Chandigarh", location: "North", lat: 30.7333, lng: 76.7794 },
  { city: "Delhi", location: "North", lat: 28.6139, lng: 77.209 },
  { city: "Lucknow", location: "North", lat: 26.8467, lng: 80.9462 },
  { city: "Jaipur", location: "North", lat: 26.9124, lng: 75.7873 },
];

function seedSmscs(): SMSC[] {
  const statuses: Status[] = ["Up", "Up", "Up", "Degraded", "Down"];
  return CITIES.map((c, i) => {
    const n = String(i + 1).padStart(2, "0");
    const status = statuses[i % statuses.length];
    return {
      id: `smsc-${n}`,
      name: `SMSC-${n}`,
      city: c.city,
      location: c.location,
      lat: c.lat,
      lng: c.lng,
      status,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: "system",
      pois: ["Vi", "Jio", "Airtel"].map((p) => ({
        id: `smsc-${n}-poi-${p}`,
        name: `POI-${p}`,
        broken: status === "Down" ? true : status === "Degraded" && p === "A",
      })),
    };
  });
}

function seedUsers(): User[] {
  const users: User[] = [
    { email: "admin@bsnl.in", name: "Admin", password: "admin123", role: "admin" },
  ];
  for (let i = 1; i <= 16; i++) {
    const n = String(i).padStart(2, "0");
    users.push({
      email: `user${n}@bsnl.in`,
      name: `Regional User ${n}`,
      password: "user123",
      role: "regional",
    });
  }
  return users;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("bsnl:store"));
}

let initialized = false;
function ensureSeed() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  if (!localStorage.getItem(KEYS.users)) write(KEYS.users, seedUsers());
  if (!localStorage.getItem(KEYS.smscs)) write(KEYS.smscs, seedSmscs());
  if (!localStorage.getItem(KEYS.audit)) write(KEYS.audit, []);
  if (!localStorage.getItem(KEYS.subs)) write(KEYS.subs, ["ops-lead@bsnl.in", "noc@bsnl.in"]);
}

const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("bsnl:store", () => listeners.forEach((l) => l()));
  window.addEventListener("storage", () => listeners.forEach((l) => l()));
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function useRaw(key: string, serverFallback: string): string {
  ensureSeed();
  return useSyncExternalStore(
    subscribe,
    () => {
      if (typeof window === "undefined") return serverFallback;
      return localStorage.getItem(key) ?? serverFallback;
    },
    () => serverFallback,
  );
}

function parse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useUsers(): User[] {
  return parse<User[]>(useRaw(KEYS.users, "[]"), []);
}
export function useSmscs(): SMSC[] {
  return parse<SMSC[]>(useRaw(KEYS.smscs, "[]"), []);
}
export function useAudit(): AuditEntry[] {
  return parse<AuditEntry[]>(useRaw(KEYS.audit, "[]"), []);
}
export function useSubscribers(): string[] {
  return parse<string[]>(useRaw(KEYS.subs, "[]"), []);
}
export function useSession(): Session | null {
  return parse<Session | null>(useRaw(KEYS.session, "null"), null);
}

// Actions
function getUsers(): User[] {
  ensureSeed();
  return read<User[]>(KEYS.users, []);
}
function getSmscs(): SMSC[] {
  ensureSeed();
  return read<SMSC[]>(KEYS.smscs, []);
}
function getAudit(): AuditEntry[] {
  return read<AuditEntry[]>(KEYS.audit, []);
}
function getSubs(): string[] {
  return read<string[]>(KEYS.subs, []);
}

export function login(email: string, password: string): Session | null {
  const u = getUsers().find(
    (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password,
  );
  if (!u) return null;
  const payload = { email: u.email, name: u.name, role: u.role, exp: Date.now() + 86400000 };
  const token = btoa(JSON.stringify(payload));
  const session: Session = { token, email: u.email, name: u.name, role: u.role };
  write(KEYS.session, session);
  return session;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.session);
  window.dispatchEvent(new CustomEvent("bsnl:store"));
}

export function addUser(u: User) {
  const users = getUsers();
  if (users.some((x) => x.email === u.email)) throw new Error("Email exists");
  write(KEYS.users, [...users, u]);
}
export function removeUser(email: string) {
  write(
    KEYS.users,
    getUsers().filter((u) => u.email !== email),
  );
}
export function resetPassword(email: string, password: string) {
  write(
    KEYS.users,
    getUsers().map((u) => (u.email === email ? { ...u, password } : u)),
  );
}

function appendAudit(entry: Omit<AuditEntry, "id" | "ts">) {
  const e: AuditEntry = {
    ...entry,
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
  };
  write(KEYS.audit, [e, ...getAudit()]);
}

export function updateSmsc(
  id: string,
  patch: { status?: Status; pois?: POI[]; note: string },
  user: string,
) {
  const list = getSmscs();
  const before = list.find((s) => s.id === id);
  if (!before) return;
  const after: SMSC = {
    ...before,
    status: patch.status ?? before.status,
    pois: patch.pois ?? before.pois,
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: user,
  };
  write(
    KEYS.smscs,
    list.map((s) => (s.id === id ? after : s)),
  );

  const changes: string[] = [];
  if (patch.status && patch.status !== before.status) {
    changes.push(`status ${before.status} → ${patch.status}`);
  }
  if (patch.pois) {
    patch.pois.forEach((p) => {
      const prev = before.pois.find((x) => x.id === p.id);
      if (prev && prev.broken !== p.broken) {
        changes.push(`${p.name} ${p.broken ? "marked broken" : "resolved"}`);
      }
    });
  }
  if (changes.length === 0 && !patch.note) return;
  appendAudit({
    user,
    smsc: before.name,
    action: changes.join("; ") || "note added",
    note: patch.note,
  });

  if (
    patch.status &&
    patch.status !== before.status &&
    (patch.status === "Down" || patch.status === "Degraded")
  ) {
    const subs = getSubs();
    console.log(`[ALERT] ${before.name} → ${patch.status}. Notifying:`, subs);
  }
}

export function addSubscriber(email: string) {
  const subs = getSubs();
  if (subs.includes(email)) return;
  write(KEYS.subs, [...subs, email]);
}
export function removeSubscriber(email: string) {
  write(
    KEYS.subs,
    getSubs().filter((s) => s !== email),
  );
}

// Theme
export function initTheme() {
  if (typeof window === "undefined") return;
  const t = localStorage.getItem(KEYS.theme) ?? "light";
  document.documentElement.classList.toggle("dark", t === "dark");
}
export function toggleTheme() {
  if (typeof window === "undefined") return;
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem(KEYS.theme, isDark ? "dark" : "light");
  window.dispatchEvent(new CustomEvent("bsnl:store"));
}
export function currentTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
