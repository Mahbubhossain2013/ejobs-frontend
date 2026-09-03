"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EpsCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      const merchantTransactionId = searchParams.get("merchantTransactionId");

      if (!merchantTransactionId) {
        toast.error("Invalid payment callback. Missing transaction ID.");
        router.push("/dashboard/wallet?payment=error");
        return;
      }

      try {
        const res = await api.post("/payment/eps/callback", {
          merchantTransactionId,
        });

        if (res.data.status && res.data.payment === "success") {
          toast.success(res.data.message || "Payment successful! Wallet credited.");
          const redirectUrl = res.data.redirect_url || "/dashboard/wallet?payment=success";
          router.push(redirectUrl);
        } else {
          toast.error(res.data.message || "Payment failed. Please try again.");
          const redirectUrl = res.data.redirect_url || "/dashboard/wallet?payment=failed";
          router.push(redirectUrl);
        }
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Payment processing error.");
        const redirectUrl = e.response?.data?.redirect_url || "/dashboard/wallet?payment=error";
        router.push(redirectUrl);
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, router]);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Processing your payment...</p>
            <p className="text-sm text-muted-foreground">Please wait while we verify your transaction.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-lg font-medium">Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  );
}
