"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Send,
  Paperclip,
  CreditCard,
  MessageSquare,
  Bug,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Wrench,
} from "@/components/icons";

export interface FeedItem {
  id: string;
  type: "message_sent" | "message_received" | "payment" | "ticket" | "system";
  content: string;
  sender?: string;
  timestamp: string;
  metadata?: {
    amount?: string;
    status?: "success" | "pending" | "failed";
    ticketId?: string;
    ticketPriority?: "low" | "medium" | "high" | "urgent";
  };
}

function FeedBubble({ item }: { item: FeedItem }) {
  if (item.type === "payment") {
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              {item.content}
            </p>
            {item.metadata?.amount && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {item.metadata.amount}
              </p>
            )}
          </div>
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        </div>
      </div>
    );
  }

  if (item.type === "ticket") {
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {item.content}
            </p>
            {item.metadata?.ticketId && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                {item.metadata.ticketId} &middot;{" "}
                {item.metadata.ticketPriority}
              </p>
            )}
          </div>
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
      </div>
    );
  }

  if (item.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
          <Clock className="w-3 h-3" />
          {item.content}
        </div>
      </div>
    );
  }

  const isSent = item.type === "message_sent";

  return (
    <div
      className={cn("flex my-1", isSent ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[80%] flex flex-col gap-0.5", isSent ? "items-end" : "items-start")}>
        {!isSent && item.sender && (
          <span className="text-[10px] text-muted-foreground font-medium px-3">
            {item.sender}
          </span>
        )}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isSent
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border text-foreground rounded-bl-md"
          )}
        >
          {item.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-3">
          {item.timestamp}
        </span>
      </div>
    </div>
  );
}

export function ActivityFeed({
  items: initialItems,
  variant = "landlord",
}: {
  items: FeedItem[];
  variant?: "landlord" | "tenant";
}) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const newItem: FeedItem = {
      id: `msg-${Date.now()}`,
      type: "message_sent",
      content: message.trim(),
      timestamp: "Just now",
    };
    setItems((prev) => [...prev, newItem]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
      >
        {items.map((item) => (
          <FeedBubble key={item.id} item={item} />
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-2xl min-h-[44px]">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
              message.trim()
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
