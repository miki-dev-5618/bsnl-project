import { useEffect, useState } from "react";
import type { SMSC } from "@/lib/store";
import { formatDateTime } from "@/lib/format";

const statusColors: Record<string, string> = {
  Up: "#10B981", // Emerald-500
  Down: "#EF4444", // Red-500
  Degraded: "#F59E0B", // Amber-500
};

export function IndiaMap({ smscs }: { smscs: SMSC[] }) {
  const [mod, setMod] = useState<typeof import("react-leaflet") | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Detect initial theme
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");

    // Listen to theme events dispatched on theme toggles
    const handleStoreUpdate = () => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };

    window.addEventListener("bsnl:store", handleStoreUpdate);
    
    let active = true;
    import("react-leaflet").then((m) => {
      if (active) setMod(m);
    });
    
    return () => {
      active = false;
      window.removeEventListener("bsnl:store", handleStoreUpdate);
    };
  }, []);

  if (!mod) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30 text-sm text-muted-foreground backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Synchronizing visual map tiles…</span>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = mod;

  const tileUrl = theme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[22.5, 79.5]}
        zoom={5}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        scrollWheelZoom
      >
        <TileLayer
          key={theme} // Key forces leaflet to re-mount and load correct tiles on theme toggle
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        {smscs.map((s) => {
          const activeCount = s.pois.filter((p) => !p.broken).length;
          return (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={10}
              pathOptions={{
                color: statusColors[s.status],
                fillColor: statusColors[s.status],
                fillOpacity: 0.75,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="space-y-1.5 p-1 text-xs">
                  <div className="text-sm font-extrabold text-foreground">{s.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                    <span>City:</span>
                    <span className="text-foreground">{s.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold">
                    <span>Status:</span>
                    <strong style={{ color: statusColors[s.status] }}>{s.status}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                    <span>Active POIs:</span>
                    <span className="text-foreground">
                      {activeCount}/{s.pois.length}
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground/80 pt-1 border-t border-border/40 font-mono">
                    Last updated: {formatDateTime(s.lastUpdatedAt)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
