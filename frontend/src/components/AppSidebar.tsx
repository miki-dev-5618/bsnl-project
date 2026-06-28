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
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <img
            src="/logo/logo.png"
            alt="BSNL Logo"
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">BSNL</span>
            <span className="text-xs text-muted-foreground">SMS Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
