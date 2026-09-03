"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PurchaseSuccessDialog from "@/components/cv/PurchaseSuccessDialog";
import PersonalInfoModal from "@/components/cv/PersonalInfoModal";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  Wallet,
  AlertCircle,
  Plus,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CvTemplate } from "@/types";

interface TemplatePurchaseDialogProps {
  template: CvTemplate;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TemplatePurchaseDialog({
  template,
  open,
  onClose,
  onSuccess,
}: TemplatePurchaseDialogProps) {
  const router = useRouter();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  // Modal visibility states
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedResumeUuid, setPurchasedResumeUuid] = useState<string | null>(null);

  const [step, setStep] = useState<"confirm" | "add-money">("confirm");
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [depositMethods, setDepositMethods] = useState<any[]>([]);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  const price = template.price || 0;
  const hasSufficientBalance = walletBalance >= price;

  useEffect(() => {
    if (!open) {
      setStep("confirm");
      setSelectedGateway("");
      setDepositAmount("");
      return;
    }
    setWalletLoading(true);
    api
      .get("/candidate/wallet")
      .then((r) => {
        const d = r.data;
        setWalletBalance(Number(d.wallet?.balance || 0));
        setDepositMethods(d.deposit_methods || []);
      })
      .catch(() => {
        toast.error(isBn ? "ব্যালোড লোড করতে ব্যর্থ" : "Failed to load wallet balance");
      })
      .finally(() => setWalletLoading(false));
  }, [open]);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await api.post("/candidate/cv/resumes", {
        title: template.name + " " + (isBn ? "সিভি" : "CV"),
        template_slug: template.slug,
      });
      // Purchase succeeded — deduct wallet on server side, show success dialog
      setPurchasedResumeUuid(res.data?.data?.uuid || null);
      setShowSuccess(true);
      onSuccess();
    } catch (e: any) {
      toast.error(
        e.response?.data?.message ||
          (isBn ? "ক্রয় ব্যর্থ হয়েছে" : "Purchase failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessUseTemplate = () => {
    setShowSuccess(false);
    // Navigate directly to the preview page with the purchased resume
    if (purchasedResumeUuid) {
      onClose();
      router.push(`/cv/preview/${purchasedResumeUuid}`);
    } else {
      // Fallback: show personal info modal
      setShowPersonalInfo(true);
    }
  };

  const handlePersonalInfoComplete = () => {
    setShowPersonalInfo(false);
    // Navigate to the preview page after profile is saved
    if (purchasedResumeUuid) {
      onClose();
      router.push(`/cv/preview/${purchasedResumeUuid}`);
    } else {
      onClose();
    }
  };

  const handleDeposit = async () => {
    if (!selectedGateway || !depositAmount) return;
    setDepositLoading(true);
    try {
      const res = await api.post("/candidate/deposit", {
        gateway_id: Number(selectedGateway),
        amount: Number(depositAmount),
      });
      if (res.data.redirect_url) {
        window.location.href = res.data.redirect_url;
        return;
      }
      toast.success(
        isBn ? "ডিপোজিট সফল হয়েছে" : "Deposit submitted successfully"
      );
      setStep("confirm");
      setWalletLoading(true);
      api
        .get("/candidate/wallet")
        .then((r) => {
          setWalletBalance(Number(r.data.wallet?.balance || 0));
        })
        .catch(() => {
          toast.error(isBn ? "ব্যালোড রিফ্রেশ করতে ব্যর্থ" : "Failed to refresh wallet balance");
        })
        .finally(() => setWalletLoading(false));
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Deposit failed");
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isBn ? "টেমপ্লেট কিনুন" : "Purchase Template"}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? `টেমপ্লেটটি কিনতে আপনার ওয়ালেট থেকে পেমেন্ট করুন`
                : `Pay from your wallet to purchase the ${template.name} template`}
            </DialogDescription>
          </DialogHeader>

        {step === "confirm" && (
          <div className="space-y-4">
            {/* Template Info */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {template.category}
                </p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(price)}</p>
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
                <span
                  className="font-semibold"
                >
                  {formatCurrency(walletBalance)}
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
                    ? "পর্যাপ্ত ব্যালেন্স নেই। আরো দরকার"
                    : `Insufficient balance. Need ${formatCurrency(price - walletBalance)} more`}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              {hasSufficientBalance ? (
                <Button
                  onClick={handlePurchase}
                  disabled={loading || walletLoading}
                  className="flex-1"
                >
                  {loading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isBn ? "কিনুন" : "Purchase"}
                </Button>
              ) : (
                <Button
                  onClick={() => setStep("add-money")}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isBn ? "অর্থ যোগ করুন" : "Add Money"}
                </Button>
              )}
            </div>

            {!hasSufficientBalance && (
              <Button variant="link" size="sm" className="w-full mt-1" asChild>
                <Link href="/dashboard/wallet">
                  <Wallet className="h-4 w-4 mr-2" />
                  {isBn
                    ? "ওয়ালেট পৃষ্ঠায় যান"
                    : "Go to Wallet Page"}
                </Link>
              </Button>
            )}
          </div>
        )}

        {step === "add-money" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>
                {isBn ? "অর্থ যোগ করুন" : "Add Money to Wallet"}
              </span>
            </div>

            {depositMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isBn
                  ? "কোনো পেমেন্ট মেথড পাওয়া যায়নি"
                  : "No payment methods available"}
              </p>
            ) : (
              <div className="space-y-4">
                  <Label>{isBn ? "পেমেন্ট মেথড" : "Payment Method"}</Label>
                  <Select
                    value={selectedGateway}
                    onValueChange={setSelectedGateway}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={isBn ? "মেথড নির্বাচন করুন" : "Select method"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {depositMethods.map((g: any) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.display_name || g.name}
                          {Number(g.percent_charge) > 0
                            ? ` (${g.percent_charge}% fee)`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                <div className="space-y-2">
                  <Label>
                    {isBn ? "পরিমাণ (BDT)" : "Amount (BDT)"}
                  </Label>
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
                    onClick={() => setStep("confirm")}
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

    {/* Purchase Success Dialog */}
    <PurchaseSuccessDialog
      open={showSuccess}
      templateName={template.name}
      onClose={() => {
        setShowSuccess(false);
        onClose();
      }}
      onUseTemplate={handleSuccessUseTemplate}
    />

    {/* Personal Info Modal (shown after purchase if profile incomplete) */}
    <PersonalInfoModal
      open={showPersonalInfo}
      onClose={() => {
        setShowPersonalInfo(false);
        onClose();
      }}
      onComplete={handlePersonalInfoComplete}
    />
    </>
  );
}