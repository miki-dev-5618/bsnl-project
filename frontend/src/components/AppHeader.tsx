import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout, toggleTheme, currentTheme, useSession } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const session = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/map":
        return "Map View";
      case "/subscribers":
        return "Alert Subscribers";
      case "/audit":
        return "Audit Log";
      default:
        return "SMS Control Center";
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/40 px-6 backdrop-blur-md transition-all duration-300",
        isScrolled
          ? "bg-background/80 shadow-md border-border/80"
          : "bg-background/40"
      )}
    >
      <SidebarTrigger className="h-9 w-9 hover:bg-muted/60 transition-colors rounded-lg" />
      
      <div className="flex flex-1 items-center gap-2">
        <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg transition-all duration-200">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            toggleTheme();
            setTheme(currentTheme());
          }}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all rounded-lg"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>

        {session && (
          <div className="flex items-center gap-3 border-l border-border/50 pl-4">
            {/* User Metadata */}
            <div className="hidden text-right text-xs leading-tight sm:block">
              <div className="font-semibold text-foreground">{session.name}</div>
              <div className="text-[9px] font-bold text-muted-foreground/80 tracking-wide uppercase mt-0.5">
                {session.role}
              </div>
            </div>

            {/* Avatar Fallback Badge */}
            <Avatar className="h-8 w-8 border border-border/80 bg-muted ring-2 ring-primary/5 transition-all">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase select-none">
                {session.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="h-8 rounded-lg px-2.5 text-xs font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
