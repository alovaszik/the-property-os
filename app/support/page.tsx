"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle,
} from "@/components/icons";
import { ticketStatusLabels } from "@/types/ticket";
import { useSupportTickets } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { createClient } from "@/lib/supabase/client";

export default function SupportPage() {
  const { data: ticketsRaw, isLoading, mutate } = useSupportTickets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  if (isLoading) return <PageSkeleton rows={4} />;

  const tickets = (ticketsRaw ?? []) as Array<Record<string, any>>;

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(search.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "open") return matchesSearch && ["open", "in-progress", "waiting"].includes(ticket.status);
    if (filter === "resolved") return matchesSearch && ["resolved", "closed"].includes(ticket.status);

    return matchesSearch;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => ["open", "in-progress", "waiting"].includes(t.status)).length,
    resolved: tickets.filter((t) => ["resolved", "closed"].includes(t.status)).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-base font-semibold text-foreground">RentDuo Support</Link>
        </div>
        <Button asChild size="sm">
          <Link href="/support/new"><Plus className="w-4 h-4 mr-2" />New Ticket</Link>
        </Button>
      </header>

      <main className="px-4 py-8 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-foreground">{stats.open}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
            </div>
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
              <Button variant={filter === "open" ? "default" : "outline"} size="sm" onClick={() => setFilter("open")} className={filter !== "open" ? "bg-transparent" : ""}>Open</Button>
              <Button variant={filter === "resolved" ? "default" : "outline"} size="sm" onClick={() => setFilter("resolved")} className={filter !== "resolved" ? "bg-transparent" : ""}>Resolved</Button>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{tickets.length === 0 ? "No support tickets yet. Create one if you need help!" : "No tickets found"}</p>
              </div>
            </Card>
          ) : (
            filteredTickets.map((ticket) => {
              const statusKey = ticket.status as keyof typeof ticketStatusLabels;
              const statusInfo = ticketStatusLabels[statusKey] || ticketStatusLabels.open;
              return (
                <Link key={ticket.id} href={`/support/${ticket.id}`}>
                  <Card className="p-5 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${statusInfo.bgColor} flex items-center justify-center shrink-0`}>
                        {ticket.status === "resolved" || ticket.status === "closed" ? (
                          <CheckCircle2 className={`w-5 h-5 ${statusInfo.color}`} />
                        ) : ticket.priority === "high" || ticket.priority === "urgent" ? (
                          <AlertCircle className={`w-5 h-5 ${statusInfo.color}`} />
                        ) : (
                          <MessageSquare className={`w-5 h-5 ${statusInfo.color}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-base font-semibold text-foreground">{ticket.subject}</h3>
                          <Badge className={`${statusInfo.color} ${statusInfo.bgColor} shrink-0`} variant="outline">{statusInfo.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>#{ticket.id?.substring(0, 6)}</span>
                          <span>Created {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "--"}</span>
                          <span>Updated {ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : "--"}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
