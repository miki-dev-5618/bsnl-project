import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, MailCheck, MailMinus, Info, Send } from "lucide-react";
import { addSubscriber, removeSubscriber, useSession, useSubscribers } from "@/lib/store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Subscribers() {
  const session = useSession();
  const subs = useSubscribers();
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "Subscribers · BSNL SMS";
  }, []);

  if (session?.role !== "admin") {
    return (
      <div className="p-6">
        <Card className="rounded-3xl border border-red-500/10 bg-red-500/5 p-6 text-sm text-red-800 dark:text-red-400 flex items-center gap-3">
          <Info className="h-5 w-5 shrink-0" />
          <span>You do not have administrative clearance to access alert subscribers.</span>
        </Card>
      </div>
    );
  }

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email");
    addSubscriber(email.trim());
    setEmail("");
    toast.success("Subscriber added successfully");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 flex-1 flex flex-col min-h-0">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Alert Subscribers</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          These email addresses will receive instant notifications in real time when any gateway SMSC registers as Degraded or Down.
        </p>
      </div>

      {/* Glass form card to add email */}
      <Card className="rounded-3xl border border-white/60 dark:border-zinc-800/40 bg-white/50 dark:bg-zinc-900/45 p-4 backdrop-blur-sm shadow-sm max-w-xl">
        <form onSubmit={add} className="flex gap-2">
          <Input
            type="email"
            placeholder="operations-alert@bsnl.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl focus-visible:ring-primary focus-visible:ring-offset-2 transition-all bg-white/70 dark:bg-zinc-900/60"
            required
          />
          <Button type="submit" className="rounded-xl px-5 gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform">
            <Send className="h-3.5 w-3.5" />
            Add
          </Button>
        </form>
      </Card>

      {/* Rounded table showing list of email addresses */}
      <div className="rounded-3xl border border-white/60 dark:border-zinc-800/40 bg-white/50 dark:bg-zinc-900/45 shadow-sm overflow-hidden max-w-2xl flex flex-col min-h-[250px]">
        <div className="overflow-y-auto flex-1 relative">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.05)] border-b border-border/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Alert Dispatch Addresses</TableHead>
                <TableHead className="w-24 text-right pr-6 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={2} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="mb-4 text-muted-foreground/60 p-4 bg-muted/40 rounded-full border border-border/40"
                      >
                        <MailMinus className="h-10 w-10" />
                      </motion.div>
                      <h3 className="text-sm font-bold text-foreground">No dispatch addresses</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[240px] leading-relaxed">
                        Currently no notification email addresses are subscribed to gateway status alerts.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subs.map((s) => (
                  <TableRow
                    key={s}
                    className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.04] transition-colors duration-150 odd:bg-muted/10 dark:odd:bg-zinc-800/10"
                  >
                    <TableCell className="font-semibold text-foreground text-xs pl-6 flex items-center gap-2.5 h-12">
                      <MailCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{s}</span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          removeSubscriber(s);
                          toast.success("Subscriber unsubscribed successfully");
                        }}
                        className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 text-muted-foreground rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
