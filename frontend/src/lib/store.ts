import { useSyncExternalStore } from "react";
import { toast } from "sonner";

export type Role = "admin" | "regional";
export type Status = "Up" | "Down" | "Degraded";
export type Location = "North" | "South" | "East" | "West";

export interface User {
  email: string;
  name: string;
  password?: string;
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
  session: "bsnl.session",
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

function getCityLocation(city: string): Location {
  const c = CITIES.find((x) => x.city.toLowerCase() === city.toLowerCase());
  return c?.location ?? "North";
}

function mapStatus(status: string): Status {
  if (status === "UP") return "Up";
  if (status === "DOWN") return "Down";
  if (status === "DEGRADED") return "Degraded";
  return "Up";
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
}

// Global Store State
const state = {
  session: read<Session | null>(KEYS.session, null),
  smscs: [] as SMSC[],
  subscribers: [] as string[],
  rawSubscribers: [] as { id: string; email: string }[],
  audit: [] as AuditEntry[],
};

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("bsnl:store"));
  }
}

// API client base and helpers
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (state.session?.token) {
    headers["Authorization"] = `Bearer ${state.session.token}`;
  }
  return headers;
}

export async function fetchSmscs() {
  if (!state.session) return;
  try {
    const res = await fetch(`${API_BASE}/smscs`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch SMSCs");
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state.smscs = data.map((smsc: any) => ({
      id: smsc.id,
      name: smsc.name,
      city: smsc.city,
      location: getCityLocation(smsc.city),
      lat: smsc.lat,
      lng: smsc.lng,
      status: mapStatus(smsc.currentStatus?.status ?? "UP"),
      lastUpdatedAt: smsc.currentStatus?.createdAt ?? smsc.createdAt,
      lastUpdatedBy: smsc.currentStatus?.updatedBy?.name ?? "system",
      pois: smsc.pois || [],
    }));
    notify();
  } catch (error) {
    console.error("Error fetching SMSCs:", error);
  }
}

export async function fetchSubscribers() {
  if (!state.session) return;
  try {
    const res = await fetch(`${API_BASE}/subscribers`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch subscribers");
    const data = await res.json();
    state.rawSubscribers = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state.subscribers = data.map((s: any) => s.email);
    notify();
  } catch (error) {
    console.error("Error fetching subscribers:", error);
  }
}

export async function fetchAuditLogs() {
  if (!state.session) return;
  try {
    const res = await fetch(`${API_BASE}/audit`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    const result = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state.audit = result.data.map((log: any) => {
      let action = log.action;
      let note = "";

      if (log.action === "SMSC_STATUS_UPDATE") {
        try {
          const parsed = JSON.parse(log.newValue || "{}");
          action = `status ${mapStatus(log.oldValue ?? "UP")} → ${mapStatus(parsed.status ?? "UP")}`;
          note = parsed.note || "";
        } catch {
          action = `status ${mapStatus(log.oldValue ?? "UP")} → ${mapStatus(log.newValue ?? "UP")}`;
          note = "";
        }
      } else if (
        log.action === "POI_CREATED" ||
        log.action === "POI_UPDATED" ||
        log.action === "POI_DELETED"
      ) {
        try {
          const parsed = JSON.parse(log.newValue || "{}");
          note = parsed.note || "";
          action = `${log.action}: ${parsed.name || ""} (${parsed.status || ""})`;
        } catch {
          note = log.newValue || "";
        }
      }

      return {
        id: log.id,
        ts: log.createdAt,
        user: log.user?.name ?? "system",
        smsc: log.smsc?.name ?? "N/A",
        action,
        note,
      };
    });
    notify();
  } catch (error) {
    console.error("Error fetching audit logs:", error);
  }
}

// React Hooks
export function useSmscs(): SMSC[] {
  return useSyncExternalStore(
    subscribe,
    () => state.smscs,
    () => [],
  );
}

export function useAudit(): AuditEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => state.audit,
    () => [],
  );
}

export function useSubscribers(): string[] {
  return useSyncExternalStore(
    subscribe,
    () => state.subscribers,
    () => [],
  );
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    subscribe,
    () => state.session,
    () => null,
  );
}

export function useUsers(): User[] {
  return [];
}

// Actions
export async function login(email: string, password: string): Promise<Session | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const session: Session = {
      token: data.token,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role.toLowerCase() as Role,
    };
    state.session = session;
    write(KEYS.session, session);
    notify();

    // Trigger async data load on login
    fetchSmscs();
    fetchSubscribers();
    fetchAuditLogs();

    return session;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
}

export function logout() {
  state.session = null;
  state.smscs = [];
  state.subscribers = [];
  state.rawSubscribers = [];
  state.audit = [];
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEYS.session);
  }
  notify();
}

export async function updateSmsc(
  id: string,
  patch: { status?: Status; pois?: POI[]; note: string },
  userEmail: string,
) {
  if (!state.session) return;
  const before = state.smscs.find((s) => s.id === id);
  if (!before) return;

  try {
    // 1. Update SMSC status if changed
    if (patch.status && patch.status !== before.status) {
      const statusMap = {
        Up: "UP",
        Down: "DOWN",
        Degraded: "DEGRADED",
      };
      const res = await fetch(`${API_BASE}/smscs/${id}/status`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          status: statusMap[patch.status],
          note: patch.note,
        }),
      });
      if (!res.ok) throw new Error("Failed to update SMSC status");
    }

    // 2. Update POI status if changed
    if (patch.pois) {
      for (const p of patch.pois) {
        const prev = before.pois.find((x) => x.id === p.id);
        if (prev && prev.broken !== p.broken) {
          const res = await fetch(`${API_BASE}/pois/${p.id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
              status: p.broken ? "BROKEN" : "ACTIVE",
              note: patch.note || undefined,
            }),
          });
          if (!res.ok) throw new Error(`Failed to update POI ${p.name}`);
        }
      }
    }

    // Refresh store state after updates
    await fetchSmscs();
    await fetchAuditLogs();
  } catch (error) {
    console.error("Error updating SMSC:", error);
    toast.error("Failed to save changes");
  }
}

export async function addSubscriber(email: string) {
  if (!state.session) return;
  try {
    const res = await fetch(`${API_BASE}/subscribers`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Failed to add subscriber");
    await fetchSubscribers();
  } catch (error) {
    console.error("Error adding subscriber:", error);
    toast.error("Failed to add subscriber");
  }
}

export async function removeSubscriber(email: string) {
  if (!state.session) return;
  const sub = state.rawSubscribers.find((s) => s.email === email);
  if (!sub) return;
  try {
    const res = await fetch(`${API_BASE}/subscribers/${sub.id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to remove subscriber");
    await fetchSubscribers();
  } catch (error) {
    console.error("Error removing subscriber:", error);
    toast.error("Failed to remove subscriber");
  }
}

export function addUser(u: User) {}
export function removeUser(email: string) {}
export function resetPassword(email: string, password: string) {}

// Theme Configuration
export function initTheme() {
  if (typeof window === "undefined") return;
  const t = localStorage.getItem(KEYS.theme) ?? "light";
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function toggleTheme() {
  if (typeof window === "undefined") return;
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem(KEYS.theme, isDark ? "dark" : "light");
  notify();
}

export function currentTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Trigger initial fetches in background on start if session exists
if (state.session) {
  setTimeout(() => {
    fetchSmscs();
    fetchSubscribers();
    fetchAuditLogs();
  }, 0);
}
