"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, DollarSign, Briefcase } from "lucide-react";
import { formatCurrency, getStorageUrl } from "@/lib/utils";

interface RecommendedJob {
  id: number;
  title: string;
  slug: string;
  company?: { name: string; logo?: string };
  salary_min?: number;
  salary_max?: number;
  location?: string;
  job_type: string;
  skills?: string[];
}

export default function RecommendedJobs() {
  const { isAuthenticated, role } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || role !== "candidate") {
      setLoading(false);
      return;
    }

    api
      .get("/candidate/recommended-jobs")
      .then((res) => {
        const data = res.data.data || res.data;
        setJobs(Array.isArray(data) ? data : data?.data || []);
      })
      .catch(() => { /* handled */ })
      .finally(() => setLoading(false));
  }, [isAuthenticated, role]);

  if (!isAuthenticated || role !== "candidate") return null;

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {isBn ? "সুপারিশকৃত চাকরি" : "Recommended for You"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!jobs.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">
        {isBn ? "সুপারিশকৃত চাকরি" : "Recommended for You"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm line-clamp-1">{job.title}</h3>
                  {job.company?.logo && (
                    <img
                      src={getStorageUrl(job.company.logo)}
                      alt={job.company.name}
                      className="h-8 w-8 rounded object-cover shrink-0 ml-2"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {job.company?.name}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {(job.salary_min || job.salary_max) && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.salary_min && job.salary_max
                        ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                        : job.salary_min
                        ? `${formatCurrency(job.salary_min)}+`
                        : `Up to ${formatCurrency(job.salary_max || 0)}`}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {job.job_type}
                  </span>
                </div>
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        +{job.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
