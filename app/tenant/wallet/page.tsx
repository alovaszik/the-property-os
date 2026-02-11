"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  Unlock,
  CreditCard,
  Trash2,
  Plus,
  Loader2,
  Clock,
  Building,
  Banknote,
  HandCoins,
  RefreshCw,
} from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface WalletData {
  id: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder: string;
  iban: string;
  is_default: boolean;
}

interface SecurityDeposit {
  id: string;
  amount: number;
  currency: string;
  status: string;
  locked_at: string;
  released_at: string | null;
  release_amount: number | null;
  deduction_reason: string | null;
  tenancies: { unit: string; properties: { name: string } } | null;
}

interface MoneyRequest {
  id: string;
  amount: number;
  currency: string;
  reason: string;
  category: string;
  status: string;
  landlord_note: string | null;
  created_at: string;
  tenancies: { unit: string; properties: { name: string } } | null;
}

interface Tenancy {
  id: string;
  unit: string;
  properties: { name: string };
}

function formatCurrency(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function txIcon(type: string) {
  switch (type) {
    case "deposit": return <ArrowDownToLine className="w-4 h-4 text-emerald-500" />;
    case "withdrawal": case "payout": return <ArrowUpFromLine className="w-4 h-4 text-orange-500" />;
    case "rent_paid": return <Banknote className="w-4 h-4 text-red-500" />;
    case "security_deposit_lock": return <Lock className="w-4 h-4 text-amber-500" />;
    case "security_deposit_release": return <Unlock className="w-4 h-4 text-emerald-500" />;
    case "maintenance_request": return <HandCoins className="w-4 h-4 text-emerald-500" />;
    default: return <CreditCard className="w-4 h-4 text-muted-foreground" />;
  }
}

function statusBadge(status: string) {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    completed: { variant: "default", label: "Completed" },
    pending: { variant: "secondary", label: "Pending" },
    failed: { variant: "destructive", label: "Failed" },
    cancelled: { variant: "outline", label: "Cancelled" },
    held: { variant: "secondary", label: "Held" },
    released: { variant: "default", label: "Released" },
    partially_released: { variant: "outline", label: "Partial" },
    approved: { variant: "default", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
    paid: { variant: "default", label: "Paid" },
  };
  const s = map[status] || { variant: "outline" as const, label: status };
  return <Badge variant={s.variant} className="text-xs">{s.label}</Badge>;
}

export default function TenantWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [deposits, setDeposits] = useState<SecurityDeposit[]>([]);
  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [loading, setLoading] = useState(true);

  // Deposit modal
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  // Withdraw modal
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Bank account modal
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: "", account_holder: "", iban: "" });
  const [bankLoading, setBankLoading] = useState(false);

  // Request money modal
  const [showRequest, setShowRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ tenancy_id: "", amount: "", reason: "", category: "maintenance" });
  const [requestLoading, setRequestLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [wRes, tRes, bRes, dRes, rRes, tenRes] = await Promise.all([
      fetch("/api/wallet"),
      fetch("/api/wallet/transactions"),
      fetch("/api/wallet/bank-accounts"),
      fetch("/api/wallet/security-deposits"),
      fetch("/api/wallet/money-requests"),
      supabase.from("tenancies").select("id, unit, properties(name)").eq("status", "active"),
    ]);
    const [w, t, b, d, r] = await Promise.all([wRes.json(), tRes.json(), bRes.json(), dRes.json(), rRes.json()]);
    setWallet(w.wallet);
    setTransactions(t.transactions || []);
    setBankAccounts(b.accounts || []);
    setDeposits(d.deposits || []);
    setRequests(r.requests || []);
    setTenancies((tenRes.data as Tenancy[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDeposit = async () => {
    const amt = Number.parseFloat(depositAmount);
    if (!amt || amt < 1) return;
    setDepositLoading(true);
    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt, currency: wallet?.currency || "eur" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setDepositLoading(false);
  };

  const handleWithdraw = async () => {
    const amt = Number.parseFloat(withdrawAmount);
    if (!amt || amt < 1) return;
    const defaultBank = bankAccounts.find((b) => b.is_default) || bankAccounts[0];
    if (!defaultBank) return;
    setWithdrawLoading(true);
    await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt, bank_account_id: defaultBank.id }),
    });
    setWithdrawAmount("");
    setShowWithdraw(false);
    await fetchAll();
    setWithdrawLoading(false);
  };

  const handleAddBank = async () => {
    if (!bankForm.bank_name || !bankForm.account_holder || !bankForm.iban) return;
    setBankLoading(true);
    await fetch("/api/wallet/bank-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bankForm),
    });
    setBankForm({ bank_name: "", account_holder: "", iban: "" });
    setShowAddBank(false);
    await fetchAll();
    setBankLoading(false);
  };

  const handleDeleteBank = async (id: string) => {
    await fetch("/api/wallet/bank-accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchAll();
  };

  const handleRequestMoney = async () => {
    if (!requestForm.tenancy_id || !requestForm.amount || !requestForm.reason) return;
    setRequestLoading(true);
    await fetch("/api/wallet/money-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenancy_id: requestForm.tenancy_id,
        amount: Number.parseFloat(requestForm.amount),
        reason: requestForm.reason,
        category: requestForm.category,
      }),
    });
    setRequestForm({ tenancy_id: "", amount: "", reason: "", category: "maintenance" });
    setShowRequest(false);
    await fetchAll();
    setRequestLoading(false);
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const heldDepositsTotal = deposits
    .filter((d) => d.status === "held")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const pendingRequestsTotal = requests
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="p-4 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Wallet</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your funds, deposits, and reimbursements</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Main Balance */}
          <Card className="p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Available Balance</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatCurrency(wallet?.balance || 0, wallet?.currency)}
            </p>
            <div className="flex gap-2 mt-4">
              <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 flex-1">
                    <ArrowDownToLine className="w-4 h-4" /> Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>Add money to your wallet via Stripe</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Amount ({wallet?.currency})</Label>
                      <Input type="number" min="1" step="0.01" placeholder="100.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      {[50, 100, 250, 500].map((amt) => (
                        <Button key={amt} variant="outline" size="sm" onClick={() => setDepositAmount(String(amt))} className="flex-1">
                          {amt}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleDeposit} disabled={depositLoading || !depositAmount} className="w-full gap-2">
                      {depositLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                      Pay with Stripe
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1 bg-transparent" disabled={!bankAccounts.length}>
                    <ArrowUpFromLine className="w-4 h-4" /> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Send to {bankAccounts.find((b) => b.is_default)?.bank_name || bankAccounts[0]?.bank_name || "your bank"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Amount ({wallet?.currency})</Label>
                      <Input type="number" min="1" max={wallet?.balance || 0} step="0.01" placeholder="50.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                      <p className="text-xs text-muted-foreground">Available: {formatCurrency(wallet?.balance || 0, wallet?.currency)}</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleWithdraw} disabled={withdrawLoading || !withdrawAmount || Number(withdrawAmount) > (wallet?.balance || 0)} className="w-full gap-2">
                      {withdrawLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpFromLine className="w-4 h-4" />}
                      Withdraw
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          {/* Security Deposits */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Locked Deposits</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatCurrency(heldDepositsTotal, wallet?.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {deposits.filter((d) => d.status === "held").length} active deposit{deposits.filter((d) => d.status === "held").length !== 1 ? "s" : ""} held
            </p>
          </Card>

          {/* Pending Requests */}
          <Card className="p-5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <HandCoins className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Pending Requests</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatCurrency(pendingRequestsTotal, wallet?.currency)}
            </p>
            <div className="mt-3">
              <Dialog open={showRequest} onOpenChange={setShowRequest}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 w-full bg-transparent" disabled={tenancies.length === 0}>
                    <HandCoins className="w-4 h-4" /> Request Money
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Reimbursement</DialogTitle>
                    <DialogDescription>Ask your landlord to cover a cost (maintenance, repairs, etc.)</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Property / Unit</Label>
                      <Select value={requestForm.tenancy_id} onValueChange={(v) => setRequestForm({ ...requestForm, tenancy_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                        <SelectContent>
                          {tenancies.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.properties?.name} - {t.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={requestForm.category} onValueChange={(v) => setRequestForm({ ...requestForm, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="utility">Utility</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount ({wallet?.currency})</Label>
                      <Input type="number" min="1" step="0.01" placeholder="50.00" value={requestForm.amount} onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Textarea placeholder="Describe what needs to be covered..." value={requestForm.reason} onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })} rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleRequestMoney} disabled={requestLoading || !requestForm.tenancy_id || !requestForm.amount || !requestForm.reason} className="w-full gap-2">
                      {requestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HandCoins className="w-4 h-4" />}
                      Submit Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="transactions" className="gap-1.5">
              <CreditCard className="w-4 h-4" /> Transactions
            </TabsTrigger>
            <TabsTrigger value="deposits" className="gap-1.5">
              <Lock className="w-4 h-4" /> Deposits
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5">
              <HandCoins className="w-4 h-4" /> My Requests
            </TabsTrigger>
            <TabsTrigger value="bank" className="gap-1.5">
              <Building className="w-4 h-4" /> Bank
            </TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-3">
            {transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your transaction history will appear here</p>
              </Card>
            ) : (
              transactions.map((tx) => (
                <Card key={tx.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      {txIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description || tx.type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${tx.amount >= 0 ? "text-emerald-600" : "text-foreground"}`}>
                        {tx.amount >= 0 ? "+" : ""}{formatCurrency(tx.amount, tx.currency)}
                      </p>
                      {statusBadge(tx.status)}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Security Deposits Tab */}
          <TabsContent value="deposits" className="space-y-3">
            {deposits.length === 0 ? (
              <Card className="p-8 text-center">
                <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No security deposits</p>
                <p className="text-xs text-muted-foreground mt-1">Your security deposits will appear here once your landlord locks them</p>
              </Card>
            ) : (
              deposits.map((dep) => (
                <Card key={dep.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${dep.status === "held" ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                      {dep.status === "held" ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {dep.tenancies?.properties?.name || "Property"} - {dep.tenancies?.unit || "Unit"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dep.status === "held" ? "Locked" : dep.status === "released" ? "Released" : "Partially released"}{" "}
                        {new Date(dep.status === "held" ? dep.locked_at : dep.released_at || dep.locked_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(dep.amount, dep.currency)}</p>
                      {statusBadge(dep.status)}
                    </div>
                  </div>
                  {dep.deduction_reason && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Deduction: {dep.deduction_reason} ({formatCurrency(dep.amount - (dep.release_amount || 0), dep.currency)})
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="requests" className="space-y-3">
            {requests.length === 0 ? (
              <Card className="p-8 text-center">
                <HandCoins className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No requests yet</p>
                <p className="text-xs text-muted-foreground mt-1">Request reimbursements for maintenance and repairs</p>
                {tenancies.length > 0 && (
                  <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowRequest(true)}>
                    <HandCoins className="w-4 h-4" /> Request Money
                  </Button>
                )}
              </Card>
            ) : (
              requests.map((req) => (
                <Card key={req.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      req.status === "paid" ? "bg-emerald-500/10" : req.status === "rejected" ? "bg-red-500/10" : "bg-orange-500/10"
                    }`}>
                      {req.status === "paid" ? <Banknote className="w-4 h-4 text-emerald-500" /> :
                       req.status === "rejected" ? <HandCoins className="w-4 h-4 text-red-500" /> :
                       <Clock className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{req.reason}</p>
                        <Badge variant="outline" className="text-xs capitalize">{req.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {req.tenancies?.properties?.name} - {req.tenancies?.unit} | {new Date(req.created_at).toLocaleDateString()}
                      </p>
                      {req.landlord_note && (
                        <p className="text-xs text-muted-foreground mt-1 italic">Landlord: {req.landlord_note}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(req.amount, req.currency)}</p>
                      {statusBadge(req.status)}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Bank Accounts Tab */}
          <TabsContent value="bank" className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Linked Bank Accounts</h3>
              <Dialog open={showAddBank} onOpenChange={setShowAddBank}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 bg-transparent">
                    <Plus className="w-4 h-4" /> Add Bank
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Bank Account</DialogTitle>
                    <DialogDescription>Enter your bank details for withdrawals</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input placeholder="e.g. OTP Bank" value={bankForm.bank_name} onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Holder</Label>
                      <Input placeholder="John Doe" value={bankForm.account_holder} onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>IBAN</Label>
                      <Input placeholder="HU42 1234 5678 9012 3456 7890 1234" value={bankForm.iban} onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddBank} disabled={bankLoading} className="w-full gap-2">
                      {bankLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Bank Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {bankAccounts.length === 0 ? (
              <Card className="p-8 text-center">
                <Building className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No bank accounts</p>
                <p className="text-xs text-muted-foreground mt-1">Add a bank account to withdraw funds</p>
              </Card>
            ) : (
              bankAccounts.map((bank) => (
                <Card key={bank.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{bank.bank_name}</p>
                        {bank.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{bank.account_holder} | ****{bank.iban.slice(-4)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBank(bank.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
    </div>
  );
}
