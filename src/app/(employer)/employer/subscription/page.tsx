"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/theme-store";
import { subscriptionService } from "@/services/subscription.service";
import type { QuotaInfo } from "@/services/subscription.service";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  CreditCard,
  Calendar,
  Clock,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Users,
  Sparkles,
  BarChart3,
  Shield,
  TrendingUp,
  Crown,
  Wallet,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import PricingPlanCard from "@/components/pricing/PricingPlanCard";
import PricingPurchaseModal from "@/components/pricing/PricingPurchaseModal";
import type { Plan, Subscription } from "@/types";

const quotaDisplayConfig: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    labelEn: string;
    labelBn: string;
  }
> = {
  job_posts: {
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    labelEn: "Job Posts",
    labelBn: "চাকরি পোস্ট",
  },
  ai_career_tools: {
    icon: Sparkles,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    labelEn: "AI Career Tools",
    labelBn: "এআই ক্যারিয়ার টুলস",
  },
  candidate_database_access: {
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    labelEn: "Candidate Database",
    labelBn: "ক্যান্ডিডেট ডাটাবেস",
  },
  job_boosts: {
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    labelEn: "Job Boosts",
    labelBn: "চাকরি বুস্ট",
  },
  promoted_listings: {
    icon: Shield,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    labelEn: "Promoted Listings",
    labelBn: "প্রমোটেড লিস্টিং",
  },
  messages_per_day: {
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    labelEn: "Messages / Day",
    labelBn: "বার্তা / দিন",
  },
  ai_cover_letters: {
    icon: Sparkles,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    labelEn: "AI Cover Letters",
    labelBn: "এআই কভার লেটার",
  },
  ai_resume_scoring: {
    icon: Sparkles,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    labelEn: "AI Resume Scoring",
    labelBn: "এআই রিজিউম স্কোরিং",
  },
  ai_job_descriptions: {
    icon: Sparkles,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    labelEn: "AI Job Descriptions",
    labelBn: "এআই চাকরি বর্ণনা",
  },
};

function getQuotaLabel(key: string, isBn: boolean): string {
  const config = quotaDisplayConfig[key];
  if (config) return isBn ? config.labelBn : config.labelEn;
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function QuotaCard({
  quotaKey,
  quota,
  isBn,
}: {
  quotaKey: string;
  quota: QuotaInfo;
  isBn: boolean;
}) {
  const config = quotaDisplayConfig[quotaKey] || {
    icon: BarChart3,
    color: "text-gray-600",
    bg: "bg-gray-50 dark:bg-gray-950",
  };
  const Icon = config.icon;
  const isUnlimited = quota.max_limit >= 9999;
  const percent = isUnlimited
    ? 0
    : Math.min(
        100,
        Math.round((quota.used / Math.max(quota.max_limit, 1)) * 100)
      );
  const isHigh = percent >= 80;
  const isLow = percent >= 50 && percent < 80;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${config.bg}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">
                {getQuotaLabel(quotaKey, isBn)}
              </p>
              <p className="text-xs text-muted-foreground">
                {isUnlimited
                  ? isBn
                    ? "অসীমিত"
                    : "Unlimited"
                  : `${quota.used} / ${quota.max_limit}`}
              </p>
            </div>
            {!isUnlimited && (
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh ? "bg-red-500" : isLow ? "bg-yellow-500" : "bg-primary"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}
            {!isUnlimited && (
              <p className="text-xs text-muted-foreground mt-1">
                {quota.remaining > 0
                  ? isBn
                    ? `${quota.remaining} বাকি`
                    : `${quota.remaining} remaining`
                  : isBn
                  ? "সীমা শেষ"
                  : "Limit reached"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmployerSubscriptionPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [quotas, setQuotas] = useState<Record<string, QuotaInfo>>({});
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, subData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getMySubscriptionWithQuotas(),
      ]);
      setPlans(p ?? []);
      setSubscription(subData.subscription);
      setQuotas(subData.quotas);
    } catch {
      toast.error(
        isBn
          ? "সাবস্ক্রিপশন তথ্য লোড করতে ব্যর্থ"
          : "Failed to load subscription data"
      );
    } finally {
      setLoading(false);
    }

    setWalletLoading(true);
    try {
      const walletRes = await api.get("/employer/wallet");
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

  const CANDIDATE_ONLY_FEATURES = [
    "Certificate Generation",
    "AI Interview Prep",
    "AI Skill Assessment",
  ];
  const planFeatures = (subscription?.plan?.features || []).filter(
    (f: any) => !CANDIDATE_ONLY_FEATURES.includes(f.name)
  );

  const handlePurchaseClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  const getButtonState = (plan: Plan) => {
    if (subscription?.plan?.id === plan.id) {
      return {
        label: isBn ? "বর্তমান প্ল্যান" : "Current Plan",
        disabled: true,
        variant: "outline" as const,
        action: "current" as const,
      };
    }
    return {
      label: isBn ? "কিনুন" : "Purchase",
      disabled: false,
      variant: plan.is_popular ? ("default" as const) : ("outline" as const),
      action: "subscribe" as const,
    };
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
              ? "আপনার প্ল্যান ও ব্যবহার ট্র্যাক করুন"
              : "Manage your employer plan and track usage"}
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

      {/* Current Plan + Expiry + Quotas */}
      {loading ? (
        <div className="space-y-4">
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Current Plan Card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {subscription?.plan?.name ||
                        subscription?.plan_name ||
                        (isBn ? "বিনামূল্যে প্ল্যান" : "Free Plan")}
                    </h3>
                    {subscription && subscription?.plan?.price > 0 && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                        <Crown className="h-3 w-3 mr-1" />
                        {isBn ? "প্রিমিয়াম" : "Premium"}
                      </Badge>
                    )}
                    <Badge
                      variant={subscription ? "success" : "secondary"}
                      className="capitalize"
                    >
                      {subscription?.status || "active"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscription
                      ? `${isBn ? "বৈধ পর্যন্ত" : "Valid until"} ${expiryDate ? new Date(expiryDate).toLocaleDateString() : "—"}`
                      : isBn
                      ? "নতুন অ্যাকাউন্টের জন্য ডিফল্ট প্ল্যান"
                      : "Default plan for new accounts"}
                  </p>
                </div>
                {subscription?.plan?.price != null && (
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                      {subscription.plan.currency || "৳"}
                      {subscription.plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /{subscription.plan.billing_cycle}
                    </span>
                  </div>
                )}
              </div>

              {expiryDate && daysRemaining !== null && (
                <>
                  <Separator className="my-4" />
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {isBn ? "মেয়াদ শেষ" : "Expires"}:
                      </span>
                      <span className="font-medium">
                        {new Date(expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
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
                      >
                        {daysRemaining} {isBn ? "দিন" : "days"}
                      </Badge>
                    </div>
                    {daysRemaining <= 7 && (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          {isBn ? "শীঘ্রই মেয়াদ শেষ!" : "Expiring soon!"}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {planFeatures.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      {isBn ? "প্ল্যানের বৈশিষ্ট্য" : "Plan Features"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {planFeatures.map((feature: any, i: number) => {
                        const val =
                          subscription?.plan?.features_mapped?.[
                            feature.id as string
                          ] ?? feature.value;
                        const isFalse =
                          val === false ||
                          val === "false" ||
                          val === 0 ||
                          val === "0";
                        const isAvailable = !isFalse && val != null;
                        const isUnlimited = Number(val) >= 9999;
                        const isBoolean =
                          val === true ||
                          val === "true" ||
                          val === "false";

                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-2 text-sm ${
                              isAvailable
                                ? "opacity-100 text-foreground font-medium"
                                : "opacity-50 text-muted-foreground/75"
                            }`}
                          >
                            {isAvailable ? (
                              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                            )}
                            <span>{feature.name}</span>
                            {!isBoolean && isAvailable && (
                              <span className="font-semibold ml-auto text-primary">
                                {isUnlimited
                                  ? isBn
                                    ? "অসীমিত"
                                    : "Unlimited"
                                  : val}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quota Usage */}
          {Object.keys(quotas).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">
                {isBn ? "ব্যবহারের হিসাব" : "Usage Quotas"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(quotas).map(([key, quota]) => (
                  <QuotaCard
                    key={key}
                    quotaKey={key}
                    quota={quota}
                    isBn={isBn}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          {isBn ? "উপলব্ধ প্ল্যান" : "Available Plans"}
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : !plans.length ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {isBn ? "কোনো প্ল্যান পাওয়া যায়নি" : "No plans available"}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const btnState = getButtonState(plan);
                const isCurrentPlan = subscription?.plan?.id === plan.id;

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
                    onAction={() => {
                      if (!isCurrentPlan) {
                        handlePurchaseClick(plan);
                      }
                    }}
                  >
                    {!isCurrentPlan && (
                      <Button
                        variant="link"
                        className="w-full mt-1 p-0 h-auto"
                        asChild
                      >
                        <Link href={`/employer/subscription/details/${plan.id}`}>
                          {isBn ? "বিস্তারিত দেখুন" : "View Details"}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </PricingPlanCard>
                );
              })}
          </div>
        )}
      </div>

      <PricingPurchaseModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        plan={selectedPlan}
        isBn={isBn}
        walletBalance={walletBalance}
        walletLoading={walletLoading}
        onSuccess={loadData}
      />
    </div>
  );
}
