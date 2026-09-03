"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, Megaphone, Newspaper, Award, Camera, Building2, MessageSquare, Globe, Mail } from "lucide-react";

function formatJobType(t: string) { return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <p className="text-sm">{text}</p>
    </div>
  );
}

// ── Jobs ──
export function JobsTab({ jobs, isBn }: { jobs: any[]; isBn: boolean }) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-3">All Jobs ({jobs.length})</h2>
      {jobs.length > 0 ? (
        <div className="space-y-2">
          {jobs.map((job, i) => (
            <Card key={i} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/jobs/${job.id}`} className="font-semibold text-sm hover:text-primary transition-colors">{job.title}</Link>
                      <Badge variant="outline" className="text-[10px]">{formatJobType(job.job_type || "full_time")}</Badge>
                    </div>
                    {job.location && <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{job.location}</div>}
                  </div>
                  <Button asChild size="sm" variant="outline"><Link href={`/jobs/${job.id}`}>View</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <p className="text-center py-8 text-muted-foreground">No active jobs posted yet</p>}
    </div>
  );
}

// ── About ──
export function AboutTab({ company, isBn }: { company: any; isBn: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-2">About {company.name}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{company.description || "No description available."}</p>
      </div>
      {(company.mission || company.vision) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {company.mission && <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800"><CardContent className="p-5"><h4 className="font-bold text-sm mb-2">Our Mission</h4><p className="text-sm text-muted-foreground">{company.mission}</p></CardContent></Card>}
          {company.vision && <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800"><CardContent className="p-5"><h4 className="font-bold text-sm mb-2">Our Vision</h4><p className="text-sm text-muted-foreground">{company.vision}</p></CardContent></Card>}
        </div>
      )}
      {company.services_products && <div><h3 className="font-bold text-sm mb-2">Services & Products</h3><p className="text-sm text-muted-foreground leading-relaxed">{company.services_products}</p></div>}
      {company.working_culture && <div><h3 className="font-bold text-sm mb-2">Working Culture</h3><p className="text-sm text-muted-foreground leading-relaxed">{company.working_culture}</p></div>}
      {company.values && <div><h3 className="font-bold text-sm mb-2">Core Values</h3><p className="text-sm text-muted-foreground leading-relaxed">{company.values}</p></div>}
    </div>
  );
}

// ── Benefits ──
export function BenefitsTab({ benefits, isBn }: { benefits: string[]; isBn: boolean }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Benefits & Perks</h2>
      {benefits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {benefits.map((item) => (
            <Card key={item}><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /><span className="text-sm font-medium">{item}</span></CardContent></Card>
          ))}
        </div>
      ) : <p className="text-center py-8 text-muted-foreground">No benefits listed</p>}
    </div>
  );
}

// ── Photos ──
export function PhotosTab({ photos }: { photos: any[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Company Photos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.length > 0 ? photos.map((p) => (
          <div key={p.id} className="aspect-video rounded-lg bg-muted overflow-hidden">
            <img src={p.file_url} alt={p.caption || "Culture photo"} className="w-full h-full object-cover" />
          </div>
        )) : [1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-video rounded-lg bg-muted flex items-center justify-center">
            <Camera className="h-6 w-6 text-muted-foreground/50" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Videos ──
export function VideosTab({ videoUrl }: { videoUrl?: string }) {
  if (videoUrl) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Company Videos</h2>
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe src={videoUrl} className="w-full h-full" allowFullScreen />
        </div>
      </div>
    );
  }
  return (
    <div className="text-center py-16">
      <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-lg font-bold">Company Videos</h3>
      <p className="text-sm text-muted-foreground mt-1">No video added yet. Add a YouTube URL in your profile settings.</p>
    </div>
  );
}

// ── Updates ──
export function UpdatesTab({ updates }: { updates: any[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">News & Updates</h2>
      {updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((u, i) => (
            <Card key={i}><CardContent className="p-4 flex items-start gap-3">
              <Newspaper className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div><p className="text-sm font-medium leading-snug">{u.title}</p><p className="text-[10px] text-muted-foreground mt-0.5">{u.time}</p></div>
            </CardContent></Card>
          ))}
        </div>
      ) : <EmptyState text="No recent updates" />}
    </div>
  );
}

// ── Awards ──
export function AwardsTab({ awards, isBn }: { awards: any[]; isBn: boolean }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Awards & Recognition</h2>
      {awards.length > 0 ? (
        <div className="space-y-3">
          {awards.map((a, i) => (
            <Card key={i}><CardContent className="p-4 flex items-start gap-3">
              <Award className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.issuer} {a.year ? `(${a.year})` : ""}</p></div>
            </CardContent></Card>
          ))}
        </div>
      ) : <EmptyState text="No awards added yet" />}
    </div>
  );
}

// ── Culture ──
export function CultureTab({ culture, photos, isBn }: { culture: string; photos: any[]; isBn: boolean }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Work Culture</h2>
      {culture ? (
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground leading-relaxed">{culture}</p></CardContent></Card>
      ) : <EmptyState text="No work culture description added yet" />}
      {photos.length > 0 && (
        <>
          <h3 className="font-bold text-sm">Culture Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="aspect-video rounded-lg bg-muted overflow-hidden">
                <img src={p.file_url} alt={p.caption || "Culture photo"} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── People ──
export function PeopleTab({ companyName, isBn }: { companyName: string; isBn: boolean }) {
  return (
    <div className="text-center py-16">
      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-lg font-bold">Our People</h3>
      <p className="text-sm text-muted-foreground mt-1">Meet the talented team behind {companyName}</p>
    </div>
  );
}

// ── Contact ──
export function ContactTab({ company, socialLinks }: { company: any; socialLinks: { icon: any; href: string; label: string }[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Contact Us</h2>
      <Card><CardContent className="p-5 space-y-4">
        {company.name && <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{company.name}</span></div>}
        {company.headOfficeAddress && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{company.headOfficeAddress}{company.postalCode ? `, ${company.postalCode}` : ""}</span></div>}
        {company.email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><a href={`mailto:${company.email}`} className="text-sm text-primary hover:underline">{company.email}</a></div>}
        {company.phone && <div className="flex items-center gap-3"><MessageSquare className="h-4 w-4 text-muted-foreground" /><a href={`tel:${company.phone}`} className="text-sm text-primary hover:underline">{company.phone}</a></div>}
        {company.website && <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-muted-foreground" /><a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{company.website}</a></div>}
        {socialLinks.length > 0 && (
          <div className="flex gap-2 pt-2">
            {socialLinks.map((sl, i) => (
              <a key={i} href={sl.href} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary">
                <sl.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}

// ── Followers ──
export function FollowersTab({ count, isBn }: { count: number; isBn: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-bold mb-2">Followers ({count})</h2>
        <p className="text-sm text-muted-foreground">{count > 0 ? `${count} people follow this company` : "No followers yet"}</p>
      </CardContent>
    </Card>
  );
}