"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Generic fetcher for Supabase queries
async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

// ---- PROPERTIES ----
async function fetchProperties() {
  const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

// ---- SINGLE PROPERTY ----
async function fetchProperty(id: string) {
  const { data } = await supabase.from("properties").select("*").eq("id", id).single();
  return data;
}

// ---- TENANCIES (landlord view with tenant profile + property) ----
async function fetchTenancies() {
  const { data } = await supabase
    .from("tenancies")
    .select("*, property:properties(*), tenant:profiles!tenancies_tenant_id_fkey(*)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ---- TENANCY (tenant's own) ----
async function fetchMyTenancy() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("tenancies")
    .select("*, property:properties(*), landlord:profiles!tenancies_landlord_id_fkey(*)")
    .eq("tenant_id", user.id)
    .eq("status", "active")
    .single();
  return data;
}

// ---- PAYMENTS (landlord) ----
async function fetchPaymentsLandlord() {
  const { data } = await supabase
    .from("payments")
    .select("*, tenancy:tenancies(*, tenant:profiles!tenancies_tenant_id_fkey(*), property:properties(*))")
    .order("due_date", { ascending: false });
  return data ?? [];
}

// ---- PAYMENTS (tenant) ----
async function fetchPaymentsTenant() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("tenant_id", user.id)
    .order("due_date", { ascending: false });
  return data ?? [];
}

// ---- MAINTENANCE TICKETS (landlord) ----
async function fetchMaintenanceLandlord() {
  const { data } = await supabase
    .from("maintenance_tickets")
    .select("*, tenancy:tenancies(*, tenant:profiles!tenancies_tenant_id_fkey(*), property:properties(*))")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ---- MAINTENANCE TICKETS (tenant) ----
async function fetchMaintenanceTenant() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("maintenance_tickets")
    .select("*, tenancy:tenancies(property:properties(*))")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ---- DOCUMENTS (tenant) ----
async function fetchDocumentsTenant() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ---- STATEMENTS (tenant) ----
async function fetchStatementsTenant() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("statements")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ---- ACTIVITY LOG ----
async function fetchActivityLog() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

// ---- SUPPORT TICKETS ----
async function fetchSupportTickets() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function fetchSupportTicketDetail(id: string) {
  const { data: ticket } = await supabase.from("tickets").select("*").eq("id", id).single();
  if (!ticket) return null;
  const { data: messages } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });
  return { ...ticket, messages: messages ?? [] };
}

// ---- DASHBOARD STATS ----
async function fetchLandlordStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { properties: 0, tenants: 0, revenue: 0, pendingPayments: 0, occupancy: 0, maintenanceOpen: 0 };

  const [propsRes, tenanciesRes, paymentsRes, maintRes] = await Promise.all([
    supabase.from("properties").select("id, total_units, status", { count: "exact" }).eq("landlord_id", user.id),
    supabase.from("tenancies").select("id, monthly_rent", { count: "exact" }).eq("landlord_id", user.id).eq("status", "active"),
    supabase.from("payments").select("amount, status").eq("landlord_id", user.id),
    supabase.from("maintenance_tickets").select("id", { count: "exact" }).eq("landlord_id", user.id).in("status", ["open", "in-progress"]),
  ]);

  const properties = propsRes.data ?? [];
  const tenancies = tenanciesRes.data ?? [];
  const payments = paymentsRes.data ?? [];
  const totalUnits = properties.reduce((sum, p) => sum + (p.total_units || 1), 0);
  const occupiedUnits = tenancies.length;
  const occupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const monthlyRevenue = tenancies.reduce((sum, t) => sum + Number(t.monthly_rent || 0), 0);
  const pending = payments.filter(p => p.status === "pending" || p.status === "overdue").length;

  return {
    properties: properties.length,
    tenants: tenancies.length,
    revenue: monthlyRevenue,
    pendingPayments: pending,
    occupancy,
    maintenanceOpen: maintRes.count ?? 0,
  };
}

async function fetchTenantStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { nextPayment: null, totalPaid: 0, onTimeRate: 100, openTickets: 0 };

  const [paymentsRes, maintRes] = await Promise.all([
    supabase.from("payments").select("*").eq("tenant_id", user.id).order("due_date", { ascending: false }),
    supabase.from("maintenance_tickets").select("id", { count: "exact" }).eq("tenant_id", user.id).in("status", ["open", "in-progress"]),
  ]);

  const payments = paymentsRes.data ?? [];
  const nextPayment = payments.find(p => p.status === "pending");
  const completed = payments.filter(p => p.status === "completed");
  const totalPaid = completed.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return {
    nextPayment,
    totalPaid,
    onTimeRate: completed.length > 0 ? 100 : 0,
    openTickets: maintRes.count ?? 0,
  };
}

// ---- SWR HOOKS ----
export function useProfile() {
  return useSWR("profile", fetchProfile);
}

export function useProperties() {
  return useSWR("properties", fetchProperties);
}

export function useProperty(id: string | null) {
  return useSWR(id ? `property-${id}` : null, () => fetchProperty(id!));
}

export function useTenancies() {
  return useSWR("tenancies", fetchTenancies);
}

export function useMyTenancy() {
  return useSWR("my-tenancy", fetchMyTenancy);
}

export function usePaymentsLandlord() {
  return useSWR("payments-landlord", fetchPaymentsLandlord);
}

export function usePaymentsTenant() {
  return useSWR("payments-tenant", fetchPaymentsTenant);
}

export function useMaintenanceLandlord() {
  return useSWR("maintenance-landlord", fetchMaintenanceLandlord);
}

export function useMaintenanceTenant() {
  return useSWR("maintenance-tenant", fetchMaintenanceTenant);
}

export function useDocumentsTenant() {
  return useSWR("documents-tenant", fetchDocumentsTenant);
}

export function useStatementsTenant() {
  return useSWR("statements-tenant", fetchStatementsTenant);
}

export function useActivityLog() {
  return useSWR("activity-log", fetchActivityLog);
}

export function useSupportTickets() {
  return useSWR("support-tickets", fetchSupportTickets);
}

export function useSupportTicketDetail(id: string) {
  return useSWR(id ? `support-ticket-${id}` : null, () => fetchSupportTicketDetail(id));
}

export function useLandlordStats() {
  return useSWR("landlord-stats", fetchLandlordStats);
}

export function useTenantStats() {
  return useSWR("tenant-stats", fetchTenantStats);
}
