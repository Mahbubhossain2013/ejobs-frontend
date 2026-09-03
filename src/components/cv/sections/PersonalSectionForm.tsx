"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { toSafeStrings, compressToWebp, uploadPhoto } from "./utils";
import { getStorageUrl } from "@/lib/utils";

export default function PersonalSectionForm({ data, onChange, isBn }: { data: Record<string, any>; onChange: (d: any) => void; isBn: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isBn ? "শুধুমাত্র ছবি অনুমোদিত" : "Only image files are allowed");
      e.target.value = ""; return;
    }
    setUploading(true);
    try {
      const compressed = await compressToWebp(file);
      toast.info(`${isBn ? "সংকুচিত" : "Compressed"}: ${(compressed.size / 1024).toFixed(0)}KB`);
      const photoUrl = await uploadPhoto(compressed, isBn);
      onChange(toSafeStrings({ ...data, photo_url: photoUrl }));
      toast.success(isBn ? "ছবি আপলোড হয়েছে!" : "Photo uploaded!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || (isBn ? "আপলোড ব্যর্থ" : "Upload failed"));
    } finally { setUploading(false); }
    e.target.value = "";
  };

  const photoUrl = getStorageUrl(data.photo_url);

  const field = (en: string, bn: string, key: string, type = "text", placeholder?: string, validate?: (v: string) => string | null) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{isBn ? bn : en}</Label>
      <Input type={type} value={data[key] || ""} onChange={(e) => { onChange(toSafeStrings({ ...data, [key]: e.target.value })); if (validate) setFieldErrors((p) => ({ ...p, [key]: validate(e.target.value) || "" })); }} placeholder={placeholder || (isBn ? bn : en)} className="h-9 text-sm" />
      {fieldErrors[key] && <p className="text-xs text-destructive h-4">{fieldErrors[key]}</p>}
    </div>
  );

  const selectField = (en: string, bn: string, key: string, options: { value: string; label_en: string; label_bn: string }[]) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{isBn ? bn : en}</Label>
      <Select value={data[key] || ""} onValueChange={(v) => onChange(toSafeStrings({ ...data, [key]: v }))}>
        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={isBn ? bn : en} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{isBn ? o.label_bn : o.label_en}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30 shrink-0">
          {photoUrl ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" /> : <User className="h-8 w-8 text-muted-foreground/50" />}
        </div>
        <div className="flex-1 min-w-0">
          <Label className="text-xs font-medium">{isBn ? "প্রোফাইল ছবি" : "Profile Photo"}</Label>
          <Input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="h-8 text-sm mt-1" />
          {uploading && <p className="text-xs text-muted-foreground mt-1">{isBn ? "আপলোড হচ্ছে..." : "Compressing & uploading..."}</p>}
        </div>
      </div>
      {field("Full Name", "পূর্ণ নাম", "full_name", "text", isBn ? "আপনার পূর্ণ নাম" : "John Doe")}
      {field("Professional Title", "পেশাদার উপাধি", "title", "text", isBn ? "যেমন: সফটওয়্যার ইঞ্জিনিয়ার" : "e.g. Software Engineer")}
      {field("Email", "ইমেইল", "email", "email", isBn ? "আপনা@উদাহরণ.com" : "you@example.com", (v) => v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? (isBn ? "সঠিক ইমেইল দিন" : "Invalid email") : null)}
      {field("Phone", "ফোন", "phone", "tel", isBn ? "০১XXXXXXXXX" : "01XXXXXXXXX", (v) => v.trim() && !/^[+]?[\d\s()-]{7,20}$/.test(v) ? (isBn ? "সঠিক ফোন" : "Invalid phone") : null)}
      {field("Location", "অবস্থান", "location", "text", isBn ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh")}
      {field("Address", "ঠিকানা", "address", "text", isBn ? "পুরো ঠিকানা" : "Full address")}
      {field("Website", "ওয়েবসাইট", "website", "url", "https://...", (v) => v.trim() && !/^https?:\/\//i.test(v) ? (isBn ? "https:// দিয়ে শুরু করুন" : "Must start with http(s)") : null)}
      {field("LinkedIn", "LinkedIn", "linkedin", "url", "https://linkedin.com/in/...", (v) => v.trim() && !/^https?:\/\//i.test(v) ? (isBn ? "https:// দিয়ে শুরু করুন" : "Must start with http(s)") : null)}
      {field("Date of Birth", "জন্ম তারিখ", "date_of_birth", "date")}
      {selectField("Gender", "লিঙ্গ", "gender", [
        { value: "male", label_en: "Male", label_bn: "পুরুষ" },
        { value: "female", label_en: "Female", label_bn: "নারী" },
        { value: "other", label_en: "Other", label_bn: "অন্যান্য" },
      ])}
      {selectField("Marital Status", "বৈবাহিক অবস্থা", "marital_status", [
        { value: "unmarried", label_en: "Unmarried", label_bn: "অবিবাহিত" },
        { value: "married", label_en: "Married", label_bn: "বিবাহিত" },
        { value: "divorced", label_en: "Divorced", label_bn: "বিবাহবিচ্ছেদ" },
        { value: "widowed", label_en: "Widowed", label_bn: "বিধবা" },
      ])}
      {field("Father's Name", "পিতার নাম", "father_name", "text", isBn ? "পিতার নাম" : "Father's name")}
      {field("Mother's Name", "মাতার নাম", "mother_name", "text", isBn ? "মাতার নাম" : "Mother's name")}
      {field("Religion", "ধর্ম", "religion", "text", isBn ? "যেমন: ইসলাম" : "e.g. Islam")}
      {selectField("Blood Group", "রক্তের গ্রুপ", "blood_group", [
        { value: "A+", label_en: "A+", label_bn: "A+" },
        { value: "A-", label_en: "A-", label_bn: "A-" },
        { value: "B+", label_en: "B+", label_bn: "B+" },
        { value: "B-", label_en: "B-", label_bn: "B-" },
        { value: "AB+", label_en: "AB+", label_bn: "AB+" },
        { value: "AB-", label_en: "AB-", label_bn: "AB-" },
        { value: "O+", label_en: "O+", label_bn: "O+" },
        { value: "O-", label_en: "O-", label_bn: "O-" },
      ])}
      {field("Nationality", "জাতীয়তা", "nationality", "text", isBn ? "বাংলাদেশী" : "Bangladeshi")}
      {field("Postal Code", "পোস্টাল কোড", "postal_code", "text", isBn ? "১০০০" : "1000")}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{isBn ? "সারসংক্ষেপ" : "Summary"}</Label>
        <Textarea value={data.summary || ""} onChange={(e) => onChange(toSafeStrings({ ...data, summary: e.target.value }))} placeholder={isBn ? "পেশাদার সারসংক্ষেপ..." : "Professional summary..."} className="min-h-[100px] text-sm" />
      </div>
    </div>
  );
}