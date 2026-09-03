"use client";

import React, { useState, useEffect } from "react";
import {
  useJobAlerts,
  useCreateJobAlert,
  useUpdateJobAlert,
  useDeleteJobAlert,
  useToggleJobAlert,
} from "@/hooks/use-job-alerts";
import type { JobAlert, JobAlertFormData } from "@/services/job-alerts.service";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  DollarSign,
  Briefcase,
  Globe,
  Clock,
  AlertCircle,
  Loader2,
  Search,
  X,
  Zap,
} from "lucide-react";
import api from "@/lib/api-client";

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

const FREQUENCIES = [
  { value: "instant", label: "Instant", icon: Zap, desc: "Get notified as soon as a match is posted" },
  { value: "daily", label: "Daily", icon: Clock, desc: "Receive a daily digest at 9:00 AM" },
  { value: "weekly", label: "Weekly", icon: Clock, desc: "Receive a weekly digest every Monday" },
];

const EMPTY_FORM: JobAlertFormData = {
  label: "",
  keywords: "",
  category_id: undefined,
  job_type: "",
  location: "",
  salary_min: undefined,
  salary_max: undefined,
  is_remote: undefined,
  frequency: "daily",
};

export default function JobAlertsPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";

  const { data: alerts, isLoading, isError } = useJobAlerts();
  const createMutation = useCreateJobAlert();
  const updateMutation = useUpdateJobAlert();
  const deleteMutation = useDeleteJobAlert();
  const toggleMutation = useToggleJobAlert();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [form, setForm] = useState<JobAlertFormData>(EMPTY_FORM);
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data?.data || [])).catch(() => {});
  }, []);

  const openCreateDialog = () => {
    setEditingAlert(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (alert: JobAlert) => {
    setEditingAlert(alert);
    setForm({
      label: alert.label || "",
      keywords: alert.keywords || "",
      category_id: alert.category_id || undefined,
      job_type: alert.job_type || "",
      location: alert.location || "",
      salary_min: alert.salary_min || undefined,
      salary_max: alert.salary_max || undefined,
      is_remote: alert.is_remote ?? undefined,
      frequency: alert.frequency,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = { ...form };
    if (!payload.label) delete payload.label;
    if (!payload.keywords) delete payload.keywords;
    if (!payload.category_id) delete payload.category_id;
    if (!payload.job_type) delete payload.job_type;
    if (!payload.location) delete payload.location;
    if (!payload.salary_min) delete payload.salary_min;
    if (!payload.salary_max) delete payload.salary_max;
    if (payload.is_remote === undefined) delete payload.is_remote;

    if (editingAlert) {
      updateMutation.mutate(
        { id: editingAlert.id, data: payload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, { onSuccess: () => setDeleteConfirmId(null) });
  };

  const activeFilters = (alert: JobAlert) => {
    const filters: string[] = [];
    if (alert.keywords) filters.push(alert.keywords);
    if (alert.category?.name) filters.push(alert.category.name);
    if (alert.job_type) filters.push(alert.job_type);
    if (alert.location) filters.push(alert.location);
    if (alert.salary_min || alert.salary_max) {
      const min = alert.salary_min ? `${alert.salary_min}` : "0";
      const max = alert.salary_max ? `${alert.salary_max}` : "∞";
      filters.push(`৳${min}–${max}`);
    }
    if (alert.is_remote) filters.push(isBn ? "রিমোট" : "Remote");
    return filters;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            {isBn ? "চাকরি এলার্ট" : "Job Alerts"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBn
              ? "নতুন চাকরি ম্যাচ হলে নোটিফিকেশন পান"
              : "Get notified when new jobs match your preferences"}
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          {isBn ? "নতুন এলার্ট" : "New Alert"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isBn ? "ত্রুটি হয়েছে" : "Something went wrong"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isBn ? "এলার্ট লোড করা যায়নি" : "Failed to load job alerts"}
          </p>
        </div>
      ) : !alerts?.length ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isBn ? "কোনো এলার্ট নেই" : "No job alerts yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {isBn
              ? "আপনার পছন্দের চাকরি খুঁজে এলার্ট সেট করুন"
              : "Create an alert to get notified about matching jobs"}
          </p>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {isBn ? "এলার্ট তৈরি করুন" : "Create Alert"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {alert.label || alert.keywords || (isBn ? "সাধারণ এলার্ট" : "General Alert")}
                      </h3>
                      <Badge
                        variant={alert.frequency === "instant" ? "default" : "secondary"}
                        className="text-xs gap-1 shrink-0"
                      >
                        {alert.frequency === "instant" && <Zap className="h-3 w-3" />}
                        {FREQUENCIES.find((f) => f.value === alert.frequency)?.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {activeFilters(alert).map((filter, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {filter}
                        </Badge>
                      ))}
                      {activeFilters(alert).length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          {isBn ? "সব চাকরি" : "All jobs"}
                        </span>
                      )}
                    </div>
                    {alert.last_sent_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {isBn ? "শেষ পাঠানো:" : "Last sent:"}{" "}
                        {new Date(alert.last_sent_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={() => toggleMutation.mutate(alert.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(alert)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(alert.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAlert
                ? isBn ? "এলার্ট এডিট করুন" : "Edit Alert"
                : isBn ? "নতুন এলার্ট তৈরি করুন" : "Create Job Alert"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{isBn ? "এলার্টের নাম" : "Alert Name"} ({isBn ? "ঐচ্ছিক" : "optional"})</Label>
              <Input
                placeholder={isBn ? "যেমন: ঢাকায় ফুল-টাইম ডেভেলপার" : "e.g. Full-time Developer in Dhaka"}
                value={form.label || ""}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{isBn ? "কীওয়ার্ড" : "Keywords"} ({isBn ? "ঐচ্ছিক" : "optional"})</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder={isBn ? "যেমন: React, Laravel, Designer" : "e.g. React, Laravel, Designer"}
                  value={form.keywords || ""}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isBn ? "ক্যাটাগরি" : "Category"}</Label>
                <Select
                  value={form.category_id?.toString() || "all"}
                  onValueChange={(v) =>
                    setForm({ ...form, category_id: v === "all" ? undefined : Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? "সব ক্যাটাগরি" : "All Categories"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isBn ? "সব ক্যাটাগরি" : "All Categories"}</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{isBn ? "চাকরির ধরন" : "Job Type"}</Label>
                <Select
                  value={form.job_type || "all"}
                  onValueChange={(v) =>
                    setForm({ ...form, job_type: v === "all" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? "সব ধরন" : "All Types"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isBn ? "সব ধরন" : "All Types"}</SelectItem>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isBn ? "লোকেশন" : "Location"} ({isBn ? "ঐচ্ছিক" : "optional"})</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder={isBn ? "যেমন: ঢাকা, চট্টগ্রাম" : "e.g. Dhaka, Chattogram"}
                  value={form.location || ""}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isBn ? "সর্বনিম্ন বেতন" : "Min Salary (BDT)"}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.salary_min || ""}
                    onChange={(e) =>
                      setForm({ ...form, salary_min: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "সর্বোচ্চ বেতন" : "Max Salary (BDT)"}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="number"
                    min="0"
                    placeholder={isBn ? "অসীমিত" : "Unlimited"}
                    value={form.salary_max || ""}
                    onChange={(e) =>
                      setForm({ ...form, salary_max: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_remote === true}
                onCheckedChange={(v) => setForm({ ...form, is_remote: v ? true : undefined })}
              />
              <Label className="flex items-center gap-1.5 cursor-pointer">
                <Globe className="h-4 w-4" />
                {isBn ? "শুধু রিমোট চাকরি" : "Remote jobs only"}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>{isBn ? "নোটিফিকেশন ফ্রিকোয়েন্সি" : "Notification Frequency"}</Label>
              <div className="grid grid-cols-3 gap-2">
                {FREQUENCIES.map((freq) => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setForm({ ...form, frequency: freq.value as any })}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      form.frequency === freq.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <freq.icon className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-sm font-medium">{freq.label}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      {freq.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingAlert
                ? isBn ? "আপডেট করুন" : "Update Alert"
                : isBn ? "এলার্ট তৈরি করুন" : "Create Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isBn ? "এলার্ট মুছুন?" : "Delete Alert?"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isBn
              ? "এই এলার্টটি স্থায়ীভাবে মুছে ফেলা হবে।"
              : "This alert will be permanently deleted."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isBn ? "মুছুন" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
