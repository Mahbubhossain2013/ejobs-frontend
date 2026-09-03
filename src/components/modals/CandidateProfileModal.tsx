"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  FolderOpen,
  ExternalLink,
  FileText,
  Award,
  X,
  Globe,
  Download,
  Eye,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: number;
  username?: string;
};

type BadgeItem = {
  id: number;
  name: string;
  badge_key: string;
  description: string;
  color: string;
  icon: string;
  icon_type: string;
  icon_url: string | null;
  priority: number;
  rarity: string;
  badge_type: string;
  progress_percentage: number;
  progress_text: string;
  progress_details: any[];
};

type ProfileData = {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  current_position: string | null;
  city: string | null;
  bio: string | null;
  availability_status: string;
  skills: string[];
  experience: any[];
  education: any[];
  projects: any[];
  social_links: any[];
  resume: string | null;
  active_badges: BadgeItem[];
  locked_badges: BadgeItem[];
  is_verified: boolean;
  trust_score: number;
  trust_explanations: any[];
  profile_strength_breakdown: any[];
  rating: number;
  reputation_status: string;
  is_featured: boolean;
  profile_completion_percentage: number;
  follower_count: number;
};

export default function CandidateProfileModal({ open, onOpenChange, userId, username }: Props) {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (!open) return;
    if (!userId && !username) {
      setError(isBn ? "প্রোফাইল তথ্য পাওয়া যায়নি" : "Profile identifier missing");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setProfile(null);
    const identifier = userId ?? username;
    api
      .get(`/profile/${encodeURIComponent(String(identifier))}`)
      .then((res) => {
        const data = res.data.data || res.data;
        setProfile(data);
      })
      .catch((err) => {
        const message = err?.response?.data?.message || (isBn ? "প্রোফাইল লোড করতে ব্যর্থ" : "Failed to load profile");
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [open, userId, username]);

  const renderSocial = () => {
    if (!profile?.social_links?.length) return null;
    const links = profile.social_links as any[];
    return (
      <div className="flex flex-wrap gap-2">
        {links.map((link, idx) => {
          const href = typeof link === "string" ? link : link?.url || "";
          const label = typeof link === "string" ? "Link" : link?.platform || "Link";
          if (!href) return null;
          return (
            <Button key={idx} variant="outline" size="sm" onClick={() => window.open(href, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              {label}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderSectionTitle = (title: string) => (
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isBn ? "প্রোফাইল" : "Candidate Profile"}</DialogTitle>
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-10 text-sm text-red-600">{error}</div>
        )}

        {!loading && profile && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=random`}
                  alt={profile.name}
                  className="h-16 w-16 rounded-full object-cover border"
                />
                <div>
                  <h2 className="text-xl font-semibold">{profile.name || "Candidate"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {profile.current_position || (isBn ? "ক্যাডিডেট" : "Candidate")}
                  </p>
                  {profile.city && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {profile.city}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {profile.is_verified && <Badge variant="success">{isBn ? "ভেরিফায়েড" : "Verified"}</Badge>}
                <Badge variant="outline" className="capitalize">{profile.reputation_status}</Badge>
                <Badge variant="secondary">{profile.profile_completion_percentage}% {isBn ? "সম্পূর্ণ" : "complete"}</Badge>
              </div>
            </div>

            {profile.bio && (
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="about">{isBn ? "সম্পর্কে" : "About"}</TabsTrigger>
                <TabsTrigger value="experience">{isBn ? "অভিজ্ঞতা" : "Experience"}</TabsTrigger>
                <TabsTrigger value="education">{isBn ? "শিক্ষা" : "Education"}</TabsTrigger>
                <TabsTrigger value="projects">{isBn ? "প্রকল্প" : "Projects"}</TabsTrigger>
                <TabsTrigger value="badges">{isBn ? "ব্যাজ" : "Badges"}</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">{isBn ? "ইমেল" : "Email"}: </span>
                    <span>{profile.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isBn ? "উপলব্ধতা" : "Availability"}: </span>
                    <span className="capitalize">{profile.availability_status}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isBn ? "রেটিং" : "Rating"}: </span>
                    <span>{profile.rating}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isBn ? "ট্রাস্ট স্কোর" : "Trust Score"}: </span>
                    <span>{profile.trust_score}</span>
                  </div>
                </div>

                {profile.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                ) : null}

                {renderSocial()}

                <div className="flex flex-wrap items-center gap-2">
                  {profile.resume && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profile.resume as string, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isBn ? "রিজিউমে" : "Resume"}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/candidate/${profile.username || profile.id}`;
                      navigator.clipboard.writeText(url).then(() => toast.success(isBn ? "প্রোফাইল লিংক কপি হয়েছে" : "Profile link copied"));
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {isBn ? "প্রোফাইল লিংক" : "Copy Profile Link"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-3">
                {profile.experience?.length ? (
                  profile.experience.map((exp, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-3 space-y-1">
                        <p className="font-medium">{exp.title || "Experience"}</p>
                        <p className="text-sm text-muted-foreground">{exp.company || ""}</p>
                        <p className="text-xs text-muted-foreground">{exp.duration || ""}</p>
                        {exp.description && <p className="text-sm text-muted-foreground">{exp.description}</p>}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{isBn ? "কোনো অভিজ্ঞতা নেই" : "No experience found"}</p>
                )}
              </TabsContent>

              <TabsContent value="education" className="space-y-3">
                {profile.education?.length ? (
                  profile.education.map((edu, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-3 space-y-1">
                        <p className="font-medium">{edu.degree || "Education"}</p>
                        <p className="text-sm text-muted-foreground">{edu.institution || ""}</p>
                        <p className="text-xs text-muted-foreground">{edu.year || ""}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{isBn ? "কোনো শিক্ষাগত যোগ্যতা নেই" : "No education found"}</p>
                )}
              </TabsContent>

              <TabsContent value="projects" className="space-y-3">
                {profile.projects?.length ? (
                  profile.projects.map((project, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-3 space-y-1">
                        <p className="font-medium">{project.title || "Project"}</p>
                        {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
                        {project.link && (
                          <Button variant="outline" size="sm" onClick={() => window.open(project.link as string, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {isBn ? "প্রকল্প দেখুন" : "View Project"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{isBn ? "কোনো প্রকল্প নেই" : "No projects found"}</p>
                )}
              </TabsContent>

              <TabsContent value="badges" className="space-y-3">
                {profile.active_badges?.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {profile.active_badges.map((badge) => (
                      <Card key={badge.id}>
                        <CardContent className="p-3 text-center">
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{isBn ? "কোনো অ্যাক্টিভ ব্যাজ নেই" : "No active badges"}</p>
                )}

                {profile.locked_badges?.length ? (
                  <div>
                    <p className="text-sm font-medium mb-2">{isBn ? "লকড ব্যাজ" : "Locked Badges"}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {profile.locked_badges.map((badge) => (
                        <Card key={badge.id} className="opacity-80">
                          <CardContent className="p-3 text-center">
                            <p className="font-medium text-sm">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.progress_text || badge.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : null}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
