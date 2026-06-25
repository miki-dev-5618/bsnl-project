import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Toaster } from "@/components/ui/sonner";
import { useSession, initTheme } from "@/lib/store";

export default function AppLayout() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    if (session === null) navigate("/login", { replace: true });
  }, [session, navigate]);

  if (!session) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
