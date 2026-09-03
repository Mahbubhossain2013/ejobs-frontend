"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Camera, Newspaper, Award, ArrowRight, Target, Eye, BookOpen } from "lucide-react";
import type { CompanyReview } from "@/types";

function formatJobType(t: string) { return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

function ReviewCard({ review }: { review: CompanyReview }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            {(review.user?.name || "A")[0]}
          </div>
          <div>
            <p className="text-sm font-medium">{review.user?.name || "Anonymous"}</p>
            <p className="text-[10px] text-muted-foreground">
              {review.is_current_employee ? "Current Employee" : "Former Employee"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} filled={s <= Math.floor(Number(review.overall_rating || review.rating))} />
          ))}
          <span className="text-xs font-medium ml-1">{Number(review.overall_rating || review.rating).toFixed(1)}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {review.pros || review.cons || review.comment || "No comment"}
        </p>
      </CardContent>
    </Card>
  );
}

function Star({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <span className={`h-3 w-3 ${filled ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400/30 text-yellow-400/30"}`}>&#9733;</span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <p className="text-sm">{text}</p>
    </div>
  );
}

interface Props {
  company: any;
  slug: string;
  activeJobs: any[];
  culturePhotos: any[];
  recentUpdates: any[];
  awards: any[];
  reviews: CompanyReview[];
  isBn: boolean;
  onTabChange: (tab: string) => void;
}

export default function OverviewTab({ company, slug, activeJobs, culturePhotos, recentUpdates, awards, reviews, isBn, onTabChange }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">About {company.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {company.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed italic">No company description added yet.</p>
          )}
        </CardContent>
      </Card>

      {(company.mission || company.vision || company.values) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {company.mission && <MissionVisionCard icon={Target} color="blue" title="Our Mission" text={company.mission} />}
          {company.vision && <MissionVisionCard icon={Eye} color="purple" title="Our Vision" text={company.vision} />}
          {company.values && <MissionVisionCard icon={BookOpen} color="emerald" title="Our Values" text={company.values} />}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Open Jobs ({company.activeJobs})</h2>
          <Button variant="link" size="sm" className="text-xs" asChild>
            <Link href="/employer/manage-jobs">View All Jobs <ArrowRight className="h-3 w-3 ml-1" /></Link>
          </Button>
        </div>
        {activeJobs.length > 0 ? (
          <div className="space-y-2">
            {activeJobs.slice(0, 5).map((job, i) => (
              <Card key={i} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{job.title}</h4>
                        <Badge variant="outline" className="text-[10px]">{formatJobType(job.type)}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{job.mode}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {job.department && <span>{job.department}</span>}
                        {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                        {job.experience && <span>{job.experience}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-600">{job.salary}</p>
                      <p className="text-[10px] text-muted-foreground">{job.posted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState text="No active jobs posted yet" />
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Our Culture</h2>
        {culturePhotos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {culturePhotos.slice(0, 6).map((photo: any) => (
                <div key={photo.id} className="aspect-video rounded-lg bg-muted overflow-hidden">
                  <img src={photo.file_url} alt={photo.caption || "Culture photo"} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <Button variant="link" size="sm" className="px-0 mt-2 h-auto text-xs" onClick={() => onTabChange("photos")}>
              View All Photos
            </Button>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <Camera className="h-6 w-6 text-muted-foreground/50" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Recent Updates</h2>
        {recentUpdates.length > 0 ? (
          <div className="space-y-3">
            {recentUpdates.map((u: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Newspaper className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium leading-snug">{u.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{u.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No recent updates" />
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Awards & Recognition</h2>
        {awards.length > 0 ? (
          <div className="space-y-3">
            {awards.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Award className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium leading-snug">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.issuer} {a.year ? `(${a.year})` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No awards added yet" />
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">What Our Employees Say</h2>
        {reviews.length > 0 ? (
          <div className="space-y-3">{reviews.slice(0, 3).map((r) => <ReviewCard key={r.id} review={r} />)}</div>
        ) : (
          <EmptyState text="No reviews yet" />
        )}
      </div>
    </div>
  );
}

function MissionVisionCard({ icon: Icon, color, title, text }: { icon: any; color: string; title: string; text: string }) {
  const gradients: Record<string, string> = {
    blue: "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800",
    purple: "from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800",
    emerald: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  };
  const iconBg: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/60 text-blue-600",
    purple: "bg-purple-100 dark:bg-purple-900/60 text-purple-600",
    emerald: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600",
  };

  return (
    <Card className={`bg-gradient-to-br ${gradients[color] || gradients.blue} border`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className={`h-8 w-8 rounded-lg ${iconBg[color] || iconBg.blue} flex items-center justify-center`}>
            <Icon className="h-4 w-4" />
          </div>
          <h4 className="font-bold text-sm">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
      </CardContent>
    </Card>
  );
}