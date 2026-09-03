"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BadgeDisplay from "@/components/badges/BadgeDisplay";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { toast } from "sonner";
import { trackBehavior, useScrollDepthTracking, useClickPatternTracking, useSessionEngagementTracking } from "@/hooks/use-behavior-tracker";
import { getInitials, getStorageUrl } from "@/lib/utils";
import {
  MapPin, Briefcase, GraduationCap, CheckCircle, Award, Globe, Code, Calendar,
  Eye, Users, ExternalLink, LinkIcon, Shield, Zap, Trophy, Star,
  MessageSquare, Mail, Phone, Share2, BriefcaseBusiness, Loader2,
  Target, TrendingUp, Clock, FileText,
} from "lucide-react";

export default function PublicProfileClient({ username }: { username: string }) {
  const { user, isAuthenticated } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useScrollDepthTracking();
  useClickPatternTracking();
  useSessionEngagementTracking();

  useEffect(() => {
    api.get("/profile/" + username)
      .then((r) => {
        const data = r.data.data || r.data;
        setProfile(data);
        if (data.follower_count !== undefined) setFollowerCount(data.follower_count);
        if (data.following_count !== undefined) setFollowingCount(data.following_count);
        trackBehavior("profile_visit", { targetId: data.user_id || data.id, metaData: { username } });
      })
      .catch(() => { toast.error("Failed to load profile"); })
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!isAuthenticated || !profile) return;
    api.get(`/candidate/profile/${username}/follow-status`)
      .then((res: any) => {
        const data = res.data;
        setFollowing(data.following ?? data.data?.following ?? false);
      })
      .catch(() => { /* follow status check - non-critical */ });
  }, [isAuthenticated, profile, username]);

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error(isBn ? "লগইন প্রয়োজন" : "Login required"); return; }
    setFollowLoading(true);
    try {
      const res = await api.post("/candidate/profile/" + username + "/follow");
      const data = res.data;
      const isNowFollowing = data.following ?? !following;
      setFollowing(isNowFollowing);
      setFollowerCount((prev) => isNowFollowing ? prev + 1 : Math.max(0, prev - 1));
      toast.success(data.message || (isNowFollowing ? "Following" : "Unfollowed"));
    } catch {
      toast.error(isBn ? "ব্যর্থ হয়েছে" : "Failed");
    } finally { setFollowLoading(false); }
  };

  if (loading) return (
    <PublicLayout>
      <div className="px-6 sm:px-8 lg:px-12 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}</div>
          <div className="lg:col-span-9 space-y-6"><Skeleton className="h-64 rounded-lg" /><Skeleton className="h-48 rounded-lg" /></div>
        </div>
      </div>
    </PublicLayout>
  );

  if (!profile) return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{isBn ? "প্রোফাইল পাওয়া যায়নি" : "Profile not found"}</h2>
        <Button asChild><Link href="/candidates">{isBn ? "ফিরে যান" : "Back"}</Link></Button>
      </div>
    </PublicLayout>
  );

  const isOwn = user && user.username === username;
  const rawSocialLinks = profile.social_links || {};
  const socialLinksData = Array.isArray(rawSocialLinks)
    ? rawSocialLinks.reduce((acc: Record<string, string>, item: any) => {
        if (item.platform && item.url) acc[item.platform + "_url"] = item.url;
        if (item.url && item.label) acc[item.label.toLowerCase() + "_url"] = item.url;
        return acc;
      }, {})
    : rawSocialLinks;
  const projects = profile.projects || [];
  const experience = profile.experience || profile.experiences || [];
  const education = profile.education || profile.educations || [];
  const skills = profile.skills || [];
  const languages = profile.language_proficiency || [];
  const trainings = profile.trainings || [];
  const certifications = profile.certifications || [];
  const activeBadges = profile.active_badges || [];
  const lockedBadges = profile.locked_badges || [];
  const avatar = profile.avatar || "";
  const position = profile.current_position || "";
  const city = profile.city || "";
  const bio = profile.bio || "";
  const email = profile.email || "";
  const phone = profile.phone || "";

  const socialLinks = [
    socialLinksData.linkedin_url || profile.linkedin_url ? { icon: () => <Briefcase className="h-3.5 w-3.5" />, href: socialLinksData.linkedin_url || profile.linkedin_url, label: "LinkedIn" } : null,
    socialLinksData.github_url || profile.github_url ? { icon: () => <Code className="h-3.5 w-3.5" />, href: socialLinksData.github_url || profile.github_url, label: "GitHub" } : null,
    socialLinksData.portfolio_url || profile.portfolio_url ? { icon: () => <LinkIcon className="h-3.5 w-3.5" />, href: socialLinksData.portfolio_url || profile.portfolio_url, label: "Portfolio" } : null,
  ].filter(Boolean) as { icon: any; href: string; label: string }[];

  return (
    <PublicLayout>
      <div className="px-6 sm:px-8 lg:px-12 space-y-6">
        {/* ── Profile Header Banner ── */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('/images/company-bg.jpg')] bg-cover bg-center opacity-20" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              <DefaultAvatar src={getStorageUrl(avatar)} name={profile.name} className="h-24 w-24 border-4 border-white/20 shadow-xl" fallback={<span className="text-2xl font-bold bg-white/10">{getInitials(profile.name || "?")}</span>} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{profile.name || profile.username || username}</h1>
                  {activeBadges.some((b: any) => b.badge_key === "premium") && <Badge className="bg-yellow-500 text-white text-xs"><Zap className="h-3 w-3 mr-1" />Pro</Badge>}
                  {profile.is_verified && <><CheckCircle className="h-5 w-5 text-green-400 fill-green-400/20" /><span className="text-xs text-green-400 font-medium">Verified</span></>}
                  {profile.trust_score != null && profile.trust_score > 0 && <div className="flex items-center gap-1 text-sm"><Shield className="h-4 w-4 text-green-400" /><span className="text-green-400 font-medium">Trust: {profile.trust_score}%</span></div>}
                </div>
                {position && <p className="text-white/70 mt-1">{position}</p>}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/60">
                  {city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{city}, Bangladesh</span>}
                  {email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{email}</span>}
                  {phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{phone}</span>}
                </div>
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    {socialLinks.map((sl, i) => (
                      <a key={i} href={sl.href} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <sl.icon />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10" title="Share" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
                  <Share2 className="h-4 w-4" />
                </Button>
                {!isOwn && isAuthenticated && (
                  <>
                    <Button variant="outline" size="sm" className="border-white/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300" onClick={handleFollow} disabled={followLoading}>
                      {followLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                      <Users className="h-4 w-4 mr-1" />{following ? "Following" : "Follow"} {followerCount > 0 && `(${followerCount})`}
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10" asChild>
                      <Link href={user?.role === "employer" ? `/employer/messages?to=${profile.id}` : `/dashboard/messages?to=${profile.id}`}><MessageSquare className="h-4 w-4 mr-1" />Message</Link>
                    </Button>
                  </>
                )}
                {isOwn && <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10" asChild><Link href="/dashboard/profile">Edit Profile</Link></Button>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: Briefcase, label: "Experience", value: `${experience.length} Positions` },
            { icon: Users, label: "Followers", value: String(followerCount) },
            { icon: Eye, label: "Profile Views", value: String(profile.profile_views_count || 0) },
            { icon: Award, label: "Badges", value: String(activeBadges.length) },
            { icon: Star, label: "Trust Score", value: `${profile.trust_score || 100}%` },
          ].map((s) => (
            <Card key={s.label} className="text-center p-3">
              <s.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-bold mt-0.5">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* ── Section Divider ── */}
        <div className="border-b border-border/50" />

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Profile Summary */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Profile Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {city && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium">{city}</p></div></div>}
                {position && <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Position</p><p className="font-medium">{position}</p></div></div>}
                {experience.length > 0 && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Experience</p><p className="font-medium">{experience.length} roles</p></div></div>}
                {skills.length > 0 && <div className="flex items-center gap-2"><Code className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Skills</p><p className="font-medium">{skills.length} skills</p></div></div>}
              </CardContent>
            </Card>

            {/* Skills Preview */}
            {skills.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Top Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 10).map((s: any, i: number) => <Badge key={i} variant="secondary" className="text-[10px]">{typeof s === "string" ? s : s.name}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Badges */}
            {activeBadges.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-1"><Trophy className="h-4 w-4 text-yellow-500" />Earned Badges</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {activeBadges.slice(0, 6).map((badge: any, i: number) => (
                      <BadgeDisplay key={badge.id || i} badge={badge} size="sm" showRarity />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* About */}
            {bio && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">About {profile.name}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{bio}</p></CardContent>
              </Card>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-5 w-5" />Work Experience</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experience.map((exp: any, i: number) => (
                      <div key={i} className="relative pl-6 pb-4 border-l-2 border-primary/20 last:border-0">
                        <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary" />
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-sm">{exp.designation || exp.position || exp.job_title}</h4>
                            <p className="text-sm text-muted-foreground">{exp.company_name || exp.company}</p>
                            {exp.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{exp.location}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{exp.start_date} - {exp.end_date || (exp.is_current ? "Present" : "")}</span>
                        </div>
                        {(exp.responsibilities || exp.description) && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.responsibilities || exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {education.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-5 w-5" />Education</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {education.map((edu: any, i: number) => (
                      <div key={i} className="relative pl-6 pb-4 border-l-2 border-primary/20 last:border-0">
                        <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary" />
                        <h4 className="font-semibold text-sm">{edu.degree_name || edu.degree || edu.level || edu.group_or_subject}</h4>
                        <p className="text-sm text-muted-foreground">{edu.institute_name || edu.institution || edu.school_name}</p>
                        {(edu.board || edu.field_of_study) && <p className="text-xs text-muted-foreground">{edu.board || edu.field_of_study}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{edu.passing_year || edu.end_date || ""}{edu.gpa_or_cgpa ? ` — GPA: ${edu.gpa_or_cgpa}` : edu.gpa ? ` — GPA: ${edu.gpa}` : ""}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Code className="h-5 w-5" />Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s: any, i: number) => {
                      const name = typeof s === "string" ? s : s.name;
                      const level = typeof s === "object" ? s.level : null;
                      return (
                        <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                          {name}{level ? ` — ${level}` : ""}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Globe className="h-5 w-5" />Languages</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {languages.map((lang: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <span className="font-medium text-sm">{lang.name}</span>
                        <div className="flex gap-1.5">
                          {lang.read && <Badge variant="secondary" className="text-[10px]">Read</Badge>}
                          {lang.write && <Badge variant="secondary" className="text-[10px]">Write</Badge>}
                          {lang.speak && <Badge variant="secondary" className="text-[10px]">Speak</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Training */}
            {trainings.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-5 w-5" />Training</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainings.map((t: any, i: number) => (
                      <div key={i} className="relative pl-6 pb-4 border-l-2 border-primary/20 last:border-0">
                        <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary" />
                        <h4 className="font-semibold text-sm">{t.title}</h4>
                        {t.institute_name && <p className="text-sm text-muted-foreground">{t.institute_name}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{[t.duration, t.year].filter(Boolean).join(" · ")}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Award className="h-5 w-5" />Certifications</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {certifications.map((cert: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cert.name || cert.title}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer || cert.organization} {cert.year ? `(${cert.year})` : ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {projects.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5" />Projects</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.map((proj: any, i: number) => (
                      <Card key={i} className="p-3">
                        <h4 className="font-semibold text-sm">{proj.name || proj.project_name}</h4>
                        {proj.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.technologies.map((t: string, j: number) => <Badge key={j} variant="outline" className="text-[10px]">{t}</Badge>)}
                          </div>
                        )}
                        {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" />View</a>}
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Badges */}
            {(activeBadges.length > 0 || lockedBadges.length > 0) && (
              <div className="space-y-4">
                {activeBadges.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-1"><Trophy className="h-4 w-4 text-yellow-500" />Earned Badges</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeBadges.map((badge: any) => (
                          <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg border">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: badge.color ? `${badge.color}20` : undefined }}>
                              <Award className="h-5 w-5" style={{ color: badge.color }} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{badge.name}</p>
                              {badge.description && <p className="text-xs text-muted-foreground">{badge.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {lockedBadges.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-1"><Shield className="h-4 w-4" />Locked Badges</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {lockedBadges.slice(0, 4).map((badge: any) => (
                          <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg border opacity-60">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><Award className="h-5 w-5 text-muted-foreground" /></div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{badge.name}</p>
                              {badge.progress_percentage > 0 && <div className="mt-1"><div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${badge.progress_percentage}%` }} /></div></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Social */}
            {(() => {
              const links = [
                { label: "LinkedIn", url: socialLinksData.linkedin_url || profile.linkedin_url, icon: <Briefcase className="h-4 w-4" /> },
                { label: "GitHub", url: socialLinksData.github_url || profile.github_url, icon: <Code className="h-4 w-4" /> },
                { label: "Portfolio", url: socialLinksData.portfolio_url || profile.portfolio_url, icon: <LinkIcon className="h-4 w-4" /> },
                { label: "Website", url: socialLinksData.website_url || profile.website_url, icon: <Globe className="h-4 w-4" /> },
              ].filter((l) => l.url);
              if (links.length === 0) return null;
              return (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Globe className="h-5 w-5" />Social Links</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {links.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <span className="text-muted-foreground">{link.icon}</span>
                          <span className="font-medium text-sm">{link.label}</span>
                          <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
