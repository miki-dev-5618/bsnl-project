import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { login, useSession, initTheme } from "@/lib/store";
import { toast } from "sonner";
import { ShieldCheck, Server, AlertCircle, Network } from "lucide-react";

function CanvasParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.radius = Math.random() * 1.5 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(148, 163, 184, 0.18)";
        ctx.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: 45 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.06 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [email, setEmail] = useState("admin@bsnl.in");
  const [password, setPassword] = useState("admin123");

  useEffect(() => {
    initTheme();
    document.title = "Login · BSNL SMS Dashboard";
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const s = await login(email, password);
    if (!s) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success(`Welcome back, ${s.name}`);
    navigate("/dashboard");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 350, damping: 26 },
    },
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background md:flex-row">
      {/* Background blobs for both light and dark modes */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[45%] w-[45%] rounded-full bg-secondary/15 blur-[130px] dark:bg-secondary/5 pointer-events-none" />

      {/* Left Side: Branding, illustration, dynamic particles */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-b from-primary/5 via-secondary/5 to-background p-12 md:flex border-r border-border/40">
        <CanvasParticles />

        {/* Top Header */}
        <div className="flex items-center gap-3">
          <img
            src="/logo/logo.png"
            alt="BSNL Logo"
            className="h-10 w-auto object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg tracking-tight text-foreground">BSNL</span>
            <span className="text-xs text-muted-foreground font-medium">SMS Control Center</span>
          </div>
        </div>

        {/* Core Value Statement */}
        <div className="my-auto space-y-6 max-w-md z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground leading-[1.15]">
              Real-time SMSC infrastructure, monitored.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Track SMS Centers nationwide, update point-of-interconnect state instantly, and dispatch emergency alerts with speed and control.
            </p>
          </motion.div>

          {/* Quick Metrics Overlay */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/60 dark:border-zinc-800/40 bg-white/45 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm">
              <Server className="h-5 w-5 text-primary mb-2" />
              <div className="text-xs text-muted-foreground">Monitored nodes</div>
              <div className="text-lg font-bold text-foreground">14 SSTPs</div>
            </div>
            <div className="rounded-2xl border border-white/60 dark:border-zinc-800/40 bg-white/45 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-500 mb-2" />
              <div className="text-xs text-muted-foreground">System SLA</div>
              <div className="text-lg font-bold text-foreground">99.98%</div>
              <div className="grid grid-cols-2 gap-4">

              </div>


            </div>
            <div className="rounded-2xl border border-white/60 dark:border-zinc-800/40 bg-white/45 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm">
              <Server className="h-5 w-5 text-primary mb-2" />
              <div className="text-xs text-muted-foreground">Monitored gateways</div>
              <div className="text-lg font-bold text-foreground">10 SMSCs</div>
            </div>
            <div className="rounded-2xl border border-white/60 dark:border-zinc-800/40 bg-white/45 dark:bg-zinc-900/40 p-4 backdrop-blur-sm shadow-sm">
              <Network className="h-5 w-5 text-emerald-500 mb-2" />
              <div className="text-xs text-muted-foreground">Total POIs</div>
              <div className="text-lg font-bold text-foreground">42 POIs</div>
            </div>
          </div>
        </div>

        {/* Footer */}

      </div>

      {/* Right Side: Centered Glass Login Card */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px]"
        >
          {/* Logo visible only on mobile */}
          <div className="mb-8 flex flex-col items-center text-center md:hidden">
            <img
              src="/logo/logo.png"
              alt="BSNL Logo"
              className="h-12 w-auto object-contain mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground">BSNL SMS Control Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage SMSC gateways</p>
          </div>

          <Card className="rounded-3xl border border-white/60 dark:border-zinc-800/50 bg-white/55 dark:bg-zinc-900/40 p-8 backdrop-blur-xl shadow-xl">
            <div className="mb-6 hidden md:block">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Welcome back</h2>
              <p className="text-xs text-muted-foreground">Provide credentials to access dashboard</p>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl bg-white/65 dark:bg-zinc-900/80 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all border-muted-foreground/10"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl bg-white/65 dark:bg-zinc-900/80 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all border-muted-foreground/10"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white font-medium py-5 shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99]">
                  Sign in
                </Button>
              </motion.div>

            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
