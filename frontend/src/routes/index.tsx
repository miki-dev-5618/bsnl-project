import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, initTheme } from "@/lib/store";

export default function Index() {
  const session = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    initTheme();
    document.title = "BSNL SMS Dashboard";
    navigate(session ? "/dashboard" : "/login", { replace: true });
  }, [session, navigate]);
  return null;
}
