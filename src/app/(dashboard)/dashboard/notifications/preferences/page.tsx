"use client";

import React, { useEffect, useState } from "react";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Save, Mail, MessageSquare, Briefcase, Send, Megaphone } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "notification_preferences";

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  jobAlerts: boolean;
  applicationUpdates: boolean;
  marketingEmails: boolean;
}

const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  smsNotifications: false,
  jobAlerts: true,
  applicationUpdates: true,
  marketingEmails: false,
};

export default function NotificationPreferencesPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [savedPreferences, setSavedPreferences] = useState<NotificationPreferences>(defaultPreferences);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as NotificationPreferences;
        setPreferences(parsed);
        setSavedPreferences(parsed);
      }
    } catch {
      // Use defaults if parsing fails
    }
    setLoading(false);
  }, []);

  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setSavedPreferences({ ...preferences });
      toast.success(
        isBn
          ? "নোটিফিকেশন পছন্দ সফলভাবে সংরক্ষিত হয়েছে"
          : "Notification preferences saved successfully"
      );
    } catch {
      toast.error(
        isBn
          ? "সংরক্ষণ করতে ব্যর্থ হয়েছে"
          : "Failed to save preferences"
      );
    } finally {
      setSaving(false);
    }
  };

  const preferenceItems: {
    key: keyof NotificationPreferences;
    icon: React.ElementType;
    titleEn: string;
    titleBn: string;
    descriptionEn: string;
    descriptionBn: string;
  }[] = [
    {
      key: "emailNotifications",
      icon: Mail,
      titleEn: "Email Notifications",
      titleBn: "ইমেইল নোটিফিকেশন",
      descriptionEn: "Receive notifications via email",
      descriptionBn: "ইমেইলের মাধ্যমে নোটিফিকেশন পান",
    },
    {
      key: "smsNotifications",
      icon: MessageSquare,
      titleEn: "SMS Notifications",
      titleBn: "এসএমএস নোটিফিকেশন",
      descriptionEn: "Receive notifications via SMS",
      descriptionBn: "এসএমএসের মাধ্যমে নোটিফিকেশন পান",
    },
    {
      key: "jobAlerts",
      icon: Briefcase,
      titleEn: "Job Alerts",
      titleBn: "জব এলার্ট",
      descriptionEn: "Get notified about new job opportunities",
      descriptionBn: "নতুন চাকরির সুযোগ সম্পর্কে নোটিফিকেশন পান",
    },
    {
      key: "applicationUpdates",
      icon: Send,
      titleEn: "Application Updates",
      titleBn: "আবেদন আপডেট",
      descriptionEn: "Updates on your job applications",
      descriptionBn: "আপনার চাকরির আবেদনের আপডেট",
    },
    {
      key: "marketingEmails",
      icon: Megaphone,
      titleEn: "Marketing Emails",
      titleBn: "মার্কেটিং ইমেইল",
      descriptionEn: "Tips, offers, and platform updates",
      descriptionBn: "টিপস, অফার এবং প্ল্যাটফর্ম আপডেট",
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">
          {isBn ? "নোটিফিকেশন পছন্দ" : "Notification Preferences"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isBn
            ? "আপনি কীভাবে নোটিফিকেশন পেতে চান তা পরিচালনা করুন"
            : "Manage how you receive notifications"}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? "চ্যানেল" : "Channels"}</CardTitle>
              <CardDescription>
                {isBn
                  ? "নোটিফিকেশন পাওয়ার পদ্ধতি নির্বাচন করুন"
                  : "Choose how you want to receive notifications"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {preferenceItems.slice(0, 2).map((item) => (
                <React.Fragment key={item.key}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isBn ? item.titleBn : item.titleEn}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isBn ? item.descriptionBn : item.descriptionEn}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences[item.key]}
                      onCheckedChange={() => handleToggle(item.key)}
                    />
                  </div>
                  <Separator />
                </React.Fragment>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isBn ? "বিষয়বস্তু" : "Content"}</CardTitle>
              <CardDescription>
                {isBn
                  ? "কোন ধরনের নোটিফিকেশন পেতে চান তা নির্বাচন করুন"
                  : "Select which types of notifications you want to receive"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {preferenceItems.slice(2).map((item) => (
                <React.Fragment key={item.key}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isBn ? item.titleBn : item.titleEn}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isBn ? item.descriptionBn : item.descriptionEn}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences[item.key]}
                      onCheckedChange={() => handleToggle(item.key)}
                    />
                  </div>
                  <Separator />
                </React.Fragment>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {hasChanges ? (
                <Badge variant="warning">
                  {isBn ? "অসংরক্ষিত পরিবর্তন" : "Unsaved changes"}
                </Badge>
              ) : (
                <Badge variant="success">
                  {isBn ? "সংরক্ষিত" : "Saved"}
                </Badge>
              )}
            </p>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving
                ? isBn
                  ? "সংরক্ষণ হচ্ছে..."
                  : "Saving..."
                : isBn
                  ? "সংরক্ষণ করুন"
                  : "Save Preferences"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
