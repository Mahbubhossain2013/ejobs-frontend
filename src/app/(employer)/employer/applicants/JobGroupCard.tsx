"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Briefcase, Globe, Wallet, MapPin, Clock, Users, FileText } from "lucide-react";
import type { JobApplication } from "@/types";
import type { JobGroup } from "./applicants-utils";
import ApplicantRow from "./ApplicantRow";

interface Props {
  group: JobGroup;
  isExpanded: boolean;
  isBn: boolean;
  onToggle: () => void;
  onStatusChange: (app: JobApplication, status: string) => void;
  onScheduleInterview?: (app: JobApplication) => void;
  onCustomHire?: (app: JobApplication) => void;
  pendingId?: number | null;
}

export default function JobGroupCard({ group, isExpanded, isBn, onToggle, onStatusChange, onScheduleInterview, onCustomHire, pendingId }: Props) {
  const jobType = group.job_type || "";
  const location = group.location || "";
  const salary = group.salary_min || group.salary_max
    ? `${group.salary_min ? "৳" + Number(group.salary_min).toLocaleString() : ""}${group.salary_min && group.salary_max ? " - " : ""}${group.salary_max ? "৳" + Number(group.salary_max).toLocaleString() : ""}`
    : group.budget != null
      ? `৳${Number(group.budget).toLocaleString()}`
      : "";
  const deadline = group.deadline ? new Date(group.deadline).toLocaleDateString() : "";
  const vacancies = group.vacancies || 0;

  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 mt-1" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 mt-1" />
        )}
        <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{group.title}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
            {jobType && <span className="capitalize">{jobType.replace(/-/g, " ")}</span>}
            {location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>}
            {salary && <span className="flex items-center gap-1"><Wallet className="h-3 w-3" />{salary}</span>}
            {deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{deadline}</span>}
            {vacancies > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{vacancies} {isBn ? "পদ" : "vacancies"}</span>}
          </div>
          {group.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {group.description.replace(/<[^>]*>/g, "").slice(0, 120)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {group.isRemote && (
            <Badge variant="secondary" className="text-xs border-blue-300 text-blue-600">
              <Globe className="h-3 w-3 mr-1" />
              {isBn ? "রিমোট" : "Remote"}
            </Badge>
          )}
          {group.budget != null && (
            <Badge variant="outline" className="text-xs">
              <Wallet className="h-3 w-3 mr-1" />
              {Number(group.budget).toLocaleString()} ৳
            </Badge>
          )}
          <Badge variant="secondary">{group.applications.length}</Badge>
        </div>
      </button>

      {/* Applicant list */}
      {isExpanded && (
        <div className="border-t divide-y">
          {group.applications.map((app) => (
            <ApplicantRow
              key={app.id}
              app={app}
              isBn={isBn}
              onStatusChange={onStatusChange}
              onScheduleInterview={onScheduleInterview}
              onCustomHire={onCustomHire}
              pending={pendingId === app.id}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
