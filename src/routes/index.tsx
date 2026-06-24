import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSession, initTheme } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BSNL SMS Dashboard" },
      { name: "description", content: "Internal SMSC and POI monitoring dashboard." },
    ],
  }),
  component: Index,
});

function Index() {
  const session = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    initTheme();
    navigate({ to: session ? "/dashboard" : "/login", replace: true });
  }, [session, navigate]);
  return null;
}
