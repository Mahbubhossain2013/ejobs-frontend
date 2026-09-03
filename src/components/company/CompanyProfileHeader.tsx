"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/ui/default-avatar";
import { MapPin, Globe, Briefcase, Users, Star, MessageSquare, Heart, Share2, CheckCircle2, ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";
import { getStorageUrl } from "@/lib/utils";

interface SocialLink {
  icon: any;
  href: string;
  label: string;
}

interface Props {
  company: any;
  mode: "owner" | "public";
  following?: boolean;
  followersCount?: number;
  activeJobsCount?: number;
  avgReview?: string;
  totalReviews?: string;
  socialLinks?: SocialLink[];
  onFollow?: () => void;
  isAuthenticated?: boolean;
  isBn?: boolean;
}

function limitWords(text: string, maxWords: number = 28): string {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

export default function CompanyProfileHeader({
  company,
  mode,
  following = false,
  followersCount = 0,
  activeJobsCount = 0,
  avgReview = "0",
  totalReviews = "0",
  socialLinks = [],
  onFollow,
  isAuthenticated = false,
  isBn = false,
}: Props) {
  const logo = company.logo;
  const coverRaw = company.cover_image || company.cover_photo;
  const cover = coverRaw ? getStorageUrl(coverRaw) : "";
  const location = [company.location || company.city].filter(Boolean).join(", ");

  return (
    <div className="rounded-xl overflow-hidden bg-background border">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
        {cover && (
          <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      {/* Profile Header Content (Reference 1 Layout: Logo on left, text beside logo) */}
      <div className="px-6 md:px-8 pb-6 bg-background pt-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* Logo & Company Info in horizontal layout */}
          <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
            {/* Logo — positioned in the marked location inside the card on the left */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border shadow-sm overflow-hidden bg-background shrink-0">
              <CompanyLogo src={logo} name={company.name}>
                {company.name?.substring(0, 2).toUpperCase()}
              </CompanyLogo>
            </div>

            {/* Company Info — right beside the logo, strictly on the clean background below cover */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{company.name}</h1>
                {company.is_verified && (
                  <div className="inline-flex items-center gap-1 bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isBn ? "যাচাইকৃত" : "Verified"}</span>
                  </div>
                )}
                {company.is_featured && (
                  <Badge className="text-xs bg-yellow-500 text-white">{isBn ? "বৈশিষ্ট্যযুক্ত" : "Featured"}</Badge>
                )}
              </div>

              {company.tagline && (
                <p className="text-muted-foreground text-sm font-medium">{company.tagline}</p>
              )}

              {/* Description — limited to ~28 words and 2 lines */}
              {company.description && (
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed max-w-3xl" title={company.description}>
                  {limitWords(company.description, 28)}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                {location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" />{location}</span>
                )}
                {company.industry && (
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 shrink-0" />{company.industry}</span>
                )}
                {company.size && (
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 shrink-0" />{company.size}</span>
                )}
                {Number(totalReviews) > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />{avgReview}
                  </span>
                )}
              </div>

              {/* Social links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  {socialLinks.map((sl, i) => (
                    <a
                      key={i}
                      href={sl.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary"
                      title={sl.label}
                    >
                      <sl.icon className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons — on the right, cleanly on white background */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {mode === "owner" ? (
              <>
                <Link href={`/companies/${company.slug || company.id || ""}`} target="_blank">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ExternalLink className="h-4 w-4 mr-1" />{isBn ? "পাবলিক প্রোফাইল" : "Public Profile"}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Link href="/employer/profile">
                  <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4 mr-1" />{isBn ? "সম্পাদনা" : "Edit Profile"}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {isAuthenticated && company.user_id && (
                  <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                    <Link href={`/employer/messages?to=${company.user_id}`}><MessageSquare className="h-4 w-4" /></Link>
                  </Button>
                )}
                {company.website && (
                  <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {onFollow && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={following ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"}
                    onClick={onFollow}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${following ? "fill-current" : ""}`} />
                    {following ? (isBn ? "ফলো করছেন" : "Following") : (isBn ? "ফলো" : "Follow")}
                    {followersCount > 0 && ` (${followersCount})`}
                  </Button>
                )}
                <Button size="sm">
                  {isBn ? `চাকরি দেখুন (${activeJobsCount})` : `View Jobs (${activeJobsCount})`}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}