"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  FileText,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { JobApplication } from "@/types";

interface Props {
  app: JobApplication;
  isBn: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOfferSent?: () => void;
}

interface JobOption {
  id: number;
  title: string;
  is_remote_project?: boolean;
  budget?: number;
  budget_type?: string;
}

interface FeePreview {
  budget: number;
  platform_fee: number;
  platform_fee_rate: number;
  total_amount: number;
  wallet_balance: number;
  has_enough_balance: boolean;
}

const BUDGET_TYPES = [
  { value: "fixed", en: "Fixed Price", bn: "ফিক্সড" },
  { value: "hourly", en: "Hourly", bn: "আওয়ারলি" },
  { value: "daily", en: "Daily", bn: "দৈনিক" },
  { value: "monthly", en: "Monthly", bn: "মাসিক" },
];

const DELIVERABLE_OPTIONS = [
  { value: "source_code", en: "Source Code", bn: "সোর্স কোড" },
  { value: "design_files", en: "Design Files", bn: "ডিজাইন ফাইল" },
  { value: "documentation", en: "Documentation", bn: "ডকুমেন্টেশন" },
  { value: "deployment", en: "Deployment", bn: "ডেপ্লয়মেন্ট" },
  { value: "testing", en: "Testing", bn: "টেস্টিং" },
  { value: "maintenance", en: "Maintenance", bn: "মেইনটেন্যান্স" },
];

export default function CustomHireModal({ app, isBn, open, onOpenChange, onOfferSent }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [feePreview, setFeePreview] = useState<FeePreview | null>(null);

  const [jobMode, setJobMode] = useState<"existing" | "custom">("existing");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [budgetType, setBudgetType] = useState("fixed");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [ownershipClause, setOwnershipClause] = useState(true);
  const [confidentialityClause, setConfidentialityClause] = useState(true);
  const [penaltyClause, setPenaltyClause] = useState(false);
  const [additionalTerms, setAdditionalTerms] = useState("");

  useEffect(() => {
    if (open) {
      api.get("/employer/jobs").then((res) => {
        const data = res.data?.data;
        setJobs(Array.isArray(data) ? data : data?.data || []);
      }).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (budget && parseFloat(budget) > 0) {
      api.post("/employer/custom-hire/preview", {
        budget: parseFloat(budget),
        candidate_id: app.user?.id,
      }).then((res) => {
        setFeePreview(res.data?.data || null);
      }).catch(() => {});
    } else {
      setFeePreview(null);
    }
  }, [budget, app.user?.id]);

  const resetForm = useCallback(() => {
    setStep(1);
    setJobMode("existing");
    setSelectedJobId(null);
    setCustomTitle("");
    setCategoryId(null);
    setTitle("");
    setScope("");
    setDeliverables([]);
    setBudget("");
    setBudgetType("fixed");
    setDeliveryDays("");
    setOwnershipClause(true);
    setConfidentialityClause(true);
    setPenaltyClause(false);
    setAdditionalTerms("");
    setFeePreview(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange]);

  const handleNext = () => {
    if (step === 1) {
      if (jobMode === "existing" && !selectedJobId) {
        toast.error(isBn ? "চাকরি নির্বাচন করুন" : "Select a job");
        return;
      }
      if (jobMode === "custom" && !customTitle.trim()) {
        toast.error(isBn ? "চাকরির শিরোনাম দিন" : "Enter job title");
        return;
      }
      if (jobMode === "existing") {
        const job = jobs.find((j) => j.id === selectedJobId);
        if (job) {
          setTitle(job.title);
          if (job.budget) setBudget(String(job.budget));
          if (job.budget_type) setBudgetType(job.budget_type);
        }
      } else {
        setTitle(customTitle);
      }
    }
    if (step === 2) {
      if (!scope.trim()) {
        toast.error(isBn ? "প্রজেক্ট স্কোপ লিখুন" : "Enter project scope");
        return;
      }
      if (!budget || parseFloat(budget) < 100) {
        toast.error(isBn ? "সর্বনিম্ন ৳১০০ বাজেট দিন" : "Minimum budget is ৳100");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const toggleDeliverable = (val: string) => {
    setDeliverables((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        candidate_id: app.user?.id,
        job_application_id: app.id,
        title: jobMode === "existing" ? title : customTitle,
        project_scope: scope,
        budget: parseFloat(budget),
        budget_type: budgetType,
        deliverables,
        ownership_clause: ownershipClause ? "Employer retains full ownership of all deliverables." : null,
        confidentiality_clause: confidentialityClause ? "Both parties agree to maintain confidentiality of project details." : null,
        penalty_clause: penaltyClause ? "Late delivery may result in budget deduction." : null,
        additional_terms: additionalTerms || null,
      };

      if (jobMode === "existing" && selectedJobId) {
        payload.job_id = selectedJobId;
      }
      if (jobMode === "custom") {
        payload.job_title_custom = customTitle;
        payload.is_remote_project = true;
      }
      if (categoryId) {
        payload.category_id = categoryId;
      }
      if (deliveryDays) {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(deliveryDays));
        payload.delivery_date = d.toISOString().split("T")[0];
      }

      await api.post("/employer/custom-hire/send", payload);
      toast.success(isBn ? "অফার প্রেরিত হয়েছে" : "Offer sent successfully");
      onOfferSent?.();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (isBn ? "ব্যর্থ" : "Failed to send offer"));
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = isBn
    ? ["চাকরি নির্বাচন", "শর্তাবলী", "পর্যালোচনা"]
    : ["Select Job", "Terms", "Review"];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {isBn ? "কাস্টম হায়ার অফার" : "Custom Hire Offer"}
          </DialogTitle>
          <DialogDescription>
            {isBn
              ? `${app.user?.name || "Candidate"}-কে একটি কাস্টম অফার পাঠান`
              : `Send a custom offer to ${app.user?.name || "candidate"}`}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 my-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 ${s <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  s < step ? "bg-primary text-primary-foreground" : s === step ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span className="text-xs hidden sm:inline">{stepLabels[s - 1]}</span>
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Job Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={jobMode === "existing" ? "default" : "outline"}
                size="sm"
                onClick={() => setJobMode("existing")}
              >
                {isBn ? "বিদ্যমান চাকরি" : "Existing Job"}
              </Button>
              <Button
                variant={jobMode === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setJobMode("custom")}
              >
                {isBn ? "কাস্টম কাজ" : "Custom Work"}
              </Button>
            </div>

            {jobMode === "existing" ? (
              <div className="space-y-2">
                <Label>{isBn ? "চাকরি নির্বাচন করুন" : "Select Job"}</Label>
                <Select onValueChange={(v) => setSelectedJobId(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? "চাকরি খুঁজুন..." : "Search jobs..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={String(job.id)}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{isBn ? "চাকরির শিরোনাম" : "Job Title"}</Label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={isBn ? "E.g. E-commerce Website Development" : "E.g. E-commerce Website Development"}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Scope & Terms */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isBn ? "প্রজেক্ট স্কোপ" : "Project Scope"} *</Label>
              <Textarea
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder={isBn
                  ? "কী কী কাজ করতে হবে সেটা বিস্তারিত লিখুন..."
                  : "Describe what needs to be done in detail..."}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>{isBn ? "ডেলিভারেবল" : "Deliverables"}</Label>
              <div className="grid grid-cols-2 gap-2">
                {DELIVERABLE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={deliverables.includes(opt.value)}
                      onCheckedChange={() => toggleDeliverable(opt.value)}
                    />
                    {isBn ? opt.bn : opt.en}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isBn ? "বাজেট (৳)" : "Budget (৳)"} *</Label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0"
                  min={100}
                />
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "পেমেন্ট ধরন" : "Payment Type"}</Label>
                <Select value={budgetType} onValueChange={setBudgetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_TYPES.map((bt) => (
                      <SelectItem key={bt.value} value={bt.value}>
                        {isBn ? bt.bn : bt.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isBn ? "সময়সীমা (দিন)" : "Timeline (days)"}</Label>
              <Input
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder={isBn ? "E.g. 30" : "E.g. 30"}
                min={1}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{isBn ? "ক্লজ (ঐচ্ছিক)" : "Clauses (Optional)"}</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={ownershipClause} onCheckedChange={(v) => setOwnershipClause(!!v)} />
                  {isBn ? "Ownership Clause — সম্পূর্ণ ownership employer-র" : "Ownership Clause — Full ownership to employer"}
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={confidentialityClause} onCheckedChange={(v) => setConfidentialityClause(!!v)} />
                  {isBn ? "Confidentiality — NDA বাধ্যতামূলক" : "Confidentiality — NDA binding"}
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={penaltyClause} onCheckedChange={(v) => setPenaltyClause(!!v)} />
                  {isBn ? "Penalty Clause — বিলম্বে জরিমানা" : "Penalty Clause — Late delivery penalty"}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isBn ? "অতিরিক্ত শর্ত" : "Additional Terms"}</Label>
              <Textarea
                value={additionalTerms}
                onChange={(e) => setAdditionalTerms(e.target.value)}
                placeholder={isBn ? "অন্য কোনো শর্ত থাকলে লিখুন..." : "Any other terms..."}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isBn ? "চাকরি" : "Job"}</span>
                <span className="font-medium">{jobMode === "existing" ? title : customTitle}</span>
              </div>
              <Separator />
              <div>
                <span className="text-sm text-muted-foreground">{isBn ? "স্কোপ" : "Scope"}</span>
                <p className="text-sm mt-1 whitespace-pre-wrap">{scope}</p>
              </div>
              {deliverables.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">{isBn ? "ডেলিভারেবল" : "Deliverables"}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {deliverables.map((d) => (
                      <Badge key={d} variant="secondary" className="text-xs">
                        {DELIVERABLE_OPTIONS.find((o) => o.value === d)?.[isBn ? "bn" : "en"] || d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isBn ? "বাজেট" : "Budget"}</span>
                <span className="font-medium">৳{Number(budget).toLocaleString()}</span>
              </div>
              {feePreview && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {isBn ? `প্ল্যাটফর্ম ফি (${feePreview.platform_fee_rate}%)` : `Platform Fee (${feePreview.platform_fee_rate}%)`}
                    </span>
                    <span className="text-sm">৳{feePreview.platform_fee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>{isBn ? "মোট প্রেরণ" : "Total to Lock"}</span>
                    <span>৳{feePreview.total_amount.toLocaleString()}</span>
                  </div>
                </>
              )}
              {deliveryDays && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{isBn ? "সময়সীমা" : "Timeline"}</span>
                  <span className="text-sm">{deliveryDays} {isBn ? "দিন" : "days"}</span>
                </div>
              )}
            </div>

            {feePreview && !feePreview.has_enough_balance && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  {isBn ? "পর্যাপ্ত ব্যালেন্স নেই।" : "Insufficient wallet balance."}{" "}
                  {isBn ? `বর্তমান: ৳${feePreview.wallet_balance.toLocaleString()}` : `Current: ৳${feePreview.wallet_balance.toLocaleString()}`}{" "}
                  {isBn ? `প্রয়োজন: ৳${feePreview.total_amount.toLocaleString()}` : `Required: ৳${feePreview.total_amount.toLocaleString()}`}
                </div>
              </div>
            )}

            {ownershipClause && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">{isBn ? "ক্লজ:" : "Clauses:"}</p>
                <p>• {isBn ? "Ownership: সম্পূর্ণ ownership employer-র" : "Ownership: Full ownership to employer"}</p>
                {confidentialityClause && <p>• {isBn ? "Confidentiality: NDA বাধ্যতামূলক" : "Confidentiality: NDA binding"}</p>}
                {penaltyClause && <p>• {isBn ? "Penalty: বিলম্বে জরিমানা" : "Penalty: Late delivery penalty"}</p>}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={loading}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {isBn ? "আগে" : "Back"}
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>
              {isBn ? "পরবর্তী" : "Next"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || (feePreview !== null && !feePreview.has_enough_balance)}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4 mr-1" />
              )}
              {isBn ? "অফার পাঠান" : "Send Offer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
