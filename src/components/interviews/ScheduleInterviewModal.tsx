"use client";

import React, { useState } from "react";
import { useThemeStore } from "@/store/theme-store";
import { interviewService } from "@/services/interview.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  X, MapPin, Video, Phone, Calendar, Clock, Loader2,
} from "lucide-react";

interface Props {
  application: any;
  onClose: () => void;
  onScheduled: () => void;
}

export default function ScheduleInterviewModal({ application, onClose, onScheduled }: Props) {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "video" as string,
    date: "",
    time: "",
    duration_minutes: 30,
    location: "",
    notes: "",
  });

  const types = [
    { value: "video", label: isBn ? "ভিডিও কল" : "Video Call", icon: Video },
    { value: "in_person", label: isBn ? "ব্যক্তিগত" : "In Person", icon: MapPin },
    { value: "phone", label: isBn ? "ফোন" : "Phone", icon: Phone },
  ];

  const durations = [15, 30, 45, 60, 90];

  const handleSubmit = async () => {
    if (!form.date || !form.time) {
      toast.error(isBn ? "তারিখ এবং সময় আবশ্যক" : "Date and time are required");
      return;
    }

    if (form.type === "in_person" && !form.location.trim()) {
      toast.error(isBn ? "ব্যক্তিগত সাক্ষাৎকারের জন্য ঠিকানা আবশ্যক" : "Location is required for in-person interviews");
      return;
    }

    if (form.type === "video" && !form.location.trim()) {
      toast.error(isBn ? "ভিডিও সাক্ষাৎকারের জন্য ভিডিও লিংক আবশ্যক" : "Video link is required for video interviews");
      return;
    }

    if (form.type === "phone" && !form.location.trim()) {
      toast.error(isBn ? "ফোন সাক্ষাৎকারের জন্য ফোন নম্বর আবশ্যক" : "Phone number is required for phone interviews");
      return;
    }

    setSubmitting(true);
    try {
      await interviewService.scheduleInterview(application.id, {
        type: form.type,
        scheduled_at: `${form.date}T${form.time}:00`,
        duration_minutes: form.duration_minutes,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });
      toast.success(isBn ? "সাক্ষাৎকার নির্ধারিত হয়েছে" : "Interview scheduled successfully");
      onScheduled();
    } catch {
      toast.error(isBn ? "নির্ধারণ ব্যর্থ" : "Failed to schedule interview");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {isBn ? "সাক্ষাৎকার নির্ধারণ করুন" : "Schedule Interview"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {application.user?.name} — {application.job?.title}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interview Type */}
          <div>
            <Label className="text-sm font-medium mb-2 block">{isBn ? "ধরন" : "Type"}</Label>
            <div className="grid grid-cols-3 gap-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-colors ${
                    form.type === t.value
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-700"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">{isBn ? "তারিখ" : "Date"}</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{isBn ? "সময়" : "Time"}</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label className="text-sm font-medium mb-2 block">{isBn ? "সময়কাল" : "Duration"}</Label>
            <div className="flex gap-2 flex-wrap">
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm({ ...form, duration_minutes: d })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    form.duration_minutes === d
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-700"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-medium">
              {form.type === "video" ? (isBn ? "ভিডিও লিংক *" : "Video Link *") :
               form.type === "phone" ? (isBn ? "ফোন নম্বর *" : "Phone Number *") :
               (isBn ? "ঠিকানা *" : "Location *")}
            </Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder={
                form.type === "video" ? "https://meet.google.com/xxx" :
                form.type === "phone" ? "+880 1XXXXXXXXX" :
                isBn ? "ঠিকানা লিখুন" : "Enter location"
              }
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium">{isBn ? "নোট" : "Notes"}</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={isBn ? "প্রার্থীকে জানানো বিষয়..." : "Instructions for the candidate..."}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isBn ? "নির্ধারণ করুন" : "Schedule"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
