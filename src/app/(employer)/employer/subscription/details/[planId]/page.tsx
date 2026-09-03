"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { subscriptionService } from "@/services/subscription.service";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Check,
  X,
  ArrowLeft,
  CreditCard,
  Zap,
  Wallet,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Plus,
  Crown,
  PartyPopper,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Plan, Subscription } from "@/types";

export default function PlanDetailsPage() {
  const params = useParams();
  const planId = params.planId as string;
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [depositMethods, setDepositMethods] = useState<any[]>([]);

  // Purchase modal states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<"confirm" | "add-money">("confirm");
  const [purchasing, setPurchasing] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  // Thank you modal state
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    loadData();
  }, [planId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, subData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getMySubscriptionWithQuotas(),
      ]);
      const foundPlan = plansData.find((p) => p.id === Number(planId));
      if (foundPlan) {
        setPlan(foundPlan);
      } else {
        toast.error(isBn ? "প্ল্যান পাওয়া যায়নি" : "Plan not found");
        router.push("/employer/subscription");
      }
      setSubscription(subData.subscription);
    } catch {
      toast.error(isBn ? "তথ্য লোড করতে ব্যর্থ" : "Failed to load data");
    } finally {
      setLoading(false);
    }

    // Load wallet balance
    setWalletLoading(true);
    try {
      const walletRes = await api.get("/employer/wallet");
      const d = walletRes.data;
      setWalletBalance(Number(d.wallet?.balance || d.balance || 0));
      setDepositMethods(d.deposit_methods || []);
    } catch {
      setWalletBalance(0);
    } finally {
      setWalletLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!plan) return;
    setPurchasing(true);
    try {
      await subscriptionService.subscribe(plan.id);
      setShowPurchaseModal(false);
      setShowThankYou(true);
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (isBn ? "ক্রয় ব্যর্থ হয়েছে" : "Purchase failed"));
    } finally {
      setPurchasing(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedGateway || !depositAmount) return;
    setDepositLoading(true);
    try {
      const res = await api.post("/employer/deposit", {
        gateway_id: Number(selectedGateway),
        amount: Number(depositAmount),
      });
      if (res.data.redirect_url) {
        window.location.href = res.data.redirect_url;
        return;
      }
      toast.success(isBn ? "ডিপোজিট সফল হয়েছে" : "Deposit submitted successfully");
      setPurchaseStep("confirm");
      try {
        const walletRes = await api.get("/employer/wallet");
        const d = walletRes.data;
        setWalletBalance(Number(d.wallet?.balance || d.balance || 0));
      } catch {
        // ignore
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Deposit failed");
    } finally {
      setDepositLoading(false);
    }
  };

  const hasSufficientBalance = plan && walletBalance !== null
    ? walletBalance >= plan.price
    : false;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employer/subscription">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{plan.name}</h1>
          <p className="text-muted-foreground mt-1">
            {isBn ? "প্ল্যানের বিস্তারিত বৈশিষ্ট্য" : "Detailed plan features"}
          </p>
        </div>
      </div>

      {/* Plan Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {plan.is_popular && (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                  <Zap className="h-3 w-3 mr-1" />
                  {isBn ? "জনপ্রিয়" : "Popular"}
                </Badge>
              )}
              <span>{plan.name}</span>
            </div>
            {subscription?.plan?.id === plan.id && plan.price > 0 && (
              <Badge variant="success" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                <Crown className="h-3 w-3 mr-1" />
                {isBn ? "প্রিমিয়াম" : "Premium"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight">
              {plan.currency || "৳"}{plan.price}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              /{plan.billing_cycle}
            </span>
          </div>

          <Separator />

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {isBn ? "বৈশিষ্ট্যসমূহ" : "Features"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.features?.map((feature, i) => {
                const val = plan.features_mapped?.[feature.id as string] ?? feature.value;
                const isFalse = val === false || val === "false" || val === 0 || val === "0";
                const isAvailable = !isFalse && val != null;
                const isUnlimited = Number(val) >= 9999;
                const isBoolean = val === true || val === "true" || val === "false";

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isAvailable
                        ? "bg-green-50 dark:bg-green-950/20"
                        : "bg-muted/50 opacity-60"
                    }`}
                  >
                    {isAvailable ? (
                      <Check className="h-5 w-5 text-green-600 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isAvailable ? "text-foreground" : "text-muted-foreground"}`}>
                        {feature.name}
                      </p>
                      {!isBoolean && isAvailable && (
                        <p className="text-xs text-primary font-semibold">
                          {isUnlimited
                            ? isBn ? "অসীমিত" : "Unlimited"
                            : String(val)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Wallet Balance */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">
                {isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
              </span>
            </div>
            {walletLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="text-lg font-bold">{formatCurrency(walletBalance || 0)}</span>
            )}
          </div>

          {/* Purchase Button */}
          {subscription?.plan?.id === plan.id ? (
            <Button className="w-full" disabled>
              <CheckCircle className="h-4 w-4 mr-2" />
              {isBn ? "বর্তমান প্ল্যান" : "Current Plan"}
            </Button>
          ) : (
            <Button className="w-full" onClick={() => setShowPurchaseModal(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              {isBn ? "এখনই কিনুন" : "Purchase Now"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={(v) => !v && setShowPurchaseModal(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isBn ? "প্ল্যান কিনুন" : "Purchase Plan"}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? `প্ল্যানটি কিনতে আপনার ওয়ালেট থেকে পেমেন্ট করুন`
                : `Pay from your wallet to purchase the ${plan.name} plan`}
            </DialogDescription>
          </DialogHeader>

          {purchaseStep === "confirm" && (
            <div className="space-y-4">
              {/* Plan Info */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {plan.billing_cycle}
                  </p>
                </div>
                <p className="text-lg font-bold">{formatCurrency(plan.price)}</p>
              </div>

              <Separator />

              {/* Wallet Balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
                  </span>
                </div>
                {walletLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="font-semibold">
                    {formatCurrency(walletBalance || 0)}
                  </span>
                )}
              </div>

              {hasSufficientBalance ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {isBn
                      ? "পর্যাপ্ত ব্যালেন্স আছে"
                      : "Sufficient balance available"}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {isBn
                      ? "পর্যাপ্ত ব্যালেন্স নেই। আরো দরকার"
                      : `Insufficient balance. Need ${formatCurrency(plan.price - (walletBalance || 0))} more`}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </Button>
                {hasSufficientBalance ? (
                  <Button
                    onClick={handlePurchase}
                    disabled={purchasing || walletLoading}
                    className="flex-1"
                  >
                    {purchasing && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {isBn ? "কিনুন" : "Purchase"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setPurchaseStep("add-money")}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isBn ? "অর্থ যোগ করুন" : "Add Money"}
                  </Button>
                )}
              </div>

              {!hasSufficientBalance && (
                <Button variant="link" size="sm" className="w-full mt-1" asChild>
                  <Link href="/employer/wallet">
                    <Wallet className="h-4 w-4 mr-2" />
                    {isBn ? "ওয়ালেট পৃষ্ঠায় যান" : "Go to Wallet Page"}
                  </Link>
                </Button>
              )}
            </div>
          )}

          {purchaseStep === "add-money" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>{isBn ? "অর্থ যোগ করুন" : "Add Money to Wallet"}</span>
              </div>

              {depositMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isBn ? "কোনো পেমেন্ট মেথড পাওয়া যায়নি" : "No payment methods available"}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{isBn ? "পেমেন্ট মেথড" : "Payment Method"}</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={selectedGateway}
                      onChange={(e) => setSelectedGateway(e.target.value)}
                    >
                      <option value="">{isBn ? "মেথড নির্বাচন করুন" : "Select method"}</option>
                      {depositMethods.map((g: any) => (
                        <option key={g.id} value={g.id}>
                          {g.display_name || g.name}
                          {Number(g.percent_charge) > 0 ? ` (${g.percent_charge}% fee)` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isBn ? "পরিমাণ (BDT)" : "Amount (BDT)"}
                    </label>
                    <input
                      type="number"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder={isBn ? "পরিমাণ লিখুন" : "Enter amount"}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="10"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setPurchaseStep("confirm")}
                      className="flex-1"
                    >
                      {isBn ? "পেছনে" : "Back"}
                    </Button>
                    <Button
                      onClick={handleDeposit}
                      disabled={!selectedGateway || !depositAmount || depositLoading}
                      className="flex-1"
                    >
                      {depositLoading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {isBn ? "ডিপোজিট করুন" : "Deposit"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Thank You Modal */}
      <Dialog open={showThankYou} onOpenChange={(v) => !v && setShowThankYou(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" />
              {isBn ? "ধন্যবাদ!" : "Thank You!"}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? "আপনার সাবস্ক্রিপশন সফলভাবে সম্পন্ন হয়েছে"
                : "Your subscription has been successfully completed"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center p-6 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-700 dark:text-green-400">
                  {isBn ? "সাবস্ক্রিপশন সক্রিয়!" : "Subscription Active!"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowThankYou(false);
                  router.push("/employer/subscription");
                }}
                className="flex-1"
              >
                {isBn ? "সাবস্ক্রিপশন পৃষ্ঠায় ফিরে যান" : "Back to Subscription"}
              </Button>
              <Button
                onClick={() => {
                  setShowThankYou(false);
                  loadData();
                }}
                className="flex-1"
              >
                {isBn ? "রিফ্রেশ করুন" : "Refresh"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
