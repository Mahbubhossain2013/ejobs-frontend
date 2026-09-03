"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Edit3, Pause, Play, Trash2, Copy, Check,
  MapPin, Briefcase, Users, Clock, DollarSign, Globe,
  FileText, Award, Car, Languages, Link2, Mail, Phone,
  Building2, Calendar, Target, BookOpen, Heart, User,
} from "lucide-react";

export default function EmployerJobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = isBn ? `চাকরি বিবরণ | ${siteName}` : `Job Details | ${siteName}`;
  }, [isBn, siteName]);

  useEffect(() => {
    api.get(`/jobs/${jobId}`)
      .then((res) => setJob(res.data.data))
      .catch(() => toast.error(isBn ? "চাকরি লোড ব্যর্থ" : "Failed to load job"))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      await api.post(`/employer/jobs/${jobId}/toggle-status`);
      setJob((j: any) => ({ ...j, is_active: !j.is_active }));
      toast.success(job.is_active ? (isBn ? "নিষ্ক্রিয় করা হয়েছে" : "Deactivated") : (isBn ? "সক্রিয় করা হয়েছে" : "Activated"));
    } catch { toast.error(isBn ? "স্ট্যাটাস আপডেট ব্যর্থ" : "Failed to update status"); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(isBn ? "আপনি কি এই চাকরিটি মুছে ফেলতে চান?" : "Delete this job?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/employer/jobs/${jobId}`);
      toast.success(isBn ? "মুছে ফেলা হয়েছে" : "Job deleted");
      router.push("/employer/manage-jobs");
    } catch { toast.error(isBn ? "মুছে ফেলা যায়নি" : "Failed to delete"); }
    setActionLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/jobs/${jobId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!job) return (
    <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
      {isBn ? "চাকরি পাওয়া যায়নি" : "Job not found"}
    </div>
  );

  const statusColor = job.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  const statusLabel = job.is_active ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "নিষ্ক্রিয়" : "Inactive");

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild><Link href="/employer/manage-jobs"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold truncate">{job.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusColor}>{statusLabel}</Badge>
            {job.is_remote_project && <Badge variant="secondary" className="gap-1"><Globe className="h-3 w-3" />Remote</Badge>}
            <span className="text-xs text-muted-foreground">{job.job_type?.replace(/_/g, " ")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild><Link href={`/employer/manage-jobs/${jobId}/edit`}><Edit3 className="h-4 w-4 mr-1" />{isBn ? "সম্পাদনা" : "Edit"}</Link></Button>
          <Button variant="outline" size="icon" onClick={copyLink} title={isBn ? "লিংক কপি" : "Copy link"}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><MapPin className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-xs text-muted-foreground">{isBn ? "অবস্থান" : "Location"}</p><p className="font-medium text-sm">{job.location || "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><Briefcase className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">{isBn ? "চাকরির ধরন" : "Job Type"}</p><p className="font-medium text-sm capitalize">{job.job_type?.replace(/_/g, " ") || "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg"><Users className="h-5 w-5 text-amber-600" /></div>
          <div><p className="text-xs text-muted-foreground">{isBn ? "খালি পদ" : "Vacancies"}</p><p className="font-medium text-sm">{job.vacancies || 1}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><DollarSign className="h-5 w-5 text-purple-600" /></div>
          <div><p className="text-xs text-muted-foreground">{isBn ? "বেতন" : "Salary"}</p><p className="font-medium text-sm">{job.salary_range || (job.salary_min ? `৳${Number(job.salary_min).toLocaleString()}${job.salary_max ? ` - ৳${Number(job.salary_max).toLocaleString()}` : "+"}` : "Negotiable")}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg"><Clock className="h-5 w-5 text-rose-600" /></div>
          <div><p className="text-xs text-muted-foreground">{isBn ? "শেষ তারিখ" : "Deadline"}</p><p className="font-medium text-sm">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg"><Target className="h-5 w-5 text-cyan-600" /></div>
          <div><p className="text-xs text-muted-foreground">{isBn ? "অভিজ্ঞতা" : "Experience"}</p><p className="font-medium text-sm">{job.experience_level || "—"}</p></div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {job.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><FileText className="h-5 w-5" />{isBn ? "বিবরণ" : "Description"}</h2>
                <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-line">{job.description}</div>
              </CardContent>
            </Card>
          )}
          {job.job_summary && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5" />{isBn ? "সারাংশ" : "Summary"}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{job.job_summary}</p>
              </CardContent>
            </Card>
          )}
          {job.responsibilities && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Briefcase className="h-5 w-5" />{isBn ? "দায়িত্ব" : "Responsibilities"}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{job.responsibilities}</p>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {job.education_requirements && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Award className="h-4 w-4" />{isBn ? "শিক্ষা" : "Education"}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{job.education_requirements}</p>
                </CardContent>
              </Card>
            )}
            {job.experience_requirements && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Target className="h-4 w-4" />{isBn ? "অভিজ্ঞতা প্রয়োজন" : "Experience Required"}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{job.experience_requirements}</p>
                </CardContent>
              </Card>
            )}
            {job.benefits && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Heart className="h-4 w-4" />{isBn ? "সুবিধা" : "Benefits"}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{job.benefits}</p>
                </CardContent>
              </Card>
            )}
            {job.additional_requirements && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4" />{isBn ? "অতিরিক্ত প্রয়োজনীয়তা" : "Additional Requirements"}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{job.additional_requirements}</p>
                </CardContent>
              </Card>
            )}
          </div>
          {job.required_skills && Array.isArray(job.required_skills) && job.required_skills.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Award className="h-5 w-5" />{isBn ? "প্রয়োজনীয় দক্ষতা" : "Required Skills"}</h2>
                <div className="flex flex-wrap gap-2">{job.required_skills.map((s: string, i: number) => <Badge key={i} variant="secondary">{s}</Badge>)}</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">{isBn ? "চাকরি তথ্য" : "Job Info"}</h3>
              {[
                { icon: Building2, label: isBn ? "বিভাগ" : "Department", value: job.category?.name },
                { icon: Globe, label: isBn ? "ওয়ার্কপ্লেস" : "Workplace", value: job.workplace_type?.replace(/_/g, " ") },
                { icon: DollarSign, label: isBn ? "বেতন ধরন" : "Salary Type", value: job.salary_type },
                { icon: Calendar, label: isBn ? "প্রকাশিত" : "Posted", value: job.created_at ? new Date(job.created_at).toLocaleDateString() : null },
                { icon: Clock, label: isBn ? "সময়মণ্ডল" : "Timezone", value: job.timezone },
                { icon: Users, label: isBn ? "আবেদন" : "Applications", value: job.applications_count ?? 0 },
              ].map(({ icon: Icon, label, value }) => value ? (
                <div key={label} className="flex items-start gap-2 text-sm">
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div><span className="text-muted-foreground text-xs">{label}</span><p className="font-medium">{value}</p></div>
                </div>
              ) : null)}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">{isBn ? "যোগাযোগ" : "Contact"}</h3>
              {[
                { icon: User, label: isBn ? "যোগাযোগ ব্যক্তি" : "Contact Person", value: job.contact_person_name },
                { icon: Mail, label: "Email", value: job.contact_email },
                { icon: Phone, label: isBn ? "ফোন" : "Phone", value: job.contact_phone },
                { icon: Link2, label: isBn ? "আবেদন পদ্ধতি" : "Apply Via", value: job.application_method?.replace(/_/g, " ") },
                { icon: Globe, label: isBn ? "ওয়েবসাইট" : "Website", value: job.application_url },
              ].map(({ icon: Icon, label, value }) => value ? (
                <div key={label} className="flex items-start gap-2 text-sm">
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div><span className="text-muted-foreground text-xs">{label}</span><p className="font-medium break-all">{value}</p></div>
                </div>
              ) : null)}
            </CardContent>
          </Card>

          {job.min_age || job.max_age || job.gender_preference || job.language_skills || job.driving_license_required ? (
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">{isBn ? "প্রার্থী প্রয়োজনীয়তা" : "Candidate Requirements"}</h3>
                {job.min_age && <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" /><span>{isBn ? "বয়স" : "Age"}: {job.min_age}{job.max_age ? ` - ${job.max_age}` : "+"}</span></div>}
                {job.gender_preference && <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" /><span>{isBn ? "লিঙ্গ" : "Gender"}: {job.gender_preference}</span></div>}
                {job.language_skills && Array.isArray(job.language_skills) && job.language_skills.length > 0 && (
                  <div className="flex items-start gap-2 text-sm"><Languages className="h-4 w-4 text-muted-foreground mt-0.5" /><div><span className="text-xs text-muted-foreground">{isBn ? "ভাষা" : "Languages"}</span><div className="flex flex-wrap gap-1 mt-1">{job.language_skills.map((l: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{l}</Badge>)}</div></div></div>
                )}
                {job.driving_license_required && <div className="flex items-center gap-2 text-sm"><Car className="h-4 w-4 text-muted-foreground" /><span>{isBn ? "ড্রাইভিং লাইসেন্স প্রয়োজন" : "Driving license required"}</span></div>}
                {job.required_certifications && Array.isArray(job.required_certifications) && job.required_certifications.length > 0 && (
                  <div><span className="text-xs text-muted-foreground">{isBn ? "প্রয়োজনীয় সার্টিফিকেট" : "Certifications"}</span><div className="flex flex-wrap gap-1 mt-1">{job.required_certifications.map((c: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)}</div></div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">{isBn ? "অ্যাকশন" : "Actions"}</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild className="justify-start"><Link href={`/employer/manage-jobs/${jobId}/edit`}><Edit3 className="h-4 w-4 mr-2" />{isBn ? "সম্পাদনা করুন" : "Edit Job"}</Link></Button>
                <Button variant="outline" size="sm" onClick={handleToggleStatus} disabled={actionLoading} className="justify-start">
                  {job.is_active ? <><Pause className="h-4 w-4 mr-2" />{isBn ? "নিষ্ক্রিয় করুন" : "Deactivate"}</> : <><Play className="h-4 w-4 mr-2" />{isBn ? "সক্রিয় করুন" : "Activate"}</>}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={actionLoading} className="justify-start"><Trash2 className="h-4 w-4 mr-2" />{isBn ? "মুছে ফেলুন" : "Delete"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function useParams() {
  const [params, setParams] = React.useState<{ id: string }>({ id: "" });
  React.useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/employer\/manage-jobs\/([^/]+)/);
    if (match) setParams({ id: match[1] });
  }, []);
  return params;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className || ""}`} />;
}
