import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { login, useSession, initTheme } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login · BSNL SMS Dashboard" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [email, setEmail] = useState("admin@bsnl.in");
  const [password, setPassword] = useState("admin123");

  useEffect(() => {
    initTheme();
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = login(email, password);
    if (!s) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success(`Welcome, ${s.name}`);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            BS
          </div>
          <h1 className="text-lg font-semibold">BSNL SMS Dashboard</h1>
          <p className="text-xs text-muted-foreground">Sign in to continue</p>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">Demo accounts</div>
            <div>admin@bsnl.in / admin123</div>
            <div>user01@bsnl.in … user16@bsnl.in / user123</div>
          </div>
        </form>
      </Card>
    </div>
  );
}