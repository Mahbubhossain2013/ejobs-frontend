"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import type { JobApplication } from "@/types";
import { candidateLabel, getProfileUrl, STATUS_COLORS } from "./applicants-utils";
import ApplicantActions from "./ApplicantActions";

interface Props {
  app: JobApplication;
  isBn: boolean;
  onStatusChange: (app: JobApplication, status: string) => void;
  onScheduleInterview?: (app: JobApplication) => void;
  onCustomHire?: (app: JobApplication) => void;
  pending?: boolean;
}

export default function ApplicantRow({ app, isBn, onStatusChange, onScheduleInterview, onCustomHire, pending }: Props) {
  const profileUrl = getProfileUrl(app);
  const strength = app.profile_strength;

  return (
    <div className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
      <DefaultAvatar
        src={(app as any).user?.avatar}
        name={candidateLabel(app)}
        className="h-10 w-10 rounded-full shrink-0"
      />

      <div className="flex-1 min-w-0">
        {/* Top line: name + badges */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium truncate">{candidateLabel(app)}</p>
            {app.cover_letter && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {app.cover_letter}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {strength != null && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="relative h-2 w-16 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                      strength >= 80 ? "bg-emerald-500" : strength >= 50 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <Badge variant={strength >= 80 ? "success" : strength >= 50 ? "warning" : "destructive"}>
                  {strength}%
                </Badge>
              </div>
            )}

            {app.ai_match_score && (
              <Badge variant="success" className="hidden sm:inline-flex">
                {app.ai_match_score}%
              </Badge>
            )}

            <Badge variant="outline" className={`capitalize text-xs ${STATUS_COLORS[app.status as string] || ""}`}>
              {app.status}
            </Badge>
          </div>
        </div>

        {/* Action row */}
        <ApplicantActions
          app={app}
          profileUrl={profileUrl}
          isBn={isBn}
          onStatusChange={onStatusChange}
          onScheduleInterview={onScheduleInterview}
          onCustomHire={onCustomHire}
          pending={pending}
        />
      </div>
    </div>
  );
}