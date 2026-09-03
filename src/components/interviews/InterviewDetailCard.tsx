"use client";

import React from "react";
import { useThemeStore } from "@/store/theme-store";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Clock, MapPin, Video, Phone, CheckCircle,
  XCircle, AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  interview: any;
}

export default function InterviewDetailCard({ interview }: Props) {
  const { language } = useThemeStore();
  const isBn = language === "bn";

  const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
    video: { icon: Video, label: isBn ? "ভিডিও কল" : "Video Call", color: "text-blue-600" },
    in_person: { icon: MapPin, label: isBn ? "ব্যক্তিগত" : "In Person", color: "text-green-600" },
    phone: { icon: Phone, label: isBn ? "ফোন" : "Phone", color: "text-amber-600" },
  };

  const responseConfig: Record<string, { icon: any; label: string; color: string }> = {
    pending: { icon: Clock, label: isBn ? "অপেক্ষমান" : "Pending", color: "bg-amber-100 text-amber-700" },
    accepted: { icon: CheckCircle, label: isBn ? "গৃহীত" : "Accepted", color: "bg-green-100 text-green-700" },
    declined: { icon: XCircle, label: isBn ? "প্রত্যাখ্যাত" : "Declined", color: "bg-red-100 text-red-700" },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    scheduled: { label: isBn ? "নির্ধারিত" : "Scheduled", color: "bg-blue-100 text-blue-700" },
    completed: { label: isBn ? "সম্পন্ন" : "Completed", color: "bg-green-100 text-green-700" },
    cancelled: { label: isBn ? "বাতিল" : "Cancelled", color: "bg-red-100 text-red-700" },
    no_show: { label: isBn ? "উপস্থিত হয়নি" : "No Show", color: "bg-orange-100 text-orange-700" },
  };

  const type = typeConfig[interview.type] || typeConfig.video;
  const response = responseConfig[interview.candidate_response] || responseConfig.pending;
  const status = statusConfig[interview.status] || statusConfig.scheduled;
  const TypeIcon = type.icon;
  const ResponseIcon = response.icon;

  const scheduledDate = new Date(interview.scheduled_at);

  return (
    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypeIcon className={`h-5 w-5 ${type.color}`} />
          <span className="font-semibold text-sm">{type.label}</span>
        </div>
        <div className="flex gap-2">
          <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
          <Badge className={`text-xs ${response.color}`}>
            <ResponseIcon className="h-3 w-3 mr-1" />
            {response.label}
          </Badge>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{scheduledDate.toLocaleDateString(isBn ? "bn-BD" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{scheduledDate.toLocaleTimeString(isBn ? "bn-BD" : "en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="text-muted-foreground">({interview.duration_minutes} min)</span>
        </div>
      </div>

      {/* Location */}
      {interview.location && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {interview.type === "video" ? (
            <a href={interview.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {interview.location}
            </a>
          ) : (
            <span>{interview.location}</span>
          )}
        </div>
      )}

      {/* Notes */}
      {interview.notes && (
        <div className="text-sm text-muted-foreground bg-white/50 dark:bg-white/5 rounded-lg p-3">
          <p className="font-medium text-foreground mb-1">{isBn ? "নোট" : "Notes"}:</p>
          <p>{interview.notes}</p>
        </div>
      )}

      {/* Candidate Response Note */}
      {interview.candidate_note && (
        <div className="text-sm bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
          <p className="font-medium text-green-700 dark:text-green-400 mb-1">
            {isBn ? "প্রার্থীর উত্তর" : "Candidate's Response"}:
          </p>
          <p className="text-green-600 dark:text-green-300">{interview.candidate_note}</p>
        </div>
      )}

      {/* Outcome */}
      {interview.outcome && (
        <div className="text-sm bg-muted rounded-lg p-3">
          <p className="font-medium mb-1">{isBn ? "ফলাফল" : "Outcome"}:</p>
          <p className="text-muted-foreground">{interview.outcome}</p>
        </div>
      )}
    </div>
  );
}
