"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { MapPin, Mail, Phone, ExternalLink, Shield, Zap, CheckCircle, Globe } from "lucide-react";
import { getStorageUrl } from "@/lib/utils";

interface Props {
  profile: any;
  user: any;
  isPublic: boolean;
  activeBadges: any[];
  isBn: boolean;
  onAvatarChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({ profile, user, isPublic, activeBadges, isBn, onAvatarChange }: Props) {
  const fullName = profile.full_name_en || profile.full_name || user.name || "";
  const position = profile.current_position || "";
  const city = profile.city || profile.district || "";
  const email = user?.email || profile.email || "";
  const phone = profile.phone || "";
  const avatar = profile.avatar || user?.avatar || "";
  const linkedin = profile.linkedin_url || profile.linkedin || "";
  const hasPremium = activeBadges.some((b: any) => b.badge_key === "premium");

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white">
      <div className="absolute inset-0 bg-[url('/images/company-bg.jpg')] bg-cover bg-center opacity-20" />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <DefaultAvatar
              src={avatar}
              name={fullName || user.name}
              className="h-28 w-28 border-4 border-white/20 shadow-xl"
              fallback={<span className="text-3xl font-bold bg-white/10">{(fullName || user.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}</span>}
            />
            {hasPremium && (
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <Zap className="h-3 w-3 text-white" />
              </div>
            )}
            {onAvatarChange && (
              <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatarChange} />
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </label>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{fullName || user.name}</h1>
              {profile.is_verified && (
                <Badge variant="outline" className="text-xs gap-1 border-white/40 text-white bg-white/10">
                  <CheckCircle className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
            {position && <p className="text-white/80 text-sm mt-1">{position}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/70">
              {city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {city}{!isBn ? ", Bangladesh" : ", বাংলাদেশ"}
                </span>
              )}
              {email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {email}
                </span>
              )}
              {phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {phone}
                </span>
              )}
            </div>
            {linkedin && (
              <div className="mt-2">
                <a href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  {linkedin.replace(/https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10" asChild>
              <Link href={`/profile/${user.username}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> {isBn ? "প্রিভিউ" : "Preview Profile"}
              </Link>
            </Button>
            <Button size="sm" className="bg-white text-blue-600 hover:bg-white/90 font-semibold" asChild>
              <Link href="/dashboard/profile">
                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {isBn ? "এডিট" : "Edit Profile"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}