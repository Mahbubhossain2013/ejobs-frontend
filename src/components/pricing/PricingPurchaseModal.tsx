"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionService } from "@/services/subscription.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { Plan } from "@/types";

interface PricingPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  isBn: boolean;
  walletBalance: number | null;
  walletLoading: boolean;
  upgradeCredit?: number;
  onSuccess: () => void;
}

export default function PricingPurchaseModal({
  open,
  onOpenChange,
  plan,
  isBn,
  walletBalance,
  walletLoading,
  upgradeCredit = 0,
  onSuccess,
}: PricingPurchaseModalProps) {
  const router = useRouter();
  const { role } = useAuth();
  const isEmployer = role === "employer";

  const [purchasing, setPurchasing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  if (!plan) return null;

  const totalPrice = Math.max(0, plan.price - upgradeCredit);
  const hasSufficientBalance =
    walletBalance !== null && walletBalance >= totalPrice;
  const deficit = hasSufficientBalance ? 0 : totalPrice - (walletBalance || 0);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await subscriptionService.subscribe(plan.id);
      setShowThankYou(true);
      onSuccess();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          (isBn ? "ক্রয় ব্যর্থ হয়েছে" : "Purchase failed")
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (showThankYou) {
    return (
      <Dialog
        open={true}
        onOpenChange={() => {
          setShowThankYou(false);
          onOpenChange(false);
        }}
      >
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
            <Button
              className="w-full"
              onClick={() => {
                setShowThankYou(false);
                onOpenChange(false);
              }}
            >
              {isBn ? "বন্ধ করুন" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isBn ? "প্ল্যান কিনুন" : "Purchase Plan"}
          </DialogTitle>
          <DialogDescription>
            {isBn
              ? "প্ল্যানটি কিনতে আপনার ওয়ালেট ব্যালেন্স ব্যবহার করুন"
              : "Use your wallet balance to purchase this plan"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Info */}
          <div className="flex flex-col p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{plan.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {plan.billing_cycle}
                </p>
              </div>
              <p className="font-bold">{formatCurrency(plan.price)}</p>
            </div>
            {upgradeCredit > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                <span>
                  {isBn
                    ? "পূর্ববর্তী প্ল্যান থেকে ক্রেডিট"
                    : "Credit from previous plan"}
                </span>
                <span>-{formatCurrency(upgradeCredit)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t font-bold">
              <span>{isBn ? "মোট প্রদেয়" : "Net Payable"}</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
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
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-400">
                {isBn
                  ? `পর্যাপ্ত ব্যালেন্স নেই। আরো ${formatCurrency(deficit)} দরকার`
                  : `Insufficient balance. Need ${formatCurrency(deficit)} more`}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            {hasSufficientBalance ? (
              <Button
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex-1"
              >
                {purchasing && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isBn ? "কিনুন" : "Purchase"}
              </Button>
            ) : (
              <Button
                onClick={() =>
                  router.push(
                    isEmployer ? "/employer/wallet" : "/dashboard/wallet"
                  )
                }
                className="flex-1"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isBn ? "ওয়ালেটে যান" : "Go to Wallet"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
