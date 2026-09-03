"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploading: boolean;
  onUpload: (file: File) => void;
  isBn: boolean;
}

export default function ProfileResumeDialog({ open, onOpenChange, uploading, onUpload, isBn }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isBn ? "রিজুমে নির্বাচন করুন" : "Select Resume"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{isBn ? "নতুন আপলোড করুন" : "Upload New"}</p>
            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full p-4 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors text-center">
              {uploading ? (
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">{isBn ? "PDF ফাইল এখানে টেনে আনুন" : "Drag PDF or click to browse"}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Max 400KB</p>
                </>
              )}
            </button>
          </div>
          <Button variant="link" size="sm" className="w-full" asChild>
            <Link href="/dashboard/resume">{isBn ? "রিজুমে ম্যানেজ করুন" : "Manage Resumes"} →</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}