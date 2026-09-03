"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Loader2,
  Mail,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { JobApplication } from "@/types";
import { groupByJob } from "./applicants-utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicants: JobApplication[];
  statusFilter: string;
  isBn: boolean;
}

type Channel = "email" | "sms";
type Template = "interview" | "update" | "custom";

const SMS_PER_SEGMENT = 160;

function countSms(message: string): number {
  if (!message.trim()) return 0;
  return Math.max(1, Math.ceil(message.length / SMS_PER_SEGMENT));
}

export function BulkMessageDialog({ applicants, statusFilter, isBn, open, onOpenChange }: Props) {
  const { user } = useAuthStore();
  const [channel, setChannel] = useState<Channel>("email");
  const [template, setTemplate] = useState<Template>("interview");
  const [jobId, setJobId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setChannel("email");
      setTemplate("interview");
      setSubject("");
      setMessage("");
      setSmsMessage("");
      setInterviewDate("");
      setInterviewLocation("");
      setJobId("");
    }
  }, [open]);

  const jobs = useMemo(() => groupByJob(applicants), [applicants]);

  // Recipients: those matching current status filter, for the selected job.
  const recipients = useMemo(() => {
    return applicants.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (jobId && String(a.job_id) !== jobId) return false;
      return true;
    });
  }, [applicants, statusFilter, jobId]);

  const validSmsRecipients = useMemo(() => {
    return recipients.filter((a) => {
      const phone = (a.user as any)?.profile?.phone || (a.user as any)?.phone;
      const clean = String(phone || "").replace(/[^0-9]/g, "");
      return clean.length === 11 && clean.startsWith("01");
    });
  }, [recipients]);

  const smsCount = useMemo(() => countSms(smsMessage) * validSmsRecipients.length, [smsMessage, validSmsRecipients]);
  const smsCost = (smsCount ?? 0) * 1;

  useEffect(() => {
    if (channel !== "sms") return;
    api
      .get("/employer/wallet")
      .then((res) => setWalletBalance(res.data?.wallet?.balance ?? res.data?.data?.balance ?? null))
      .catch(() => setWalletBalance(null));
  }, [channel, open]);

  const insufficient = channel === "sms" && walletBalance != null && smsCost > walletBalance;

  // Auto-fill template message when template changes
  useEffect(() => {
    if (channel === "email") {
      if (template === "interview") {
        setSubject("Interview Invitation");
        setMessage(`Dear {name},

We were impressed by your application for the position of "{job_title}" at {company}.

We would like to invite you to an interview. Please confirm your availability.

Best regards,
{company} HR Team`);
      } else if (template === "update") {
        setSubject("Application Update");
        setMessage(`Dear {name},

Your application for "{job_title}" at {company} is currently marked as {status}.

Best regards,
{company}`);
      } else {
        setSubject("");
        setMessage("");
      }
    } else {
      setSmsMessage(`Dear {name}, you have been invited to an interview for "{job_title}" at {company}. Please confirm. - {company}`);
    }
  }, [template, channel]);

  const handleSend = async () => {
    if (!recipients.length || !validSmsRecipients.length && channel === "sms") {
      toast.error(isBn ? "নির্বাচিত কোনো প্রার্থী নেই" : "No matching candidates");
      return;
    }
    if (channel === "email" && !message.trim()) {
      toast.error(isBn ? "বার্তা লিখুন" : "Write a message");
      return;
    }
    if (channel === "sms" && !smsMessage.trim()) {
      toast.error(isBn ? "SMS বার্তা লিখুন" : "Write an SMS message");
      return;
    }

    setSending(true);
    try {
      const payload: any = {
        channel,
        template,
        job_id: jobId ? Number(jobId) : null,
        status: statusFilter,
        recipient_ids: channel === "sms" ? validSmsRecipients.map((a) => a.id) : recipients.map((a) => a.id),
        subject: channel === "email" ? subject : undefined,
        message: channel === "email" ? message : undefined,
        sms_message: channel === "sms" ? smsMessage : undefined,
        interview_date: template === "interview" ? interviewDate : undefined,
        interview_location: template === "interview" ? interviewLocation : undefined,
      };
      const res = await api.post("/employer/bulk-message", payload);
      toast.success(
        isBn
          ? res.data?.message || "বার্তা পাঠানো হয়েছে"
          : res.data?.message || "Messages sent"
      );
      onOpenChange(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (isBn ? "পাঠানো ব্যর্থ হয়েছে" : "Failed to send");
      toast.error(msg);
      if (err?.response?.data?.required) {
        setWalletBalance(err?.response?.data?.wallet_balance);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isBn ? "বাল্ক বার্তা পাঠান" : "Send Bulk Message"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Channel */}
          <div>
            <Label>{isBn ? "চ্যানেল" : "Channel"}</Label>
            <RadioGroup
              value={channel}
              onValueChange={(v) => setChannel(v as Channel)}
              className="flex gap-4 mt-2"
            >
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="email" />
                <Mail className="h-4 w-4" /> {isBn ? "ইমেইল" : "Email"}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="sms" />
                <MessageSquare className="h-4 w-4" /> {isBn ? "SMS" : "SMS"}
              </label>
            </RadioGroup>
          </div>

          {/* Template (email only) */}
          {channel === "email" && (
            <div>
              <Label>{isBn ? "টেমপ্লেট" : "Template"}</Label>
              <RadioGroup
                value={template}
                onValueChange={(v) => setTemplate(v as Template)}
                className="flex flex-wrap gap-3 mt-2"
              >
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="interview" /> {isBn ? "সাক্ষাৎকার" : "Interview"}
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="update" /> {isBn ? "আপডেট" : "Update"}
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="custom" /> {isBn ? "কাস্টম" : "Custom"}
                </label>
              </RadioGroup>
            </div>
          )}

          {/* Job selector */}
          <div>
            <Label>{isBn ? "চাকরি" : "Job"}</Label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              <option value="">{isBn ? "সব চাকরি" : "All jobs"}</option>
              {jobs.map((j) => (
                <option key={j.jobId} value={j.jobId}>{j.title}</option>
              ))}
            </select>
          </div>

          {/* Recipients count */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
            <p className="flex items-center gap-2">
              <Badge variant="secondary">{statusFilter === "all" ? "All" : statusFilter}</Badge>
              <span>
                {recipients.length} {isBn ? "উম্মীদ" : "recipients"}
              </span>
              {channel === "sms" && (
                <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" />
                  {validSmsRecipients.length} {isBn ? "ভ্যালিড নম্বর" : "valid numbers"}
                </span>
              )}
            </p>
            {channel === "sms" && (
              <p className="text-xs text-muted-foreground">
                {smsCount} SMS × 1 ৳ = <strong>{smsCost.toLocaleString()} ৳</strong>
                {walletBalance != null && (
                  <> · {isBn ? "ব্যালেন্স" : "Balance"}: {walletBalance} ৳</>
                )}
                {insufficient && (
                  <span className="text-red-600 ml-1">
                    {isBn ? "পর্যাপ্ত ব্যালেন্স নেই" : "Insufficient balance"}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Email fields */}
          {channel === "email" && (
            <>
              <div>
                <Label>{isBn ? "বিষয়" : "Subject"}</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{isBn ? "বার্তা" : "Message"}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  className="mt-1"
                  placeholder={isBn ? "{name}, {job_title}, {company} ব্যবহার করুন" : "Use {name}, {job_title}, {company} placeholders"}
                />
              </div>
              {template === "interview" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{isBn ? "তারিখ" : "Date"}</Label>
                    <Input value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="mt-1" placeholder="2026-08-15 10:00" />
                  </div>
                  <div>
                    <Label>{isBn ? "স্থান" : "Location"}</Label>
                    <Input value={interviewLocation} onChange={(e) => setInterviewLocation(e.target.value)} className="mt-1" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* SMS message text */}
          {channel === "sms" && (
            <div>
              <Label>{isBn ? "SMS বার্তা" : "SMS Message"}</Label>
              <Textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                className="mt-1"
                placeholder={isBn ? "প্রতি SMS 160 অক্ষর = 1 ৳" : "1 SMS segment = 160 chars = 1 ৳"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {smsMessage.length} {isBn ? "অক্ষর" : "chars"}
              </p>
            </div>
          )}

          <Button onClick={handleSend} disabled={sending || (channel === "sms" && insufficient)} className="w-full">
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {sending
              ? (isBn ? "পাঠানো হচ্ছে..." : "Sending...")
              : (isBn ? `${(channel === "sms" ? validSmsRecipients : recipients).length} জনকে পাঠান` : `Send to ${(channel === "sms" ? validSmsRecipients : recipients).length}`)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}