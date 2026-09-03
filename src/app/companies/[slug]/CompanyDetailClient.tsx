"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { companiesService } from "@/services/companies.service";
import api from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { trackBehavior, useScrollDepthTracking, useClickPatternTracking, useSessionEngagementTracking } from "@/hooks/use-behavior-tracker";
import {
  Building2, ArrowLeft, Users, Calendar, Briefcase, Star, Eye, MapPin,
  Link2, AtSign, Hash, Send, Rss, Globe, CheckCircle2, ThumbsUp,
  ShieldCheck, Camera, Megaphone, Newspaper, Award, MessageSquare,
  Flame, ArrowRight, Target, BookOpen,
} from "lucide-react";
import type { Company, CompanyReview } from "@/types";
import CompanyProfileHeader from "@/components/company/CompanyProfileHeader";
import CompanyProfileSidebar from "@/components/company/CompanyProfileSidebar";

function formatJobType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── Empty state helper ─── */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <Building2 className="h-8 w-8 mb-2 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

/* ─── Left sidebar nav items (same as employer overview) ─── */
const sidebarNavItems = [
  { key: "overview", label: "Overview", icon: Eye },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "about", label: "About Us", icon: Building2 },
  { key: "people", label: "People", icon: Users },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "benefits", label: "Benefits", icon: ShieldCheck },
  { key: "photos", label: "Photos", icon: Camera },
  { key: "videos", label: "Videos", icon: Megaphone },
  { key: "updates", label: "News & Updates", icon: Newspaper },
  { key: "culture", label: "Work Culture", icon: Flame },
  { key: "awards", label: "Awards", icon: Award },
  { key: "contact", label: "Contact Us", icon: MessageSquare },
];

interface Brochure { id: number; title: string; file_url: string; }
interface Props { slug: string; }

export default function CompanyDetailClient({ slug }: Props) {
  const { isAuthenticated, user } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [activeTab, setActiveTab] = useState("overview");
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [brochures, setBrochures] = useState<Brochure[]>([]);

  useScrollDepthTracking();
  useClickPatternTracking();
  useSessionEngagementTracking();

  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [reviewMeta, setReviewMeta] = useState({ average_rating: 0, total_reviews: 0 });
  const [ratingBreakdown, setRatingBreakdown] = useState<{ stars: number; count: number; percent: number }[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAnonymous, setReviewAnonymous] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({ work_culture: 0, salary: 0, management: 0, growth: 0, work_life_balance: 0 });

  const loadReviews = async (companyId: number) => {
    setReviewsLoading(true);
    try {
      const payload = await companiesService.getCompanyReviews(companyId);
      const rv = (payload as any)?.reviews || [];
      setReviews(rv);
      setReviewMeta({
        average_rating: Number((payload as any)?.averages?.overall || (payload as any)?.averages?.average_rating) || 0,
        total_reviews: (payload as any)?.total_reviews || 0,
      });
      if ((payload as any)?.user_has_reviewed) setUserHasReviewed(true);
      const total = rv.length;
      if (total > 0) {
        const counts = [0, 0, 0, 0, 0];
        rv.forEach((r: CompanyReview) => {
          const star = Math.round(Number(r.overall_rating || r.rating));
          if (star >= 1 && star <= 5) counts[star - 1]++;
        });
        setRatingBreakdown(
          [5, 4, 3, 2, 1].map((stars) => ({
            stars,
            count: counts[stars - 1],
            percent: Math.round((counts[stars - 1] / total) * 100),
          }))
        );
      }
    } catch { /* ignore */ } finally { setReviewsLoading(false); }
  };

  useEffect(() => {
    companiesService.getCompanyBySlug(slug)
      .then((res) => {
        const data = res as unknown as Company;
        setCompany(data);
        if (data.followers_count != null) setFollowersCount(data.followers_count);
        trackBehavior("company_visit", { targetId: data.id, metaData: { name: data.name, slug } });
        companiesService.getCompanyBrochures(data.id).then((r) => setBrochures(r.data || [])).catch(() => {});
        loadReviews(data.id);
      })
      .catch(() => toast.error("Failed to load company details"))
      .finally(() => setLoading(false));
  }, [slug]);

  // Check follow status when authenticated (both candidates and employers can follow)
  useEffect(() => {
    if (!company || !isAuthenticated || !user) return;
    api.get(`/candidate/companies/${company.id}/followers/check`)
      .then((res: any) => setFollowing(res.data?.data?.is_following ?? res.data?.is_following ?? false))
      .catch(() => {});
  }, [company, isAuthenticated, user]);

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error(isBn ? "লগইন করুন" : "Please login first"); return; }
    if (!company) return;
    try {
      await companiesService.toggleFollow(company.id);
      setFollowing(!following);
      setFollowersCount((p) => (following ? Math.max(0, p - 1) : p + 1));
      toast.success(following ? "Unfollowed" : "Following");
    } catch { toast.error("Failed"); }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) { toast.error(isBn ? "লগইন করুন" : "Please login first"); return; }
    if (!company || reviewRating === 0) { toast.error("Please select a rating"); return; }
    if (!reviewComment.trim()) { toast.error("Please write a comment"); return; }
    setReviewSubmitting(true);
    try {
      await companiesService.submitReview(company.id, {
        rating: reviewRating, comment: reviewComment, is_anonymous: reviewAnonymous,
        rating_work_culture: categoryRatings.work_culture || undefined,
        rating_salary: categoryRatings.salary || undefined,
        rating_management: categoryRatings.management || undefined,
        rating_growth: categoryRatings.growth || undefined,
        rating_work_life_balance: categoryRatings.work_life_balance || undefined,
      });
      toast.success("Review submitted");
      setReviewRating(0); setReviewComment(""); setReviewAnonymous(false);
      setUserHasReviewed(true);
      setCategoryRatings({ work_culture: 0, salary: 0, management: 0, growth: 0, work_life_balance: 0 });
      loadReviews(company.id);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit review";
      toast.error(msg);
      if (err?.response?.data?.message?.includes("already")) setUserHasReviewed(true);
    } finally { setReviewSubmitting(false); }
  };

  const socialLinks = company ? [
    company.facebook && { icon: AtSign, href: company.facebook, label: "Facebook" },
    company.linkedin && { icon: Link2, href: company.linkedin, label: "LinkedIn" },
    company.youtube_channel && { icon: Send, href: company.youtube_channel, label: "YouTube" },
    company.instagram_profile && { icon: Hash, href: company.instagram_profile, label: "Instagram" },
    company.website && { icon: Rss, href: company.website.startsWith("http") ? company.website : `https://${company.website}`, label: "Website" },
  ].filter(Boolean) as { icon: any; href: string; label: string }[] : [];

  if (loading) {
    return (
      <PublicLayout>
        <div className="px-6 sm:px-8 lg:px-12 py-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}</div>
            <div className="lg:col-span-6 space-y-6"><Skeleton className="h-64 rounded-lg" /><Skeleton className="h-48 rounded-lg" /></div>
            <div className="lg:col-span-3 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}</div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!company) {
    return (
      <PublicLayout>
        <div className="px-6 sm:px-8 lg:px-12 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">{isBn ? "কোম্পানি পাওয়া যায়নি" : "Company not found"}</h2>
          <Button asChild><Link href="/companies"><ArrowLeft className="h-4 w-4 mr-2" />{isBn ? "ফিরে যান" : "Back to Companies"}</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const jobs = company.jobs || [];
  const activeJobsCount = String(company.active_jobs_count ?? company.jobs_count ?? jobs.length);
  const jobsPostedCount = String(company.jobs_count ?? 0);
  const avgReview = reviewMeta.total_reviews > 0 ? reviewMeta.average_rating.toFixed(1) : "0.0";
  const totalReviews = String(reviewMeta.total_reviews || 0);
  const whyJoinUs = (() => { const wju = company.why_join_us; if (Array.isArray(wju)) return wju; if (wju && typeof wju === "object" && "benefits" in wju) return (wju as { benefits?: string[] }).benefits || []; return []; })();
  const topSkills = company.top_skills || [];
  const highlights = company.highlights || [];
  const location = [company.location].filter(Boolean).join(", ");

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: company.name, url: company.website, logo: company.logo, description: company.description, address: { "@type": "PostalAddress", addressLocality: company.location }, numberOfEmployees: company.size }) }} />

      <div className="px-6 sm:px-8 lg:px-12 space-y-6">
        {/* ══════════════════════════════════════════════════════════════════════
            COMPANY HEADER (Facebook-style cover — same as employer overview)
           ══════════════════════════════════════════════════════════════════════ */}
        <CompanyProfileHeader
          company={{
            ...company,
            cover_photo: company.cover_photo || company.cover_image,
            size: company.size,
          }}
          mode="public"
          following={following}
          followersCount={followersCount}
          activeJobsCount={Number(activeJobsCount)}
          avgReview={avgReview}
          totalReviews={totalReviews}
          socialLinks={socialLinks}
          onFollow={handleFollow}
          isAuthenticated={isAuthenticated}
          isBn={isBn}
        />

        {/* ══════════════════════════════════════════════════════════════════════
            STATS BAR (same 7-stat layout as employer overview)
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { icon: Calendar, label: "Founded", value: company.founded_year || "N/A" },
            { icon: Users, label: "Employees", value: company.size || "N/A" },
            { icon: Briefcase, label: "Jobs Posted", value: jobsPostedCount },
            { icon: Briefcase, label: "Active Jobs", value: activeJobsCount },
            { icon: Eye, label: "Followers", value: String(followersCount) },
            { icon: Star, label: "Avg. Review", value: `${avgReview} (${totalReviews})` },
          ].map((s) => (
            <Card key={s.label} className="text-center p-3 hover:shadow-sm transition-shadow">
              <s.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-bold mt-0.5">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            3-COLUMN LAYOUT (same as employer overview: 3 | 6 | 3)
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ──────────────────────────────────────────────────────────────────
              LEFT SIDEBAR (Navigation + Shared Company Sidebar)
             ────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Vertical Navigation */}
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-0.5">
                  {sidebarNavItems.map((item) => {
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                        {item.key === "jobs" && activeJobsCount !== "0" && (
                          <Badge variant={isActive ? "secondary" : "outline"} className="ml-auto text-[10px] h-5">
                            {activeJobsCount}
                          </Badge>
                        )}
                        {item.key === "reviews" && totalReviews !== "0" && (
                          <Badge variant={isActive ? "secondary" : "outline"} className="ml-auto text-[10px] h-5">
                            {totalReviews}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Shared Company Sidebar */}
            <CompanyProfileSidebar
              company={company}
              whyJoinUs={whyJoinUs}
              brochures={brochures}
              topSkills={topSkills}
              socialLinks={socialLinks}
              highlights={highlights}
              location={location}
            />
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              MAIN CONTENT (Tabbed)
             ────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-6">

            {/* ══ OVERVIEW TAB ══ */}
            {activeTab === "overview" && (
              <>
                {/* About Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold">About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company.description ? (
                      <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed italic">No company description available.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Mission / Vision / Values */}
                {(company.mission || company.vision || company.values) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {company.mission && (
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center">
                              <Target className="h-4 w-4 text-blue-600" />
                            </div>
                            <h4 className="font-bold text-sm">Our Mission</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{company.mission}</p>
                        </CardContent>
                      </Card>
                    )}
                    {company.vision && (
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center">
                              <Eye className="h-4 w-4 text-purple-600" />
                            </div>
                            <h4 className="font-bold text-sm">Our Vision</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{company.vision}</p>
                        </CardContent>
                      </Card>
                    )}
                    {company.values && (
                      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-emerald-600" />
                            </div>
                            <h4 className="font-bold text-sm">Our Values</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{company.values}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Open Jobs */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold">Open Jobs ({activeJobsCount})</h2>
                    <Button variant="link" size="sm" className="text-xs" asChild>
                      <Link href={`/jobs?company=${slug}`}>View All Jobs <ArrowRight className="h-3 w-3 ml-1" /></Link>
                    </Button>
                  </div>
                  {jobs.length > 0 ? (
                    <div className="space-y-2">
                      {jobs.slice(0, 5).map((job: any) => (
                        <Card key={job.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Link href={`/jobs/${job.id}`} className="font-semibold text-sm hover:text-primary transition-colors">{job.title}</Link>
                                  <Badge variant="outline" className="text-[10px]">{formatJobType(job.job_type || "full_time")}</Badge>
                                </div>
                                {job.location && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />{job.location}
                                  </div>
                                )}
                              </div>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/jobs/${job.id}`}>View</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="No active jobs posted yet" />
                  )}
                </div>

                {/* Employee Reviews / Testimonials */}
                <div>
                  <h2 className="text-lg font-bold mb-3">What Our Employees Say</h2>
                  {reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.slice(0, 3).map((t) => (
                        <Card key={t.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                {(t.user?.name || "A")[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{t.user?.name || "Anonymous"}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {t.is_current_employee ? "Current Employee" : "Former Employee"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`h-3 w-3 ${s <= Math.floor(Number(t.overall_rating || t.rating)) ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400/30 text-yellow-400/30"}`} />
                              ))}
                              <span className="text-xs font-medium ml-1">{Number(t.overall_rating || t.rating).toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {t.pros || t.cons || t.comment || "No comment"}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="No reviews yet" />
                  )}
                </div>
              </>
            )}

            {/* ══ JOBS TAB ══ */}
            {activeTab === "jobs" && (
              <div>
                <h2 className="text-lg font-bold mb-3">All Jobs ({activeJobsCount})</h2>
                {jobs.length > 0 ? (
                  <div className="space-y-2">
                    {jobs.map((job: any) => (
                      <Card key={job.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/jobs/${job.id}`} className="font-semibold text-sm hover:text-primary transition-colors">{job.title}</Link>
                                <Badge variant="outline" className="text-[10px]">{formatJobType(job.job_type || "full_time")}</Badge>
                              </div>
                              {job.location && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />{job.location}
                                </div>
                              )}
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/jobs/${job.id}`}>View</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="No active jobs posted yet" />
                )}
              </div>
            )}

            {/* ══ ABOUT TAB ══ */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold">About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company.description ? (
                      <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed italic">No company description available.</p>
                    )}
                  </CardContent>
                </Card>

                {(company.mission || company.vision || company.values) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {company.mission && (
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center">
                              <Target className="h-4 w-4 text-blue-600" />
                            </div>
                            <h4 className="font-bold text-sm">Our Mission</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{company.mission}</p>
                        </CardContent>
                      </Card>
                    )}
                    {company.vision && (
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center">
                              <Eye className="h-4 w-4 text-purple-600" />
                            </div>
                            <h4 className="font-bold text-sm">Our Vision</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{company.vision}</p>
                        </CardContent>
                      </Card>
                    )}
                    {company.values && (
                      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-emerald-600" />
                            </div>
                            <h4 className="font-bold text-sm">Our Values</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{company.values}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {company.services_products && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold">Services & Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{company.services_products}</p>
                    </CardContent>
                  </Card>
                )}

                {company.working_culture && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold">Working Culture</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{company.working_culture}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ══ PEOPLE TAB ══ */}
            {activeTab === "people" && (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-bold">Our People</h3>
                <p className="text-sm text-muted-foreground mt-1">Meet the talented team behind {company.name}</p>
              </div>
            )}

            {/* ══ REVIEWS TAB ══ */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold">Company Reviews</h2>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold">{avgReview}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-5 w-5 ${s <= Math.round(Number(avgReview)) ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400/30 text-yellow-400/30"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
                </div>
                {ratingBreakdown.length > 0 && (
                  <div className="space-y-2 max-w-md">
                    {ratingBreakdown.map((r) => (
                      <div key={r.stars} className="flex items-center gap-2 text-sm">
                        <span className="w-3 text-right">{r.stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${r.percent}%` }} />
                        </div>
                        <span className="w-10 text-right text-muted-foreground">{r.percent}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review form */}
                {isAuthenticated && !userHasReviewed && (
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <h3 className="font-bold text-sm">Write a Review</h3>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setReviewRating(s)} onMouseEnter={() => setReviewHoverRating(s)} onMouseLeave={() => setReviewHoverRating(0)}>
                            <Star className={`h-6 w-6 transition-colors ${(reviewHoverRating || reviewRating) >= s ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400/30 text-yellow-400/30"}`} />
                          </button>
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">{reviewRating > 0 ? `${reviewRating}/5` : "Select rating"}</span>
                      </div>
                      <textarea
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Share your experience working here..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="anonymous" checked={reviewAnonymous} onChange={(e) => setReviewAnonymous(e.target.checked)} className="rounded" />
                        <label htmlFor="anonymous" className="text-sm text-muted-foreground">Post anonymously</label>
                      </div>
                      <Button size="sm" onClick={handleSubmitReview} disabled={reviewSubmitting || reviewRating === 0}>
                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  {reviews.length > 0 ? reviews.map((t) => (
                    <Card key={t.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {(t.user?.name || "A")[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{t.user?.name || "Anonymous"}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {t.is_current_employee ? "Current Employee" : "Former Employee"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${s <= Math.floor(Number(t.overall_rating || t.rating)) ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400/30 text-yellow-400/30"}`} />
                          ))}
                          <span className="text-xs font-medium ml-1">{Number(t.overall_rating || t.rating).toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t.pros || t.cons || t.comment || "No comment"}
                        </p>
                      </CardContent>
                    </Card>
                  )) : (
                    <EmptyState text="No reviews yet" />
                  )}
                </div>
              </div>
            )}

            {/* ══ BENEFITS TAB ══ */}
            {activeTab === "benefits" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Benefits & Perks</h2>
                {whyJoinUs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {whyJoinUs.map((item) => (
                      <Card key={item}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                          <span className="text-sm font-medium">{item}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="No benefits listed" />
                )}
              </div>
            )}

            {/* ══ PHOTOS TAB ══ */}
            {activeTab === "photos" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Company Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                      <Camera className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ VIDEOS TAB ══ */}
            {activeTab === "videos" && (
              <div className="text-center py-16">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-bold">Company Videos</h3>
                <p className="text-sm text-muted-foreground mt-1">No videos available yet.</p>
              </div>
            )}

            {/* ══ UPDATES TAB ══ */}
            {activeTab === "updates" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">News & Updates</h2>
                <EmptyState text="No recent updates" />
              </div>
            )}

            {/* ══ CULTURE TAB ══ */}
            {activeTab === "culture" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold">Work Culture</h2>
                {company.working_culture ? (
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">{company.working_culture}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <EmptyState text="No work culture description added yet" />
                )}
              </div>
            )}

            {/* ══ AWARDS TAB ══ */}
            {activeTab === "awards" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Awards & Recognition</h2>
                <EmptyState text="No awards added yet" />
              </div>
            )}

            {/* ══ CONTACT TAB ══ */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold">Contact Us</h2>
                <Card>
                  <CardContent className="p-5 space-y-4">
                    {company.name && (
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{company.name}</span>
                      </div>
                    )}
                    {company.head_office_address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{company.head_office_address}{company.address_postal_code ? `, ${company.address_postal_code}` : ""}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          {company.website}
                        </a>
                      </div>
                    )}
                    {socialLinks.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {socialLinks.map((sl, i) => (
                          <a key={i} href={sl.href} target="_blank" rel="noopener noreferrer"
                            className="h-8 w-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary">
                            <sl.icon className="h-4 w-4" />
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              RIGHT SIDEBAR (Rating + Location + CTA)
             ────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Company Rating */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Company Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold">{avgReview}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgReview)) ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400/30 text-yellow-400/30"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">({totalReviews} reviews)</p>
                {ratingBreakdown.length > 0 && (
                  <div className="space-y-1.5">
                    {ratingBreakdown.map((r) => (
                      <div key={r.stars} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-right">{r.stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${r.percent}%` }} />
                        </div>
                        <span className="w-8 text-right text-muted-foreground">{r.percent}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[21/9] rounded-lg bg-muted flex items-center justify-center mb-3 overflow-hidden">
                  <MapPin className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">{company.name}</p>
                {company.head_office_address && (
                  <p className="text-xs text-muted-foreground">{company.head_office_address}</p>
                )}
                {location && (
                  <p className="text-xs text-muted-foreground">{location}</p>
                )}
              </CardContent>
            </Card>

            {/* Career CTA */}
            <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-5 text-center space-y-3">
                <h3 className="font-bold text-sm">{isBn ? "এই কোম্পানিতে ক্যারিয়ার খুঁজছেন?" : `Looking for a career at ${company.name}?`}</h3>
                <p className="text-xs text-muted-foreground">
                  {isBn ? "বর্তমান খোলা পদগুলো অনুসন্ধান করুন।" : "Explore current openings and become a part of our exciting team."}
                </p>
                <Button size="sm" className="w-full" asChild>
                  <Link href={`/jobs?company=${slug}`}>{isBn ? "সব চাকরি দেখুন" : "View All Jobs"} ({activeJobsCount})</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
