"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Zap,
  CheckCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { FEATURE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Plan } from "@/types";
import type { PlanButtonAction } from "@/lib/constants";

interface PricingPlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isBn: boolean;
  buttonLabel: string;
  buttonDisabled: boolean;
  buttonVariant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  buttonAction?: PlanButtonAction;
  onAction?: () => void;
  isProcessing?: boolean;
  children?: React.ReactNode;
}

function ButtonIcon({
  action,
  isProcessing,
}: {
  action: PlanButtonAction;
  isProcessing: boolean;
}) {
  if (isProcessing) return <Loader2 className="h-4 w-4 mr-2 animate-spin" />;
  switch (action) {
    case "current":
      return <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />;
    case "upgrade":
      return <ArrowUpRight className="h-4 w-4 mr-2" />;
    case "downgrade":
      return <ArrowDownRight className="h-4 w-4 mr-2 text-muted-foreground" />;
    case "login":
      return null;
    case "subscribe":
    default:
      return null;
  }
}

export default function PricingPlanCard({
  plan,
  isCurrentPlan,
  isBn,
  buttonLabel,
  buttonDisabled,
  buttonVariant = "default",
  buttonAction = "subscribe",
  onAction,
  isProcessing = false,
  children,
}: PricingPlanCardProps) {
  return (
    <Card
      className={`relative flex flex-col ${
        isCurrentPlan
          ? "border-2 border-primary bg-primary/5 shadow-md"
          : plan.is_popular
          ? "border-primary shadow-md"
          : ""
      }`}
    >
      {plan.is_popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Zap className="h-3 w-3 mr-1" /> Popular
        </Badge>
      )}

      {isCurrentPlan && (
        <Badge variant="success" className="absolute -top-3 right-4">
          <CheckCircle className="h-3 w-3 mr-1" />
          {isBn ? "আপনার প্ল্যান" : "Your Plan"}
        </Badge>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{plan.name}</span>
        </CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">
            {plan.currency || "৳"}{plan.price}
          </span>
          <span className="text-muted-foreground">/{plan.billing_cycle}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex flex-col flex-1">
        {children}

        <ul className="space-y-2.5 text-sm flex-1">
          {plan.features?.map((feature, i) => {
            const label = FEATURE_LABELS[feature.id.toString()]?.(isBn) || FEATURE_LABELS[feature.name]?.(isBn) || feature.name;
            const val = feature.value;
            const isFalse = val === false || val === "false" || val === 0 || val === "0";
            const isAvailable = !isFalse && val != null;
            const isUnlimited = Number(val) >= 9999;
            const isBoolean =
              val === true || val === "true" || val === false || val === "false";

            return (
              <li
                key={i}
                className={`flex items-center gap-2 ${
                  isAvailable
                    ? "opacity-100 text-foreground font-medium"
                    : "opacity-45 text-muted-foreground/70"
                }`}
              >
                {isAvailable ? (
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                )}
                <span className="flex-1">{label}</span>
                {!isBoolean && isAvailable && (
                  <span className="text-primary font-semibold">
                    {isUnlimited
                      ? isBn
                        ? "অসীমিত"
                        : "Unlimited"
                      : val}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {onAction && (
          <Button
            className="w-full mt-auto"
            variant={isCurrentPlan ? "outline" : buttonVariant}
            disabled={buttonDisabled || isProcessing}
            onClick={onAction}
          >
            <ButtonIcon action={buttonAction} isProcessing={isProcessing} />
            {buttonLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
