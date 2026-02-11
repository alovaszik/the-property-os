"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Clock } from "@/components/icons";
import { ticketStatusLabels } from "@/types/ticket";
import { useSupportTicketDetail } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { createClient } from "@/lib/supabase/client";

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: ticket, isLoading, mutate } = useSupportTicketDetail(id);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (isLoading) return <PageSkeleton />;

  const t = ticket as Record<string, any> | null;
  if (!t) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Ticket not found</p>
          <Button asChild variant="outline" className="mt-4 bg-transparent">
            <Link href="/support"><ArrowLeft className="w-4 h-4 mr-2" />Back to Support</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const statusKey = (t.status || "open") as keyof typeof ticketStatusLabels;
  const statusInfo = ticketStatusLabels[statusKey] || ticketStatusLabels.open;
  const messages = (t.messages ?? []) as Array<Record<string, any>>;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("ticket_messages").insert({
        ticket_id: id,
        sender_id: user.id,
        is_staff: false,
        message: message.trim(),
      });
      await supabase.from("tickets").update({ updated_at: new Date().toISOString() }).eq("id", id);
    }
    setMessage("");
    setSending(false);
    await mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border lg:px-8">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/support"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link>
          </Button>
          <span className="text-sm text-muted-foreground">Ticket #{t.id?.substring(0, 6)}</span>
        </div>
      </header>

      <main className="px-4 py-8 lg:px-8 max-w-4xl mx-auto">
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">{t.subject}</h1>
              <p className="text-sm text-muted-foreground">
                Created {t.created_at ? new Date(t.created_at).toLocaleString() : "--"} &middot; Last updated {t.updated_at ? new Date(t.updated_at).toLocaleString() : "--"}
              </p>
            </div>
            <Badge className={`${statusInfo.color} ${statusInfo.bgColor}`} variant="outline">{statusInfo.label}</Badge>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-sm text-foreground leading-relaxed">{t.description}</p>
          </div>
        </Card>

        <div className="space-y-4 mb-6">
          {messages.map((msg) => {
            const isSupport = msg.is_staff === true;
            return (
              <Card key={msg.id} className={`p-4 ${isSupport ? "border-primary/30 bg-primary/5" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isSupport ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"}`}>
                    {isSupport ? "S" : "Y"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-sm font-semibold text-foreground">{isSupport ? "Support Team" : "You"}</span>
                      {isSupport && <Badge variant="outline" className="text-xs">Support</Badge>}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {t.status !== "closed" && (
          <Card className="p-4">
            <Textarea placeholder="Type your message..." value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px] mb-3 resize-none" />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">You will be notified when support responds</p>
              <Button onClick={handleSend} disabled={!message.trim() || sending} size="sm">
                {sending ? "Sending..." : (<><Send className="w-4 h-4 mr-2" />Send</>)}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
