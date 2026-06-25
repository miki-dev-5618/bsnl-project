import { useEffect } from "react";
import { IndiaMap } from "@/components/IndiaMap";
import { useSmscs } from "@/lib/store";

export default function MapPage() {
  const smscs = useSmscs();

  useEffect(() => {
    document.title = "Map · BSNL SMS";
  }, []);

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <IndiaMap smscs={smscs} />
    </div>
  );
}
