import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Toaster } from "@/components/ui/sonner";
import { useSession, initTheme } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export default function AppLayout() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

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
      <SidebarInset className="relative flex flex-col min-w-0 bg-background/50">
        <AppHeader />
        
        {/* Subtle background animated gradient blobs */}
        <div className="absolute top-[20%] right-[10%] h-[30%] w-[30%] rounded-full bg-primary/5 blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-[20%] left-[10%] h-[35%] w-[35%] rounded-full bg-secondary/5 blur-[110px] pointer-events-none -z-10" />
        
        <main className="flex-1 flex flex-col min-h-0 w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.32,
                ease: [0.16, 1, 0.3, 1], // Custom Apple-like cubic bezier ease curve
              }}
              className="flex-1 flex flex-col w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
