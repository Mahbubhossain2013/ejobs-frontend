"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { aiService } from "@/services/ai.service";
import { subscriptionService, type QuotaInfo } from "@/services/subscription.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Sparkles, Send, Loader2, CheckCircle2, X, FileText, Upload } from "lucide-react";
import type { Job } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  job: Job | null;
  isBn: boolean;
  resumeFromProfile: string | null;
  onSuccess: () => void;
}

export default function ApplyDialog({ open, onOpenChange, job, isBn, resumeFromProfile: initialResume, onSuccess }: Props) {
  const [coverLetter, setCoverLetter] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFromProfile, setResumeFromProfile] = useState(initialResume);
  const [submitting, setSubmitting] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [quotas, setQuotas] = useState<Record<string, QuotaInfo>>({});

  useEffect(() => {
    if (!open) return;
    setCoverLetter("");
    setDeliveryDays("");
    setResumeFile(null);
    setResumeFromProfile(initialResume);
    subscriptionService.getMySubscriptionWithQuotas().then((r) => setQuotas(r.quotas)).catch(() => {});
  }, [open, initialResume]);

  const aiQuota = quotas.ai_cover_letters;
  const aiLimitReached = aiQuota != null && aiQuota.max_limit > 0 && aiQuota.remaining <= 0;

  const handleGenerate = async () => {
    if (!job || aiLimitReached) return;
    setGeneratingCover(true);
    try {
      const companyName = typeof job.company === "object" && job.company ? job.company.name || "" : typeof job.company === "string" ? job.company : "";
      const res = await aiService.generateCoverLetter({ job_title: job.title, company_name: companyName });
      const text = res?.cover_letter || res?.response;
      if (text) {
        setCoverLetter(text);
        if (res?.fallback) toast.info(isBn ? "কভার লেটার টেমপ্লেট তৈরি হয়েছে (AI অনুপলব্ধ)" : "Cover letter template generated (AI unavailable)");
        else toast.success(isBn ? "কভার লেটার তৈরি হয়েছে!" : "Cover letter generated!");
      }
      else toast.error(isBn ? "তৈরি করতে ব্যর্থ" : "Failed to generate");
      subscriptionService.getMySubscriptionWithQuotas().then((r) => setQuotas(r.quotas)).catch(() => {});
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) toast.error(isBn ? "প্রিমিয়াম প্ল্যান প্রয়োজন" : "Premium plan required");
      else if (status === 429) toast.error(isBn ? "সীমা শেষ" : "Usage limit reached");
      else toast.error(isBn ? "AI সার্ভিস অনুপলব্ধ" : "AI service unavailable");
    } finally { setGeneratingCover(false); }
  };

  const handleSubmit = async () => {
    if (!job || !coverLetter.trim()) { toast.error(isBn ? "কভার লেটার লিখুন" : "Please write a cover letter"); return; }
    if (coverLetter.trim().length < 10) { toast.error(isBn ? "কভার লেটার কমপক্ষে ১০ অক্ষর হতে হবে" : "Cover letter must be at least 10 characters"); return; }
    if (!deliveryDays || Number(deliveryDays) < 1) { toast.error(isBn ? "ডেলিভারি দিন লিখুন" : "Please enter delivery days"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("cover_letter", coverLetter);
      fd.append("delivery_days", deliveryDays);
      if (resumeFile) fd.append("resume", resumeFile);
      await (await import("@/lib/api-client")).default.post(`/candidate/jobs/${job.id}/apply`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(isBn ? "সফলভাবে আবেদন করা হয়েছে!" : "Application submitted!");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || (isBn ? "ব্যর্থ" : "Failed");
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isBn ? "আবেদন জমা দিন" : "Submit Application"}</span>
            {aiQuota && aiQuota.max_limit > 0 && <Badge variant={aiLimitReached ? "destructive" : "secondary"} className="text-xs"><Sparkles className="h-3 w-3 mr-1" /> {aiQuota.remaining} {isBn ? "বাকি" : "left"}</Badge>}
          </DialogTitle>
          {job && <p className="text-sm text-muted-foreground">{job.title}{job.company && ` — ${typeof job.company === "object" ? job.company.name : job.company}`}</p>}
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>{isBn ? "কভার লেটার *" : "Cover Letter *"}</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={handleGenerate} disabled={generatingCover || !!aiLimitReached}>
                {generatingCover ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                {isBn ? "AI তৈরি করুন" : "AI Generate"}
              </Button>
            </div>
            <Textarea placeholder={isBn ? "আপনাকে কেন নিয়োগ দেওয়া উচিত..." : "Tell us why you're the right fit..."} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} />
            {aiLimitReached && <p className="text-xs text-destructive mt-1">{isBn ? "AI কোয়োটা শেষ" : "AI quota reached"} <Link href="/pricing" className="underline">{isBn ? "আপগ্রেড" : "Upgrade"}</Link></p>}
            {generatingCover && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />{isBn ? "তৈরি হচ্ছে..." : "Generating..."}</p>}
          </div>
          <div>
            <Label>{isBn ? "ডেলিভারি সময় (দিন) *" : "Delivery Days *"}</Label>
            <Input type="number" placeholder={isBn ? "কত দিনে সম্পন্ন হবে" : "Days to complete"} value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} min="1" className="mt-1" />
          </div>
          <div>
            <Label>{isBn ? "রিজিউমে" : "Resume"}</Label>
            <div className="mt-1 space-y-2">
              {resumeFromProfile && !resumeFile && (
                <div className="flex items-center justify-between p-2 border rounded-lg bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="truncate max-w-[200px]">{isBn ? "প্রোফাইল থেকে রিজিউমে" : "Resume from profile"}</span></div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setResumeFromProfile(null)}>{isBn ? "পরিবর্তন" : "Change"}</Button>
                </div>
              )}
              {resumeFile ? (
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-muted-foreground" /><span className="truncate max-w-[200px]">{resumeFile.name}</span></div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setResumeFile(null)}><X className="h-3 w-3" /></Button>
                </div>
              ) : !resumeFromProfile ? (
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{isBn ? "ফাইল নির্বাচন করুন" : "Choose a file (PDF, DOC)"}</span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setResumeFile(f); }} />
                </label>
              ) : null}
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={submitting || !coverLetter.trim()} className="w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            {submitting ? (isBn ? "জমা দিচ্ছে..." : "Submitting...") : (isBn ? "আবেদন জমা দিন" : "Submit Application")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}