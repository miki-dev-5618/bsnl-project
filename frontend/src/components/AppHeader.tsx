import { useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { logout, toggleTheme, currentTheme, useSession } from "@/lib/store";

export function AppHeader() {
  const session = useSession();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => setTheme(currentTheme()), []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-2">
        <h1 className="text-sm font-semibold tracking-tight sm:text-base">BSNL SMS Dashboard</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toggleTheme();
          setTheme(currentTheme());
        }}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      {session && (
        <>
          <div className="hidden text-right text-xs leading-tight sm:block">
            <div className="font-medium">{session.name}</div>
            <div className="text-muted-foreground capitalize">{session.role}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Logout
          </Button>
        </>
      )}
    </header>
  );
}
