import { createFileRoute } from "@tanstack/react-router";
import { IndiaMap } from "@/components/IndiaMap";
import { useSmscs } from "@/lib/store";

export const Route = createFileRoute("/_app/map")({
  head: () => ({ meta: [{ title: "Map · BSNL SMS" }] }),
  component: MapPage,
});

function MapPage() {
  const smscs = useSmscs();
  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <IndiaMap smscs={smscs} />
    </div>
  );
}
