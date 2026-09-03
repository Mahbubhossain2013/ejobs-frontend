"use client";

import React from "react";
import Link from "next/link";
import { useSavedJobs, useToggleSaveJob } from "@/hooks/use-jobs";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, MapPin, ArrowRight, AlertCircle, Globe, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function SavedJobsPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const { data: jobs, isLoading, isError } = useSavedJobs();
  const removeMutation = useToggleSaveJob();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isBn ? "সংরক্ষিত চাকরি" : "Saved Jobs"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isBn ? "আপনার সংরক্ষিত চাকরির তালিকা" : "Jobs you've saved for later"}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isBn ? "ত্রুটি হয়েছে" : "Something went wrong"}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {isBn ? "সংরক্ষিত চাকরি লোড করা যায়নি" : "Failed to load saved jobs"}
          </p>
          <Button asChild>
            <Link href="/jobs">
              {isBn ? "চাকরি খুঁজুন" : "Browse Jobs"}
            </Link>
          </Button>
        </div>
      ) : !jobs?.length ? (
        <div className="text-center py-16">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isBn ? "কোনো সংরক্ষিত চাকরি নেই" : "No saved jobs"}
          </h3>
          <Button asChild>
            <Link href="/jobs">
              {isBn ? "চাকরি খুঁজুন" : "Browse Jobs"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {job.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{typeof job.company === 'object' ? job.company?.name : job.company}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                      )}
                      {job.salary_min && (
                        <span>{formatCurrency(job.salary_min)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {job.is_remote_project || job.is_remote ? (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Globe className="h-3 w-3" /> {isBn ? "রিমোট" : "Remote"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Briefcase className="h-3 w-3" /> {isBn ? "রেগুলার" : "Regular"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMutation.mutate(job.id)}
                  >
                    <Bookmark className="h-4 w-4 fill-primary text-primary" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
