import { useEffect, useState } from "react";
import type { SMSC } from "@/lib/store";
import { formatDateTime } from "@/lib/format";

const statusVar: Record<string, string> = {
  Up: "#22c55e",
  Down: "#ef4444",
  Degraded: "#f59e0b",
};

export function IndiaMap({ smscs }: { smscs: SMSC[] }) {
  const [mod, setMod] = useState<typeof import("react-leaflet") | null>(null);

  useEffect(() => {
    let active = true;
    import("react-leaflet").then((m) => {
      if (active) setMod(m);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!mod) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = mod;

  return (
    <MapContainer
      center={[22.5, 80]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {smscs.map((s) => {
        const active = s.pois.filter((p) => !p.broken).length;
        return (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={10}
            pathOptions={{
              color: statusVar[s.status],
              fillColor: statusVar[s.status],
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <div className="text-sm font-semibold">{s.name}</div>
                <div>City: {s.city}</div>
                <div>
                  Status: <strong style={{ color: statusVar[s.status] }}>{s.status}</strong>
                </div>
                <div>
                  Active POIs: {active}/{s.pois.length}
                </div>
                <div>Updated: {formatDateTime(s.lastUpdatedAt)}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
