"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import {
  subscriptionService,
  type QuotaInfo,
} from "@/services/subscription.service";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Crown,
  CreditCard,
  Clock,
  Calendar,
  AlertTriangle,
  Package,
  Wallet,
  Loader2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import PricingPlanCard from "@/components/pricing/PricingPlanCard";
import PricingPurchaseModal from "@/components/pricing/PricingPurchaseModal";
import { QUOTA_FEATURE_LABELS } from "@/lib/constants";
import type { Plan, Subscription } from "@/types";

export default function SubscriptionPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const { user } = useAuth();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [quotas, setQuotas] = useState<Record<string, QuotaInfo>>({});
  const [loading, setLoading] = useState(true);

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, result] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getMySubscriptionWithQuotas(),
      ]);
      setPlans(p ?? []);
      setSubscription(result.subscription ?? null);
      setQuotas(result.quotas ?? {});
    } catch {
      toast.error(
        isBn
          ? "সাবস্ক্রিপশন ডাটা লোড করতে ব্যর্থ হয়েছে"
          : "Failed to load subscription data"
      );
    } finally {
      setLoading(false);
    }

    setWalletLoading(true);
    try {
      const walletRes = await api.get("/candidate/wallet");
      const d = walletRes.data;
      setWalletBalance(Number(d.wallet?.balance || d.balance || 0));
    } catch {
      setWalletBalance(0);
    } finally {
      setWalletLoading(false);
    }
  };

  const expiryDate = subscription?.expires_at || subscription?.end_date;
  const daysRemaining = expiryDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const currentPlanIndex = useMemo(() => {
    if (!subscription?.plan_id) return -1;
    return plans.findIndex((p) => p.id === subscription.plan_id);
  }, [subscription, plans]);

  const getButtonState = (plan: Plan) => {
    const planIndex = plans.findIndex((p) => p.id === plan.id);

    if (subscription?.plan_id === plan.id) {
      return {
        label: isBn ? "বর্তমান প্ল্যান" : "Current Plan",
        variant: "outline" as const,
        disabled: true,
        action: "current" as const,
      };
    }

    if (currentPlanIndex >= 0 && planIndex > currentPlanIndex) {
      return {
        label: isBn ? "আপগ্রেড করুন" : "Upgrade",
        variant: "default" as const,
        disabled: false,
        action: "upgrade" as const,
      };
    }

    if (currentPlanIndex >= 0 && planIndex < currentPlanIndex) {
      return null;
    }

    return {
      label: isBn ? "এখনই সাবস্ক্রাইব" : "Subscribe",
      variant: plan.is_popular ? ("default" as const) : ("outline" as const),
      disabled: false,
      action: "subscribe" as const,
    };
  };

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await subscriptionService.cancel();
      setShowCancelConfirm(false);
      toast.success(
        isBn
          ? "সাবস্ক্রিপশন বাতিল করা হয়েছে"
          : "Subscription cancelled successfully"
      );
      await loadData();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          (isBn
            ? "বাতিল করতে ব্যর্থ হয়েছে"
            : "Failed to cancel subscription")
      );
    } finally {
      setCancelling(false);
    }
  };

  const quotaColor = (used: number, max: number) => {
    if (max <= 0) return "text-muted-foreground";
    const pct = (used / max) * 100;
    if (pct >= 95) return "text-red-500";
    if (pct >= 80) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {isBn ? "সাবস্ক্রিপশন" : "Subscription"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBn
              ? "আপনার প্ল্যান এবং সীমাবদ্ধতা পরিচালনা করুন"
              : "Manage your plan and usage limits"}
          </p>
        </div>
        <Card className="sm:w-auto w-full">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
                </p>
                {walletLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <p className="text-lg font-bold leading-tight">
                    {formatCurrency(walletBalance || 0)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Plan Header */}
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : subscription ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {subscription.plan_name ||
                        subscription.plan?.name ||
                        "Free"}
                    </h3>
                    {subscription.plan?.price > 0 && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                        <Crown className="h-3 w-3 mr-1" />
                        {isBn ? "প্রিমিয়াম" : "Premium"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {isBn ? "বৈধ পর্যন্ত" : "Valid until"}{" "}
                    {subscription.end_date
                      ? new Date(subscription.end_date).toLocaleDateString()
                      : "-"}
                  </div>
                  {expiryDate && daysRemaining !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {isBn ? "বাকি দিন" : "Days remaining"}:
                      </span>
                      <Badge
                        variant={
                          daysRemaining <= 7
                            ? "destructive"
                            : daysRemaining <= 30
                            ? "warning"
                            : "success"
                        }
                        className="text-xs"
                      >
                        {daysRemaining} {isBn ? "দিন" : "days"}
                      </Badge>
                      {daysRemaining <= 7 && (
                        <span className="text-destructive text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {isBn ? "শীঘ্রই মেয়াদ শেষ!" : "Expiring soon!"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="capitalize">
                  {subscription.status}
                </Badge>
                {subscription.plan?.price > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    {isBn ? "বাতিল করুন" : "Cancel"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPurchaseModal(true)}
                >
                  {isBn ? "আপগ্রেড" : "Upgrade Plan"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              {isBn
                ? "আপনার কোনো সক্রিয় সাবস্ক্রিপশন নেই"
                : "You don't have an active subscription"}
            </p>
            <Button size="sm" onClick={() => setShowPurchaseModal(true)}>
              {isBn ? "প্ল্যান দেখুন" : "View Plans"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Live Usage Limits */}
      {Object.keys(quotas).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {isBn ? "ব্যবহারের সীমাবদ্ধতা" : "Usage Limits"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(quotas).map(([key, quota]) => {
              const label =
                QUOTA_FEATURE_LABELS[key]?.(isBn) ||
                key.replace(/_/g, " ");
              const pct =
                quota.max_limit > 0
                  ? Math.min((quota.used / quota.max_limit) * 100, 100)
                  : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span
                      className={quotaColor(quota.used, quota.max_limit)}
                    >
                      {quota.used} / {quota.max_limit}{" "}
                      {isBn ? "ব্যবহৃত" : "used"}
                      {quota.max_limit > 0 && (
                        <span className="text-muted-foreground ml-1">
                          ({isBn ? "বাকি" : "left"}: {quota.remaining})
                        </span>
                      )}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-8 w-16 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const btnState = getButtonState(plan);
                if (!btnState) return null;

                const isCurrentPlan = subscription?.plan_id === plan.id;

                return (
                  <PricingPlanCard
                    key={plan.id}
                    plan={plan}
                    isCurrentPlan={isCurrentPlan}
                    isBn={isBn}
                    buttonLabel={btnState.label}
                    buttonDisabled={btnState.disabled}
                    buttonVariant={btnState.variant}
                    buttonAction={btnState.action}
                    onAction={() => handleSubscribe(plan)}
                  />
                );
              })}
        </div>
      )}

      <PricingPurchaseModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        plan={selectedPlan}
        isBn={isBn}
        walletBalance={walletBalance}
        walletLoading={walletLoading}
        onSuccess={loadData}
      />

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={showCancelConfirm}
        onOpenChange={(v) => !v && setShowCancelConfirm(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isBn ? "সাবস্ক্রিপশন বাতিল করুন" : "Cancel Subscription"}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? "আপনার সাবস্ক্রিপশন বাতিল করলে আপনি বর্তমান বিলিং চক্র শেষ না হওয়া পর্যন্ত সুবিধাগুলি ব্যবহার করতে পারবেন। আপনি কি নিশ্চিত?"
                : "If you cancel, you will continue to have access to features until your current billing cycle ends. Are you sure?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {isBn
                  ? "এই সিদ্ধান্ত পুনরায় পরিবর্তন করা যাবে না। ভবিষ্যতে আবার সাবস্ক্রাইব করতে পারবেন।"
                  : "This action cannot be undone. You can resubscribe anytime in the future."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
                disabled={cancelling}
              >
                {isBn ? "না, রাখুন" : "Keep Plan"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1"
              >
                {cancelling && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isBn ? "হ্যাঁ, বাতিল করুন" : "Yes, Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
