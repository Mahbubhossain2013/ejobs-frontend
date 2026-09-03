import api from "@/lib/api-client";
import type { Plan, Subscription } from "@/types";

interface PlansResponse {
  status: boolean;
  plans: Plan[];
  features: { id: number; name: string; feature_key: string; description: string; type: string }[];
  current_role: string;
}

export interface QuotaInfo {
  used: number;
  max_limit: number;
  remaining: number;
}

export interface MySubscriptionResult {
  subscription: Subscription | null;
  quotas: Record<string, QuotaInfo>;
}

export const subscriptionService = {
  getPlans: async () => {
    const res = await api.get<PlansResponse>("/subscriptions/plans");
    const rawPlans = res.data.plans ?? [];

    // Map each plan: convert features_mapped dict into features array matching Plan type
    return rawPlans.map((plan: any) => ({
      ...plan,
      features: plan.features_mapped
        ? Object.entries(plan.features_mapped).map(([key, value]) => ({
            id: key,
            name: key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            value: value,
          }))
        : [],
    })) as Plan[];
  },

  getMySubscription: async () => {
    const res = await api.get("/subscriptions/my-subscription");
    return res.data.subscription ?? res.data.active_subscription ?? null;
  },

  getMySubscriptionWithQuotas: async (): Promise<MySubscriptionResult> => {
    const res = await api.get("/subscriptions/my-subscription");
    return {
      subscription: res.data.subscription ?? res.data.active_subscription ?? null,
      quotas: res.data.quotas ?? {},
    };
  },

  subscribe: async (planId: number) => {
    const res = await api.post("/subscriptions/subscribe", {
      plan_id: planId,
    });
    return res.data;
  },

  cancel: async () => {
    const res = await api.post("/subscriptions/cancel");
    return res.data;
  },
};
