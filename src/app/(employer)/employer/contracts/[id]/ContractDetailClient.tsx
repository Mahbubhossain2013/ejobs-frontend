"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { useRouter, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  User,
  Loader2,
  Send,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface ContractData {
  id: number;
  title: string;
  job_title_custom?: string;
  project_scope?: string;
  budget: number;
  platform_fee: number;
  total_amount: number;
  status: string;
  offer_status: string;
  delivery_date?: string;
  deliverables?: string[];
  budget_type?: string;
  ownership_clause?: string;
  confidentiality_clause?: string;
  penalty_clause?: string;
  additional_terms?: string;
  created_at: string;
  offer_sent_at?: string;
  offer_expires_at?: string;
  employer_signed_at?: string;
  candidate_signed_at?: string;
  rejection_reason?: string;
  candidate?: { id: number; name: string; email: string };
  employer?: { id: number; name: string; email: string };
  job?: { id: number; title: string };
  escrow?: { amount: number; status: string; platform_fee: number };
}

const STATUS_CONFIG: Record<string, { en: string; bn: string; color: string }> = {
  draft: { en: "Draft", bn: "খসড়া", color: "bg-gray-100 text-gray-800" },
  pending_candidate: { en: "Pending Candidate", bn: "ক্যান্ডিডেট অপেক্ষমাণ", color: "bg-yellow-100 text-yellow-800" },
  candidate_accepted: { en: "Accepted", bn: "গৃহীত", color: "bg-blue-100 text-blue-800" },
  candidate_rejected: { en: "Rejected", bn: "প্রত্যাখ্যাত", color: "bg-red-100 text-red-800" },
  employer_signed: { en: "Employer Signed", bn: "এম্প্লয়ার সাইন", color: "bg-purple-100 text-purple-800" },
  candidate_signed: { en: "Candidate Signed", bn: "ক্যান্ডিডেট সাইন", color: "bg-indigo-100 text-indigo-800" },
  active: { en: "Active", bn: "সক্রিয়", color: "bg-green-100 text-green-800" },
  completed: { en: "Completed", bn: "সম্পন্ন", color: "bg-emerald-100 text-emerald-800" },
  terminated: { en: "Terminated", bn: "বিচ্ছিন্ন", color: "bg-red-100 text-red-800" },
  disputed: { en: "Disputed", bn: "বিরোধ", color: "bg-orange-100 text-orange-800" },
};

export default function ContractDetailClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const params = useParams();
  const contractId = params?.id;

  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);

  useEffect(() => {
    if (contractId) fetchContract();
  }, [contractId]);

  const fetchContract = () => {
    setLoading(true);
    api.get(`/employer/contracts/${contractId}`)
      .then((res) => setContract(res.data?.data))
      .catch(() => {
        toast.error(isBn ? "লোড করতে ব্যর্থ" : "Failed to load");
        router.push("/employer/contracts");
      })
      .finally(() => setLoading(false));
  };

  const handleRequestOtp = async () => {
    try {
      await api.post(`/employer/custom-hire/${contractId}/request-otp`);
      setOtpSent(true);
      toast.success(isBn ? "OTP প্রেরিত হয়েছে" : "OTP sent to your email");
    } catch {
      toast.error(isBn ? "OTP পাঠাতে ব্যর্থ" : "Failed to send OTP");
    }
  };

  const handleSign = async () => {
    if (!otp.trim()) {
      toast.error(isBn ? "OTP দিন" : "Enter OTP");
      return;
    }
    setSigning(true);
    try {
      const res = await api.post(`/employer/custom-hire/${contractId}/sign`, { otp });
      toast.success(isBn ? "সফলভাবে সাইন হয়েছে" : "Signed successfully");
      setContract(res.data?.data);
      setShowSignDialog(false);
      setOtp("");
      setOtpSent(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (isBn ? "সাইন ব্যর্থ" : "Sign failed"));
    } finally {
      setSigning(false);
    }
  };

  const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (!contract) return null;

  const statusCfg = getStatusConfig(contract.offer_status);
  const canSign = ["pending_candidate", "candidate_accepted", "pending_employer", "employer_signed"].includes(contract.offer_status);
  const employerSigned = !!contract.employer_signed_at;
  const candidateSigned = !!contract.candidate_signed_at;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/employer/contracts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{contract.title}</h1>
          <p className="text-muted-foreground text-sm">
            {isBn ? "চুক্তির বিস্তারিত" : "Contract Details"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{isBn ? "প্রজেক্ট বিবরণ" : "Project Details"}</h2>
                <Badge className={`${statusCfg.color}`}>
                  {statusCfg[isBn ? "bn" : "en"]}
                </Badge>
              </div>

              <Separator />

              {contract.project_scope && (
                <div>
                  <Label className="text-muted-foreground text-xs">{isBn ? "স্কোপ" : "Scope"}</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{contract.project_scope}</p>
                </div>
              )}

              {contract.deliverables && contract.deliverables.length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs">{isBn ? "ডেলিভারেবল" : "Deliverables"}</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contract.deliverables.map((d) => (
                      <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clauses */}
          {(contract.ownership_clause || contract.confidentiality_clause || contract.penalty_clause || contract.additional_terms) && (
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold">{isBn ? "শর্তাবলী" : "Terms & Clauses"}</h3>
                <Separator />
                {contract.ownership_clause && (
                  <div>
                    <Label className="text-muted-foreground text-xs">{isBn ? "Ownership" : "Ownership"}</Label>
                    <p className="text-sm mt-1">{contract.ownership_clause}</p>
                  </div>
                )}
                {contract.confidentiality_clause && (
                  <div>
                    <Label className="text-muted-foreground text-xs">{isBn ? "Confidentiality" : "Confidentiality"}</Label>
                    <p className="text-sm mt-1">{contract.confidentiality_clause}</p>
                  </div>
                )}
                {contract.penalty_clause && (
                  <div>
                    <Label className="text-muted-foreground text-xs">{isBn ? "Penalty" : "Penalty"}</Label>
                    <p className="text-sm mt-1">{contract.penalty_clause}</p>
                  </div>
                )}
                {contract.additional_terms && (
                  <div>
                    <Label className="text-muted-foreground text-xs">{isBn ? "অতিরিক্ত শর্ত" : "Additional Terms"}</Label>
                    <p className="text-sm mt-1">{contract.additional_terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rejection Reason */}
          {contract.rejection_reason && (
            <Card className="border-red-200">
              <CardContent className="p-5">
                <h3 className="font-semibold text-red-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {isBn ? "প্রত্যাখ্যানের কারণ" : "Rejection Reason"}
                </h3>
                <p className="text-sm mt-2">{contract.rejection_reason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Financial */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {isBn ? "আর্থিক বিবরণ" : "Financial Details"}
              </h3>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? "বাজেট" : "Budget"}</span>
                  <span>৳{contract.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? "প্ল্যাটফর্ম ফি" : "Platform Fee"}</span>
                  <span>৳{contract.platform_fee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>{isBn ? "মোট" : "Total"}</span>
                  <span>৳{contract.total_amount.toLocaleString()}</span>
                </div>
              </div>
              {contract.escrow && (
                <div className="mt-2 p-2 rounded bg-muted text-xs">
                  <p className="font-medium">{isBn ? "Escrow" : "Escrow"}: {contract.escrow.status}</p>
                  <p>৳{contract.escrow.amount.toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                {isBn ? "পক্ষ" : "Parties"}
              </h3>
              <Separator />
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">{isBn ? "এম্প্লয়ার" : "Employer"}</span>
                  <p className="font-medium">{contract.employer?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {employerSigned ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {isBn ? "সাইন করেছেন" : "Signed"} ({new Date(contract.employer_signed_at!).toLocaleDateString()})
                      </span>
                    ) : (
                      <span className="text-yellow-600">{isBn ? "সাইন অপেক্ষমাণ" : "Awaiting signature"}</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">{isBn ? "ক্যান্ডিডেট" : "Candidate"}</span>
                  <p className="font-medium">{contract.candidate?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {candidateSigned ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {isBn ? "সাইন করেছেন" : "Signed"} ({new Date(contract.candidate_signed_at!).toLocaleDateString()})
                      </span>
                    ) : (
                      <span className="text-yellow-600">{isBn ? "সাইন অপেক্ষমাণ" : "Awaiting signature"}</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {isBn ? "সময়রেখা" : "Timeline"}
              </h3>
              <Separator />
              <div className="space-y-2 text-sm">
                {contract.offer_sent_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBn ? "প্রেরিত" : "Sent"}</span>
                    <span>{new Date(contract.offer_sent_at).toLocaleDateString()}</span>
                  </div>
                )}
                {contract.offer_expires_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBn ? "মেয়াদ" : "Expires"}</span>
                    <span>{new Date(contract.offer_expires_at).toLocaleDateString()}</span>
                  </div>
                )}
                {contract.delivery_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBn ? "ডেলিভারি" : "Delivery"}</span>
                    <span>{new Date(contract.delivery_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sign Button */}
          {canSign && !employerSigned && (
            <Button className="w-full" onClick={() => setShowSignDialog(true)}>
              <Shield className="h-4 w-4 mr-2" />
              {isBn ? "সাইন করুন" : "Sign Contract"}
            </Button>
          )}
        </div>
      </div>

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {isBn ? "ডিজিটাল সিগনেচার" : "Digital Signature"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isBn
                ? "সাইন করতে আপনার ইমেইলে OTP প্রেরিত হবে।"
                : "An OTP will be sent to your email to sign."}
            </p>
            {!otpSent ? (
              <Button onClick={handleRequestOtp} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {isBn ? "OTP পাঠান" : "Send OTP"}
              </Button>
            ) : (
              <div className="space-y-2">
                <Label>{isBn ? "OTP" : "OTP Code"}</Label>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  maxLength={6}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSignDialog(false); setOtp(""); setOtpSent(false); }}>
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            {otpSent && (
              <Button onClick={handleSign} disabled={signing || !otp.trim()}>
                {signing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {isBn ? "সাইন করুন" : "Sign"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
