import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Map, Mail, ScrollText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const session = useSession();
  const { pathname } = useLocation();
  const isAdmin = session?.role === "admin";

  const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutGrid, show: true },
    { title: "Map view", url: "/map", icon: Map, show: true },
    { title: "Alert subscribers", url: "/subscribers", icon: Mail, show: isAdmin },
    { title: "Audit log", url: "/audit", icon: ScrollText, show: isAdmin },
  ].filter((i) => i.show);

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="border-b border-sidebar-border/40 p-4">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <img
            src="/logo/logo.png"
            alt="BSNL Logo"
            className="h-8 w-auto object-contain shrink-0 transition-transform duration-300 hover:rotate-12"
          />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-foreground">BSNL SMART</span>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wide uppercase">SMS Monitoring and Add-on  Revenue Tool</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url} className="relative">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "relative h-10 px-3 overflow-visible rounded-xl font-medium transition-colors hover:bg-transparent!",
                        isActive
                          ? "text-primary dark:text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Link to={item.url} className="flex w-full items-center gap-3">
                        {/* Hover & Active Background Slider */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebarActiveBackdrop"
                            className="absolute inset-0 -z-10 rounded-xl bg-primary/10 dark:bg-primary/20 border-l-[3.5px] border-primary"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}

                        <item.icon className={cn(
                          "h-5 w-5 transition-transform duration-200",
                          isActive ? "text-primary scale-105" : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                        )} />

                        <span className="text-sm transition-all duration-200 group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
