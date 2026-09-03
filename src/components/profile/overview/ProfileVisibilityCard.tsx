"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Globe, Eye, Edit3 } from "lucide-react";

interface Props {
  isPublic: boolean;
  onToggle: (val: boolean) => void;
  isBn: boolean;
  resumePath: string | null;
  onResumeDialogOpen: () => void;
}

export default function ProfileVisibilityCard({ isPublic, onToggle, isBn, resumePath, onResumeDialogOpen }: Props) {
  return (
    <div className="space-y-4">
      {/* Resume Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">{isBn ? "রিজুমে" : "Resume"}</h2>
          </div>
          {resumePath ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Mehedi_Hasan_Resume.pdf</p>
                  <p className="text-[10px] text-muted-foreground">Updated on 15 May 2024</p>
                </div>
                <a href={`/storage/${resumePath}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></Button>
                </a>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={onResumeDialogOpen}>
                {isBn ? "আপডেট রিজুমে" : "Update Resume"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-3">{isBn ? "কোনো রিজুমে নেই" : "No resume uploaded"}</p>
              <Button variant="outline" size="sm" className="w-full" onClick={onResumeDialogOpen}>
                {isBn ? "আপলোড করুন" : "Upload Resume"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visibility Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isPublic ? <Eye className="h-4 w-4 text-green-500" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
            <div>
              <p className="text-sm font-medium">{isBn ? "প্রোফাইল দৃশ্যমানতা" : "Profile Visibility"}</p>
              <p className="text-xs text-muted-foreground">
                {isPublic ? (isBn ? "নিয়োগকর্তাদের কাছে দৃশ্যমান" : "Your profile is visible to employers") : (isBn ? "নিয়োগকর্তাদের কাছে লুকানো" : "Your profile is hidden from employers")}
              </p>
            </div>
          </div>
          <Switch checked={isPublic} onCheckedChange={onToggle} />
        </CardContent>
      </Card>
    </div>
  );
}