"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { JobApplication } from "@/types";
import { candidateLabel } from "./applicants-utils";

interface Props {
  app: JobApplication | null;
  isBn: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: string) => Promise<void>;
}

const STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "hired"];

export function StatusChangeDialog({ app, isBn, onOpenChange, onStatusChange }: Props) {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  if (!app) return null;

  const handleClick = async (s: string) => {
    if (pendingStatus) return;
    setPendingStatus(s);
    try {
      await onStatusChange(s);
    } finally {
      setPendingStatus(null);
    }
  };

  return (
    <Dialog open={!!app} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isBn ? "স্ট্যাটাস পরিবর্তন করুন" : "Change Applicant Status"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {candidateLabel(app)} — {app.job?.title || "Job"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => (
              <Button
                key={s}
                variant={app.status === s ? "default" : "outline"}
                size="sm"
                className="capitalize"
                disabled={!!pendingStatus}
                onClick={() => handleClick(s)}
              >
                {pendingStatus === s ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  s
                )}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}