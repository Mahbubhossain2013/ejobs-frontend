"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { toast } from "sonner";
import {
  Calendar, Clock, MapPin, Video, Phone, CheckCircle, XCircle,
  Loader2, Building2, Briefcase, ArrowRight, MessageSquare, StickyNote,
} from "lucide-react";
import { formatDate, getStorageUrl } from "@/lib/utils";

type Interview = {
  id: number;
  type: "video" | "in_person" | "phone";
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  notes: string | null;
  candidate_response: "pending" | "accepted" | "declined";
  candidate_note: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  outcome: string | null;
  job?: { id: number; title: string; company_id?: number };
  employer?: { id: number; name: string; avatar?: string };
  application?: { id: number; company?: { name?: string; logo?: string; slug?: string; user_id?: number } };
};

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string; labelBn: string }> = {
  video:    { icon: Video,   color: "text-blue-600",    label: "Video Call", labelBn: "ভিডিও কল" },
  in_person:{ icon: MapPin,  color: "text-emerald-600", label: "In Person",  labelBn: "ব্যক্তিগত" },
  phone:    { icon: Phone,   color: "text-amber-600",   label: "Phone",      labelBn: "ফোন" },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; labelBn: string }> = {
  scheduled: { color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/40",     border: "border-blue-200 dark:border-blue-800",     label: "Scheduled", labelBn: "নির্ধারিত" },
  completed: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", label: "Completed", labelBn: "সম্পন্ন" },
  cancelled: { color: "text-red-600",     bg: "bg-red-50 dark:bg-red-950/40",         border: "border-red-200 dark:border-red-800",         label: "Cancelled", labelBn: "বাতিল" },
  no_show:   { color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/40",   border: "border-orange-200 dark:border-orange-800",   label: "No Show",   labelBn: "অনুপস্থিত" },
};

const RESPONSE_CONFIG: Record<string, { color: string; label: string; labelBn: string }> = {
  pending:  { color: "text-amber-600", label: "Awaiting Response", labelBn: "অপেক্ষমান" },
  accepted: { color: "text-emerald-600", label: "Accepted",        labelBn: "গৃহীত" },
  declined: { color: "text-red-600",     label: "Declined",       labelBn: "প্রত্যাখ্যাত" },
};

export default function CandidateInterviewsPage() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

  useEffect(() => {
    document.title = isBn ? `সাক্ষাৎকার | ${siteName}` : `Interviews | ${siteName}`;
  }, [isBn, siteName]);

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseNote, setResponseNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchInterviews = () => {
    api.get("/candidate/interviews")
      .then((res) => {
        const raw = res.data.data;
        const list = Array.isArray(raw) ? raw : raw?.data && Array.isArray(raw.data) ? raw.data : [];
        setInterviews(list);
      })
      .catch(() => toast.error(isBn ? "সাক্ষাৎকার লোড করতে ব্যর্থ" : "Failed to load interviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInterviews(); }, []);

  const handleRespond = async (interviewId: number, response: "accepted" | "declined") => {
    setSubmitting(true);
    try {
      await api.post(`/candidate/interviews/${interviewId}/respond`, {
        candidate_response: response,
        candidate_note: responseNote || undefined,
      });
      toast.success(response === "accepted"
        ? (isBn ? "সাক্ষাৎকার গৃহীত হয়েছে" : "Interview accepted")
        : (isBn ? "সাক্ষাৎকার প্রত্যাখ্যাত" : "Interview declined")
      );
      setRespondingTo(null);
      setResponseNote("");
      fetchInterviews();
    } catch {
      toast.error(isBn ? "ব্যর্থ" : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const upcoming = interviews.filter((i) => new Date(i.scheduled_at) >= new Date() && i.status === "scheduled");
  const past = interviews.filter((i) => new Date(i.scheduled_at) < new Date() || i.status !== "scheduled");

  const formatScheduledDate = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString(isBn ? "bn-BD" : "en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };
  const formatScheduledTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleTimeString(isBn ? "bn-BD" : "en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const getCompanyInfo = (interview: Interview) => {
    const company = interview.application?.company;
    return {
      name: company?.name || interview.employer?.name || "",
      logo: company?.logo || interview.employer?.avatar,
      slug: company?.slug,
      userId: company?.user_id,
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">{isBn ? "সাক্ষাৎকার" : "Interviews"}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {isBn ? "আপনার আসন্ন এবং অতীত সাক্ষাৎকারসমূহ" : "Your upcoming and past interviews"}
        </p>
      </div>

      {/* Stats */}
      {interviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { key: "upcoming", count: upcoming.length, label: isBn ? "আসন্ন" : "Upcoming", color: "text-blue-600", icon: Calendar },
            { key: "accepted", count: interviews.filter((i) => i.candidate_response === "accepted").length, label: isBn ? "গৃহীত" : "Accepted", color: "text-emerald-600", icon: CheckCircle },
            { key: "pending", count: interviews.filter((i) => i.candidate_response === "pending").length, label: isBn ? "অপেক্ষমান" : "Pending", color: "text-amber-600", icon: Clock },
            { key: "past", count: past.length, label: isBn ? "অতীত" : "Past", color: "text-muted-foreground", icon: Clock },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-card border border-border">
              <div className="p-1.5 sm:p-2 rounded-lg bg-muted">
                <s.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold leading-none">{s.count}</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Interviews */}
      <div>
        <h2 className="text-sm sm:text-base font-semibold mb-2.5 sm:mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          {isBn ? "আসন্ন সাক্ষাৎকার" : "Upcoming Interviews"}
          <Badge className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs">{upcoming.length}</Badge>
        </h2>
        {upcoming.length === 0 ? (
          <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 sm:p-8 text-center">
              <Calendar className="h-10 sm:h-12 text-blue-300 mx-auto mb-3" />
              <p className="text-sm font-medium">{isBn ? "কোনো আসন্ন সাক্ষাৎকার নেই" : "No upcoming interviews"}</p>
              <p className="text-xs text-muted-foreground mt-1">{isBn ? "নতুন সাক্ষাৎকার নির্ধারিত হলে এখানে দেখাবে" : "Newly scheduled interviews will appear here"}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((interview) => {
              const typeCfg = TYPE_CONFIG[interview.type] || TYPE_CONFIG.video;
              const TypeIcon = typeCfg.icon;
              const company = getCompanyInfo(interview);
              return (
                <Card key={interview.id} className="border bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
                  <CardContent className="p-3 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Type icon */}
                      <div className={`shrink-0 p-2 sm:p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60`}>
                        <TypeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Mobile: badges above */}
                        <div className="flex items-center gap-2 sm:hidden flex-wrap">
                          <Badge className={`gap-1 text-[10px] px-1.5 py-0.5 ${STATUS_CONFIG[interview.status]?.color} bg-transparent border-current/20`} variant="outline">
                            {isBn ? STATUS_CONFIG[interview.status]?.labelBn : STATUS_CONFIG[interview.status]?.label}
                          </Badge>
                          <Badge className={`gap-1 text-[10px] px-1.5 py-0.5 ${RESPONSE_CONFIG[interview.candidate_response]?.color} bg-transparent border-current/20`} variant="outline">
                            {isBn ? RESPONSE_CONFIG[interview.candidate_response]?.labelBn : RESPONSE_CONFIG[interview.candidate_response]?.label}
                          </Badge>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base leading-snug">{interview.job?.title}</h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                              <p className="text-[11px] sm:text-sm text-muted-foreground truncate">{company.name}</p>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <Badge className={`gap-1 text-xs ${STATUS_CONFIG[interview.status]?.color} bg-transparent border-current/20`} variant="outline">
                              {isBn ? STATUS_CONFIG[interview.status]?.labelBn : STATUS_CONFIG[interview.status]?.label}
                            </Badge>
                            <Badge className={`gap-1 text-xs ${RESPONSE_CONFIG[interview.candidate_response]?.color} bg-transparent border-current/20`} variant="outline">
                              {isBn ? RESPONSE_CONFIG[interview.candidate_response]?.labelBn : RESPONSE_CONFIG[interview.candidate_response]?.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 sm:mt-3 text-[11px] sm:text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 min-w-0">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span className="truncate">{formatScheduledDate(interview.scheduled_at)}</span>
                          </span>
                          <span className="flex items-center gap-1 min-w-0">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="truncate">{formatScheduledTime(interview.scheduled_at)}</span>
                          </span>
                          <span className="flex items-center gap-1 min-w-0">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="truncate">{interview.duration_minutes} min</span>
                          </span>
                          <span className={`flex items-center gap-1 min-w-0 ${typeCfg.color}`}>
                            <TypeIcon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{isBn ? typeCfg.labelBn : typeCfg.label}</span>
                          </span>
                        </div>

                        {interview.location && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {interview.type === "video" ? (
                              <a href={interview.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{interview.location}</a>
                            ) : (
                              <span className="truncate">{interview.location}</span>
                            )}
                          </div>
                        )}

                        {interview.notes && (
                          <div className="mt-2 flex items-start gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
                            <StickyNote className="h-3 w-3 shrink-0 mt-0.5" />
                            <p className="italic">"{interview.notes}"</p>
                          </div>
                        )}

                        {/* Response section */}
                        {interview.candidate_response === "pending" && (
                          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                            {respondingTo === interview.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={responseNote}
                                  onChange={(e) => setResponseNote(e.target.value)}
                                  placeholder={isBn ? "নোট (ঐচ্ছিক)..." : "Note (optional)..."}
                                  rows={2}
                                  className="text-xs"
                                />
                                <div className="flex gap-1.5">
                                  <Button size="sm" className="h-7 gap-1 text-[11px] px-2.5" onClick={() => handleRespond(interview.id, "accepted")} disabled={submitting}>
                                    {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                    {isBn ? "গ্রহণ" : "Accept"}
                                  </Button>
                                  <Button size="sm" variant="destructive" className="h-7 gap-1 text-[11px] px-2.5" onClick={() => handleRespond(interview.id, "declined")} disabled={submitting}>
                                    {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                    {isBn ? "প্রত্যাখ্যান" : "Decline"}
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2.5" onClick={() => { setRespondingTo(null); setResponseNote(""); }}>
                                    {isBn ? "বাতিল" : "Cancel"}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button size="sm" className="h-7 sm:h-8 gap-1 text-[11px] sm:text-xs px-2.5 sm:px-3" onClick={() => setRespondingTo(interview.id)}>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  {isBn ? "গ্রহণ করুন" : "Accept"}
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 sm:h-8 gap-1 text-[11px] sm:text-xs px-2.5 sm:px-3" onClick={() => setRespondingTo(interview.id)}>
                                  <XCircle className="h-3.5 w-3.5" />
                                  {isBn ? "প্রত্যাখ্যান" : "Decline"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action links */}
                        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center sm:gap-2 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-blue-200 dark:border-blue-800">
                          {interview.job?.id && (
                            <Button asChild variant="outline" size="sm" className="h-7 sm:h-8 gap-1 text-[11px] sm:text-xs px-2 sm:px-3">
                              <Link href={`/jobs/${interview.job.id}`}>
                                <Briefcase className="h-3.5 w-3.5" />
                                {isBn ? "চাকরি" : "Job"}
                              </Link>
                            </Button>
                          )}
                          {company.slug && (
                            <Button asChild variant="outline" size="sm" className="h-7 sm:h-8 gap-1 text-[11px] sm:text-xs px-2 sm:px-3">
                              <Link href={`/companies/${company.slug}`}>
                                <Building2 className="h-3.5 w-3.5" />
                                {isBn ? "কোম্পানি" : "Company"}
                              </Link>
                            </Button>
                          )}
                          {company.userId && (
                            <Button asChild variant="outline" size="sm" className="h-7 sm:h-8 gap-1 text-[11px] sm:text-xs px-2 sm:px-3">
                              <Link href={`/dashboard/messages?employer=${company.userId}`}>
                                <MessageSquare className="h-3.5 w-3.5" />
                                {isBn ? "বার্তা" : "Message"}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Interviews */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm sm:text-base font-semibold mb-2.5 sm:mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            {isBn ? "অতীত সাক্ষাৎকার" : "Past Interviews"}
            <Badge className="bg-muted text-muted-foreground text-[10px] sm:text-xs">{past.length}</Badge>
          </h2>
          <div className="grid gap-3">
            {past.map((interview) => {
              const typeCfg = TYPE_CONFIG[interview.type] || TYPE_CONFIG.video;
              const TypeIcon = typeCfg.icon;
              const company = getCompanyInfo(interview);
              return (
                <Card key={interview.id} className="opacity-75 border">
                  <CardContent className="p-3 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="shrink-0 p-2 rounded-xl bg-muted">
                        <TypeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base leading-snug">{interview.job?.title}</h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                              <p className="text-[11px] sm:text-sm text-muted-foreground truncate">{company.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge className={`text-[10px] sm:text-xs ${STATUS_CONFIG[interview.status]?.color} bg-transparent border-current/20`} variant="outline">
                              {isBn ? STATUS_CONFIG[interview.status]?.labelBn : STATUS_CONFIG[interview.status]?.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-[11px] sm:text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 min-w-0">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span className="truncate">{formatScheduledDate(interview.scheduled_at)}</span>
                          </span>
                          <span className="flex items-center gap-1 min-w-0">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="truncate">{formatScheduledTime(interview.scheduled_at)}</span>
                          </span>
                          <span className={`flex items-center gap-1 min-w-0 ${typeCfg.color}`}>
                            <TypeIcon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{isBn ? typeCfg.labelBn : typeCfg.label}</span>
                          </span>
                          <span className="flex items-center gap-1 min-w-0">
                            <Badge className={`text-[10px] ${RESPONSE_CONFIG[interview.candidate_response]?.color} bg-transparent border-current/20 px-1 py-0`} variant="outline">
                              {isBn ? RESPONSE_CONFIG[interview.candidate_response]?.labelBn : RESPONSE_CONFIG[interview.candidate_response]?.label}
                            </Badge>
                          </span>
                        </div>

                        {interview.outcome && (
                          <p className="mt-2 text-[11px] sm:text-xs text-muted-foreground italic">"{interview.outcome}"</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
