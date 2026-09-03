"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Globe, Shield, Target, FileText, Upload, ExternalLink, Loader2 } from "lucide-react";
import { getStorageUrl } from "@/lib/utils";

interface Props {
  profile: any;
  user: any;
  isPublic: boolean;
  isBn: boolean;
  onToggleVisibility: (val: boolean) => void;
  onResumeUpload: (file: File) => void;
  onResumeDialogOpen: () => void;
  uploadingResume: boolean;
}

export default function ProfileBottomCards({ profile, user, isPublic, isBn, onToggleVisibility, onResumeUpload, onResumeDialogOpen, uploadingResume }: Props) {
  const p = profile;
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const resumePath = p.resume_path || p.resume;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Job Preferences */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              {isBn ? "চাকরির পছন্দ" : "Job Preferences"}
            </h3>
            <div className="space-y-2 text-sm">
              {p.current_profession && <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "পছন্দের পদবি" : "Preferred Role"}</span><span className="font-medium">{p.current_profession}</span></div>}
              {p.expected_job_category && <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "ক্যাটাগরি" : "Category"}</span><span className="font-medium">{p.expected_job_category}</span></div>}
              {p.preferred_location && <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "লোকেশন" : "Location"}</span><span className="font-medium">{p.preferred_location}</span></div>}
              {p.expected_salary && <div className="flex justify-between"><span className="text-muted-foreground">{isBn ? "বেতন" : "Salary"}</span><span className="font-medium">{p.expected_salary}</span></div>}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? "কাজের ধরন" : "Work Type"}</span>
                <span className="font-medium">{p.available_remote ? "Remote/On-site" : "On-site"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? "উপলব্ধতা" : "Availability"}</span>
                <span className="font-medium">{p.availability_status || "Immediate"}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-primary" asChild>
              <Link href="/dashboard/profile">{isBn ? "এডিট করুন" : "Edit preferences"}</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Resume */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {isBn ? "রিজুমে" : "Resume"}
            </h3>
            {resumePath ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{user.name}_Resume.pdf</p>
                    <p className="text-[10px] text-muted-foreground">PDF</p>
                  </div>
                  <a href={getStorageUrl(resumePath) || resumePath} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                  </a>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={onResumeDialogOpen}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> {isBn ? "পরিবর্তন করুন" : "Change Resume"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground mb-3">{isBn ? "কোনো রিজুমে নেই" : "No resume uploaded"}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={onResumeDialogOpen}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> {isBn ? "আপলোড করুন" : "Upload Resume"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visibility */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{isBn ? "প্রোফাইল দৃশ্যমানতা" : "Profile Visibility"}</p>
              <p className="text-xs text-muted-foreground">{isPublic ? (isBn ? "নিয়োগকর্তাদের কাছে দৃশ্যমান" : "Visible to employers") : (isBn ? "নিয়োগকর্তাদের কাছে লুকানো" : "Hidden from employers")}</p>
            </div>
          </div>
          <Switch checked={isPublic} onCheckedChange={onToggleVisibility} />
        </CardContent>
      </Card>
    </>
  );
}