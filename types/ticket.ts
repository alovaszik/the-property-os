export type TicketStatus = "open" | "in-progress" | "waiting" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "account" | "payment" | "technical" | "property" | "other";

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  createdAt: Date;
  isInternal?: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
}

export const ticketStatusLabels: Record<TicketStatus, { label: string; color: string; bgColor: string }> = {
  open: {
    label: "Open",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  waiting: {
    label: "Waiting for Response",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  resolved: {
    label: "Resolved",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  closed: {
    label: "Closed",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
  },
};

export const ticketPriorityLabels: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "text-gray-600" },
  medium: { label: "Medium", color: "text-blue-600" },
  high: { label: "High", color: "text-orange-600" },
  urgent: { label: "Urgent", color: "text-red-600" },
};

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  account: "Account & Profile",
  payment: "Payments & Billing",
  technical: "Technical Issue",
  property: "Property Related",
  other: "Other",
};
