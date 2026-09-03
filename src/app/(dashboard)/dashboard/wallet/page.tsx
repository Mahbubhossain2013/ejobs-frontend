"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, TrendingUp, CreditCard, Shield, Clock, CheckCircle, AlertCircle, Info, Copy, CircleDot, ArrowRight, ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate, getStorageUrl } from "@/lib/utils";
import Image from "next/image";

function WalletPageInner() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const [wallet, setWallet] = useState<any>(null);
  const [depositMethods, setDepositMethods] = useState<any[]>([]);
  const [withdrawalMethods, setWithdrawalMethods] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [addGatewayId, setAddGatewayId] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addTxId, setAddTxId] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedTotal, setCopiedTotal] = useState(false);
  const [personalStep, setPersonalStep] = useState<1 | 2>(1);
  const [withdrawGatewayId, setWithdrawGatewayId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawInputs, setWithdrawInputs] = useState<Record<string, string>>({});
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [financialSettings, setFinancialSettings] = useState<any>(null);

  useEffect(() => {
    api.get("/candidate/wallet").then((r) => {
      const d = r.data;
      setWallet(d.wallet || {});
      setDepositMethods(d.deposit_methods || []);
      setWithdrawalMethods(d.withdrawal_methods || []);
      setTransactions(d.transactions || []);
      setWithdrawals(d.withdrawals || []);
      setEscrows(d.escrows || []);
      const eps = (d.deposit_methods || []).find((g: any) => String(g.name || "").toLowerCase() === "eps");
      if (eps && !addGatewayId) setAddGatewayId(String(eps.id));
    }).catch((err) => toast.error(err?.response?.data?.message || "Failed to load wallet")).finally(() => setLoading(false));
    api.get("/settings/financial").then((r) => {
      setFinancialSettings(r.data?.data || r.data || {});
    }).catch(() => toast.error("Failed to load financial settings"));
  }, []);

  useEffect(() => {
    if (paymentStatus === "success") {
      toast.success("Payment successful! Your wallet has been credited.");
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed. Please try again.");
    } else if (paymentStatus === "error") {
      toast.error("Payment processing error. Please contact support.");
    } else if (paymentStatus === "already_processed") {
      toast.info("This payment was already processed.");
    }
  }, [paymentStatus]);

  const epsMethod = depositMethods.find((g: any) => String(g.name || "").toLowerCase() === "eps");
  const hasEps = !!epsMethod;
  const effectiveGateway = hasEps ? epsMethod : depositMethods.find((g: any) => String(g.id) === addGatewayId);
  const selDG = effectiveGateway;
  const selWG = withdrawalMethods.find((g: any) => String(g.id) === withdrawGatewayId);
  const depFee = selDG ? (Number(addAmount || 0) * Number(selDG.percent_charge || 0)) / 100 : 0;
  const wdFee = selWG ? (Number(withdrawAmount || 0) * Number(selWG.percent_charge || 0)) / 100 + Number(selWG.fixed_charge || 0) : 0;
  const wdNet = Number(withdrawAmount || 0) - wdFee;
  const isPersonal = selDG?.drive_type === 'personal';

  const handleAdd = async () => {
    if (!addGatewayId || !addAmount || addLoading) return;
    setAddLoading(true);
    try {
      const payload: any = { gateway_id: Number(addGatewayId), amount: Number(addAmount) };
      if (isPersonal) {
        if (!addTxId) { toast.error("Please enter transaction ID"); setAddLoading(false); return; }
        payload.transaction_id = addTxId;
      }
      const res = await api.post("/candidate/deposit", payload);

      if (res.data.requires_redirect && res.data.payment_id) {
        sessionStorage.setItem('bkash_payment_id', res.data.payment_id);
        sessionStorage.setItem('bkash_trx_id', payload.transaction_id || '');
        if (res.data.payment_url) { window.location.href = res.data.payment_url; return; }
        toast.info("Please complete payment in bKash popup");
      }

      if (res.data.redirect_url) { window.location.href = res.data.redirect_url; return; }
      toast.success(res.data.message || "Deposit submitted");
      setAddAmount(""); setAddGatewayId(""); setAddTxId(""); setPersonalStep(1); setTab("overview");
    } catch (e: any) { toast.error(e.response?.data?.message || "Failed"); } finally { setAddLoading(false); }
  };

  const copyNumber = () => {
    if (selDG?.personal_number) {
      navigator.clipboard.writeText(selDG.personal_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawGatewayId || !withdrawAmount) return;
    setWithdrawLoading(true);
    try {
      const res = await api.post("/candidate/withdraw", { gateway_id: Number(withdrawGatewayId), amount: Number(withdrawAmount), inputs: withdrawInputs });
      toast.success(res.data.message || "Withdrawal requested");
      setWithdrawAmount(""); setWithdrawGatewayId(""); setWithdrawInputs({}); setTab("overview");
    } catch (e: any) { toast.error(e.response?.data?.message || "Failed"); } finally { setWithdrawLoading(false); }
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div>;

  const balance = Number(wallet?.balance || 0);
  const locked = Number(wallet?.locked_balance || 0);
  const withdrawable = Number(wallet?.withdrawable_balance || 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wallet</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-full bg-primary/10"><Wallet className="h-8 w-8 text-primary" /></div><div><p className="text-sm text-muted-foreground">Balance</p><p className="text-2xl font-bold">{formatCurrency(balance)}</p></div></div></CardContent></Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-full bg-green-500/10"><TrendingUp className="h-8 w-8 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Withdrawable</p><p className="text-2xl font-bold">{formatCurrency(withdrawable)}</p></div></div></CardContent></Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-full bg-yellow-500/10"><Shield className="h-8 w-8 text-yellow-600" /></div><div><p className="text-sm text-muted-foreground">Locked</p><p className="text-2xl font-bold">{formatCurrency(locked)}</p></div></div></CardContent></Card>
      </div>
      {financialSettings && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Fee Information</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div><span className="text-muted-foreground">Service Charge: </span><span className="font-semibold">{financialSettings.remote_job_service_charge || financialSettings.service_charge_percent || 0}%</span></div>
              <div><span className="text-muted-foreground">Escrow Fee: </span><span className="font-semibold">{financialSettings.escrow_fee_percent || 0}%</span></div>
              {financialSettings.min_withdrawal && <div><span className="text-muted-foreground">Minimum Withdrawal: </span><span className="font-semibold">{formatCurrency(financialSettings.min_withdrawal)}</span></div>}
            </div>
          </CardContent>
        </Card>
      )}
      <Tabs value={tab} onValueChange={(v) => { setTab(v); if (v === "add") setPersonalStep(1); }}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="add"><Plus className="h-4 w-4 mr-1" />Add Money</TabsTrigger>
          <TabsTrigger value="withdraw"><CreditCard className="h-4 w-4 mr-1" />Withdraw</TabsTrigger>
          <TabsTrigger value="escrow"><Shield className="h-4 w-4 mr-1" />Escrow</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card><CardHeader><CardTitle>Transactions</CardTitle></CardHeader><CardContent>
            {!transactions.length ? <p className="text-center text-muted-foreground py-8">No transactions</p> : <div className="space-y-2">{transactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={"p-2 rounded-full " + (t.type === "credit" ? "bg-green-50" : "bg-red-50")}>{t.type === "credit" ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> : <ArrowUpRight className="h-4 w-4 text-red-600" />}</div>
                  <div><p className="text-sm font-medium">{t.description || t.reference_type || "Transaction"}</p><p className="text-xs text-muted-foreground">{formatDate(t.created_at)}</p></div>
                </div>
                <span className={"font-semibold " + (t.type === "credit" ? "text-green-600" : "text-red-600")}>{t.type === "credit" ? "+" : "-"}{formatCurrency(t.amount)}</span>
              </div>
            ))}</div>}
          </CardContent></Card>
          {withdrawals.length > 0 && <Card><CardHeader><CardTitle>Withdrawals</CardTitle></CardHeader><CardContent><div className="space-y-2">{withdrawals.map((w: any) => (
            <div key={w.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div><p className="text-sm font-medium">{w.payment_method || w.payoutGateway?.name}</p><p className="text-xs text-muted-foreground">{formatDate(w.created_at)} {w.charge > 0 ? "Fee: " + formatCurrency(w.charge) : ""}</p></div>
              <div className="text-right"><Badge variant={w.status === "approved" ? "default" : w.status === "rejected" ? "destructive" : "secondary"}>{w.status}</Badge><p className="text-sm font-semibold text-red-600 mt-1">-{formatCurrency(w.amount)}</p></div>
            </div>
          ))}</div></CardContent></Card>}
        </TabsContent>

        {/* ADD MONEY TAB */}
        <TabsContent value="add"><Card><CardHeader><CardTitle>Add Money</CardTitle></CardHeader><CardContent className="space-y-4">
          {depositMethods.length === 0 ? <p className="text-muted-foreground">No payment methods available</p> : <>
            {(() => {
              const epsMethod = depositMethods.find((g: any) => String(g.name || "").toLowerCase() === "eps");
              const hasEps = !!epsMethod;
              const effectiveGateway = hasEps ? epsMethod : depositMethods.find((g: any) => String(g.id) === addGatewayId);
              if (hasEps && addGatewayId !== String(epsMethod.id)) setAddGatewayId(String(epsMethod.id));
              return (
                <>
                  {!hasEps && (
                    <div className="space-y-3">
                      <Label>Payment Method</Label>
                      <div className="flex flex-wrap gap-2">
                        {depositMethods.map((g: any) => {
                          const logo = getStorageUrl(g.logo);
                          const isSelected = String(g.id) === addGatewayId;
                          return (
                            <button key={g.id} type="button" onClick={() => { setAddGatewayId(String(g.id)); setAddTxId(""); setPersonalStep(1); }}
                              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${isSelected ? "border-primary bg-primary/5 shadow-sm font-medium" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}>
                              {logo ? <Image src={logo} alt={g.display_name || g.name} width={24} height={24} className="object-contain h-6 w-6" /> : <CircleDot className="h-4 w-4 text-muted-foreground" />}
                              <span>{g.display_name || g.name}</span>
                              {Number(g.percent_charge) > 0 && <span className="text-xs text-muted-foreground ml-1">({g.percent_charge}%)</span>}
                              {isSelected && <CheckCircle className="h-3.5 w-3.5 text-primary ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Amount (BDT)</Label>
                    <Input type="number" placeholder="Enter amount" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} min="10" />
                    {effectiveGateway && <p className="text-xs text-muted-foreground">Min: {formatCurrency(effectiveGateway.min_amount)} - Max: {formatCurrency(effectiveGateway.max_amount)}</p>}
                  </div>

                  {Number(addAmount) > 0 && effectiveGateway && <div className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="flex justify-between text-sm"><span>Amount</span><span>{formatCurrency(Number(addAmount))}</span></div>
                    {depFee > 0 && <div className="flex justify-between text-sm"><span>Fee</span><span>{formatCurrency(depFee)}</span></div>}
                    <div className="flex justify-between text-sm font-semibold border-t pt-1"><span>Total</span><span>{formatCurrency(Number(addAmount) + depFee)}</span></div>
                  </div>}

                  {(() => {
                    const isPersonal = effectiveGateway?.drive_type === 'personal';
                    if (!isPersonal) {
                      return (
                        <Button onClick={handleAdd} disabled={!addGatewayId || !addAmount || addLoading} className="w-full">
                          {addLoading ? "Processing..." : "Add Money"}
                        </Button>
                      );
                    }
                    if (!hasEps && personalStep === 2 && effectiveGateway) {
                      return (
                        <>
                          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                            <p className="text-sm font-semibold text-primary">Send Money To:</p>
                            <div className="flex items-center gap-2 bg-background p-3 rounded-lg border">
                              <span className="text-lg font-mono font-bold flex-1">{effectiveGateway.personal_number}</span>
                              <Button variant="ghost" size="sm" onClick={copyNumber}>
                                {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            {Number(addAmount) > 0 && (
                              <div className="flex items-center gap-2 bg-background p-3 rounded-lg border">
                                <span className="text-lg font-mono font-bold flex-1">Total: {formatCurrency(Number(addAmount) + depFee)}</span>
                                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(String(Number(addAmount) + depFee)); setCopiedTotal(true); setTimeout(() => setCopiedTotal(false), 2000); }}>
                                  {copiedTotal ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                            )}
                            {effectiveGateway.instruction && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{effectiveGateway.instruction}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label>Transaction ID *</Label>
                            <Input placeholder="Enter transaction ID from your payment" value={addTxId} onChange={(e) => setAddTxId(e.target.value)} />
                            <p className="text-xs text-muted-foreground">Enter the transaction ID you received after sending money</p>
                          </div>
                          <Button onClick={handleAdd} disabled={!addAmount || addLoading || !addTxId} className="w-full">
                            {addLoading ? "Processing..." : "Add Money"}
                          </Button>
                        </>
                      );
                    }
                    return (
                      <Button onClick={() => setPersonalStep(2)} disabled={!addGatewayId || !addAmount} className="w-full">
                        Proceed <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    );
                  })()}
                </>
              );
            })()}
          </>}
        </CardContent></Card></TabsContent>

        {/* WITHDRAW TAB */}
        <TabsContent value="withdraw"><Card><CardHeader><CardTitle>Withdraw</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="p-3 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Withdrawable (Earnings Only)</p><p className="text-xl font-bold">{formatCurrency(withdrawable)}</p><p className="text-xs text-muted-foreground mt-1">Only earned money from jobs can be withdrawn. Service charge applies.</p></div>
          {withdrawalMethods.length === 0 ? <p className="text-muted-foreground">No withdrawal methods available</p> : <><div className="space-y-2"><Label>Method</Label><Select value={withdrawGatewayId} onValueChange={(v) => { setWithdrawGatewayId(v); setWithdrawInputs({}); }}><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger><SelectContent>{withdrawalMethods.map((g: any) => <SelectItem key={g.id} value={String(g.id)}>{g.name}{Number(g.percent_charge) > 0 ? " (" + g.percent_charge + "%)" : ""}{Number(g.fixed_charge) > 0 ? " +" + formatCurrency(g.fixed_charge) : ""}</SelectItem>)}</SelectContent></Select></div>
          {selWG && <>
            <div className="space-y-2"><Label>Amount</Label><Input type="number" placeholder="Enter amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} min={selWG.min_amount} max={selWG.max_amount} /><p className="text-xs text-muted-foreground">Min: {formatCurrency(selWG.min_amount)} - Max: {formatCurrency(selWG.max_amount)}</p></div>
            {withdrawInputs && Array.isArray(selWG.user_input) && selWG.user_input.map((f: any, idx: number) => <div key={f.key || idx} className="space-y-2"><Label>{f.label}{f.required ? " *" : ""}</Label><Input placeholder={f.label} value={withdrawInputs[f.key] || ""} onChange={(e) => setWithdrawInputs({ ...withdrawInputs, [f.key]: e.target.value })} /></div>)}
            {Number(withdrawAmount) > 0 && <div className="p-3 bg-muted rounded-lg space-y-1">
              <div className="flex justify-between text-sm"><span>Amount</span><span>{formatCurrency(Number(withdrawAmount))}</span></div>
              {wdFee > 0 && <div className="flex justify-between text-sm text-red-600"><span>Service Charge</span><span>-{formatCurrency(wdFee)}</span></div>}
              <div className="flex justify-between text-sm font-semibold border-t pt-1"><span>You Receive</span><span>{formatCurrency(wdNet)}</span></div>
            </div>}
          </>}
          <Button onClick={handleWithdraw} disabled={!withdrawGatewayId || !withdrawAmount || withdrawLoading || Number(withdrawAmount) > withdrawable} className="w-full">{withdrawLoading ? "Processing..." : "Request Withdrawal"}</Button>
          </>}
        </CardContent></Card></TabsContent>

        {/* ESCROW TAB */}
        <TabsContent value="escrow"><Card><CardHeader><CardTitle>Escrow</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="p-3 bg-muted rounded-lg"><p className="text-sm font-medium">How Escrow Works</p><p className="text-xs text-muted-foreground mt-1">When employer approves your remote job, the amount is locked in escrow. After you complete work and employer releases payment, funds go to your wallet minus a platform service charge.</p></div>
          {locked > 0 && <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20"><div className="flex items-center gap-2 mb-2"><Clock className="h-5 w-5 text-yellow-600" /><span className="font-semibold">Active Escrow</span></div><p className="text-sm text-muted-foreground">{formatCurrency(locked)} locked in active projects.</p></div>}
          {escrows.length === 0 ? (
            <div className="text-center py-8"><Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" /><p className="text-muted-foreground">No escrow transactions yet</p></div>
          ) : <div className="space-y-2">{escrows.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={"p-2 rounded-full " + (e.status === 'released' ? "bg-green-50" : e.status === 'refunded' ? "bg-blue-50" : "bg-yellow-50")}>
                  {e.status === 'released' ? <CheckCircle className="h-4 w-4 text-green-600" /> : e.status === 'refunded' ? <ArrowDownLeft className="h-4 w-4 text-blue-600" /> : <Clock className="h-4 w-4 text-yellow-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{e.job?.title || "Project"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.created_at)} — <Badge variant={e.status === 'disputed' ? 'destructive' : e.status === 'released' ? 'default' : 'secondary'} className="text-xs">{e.status}</Badge></p>
                </div>
              </div>
              <span className="font-semibold text-yellow-600">{formatCurrency(e.amount)}</span>
            </div>
          ))}</div>}
        </CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div>}>
      <WalletPageInner />
    </Suspense>
  );
}
