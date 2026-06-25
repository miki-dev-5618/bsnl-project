import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Trash2 } from "lucide-react";
import { addSubscriber, removeSubscriber, useSession, useSubscribers } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/subscribers")({
  head: () => ({ meta: [{ title: "Subscribers · BSNL SMS" }] }),
  component: Subscribers,
});

function Subscribers() {
  const session = useSession();
  const subs = useSubscribers();
  const [email, setEmail] = useState("");

  if (session?.role !== "admin") {
    return (
      <div className="p-6">
        <Card className="p-6 text-sm text-muted-foreground">
          You don't have access to this page.
        </Card>
      </div>
    );
  }

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email");
    addSubscriber(email.trim());
    setEmail("");
    toast.success("Subscriber added");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Alert subscribers</h2>
        <p className="text-sm text-muted-foreground">
          These addresses receive alerts when any SMSC turns Down or Degraded.
        </p>
      </div>
      <Card className="p-4">
        <form onSubmit={add} className="flex gap-2">
          <Input
            type="email"
            placeholder="ops@bsnl.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </form>
      </Card>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                  No subscribers yet.
                </TableCell>
              </TableRow>
            )}
            {subs.map((s) => (
              <TableRow key={s}>
                <TableCell className="font-medium">{s}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      removeSubscriber(s);
                      toast.success("Removed");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
