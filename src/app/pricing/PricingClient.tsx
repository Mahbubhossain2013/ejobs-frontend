"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionService } from "@/services/subscription.service";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Briefcase, Users, CreditCard, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { PlanButtonState } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import PricingPlanCard from "@/components/pricing/PricingPlanCard";
import PricingPurchaseModal from "@/components/pricing/PricingPurchaseModal";
import type { Plan, Subscription } from "@/types";

interface FinancialSettings {
  remote_job_service_charge: number;
  regular_job_apply_fee: number;
  regular_job_apply_fee_enabled: boolean;
  exchange_rate_usd: number;
}

export default function PricingClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const isEmployer = role === "employer";

  const [activeTab, setActiveTab] = useState<"candidate" | "employer">("candidate");
  const [candidatePlans, setCandidatePlans] = useState<Plan[]>([]);
  const [employerPlans, setEmployerPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [financial, setFinancial] = useState<FinancialSettings>({
    remote_job_service_charge: 0,
    regular_job_apply_fee: 0,
    regular_job_apply_fee_enabled: false,
    exchange_rate_usd: 115,
  });

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const plans = activeTab === "candidate" ? candidatePlans : employerPlans;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [candRes, empRes] = await Promise.all([
      api.get("/subscriptions/plans?role=candidate").catch(() => ({ data: { plans: [] } })),
      api.get("/subscriptions/plans?role=employer").catch(() => ({ data: { plans: [] } })),
    ]);

    const mapPlans = (raw: any[]): Plan[] =>
      (Array.isArray(raw) ? raw : []).map((p: any) => ({
        ...p,
        price: Number(p.price ?? 0),
        features: p.features_mapped
          ? Object.entries(p.features_mapped).map(([key, value]) => ({
              id: key,
              name: key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
              value,
            }))
          : [],
      }));

    setCandidatePlans(mapPlans(candRes.data?.plans));
    setEmployerPlans(mapPlans(empRes.data?.plans));
    setLoading(false);

    if (isAuthenticated) {
      try {
        const subData = await subscriptionService.getMySubscription();
        setCurrentSubscription(subData);
      } catch {}

      try {
        const walletUrl = isEmployer ? "/employer/wallet" : "/candidate/wallet";
        const walletRes = await api.get(walletUrl);
        const b = Number(
          walletRes.data?.balance ??
            walletRes.data?.data?.balance ??
            walletRes.data?.wallet?.balance ??
            0
        );
        setWalletBalance(isNaN(b) ? 0 : b);
      } catch {}

      setActiveTab(isEmployer ? "employer" : "candidate");
    }

    try {
      const financialRes = await api.get("/settings/financial");
      const s = financialRes.data?.data || financialRes.data || {};
      setFinancial({
        remote_job_service_charge: Number(s.remote_job_service_charge ?? 0),
        regular_job_apply_fee: Number(s.regular_job_apply_fee ?? 0),
        regular_job_apply_fee_enabled: !!s.regular_job_apply_fee_enabled,
        exchange_rate_usd: Number(s.exchange_rate_usd ?? 115),
      });
    } catch {}
  };

  const handleSubscribe = (plan: Plan) => {
    if (!isAuthenticated) {
      toast.info(isBn ? "সাবস্ক্রিপশনের জন্য লগইন করুন" : "Please login to subscribe");
      router.push("/login");
      return;
    }
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  const getUpgradeCredit = (activeSub: any) => {
    if (!activeSub || !activeSub.starts_at || !activeSub.expires_at) return 0;
    const oldPrice = Number(activeSub.plan_details?.price || activeSub.plan?.price || 0);
    if (oldPrice <= 0) return 0;
    const starts = new Date(activeSub.starts_at);
    const expires = new Date(activeSub.expires_at);
    const now = new Date();
    const totalDays = Math.max(1, Math.round((expires.getTime() - starts.getTime()) / (1000 * 60 * 60 * 24)));
    let usedDays = Math.round((now.getTime() - starts.getTime()) / (1000 * 60 * 60 * 24));
    if (usedDays < 0) usedDays = 0;
    if (usedDays > totalDays) usedDays = totalDays;
    return Number(Math.max(0, oldPrice - (usedDays * (oldPrice / totalDays))).toFixed(2));
  };

  const getButtonState = (plan: Plan): PlanButtonState => {
    const isCurrentPlan = currentSubscription?.status === "active" && currentSubscription?.plan_id === plan.id;
    if (isCurrentPlan) return { label: isBn ? "বর্তমান প্ল্যান" : "Current Plan", disabled: true, variant: "outline", action: "current" };
    if (!isAuthenticated) return { label: isBn ? "এখনই শুরু করুন" : "Get Started", disabled: false, variant: plan.is_popular ? "default" : "outline", action: "subscribe" };
    if (currentSubscription?.status === "active" && currentSubscription?.plan) {
      const currentPrice = Number(currentSubscription.plan_details?.price || currentSubscription.plan.price || 0);
      if (plan.price < currentPrice) return { label: isBn ? "ডাউনগ্রেড সম্ভব নয়" : "Downgrade Restricted", disabled: true, variant: "outline", action: "downgrade" };
      if (plan.price > currentPrice) return { label: isBn ? "আপগ্রেড করুন" : "Upgrade", disabled: false, variant: "default", action: "upgrade" };
      return { label: isBn ? "বর্তমান প্ল্যান" : "Current Plan", disabled: true, variant: "outline", action: "current" };
    }
    return { label: isBn ? "এখনই শুরু করুন" : "Get Started", disabled: false, variant: plan.is_popular ? "default" : "outline", action: "subscribe" };
  };

  const currentPlanId = currentSubscription?.plan_id;
  const hasActiveSubscription = currentSubscription && currentSubscription.status === "active";

  const serviceCharges = [
    {
      label: isBn ? "চাকরি আবেদন ফি" : "Job Application Fee",
      value: financial.regular_job_apply_fee_enabled ? formatCurrency(financial.regular_job_apply_fee) : (isBn ? "বিনামূল্যে" : "Free"),
      description: isBn ? "প্রতিটি চাকরিতে আবেদনের জন্য ফি" : "Fee charged per job application",
    },
    {
      label: isBn ? "রিমোট জব সার্ভিস চার্জ" : "Remote Job Service Charge",
      value: financial.remote_job_service_charge > 0 ? `${financial.remote_job_service_charge}%` : (isBn ? "বিনামূল্যে" : "Free"),
      description: isBn ? "রিমোট চাকরি সম্পন্ন হলে সার্ভিস চার্জ" : "Service charge on completed remote jobs",
    },
    {
      label: isBn ? "USD এক্সচেঞ্জ রেট" : "USD Exchange Rate",
      value: `৳${financial.exchange_rate_usd}`,
      description: isBn ? "ডলার থেকে টাকার হার" : "Bangladeshi Taka per US Dollar",
    },
  ];

  return (
    <PublicLayout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            {isBn ? "মূল্য পরিকল্পনা" : "Pricing Plans"}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            {isBn ? "আপনার জন্য সঠিক প্ল্যান বেছে নিন" : "Choose the Right Plan"}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            {isBn ? "ব্যক্তিগত এবং কোম্পানি উভয়ের জন্য সাশ্রয়ী মূল্য" : "Affordable plans for individuals and companies"}
          </p>

          {isAuthenticated && walletBalance !== null && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}:</span>
              <span className="text-sm font-semibold">{formatCurrency(walletBalance)}</span>
            </div>
          )}

          {/* Candidate / Employer Tabs */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveTab("candidate")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "candidate"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Users className="h-4 w-4" />
              {isBn ? "প্রার্থী" : "Candidate"}
            </button>
            <button
              onClick={() => setActiveTab("employer")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "employer"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              {isBn ? "নিয়োগকর্তা" : "Employer"}
            </button>
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-8">
                  <Skeleton className="h-6 w-24 mx-auto mb-4" />
                  <Skeleton className="h-10 w-20 mx-auto mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mx-auto mb-6" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : plans.length > 0 ? (
            <div className={`grid grid-cols-1 gap-6 max-w-5xl mx-auto ${plans.length >= 3 ? "md:grid-cols-3" : plans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1 max-w-md"}`}>
              {plans.map((plan) => {
                const isCurrentPlan = hasActiveSubscription && currentPlanId === plan.id;
                const btnState = getButtonState(plan);
                return (
                  <PricingPlanCard
                    key={plan.id}
                    plan={plan}
                    isCurrentPlan={!!isCurrentPlan}
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
          ) : (
            <p className="text-muted-foreground py-8">
              {isBn ? "কোনো প্ল্যান পাওয়া যায়নি" : "No plans available"}
            </p>
          )}

          {/* Service Charges */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">
              {isBn ? "সার্ভিস চার্জ" : "Service Charges"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isBn ? "প্ল্যান ছাড়াও নিম্নোক্ত সেবাসমূহে ফি প্রযোজ্য" : "Applicable fees for services beyond subscription plans"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {serviceCharges.map((item, i) => (
                <Card key={i} className="text-left">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-2">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          {!isAuthenticated && (
            <div className="mt-12">
              <Button size="lg" onClick={() => router.push("/register")} className="gap-2">
                {isBn ? "এখনই শুরু করুন" : "Get Started Now"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <PricingPurchaseModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        plan={selectedPlan}
        isBn={isBn}
        walletBalance={walletBalance}
        walletLoading={false}
        upgradeCredit={currentSubscription ? getUpgradeCredit(currentSubscription) : 0}
        onSuccess={loadData}
      />
    </PublicLayout>
  );
}
