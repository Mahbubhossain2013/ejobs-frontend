"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { companiesService } from "@/services/companies.service";
import { useEmployerCompany } from "@/hooks/use-employer-company";
import type { CompanyReview } from "@/types";
import { Calendar, Users, Briefcase, Eye, ThumbsUp, Star, MapPin, AtSign, Link2, Send, Hash, Rss, Target, BookOpen } from "lucide-react";
import CompanyProfileHeader from "@/components/company/CompanyProfileHeader";
import CompanyProfileSidebar from "@/components/company/CompanyProfileSidebar";
import OverviewTab from "@/components/company/tabs/OverviewTab";
import ReviewsTab from "@/components/company/tabs/ReviewsTab";
import { JobsTab, AboutTab, BenefitsTab, PhotosTab, VideosTab, UpdatesTab, AwardsTab, CultureTab, PeopleTab, ContactTab, FollowersTab } from "@/components/company/tabs/SimpleTab";

function formatJobType(t: string) { return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

const sidebarNavItems = [
  { key: "overview", label: "Overview", icon: Eye },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "about", label: "About Us", icon: Briefcase },
  { key: "people", label: "People", icon: Users },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "benefits", label: "Benefits", icon: Briefcase },
  { key: "photos", label: "Photos", icon: Eye },
  { key: "videos", label: "Videos", icon: Briefcase },
  { key: "updates", label: "News & Updates", icon: Briefcase },
  { key: "culture", label: "Work Culture", icon: Briefcase },
  { key: "awards", label: "Awards", icon: Briefcase },
  { key: "contact", label: "Contact Us", icon: Briefcase },
];

export default function CompanyOverviewClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [activeTab, setActiveTab] = useState("overview");
  const {
    company: companyData, loading, getDisplayField,
    brochures, awards, culturePhotos, recentUpdates, activeJobs: apiActiveJobs,
    profileViews, followersCount, reviewsCount, avgRating,
    similarCompanies: similarCompaniesData,
  } = useEmployerCompany();
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [reviewMeta, setReviewMeta] = useState({ average_rating: 0, total_reviews: 0 });
  const [ratingBreakdown, setRatingBreakdown] = useState<{ stars: number; count: number; percent: number }[]>([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAnonymous, setReviewAnonymous] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({ work_culture: 0, salary: 0, management: 0, growth: 0, work_life_balance: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!companyData?.id) return;
    setReviewsLoading(true);
    companiesService.getCompanyReviews(companyData.id).then((res) => {
      const d = res.data;
      const rv = d?.reviews || [];
      setReviews(rv);
      setReviewMeta({ average_rating: Number(d?.averages?.overall || d?.averages?.average_rating) || 0, total_reviews: d?.total_reviews || 0 });
      if (d?.user_has_reviewed) setUserHasReviewed(true);
      const total = rv.length;
      if (total > 0) {
        const counts = [0, 0, 0, 0, 0];
        rv.forEach((r: CompanyReview) => { const star = Math.round(Number(r.overall_rating || r.rating)); if (star >= 1 && star <= 5) counts[star - 1]++; });
        setRatingBreakdown([5, 4, 3, 2, 1].map((stars) => ({ stars, count: counts[stars - 1], percent: Math.round((counts[stars - 1] / total) * 100) })));
      }
    }).catch(() => {}).finally(() => setReviewsLoading(false));
  }, [companyData?.id]);

  const company = companyData
    ? {
        name: getDisplayField("name", "Your Company"), tagline: getDisplayField("tagline", ""),
        location: [getDisplayField("city"), getDisplayField("address_country")].filter(Boolean).join(", ") || getDisplayField("location"),
        website: getDisplayField("website"), email: getDisplayField("contact_email") || getDisplayField("email"),
        founded: getDisplayField("founded_year"), employees: getDisplayField("employee_count") || getDisplayField("size") || getDisplayField("company_size"),
        jobsPosted: String(companyData.jobs_count ?? 0), activeJobs: String(companyData.active_jobs_count ?? 0),
        profileViews: String(profileViews), responseRate: companyData.response_rate ? `${companyData.response_rate}%` : "0%",
        avgReview: reviewMeta.average_rating > 0 ? reviewMeta.average_rating.toFixed(1) : (avgRating > 0 ? avgRating.toFixed(1) : "0"),
        totalReviews: String(reviewMeta.total_reviews || reviewsCount), companySize: getDisplayField("size") || getDisplayField("company_size"),
        industry: getDisplayField("industry"),
        headquarters: [getDisplayField("city"), getDisplayField("address_country")].filter(Boolean).join(", ") || getDisplayField("head_office_address") || getDisplayField("location"),
        logo: companyData.logo, coverPhoto: companyData.cover_photo,
        phone: getDisplayField("contact_phone") || getDisplayField("phone"),
        facebook: getDisplayField("facebook"), linkedin: getDisplayField("linkedin"),
        youtube: getDisplayField("youtube_channel"), instagram: getDisplayField("instagram_profile"),
        description: getDisplayField("description"), mission: getDisplayField("mission"), vision: getDisplayField("vision"), values: getDisplayField("values"),
        servicesProducts: getDisplayField("services_products"), workingCulture: getDisplayField("working_culture"),
        headOfficeAddress: getDisplayField("head_office_address"), postalCode: getDisplayField("address_postal_code"),
        isVerified: companyData.is_verified, highlights: (companyData.highlights as string[]) || [],
        whyJoinUs: (() => { const wju = companyData.why_join_us; if (Array.isArray(wju)) return wju; if (wju && typeof wju === "object" && "benefits" in wju) return (wju as any).benefits || []; return []; })(),
        topSkills: (companyData.top_skills as string[]) || [],
      }
    : {
        name: "Your Company", tagline: "", location: "", website: "", email: "", founded: "", employees: "",
        jobsPosted: "0", activeJobs: "0", profileViews: "0", responseRate: "0%", avgReview: "0", totalReviews: "0",
        companySize: "", industry: "", headquarters: "", logo: null, coverPhoto: null, phone: null,
        facebook: "", linkedin: "", youtube: "", instagram: "",
        description: "", mission: "", vision: "", values: "", servicesProducts: "", workingCulture: "",
        headOfficeAddress: "", postalCode: "", isVerified: false, highlights: [], whyJoinUs: [], topSkills: [],
      };

  const socialLinks = [
    company.facebook && { icon: AtSign, href: company.facebook, label: "Facebook" },
    company.linkedin && { icon: Link2, href: company.linkedin, label: "LinkedIn" },
    company.youtube && { icon: Send, href: company.youtube, label: "YouTube" },
    company.instagram && { icon: Hash, href: company.instagram, label: "Instagram" },
    company.website && { icon: Rss, href: `https://${company.website}`, label: "Website" },
  ].filter(Boolean) as { icon: any; href: string; label: string }[];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}</div>
          <div className="lg:col-span-9 space-y-6"><Skeleton className="h-64 rounded-lg" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyProfileHeader
        company={{ ...companyData, name: company.name, tagline: company.tagline, description: company.description, logo: company.logo, cover_photo: company.coverPhoto, is_verified: company.isVerified, location: company.headquarters, industry: company.industry, size: company.companySize, website: company.website, slug: companyData?.slug }}
        mode="owner" followersCount={followersCount} activeJobsCount={Number(company.activeJobs)}
        avgReview={company.avgReview} totalReviews={company.totalReviews} socialLinks={socialLinks} isBn={isBn}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { icon: Calendar, label: "Founded", value: company.founded || "N/A" },
          { icon: Users, label: "Employees", value: company.employees || "N/A" },
          { icon: Briefcase, label: "Jobs Posted", value: company.jobsPosted },
          { icon: Briefcase, label: "Active Jobs", value: company.activeJobs },
          { icon: Eye, label: "Profile Views", value: company.profileViews },
          { icon: ThumbsUp, label: "Response Rate", value: company.responseRate },
          { icon: Star, label: "Avg. Review", value: `${company.avgReview} (${company.totalReviews})` },
        ].map((s) => (
          <Card key={s.label} className="text-center p-3 hover:shadow-sm transition-shadow">
            <s.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-sm font-bold mt-0.5">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card><CardContent className="p-2"><nav className="space-y-0.5">
            {sidebarNavItems.map((item) => (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav></CardContent></Card>
          <CompanyProfileSidebar company={{ founded_year: company.founded, size: company.companySize, industry: company.industry, website: company.website }} whyJoinUs={company.whyJoinUs} brochures={brochures} topSkills={company.topSkills} socialLinks={socialLinks} highlights={company.highlights} location={company.headquarters} />
        </div>

        <div className="lg:col-span-9 space-y-6">
          {activeTab === "overview" && <OverviewTab company={company} slug={""} activeJobs={apiActiveJobs} culturePhotos={culturePhotos} recentUpdates={recentUpdates} awards={awards} reviews={reviews} isBn={isBn} onTabChange={setActiveTab} />}
          {activeTab === "jobs" && <JobsTab jobs={apiActiveJobs} isBn={isBn} />}
          {activeTab === "about" && <AboutTab company={company} isBn={isBn} />}
          {activeTab === "people" && <PeopleTab companyName={company.name} isBn={isBn} />}
          {activeTab === "reviews" && <ReviewsTab company={company} avgReview={company.avgReview} totalReviews={company.totalReviews} ratingBreakdown={ratingBreakdown} reviews={reviews} reviewsLoading={reviewsLoading} isAuthenticated={true} userHasReviewed={userHasReviewed} reviewRating={reviewRating} reviewHoverRating={reviewHoverRating} reviewComment={reviewComment} reviewAnonymous={reviewAnonymous} reviewSubmitting={reviewSubmitting} categoryRatings={categoryRatings} onRate={setReviewRating} onHoverRate={setReviewHoverRating} onCategoryRate={(key, val) => setCategoryRatings((p) => ({ ...p, [key]: val }))} onCommentChange={setReviewComment} onAnonymousChange={setReviewAnonymous} onSubmit={() => {}} isBn={isBn} />}
          {activeTab === "benefits" && <BenefitsTab benefits={company.whyJoinUs} isBn={isBn} />}
          {activeTab === "photos" && <PhotosTab photos={culturePhotos} />}
          {activeTab === "videos" && <VideosTab videoUrl={companyData?.company_video_url} />}
          {activeTab === "updates" && <UpdatesTab updates={recentUpdates} />}
          {activeTab === "awards" && <AwardsTab awards={awards} isBn={isBn} />}
          {activeTab === "culture" && <CultureTab culture={company.workingCulture} photos={culturePhotos} isBn={isBn} />}
          {activeTab === "contact" && <ContactTab company={company} socialLinks={socialLinks} />}
          {activeTab === "followers" && <FollowersTab count={followersCount} isBn={isBn} />}
        </div>
      </div>
    </div>
  );
}