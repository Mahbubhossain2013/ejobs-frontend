"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/ui/rich-text-editor"), { ssr: false });

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(50),
  experience_requirements: z.string().optional(),
  education_requirements: z.string().optional(),
  additional_requirements: z.string().optional(),
  salary_min: z.coerce.number().min(0).optional(),
  salary_max: z.coerce.number().min(0).optional(),
  job_type: z.string().min(1),
  experience_level: z.string().optional(),
  location: z.string().optional(),
  deadline: z.string().optional(),
});
type Form = z.input<typeof schema>;

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = isBn ? `চাকরি সম্পাদনা | ${siteName}` : `Edit Job | ${siteName}`;
  }, [isBn, siteName]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api
      .get(`/jobs/${jobId}`)
      .then((res) => {
        const job = res.data.data;
        setValue("title", job.title);
        setValue("description", job.description);
        setValue("experience_requirements", job.experience_requirements || "");
        setValue("education_requirements", job.education_requirements || "");
        setValue("additional_requirements", job.additional_requirements || "");
        setValue("salary_min", job.salary_min);
        setValue("salary_max", job.salary_max);
        setValue("job_type", job.job_type);
        setValue("experience_level", job.experience_level || "");
        setValue("location", job.location || "");
        setValue("deadline", job.deadline ? job.deadline.split("T")[0] : "");
      })
      .catch(() => toast.error("Failed to load job"))
      .finally(() => setLoading(false));
  }, [jobId, setValue]);

  const onSubmit = async (data: Form) => {
    setSaving(true);
    try {
      await api.put(`/employer/jobs/${jobId}`, data);
      toast.success(isBn ? "আপডেট হয়েছে!" : "Job updated!");
      router.push("/employer/manage-jobs");
    } catch {
      toast.error(isBn ? "ব্যর্থ" : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{isBn ? "চাকরি সম্পাদনা" : "Edit Job"}</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>{isBn ? "পদের নাম" : "Job Title"} *</Label>
              <Input {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{isBn ? "বিবরণ" : "Description"} *</Label>
              <RichTextEditor
                value={watch("description") || ""}
                onChange={(val) => setValue("description", val, { shouldValidate: true })}
                placeholder={isBn ? "চাকরির বিস্তারিত বিবরণ..." : "Describe the job in detail..."}
                maxLength={5000}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{isBn ? "অভিজ্ঞতার প্রয়োজনীয়তা" : "Experience Requirements"}</Label>
              <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("experience_requirements")} />
            </div>
            <div className="space-y-2">
              <Label>{isBn ? "শিক্ষাগত যোগ্যতা" : "Education Requirements"}</Label>
              <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("education_requirements")} />
            </div>
            <div className="space-y-2">
              <Label>{isBn ? "অতিরিক্ত প্রয়োজনীয়তা" : "Additional Requirements"}</Label>
              <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("additional_requirements")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isBn ? "সর্বনিম্ন বেতন" : "Min Salary"}</Label>
                <Input type="number" {...register("salary_min")} />
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "সর্বোচ্চ বেতন" : "Max Salary"}</Label>
                <Input type="number" {...register("salary_max")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isBn ? "লোকেশন" : "Location"}</Label>
                <Input {...register("location")} />
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "শেষ তারিখ" : "Deadline"}</Label>
                <Input type="date" {...register("deadline")} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isBn ? "সংরক্ষণ করুন" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
