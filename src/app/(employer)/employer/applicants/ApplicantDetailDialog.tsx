"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Eye,
  MessageSquare,
  FileText,
  ClipboardList,
} from "lucide-react";
import type { JobApplication } from "@/types";
import {
  candidateLabel,
  getProfileUrl,
  ALL_STATUSES,
  getStatusLabel,
  tryEndpoints,
} from "./applicants-utils";
import { toast } from "sonner";

interface Props {
  app: JobApplication | null;
  isBn: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusRefresh: (id: number, status: string) => void;
  onOpenStatusChange: (app: JobApplication) => void;
}

export default function ApplicantDetailDialog({ app, isBn, onOpenChange, onStatusRefresh, onOpenStatusChange }: Props) {
  const router = useRouter();

  if (!app) return null;

  const profileUrl = getProfileUrl(app);

  const openMessages = () => {
    const cid = app.user?.id ?? app.id;
    if (cid) router.push(`/employer/messages?to=${cid}`);
  };

  return (
    <Dialog open={!!app} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isBn ? "আবেদনের বিবরণ" : "Applicant Details"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <DefaultAvatar
              src={(app as any).user?.avatar}
              name={candidateLabel(app)}
              className="h-14 w-14 rounded-full"
            />
            <div className="flex-1">
              <p className="font-semibold text-base">{candidateLabel(app)}</p>
              <p className="text-sm text-muted-foreground">{app.job?.title || "Job"}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize text-xs">{app.status}</Badge>
                {app.profile_strength != null && (
                  <Badge variant={app.profile_strength >= 80 ? "success" : app.profile_strength >= 50 ? "warning" : "destructive"}>
                    {app.profile_strength}%
                  </Badge>
                )}
                {app.ai_match_score && <Badge variant="success">{app.ai_match_score}% Match</Badge>}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            {app.expected_salary && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{isBn ? "প্রত্যাশিত বেতন" : "Expected Salary"}</p>
                <p className="font-medium">{app.expected_salary}</p>
              </div>
            )}
            {app.delivery_days && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{isBn ? "ডেলিভারি" : "Delivery"}</p>
                <p className="font-medium">{app.delivery_days} {isBn ? "দিন" : "days"}</p>
              </div>
            )}
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{isBn ? "স্ট্যাটাস" : "Status"}</p>
              <p className="font-medium capitalize">{app.status}</p>
            </div>
          </div>

          {/* Cover Letter */}
          {app.cover_letter && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <p className="text-sm font-medium">{isBn ? "আবেদন পত্র" : "Cover Letter"}</p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.cover_letter}</p>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(app as any).resume_url && (
              <Button variant="outline" size="sm" onClick={() => window.open((app as any).resume_url, "_blank")}>
                <Download className="h-4 w-4 mr-2" />{isBn ? "সিভি" : "Download CV"}
              </Button>
            )}
            {profileUrl && (
              <Button variant="secondary" size="sm" asChild>
                <Link href={profileUrl} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />{isBn ? "প্রোফাইল" : "View Profile"}
                </Link>
              </Button>
            )}
            <Button variant="default" size="sm" onClick={() => onOpenStatusChange(app)}>
              <ClipboardList className="h-4 w-4 mr-2" />{isBn ? "স্ট্যাটাস পরিবর্তন" : "Change Status"}
            </Button>
            <Button variant="outline" size="sm" onClick={openMessages}>
              <MessageSquare className="h-4 w-4 mr-2" />{isBn ? "বার্তা" : "Message"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}