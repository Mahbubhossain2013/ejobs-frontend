"use client";

import React, { useState, useRef, useEffect } from "react";
import type { useResumeWizard } from "@/hooks/use-resume-wizard";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, User, Loader2, Sparkles, Shield, MapPin, Phone, Mail, Globe } from "lucide-react";
import { compressToWebp } from "@/components/cv/sections/utils";
import { getStorageUrl } from "@/lib/utils";

const MAX_CHARS = { full_name: 80, email: 80, phone: 30, address: 120, zip_code: 20, city: 50 };
const GENDERS = [
  { val: "Male", en: "Male", bn: "পুরুষ" },
  { val: "Female", en: "Female", bn: "নারী" },
  { val: "Other", en: "Other", bn: "অন্যান্য" },
];
const MARITAL = [
  { val: "Single", en: "Single / Unmarried", bn: "অবিবাহিত" },
  { val: "Married", en: "Married", bn: "বিবাহিত" },
  { val: "Divorced", en: "Divorced", bn: "তালাকপ্রাপ্ত" },
  { val: "Widowed", en: "Widowed", bn: "বিধবা / বিপত্নীক" },
];
const RELIGIONS = [
  { val: "Islam", en: "Islam", bn: "ইসলাম" },
  { val: "Hinduism", en: "Hinduism", bn: "হিন্দু" },
  { val: "Buddhism", en: "Buddhism", bn: "বৌদ্ধ" },
  { val: "Christianity", en: "Christianity", bn: "খ্রিস্টান" },
  { val: "Other", en: "Other", bn: "অন্যান্য" },
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function PersonalStep({
  wizard,
  onNext,
  onPrev,
}: {
  wizard: ReturnType<typeof useResumeWizard>;
  onNext: () => void;
  onPrev?: () => void;
}) {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const { user } = useAuth();
  const { data, updatePersonal } = wizard;
  const p = data.personal;
  const [showMore, setShowMore] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importedRef = useRef(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Auto-import from logged-in profile on mount
  useEffect(() => {
    if (!user || importedRef.current) return;
    importedRef.current = true;

    const updates: Record<string, string> = {};
    if (user.name && !wizard.data.personal.full_name) {
      const parts = user.name.split(" ");
      updates.first_name = parts[0] || "";
      updates.last_name = parts.slice(1).join(" ") || "";
      updates.full_name = user.name;
    }
    if (user.email && !wizard.data.personal.email) {
      updates.email = user.email;
    }

    api.get("/candidate/dashboard").then((res) => {
      const prof = res.data?.user?.profile || {};
      if (!wizard.data.personal.phone && prof.phone) updates.phone = prof.phone;
      if (!wizard.data.personal.city && (prof.city || prof.district)) updates.city = prof.city || prof.district;
      if (!wizard.data.personal.current_position && prof.current_position) updates.current_position = prof.current_position;
      if (!wizard.data.personal.dob && prof.date_of_birth) updates.dob = prof.date_of_birth;
      if (!wizard.data.personal.gender && prof.gender) updates.gender = prof.gender;
      if (!wizard.data.personal.nationality && prof.nationality) updates.nationality = prof.nationality;
      if (!wizard.data.personal.linkedin && prof.linkedin_url) updates.linkedin = prof.linkedin_url;
      if (!wizard.data.personal.github && prof.github_url) updates.github = prof.github_url;
      if (!wizard.data.personal.website && prof.portfolio_url) updates.website = prof.portfolio_url;
      if (!wizard.data.personal.photo_url && (prof.avatar || res.data?.user?.avatar)) {
        updates.photo_url = getStorageUrl(prof.avatar || res.data?.user?.avatar) || "";
      }
      if (!wizard.data.personal.address && (prof.present_address || prof.address)) updates.address = prof.present_address || prof.address;
      if (!(wizard.data.personal as any).permanent_address && prof.permanent_address) updates.permanent_address = prof.permanent_address;
      if (!wizard.data.personal.marital_status && prof.marital_status) updates.marital_status = prof.marital_status;
      if (!(wizard.data.personal as any).father_name && prof.father_name) updates.father_name = prof.father_name;
      if (!(wizard.data.personal as any).mother_name && prof.mother_name) updates.mother_name = prof.mother_name;
      if (!(wizard.data.personal as any).religion && prof.religion) updates.religion = prof.religion;
      if (!(wizard.data.personal as any).blood_group && prof.blood_group) updates.blood_group = prof.blood_group;
      if (!(wizard.data.personal as any).nid && prof.nid) updates.nid = prof.nid;

      if (Object.keys(updates).length > 0) {
        updatePersonal(updates);
      }

      // Auto-populate work experience if wizard has none
      if ((wizard.data.work_experience || []).length === 0 && Array.isArray(prof.experiences) && prof.experiences.length > 0) {
        const mappedExp = prof.experiences.map((exp: any) => ({
          job_title: exp.designation || exp.position || "",
          employer: exp.company_name || exp.company || "",
          employment_type: exp.employment_type || "Full-time",
          city: exp.city || exp.location || "",
          start_date: exp.start_date ? String(exp.start_date).slice(0, 7) : "",
          end_date: exp.end_date ? String(exp.end_date).slice(0, 7) : (exp.is_current ? "Present" : ""),
          is_current: Boolean(exp.is_current),
          description: exp.responsibilities || exp.description || "",
        }));
        wizard.setSectionData("work_experience", mappedExp);
      }

      // Auto-populate education if wizard has none
      if ((wizard.data.education || []).length === 0 && Array.isArray(prof.educations) && prof.educations.length > 0) {
        const mappedEdu = prof.educations.map((edu: any) => ({
          school: edu.institute_name || edu.institution || "",
          degree: edu.degree_name || edu.degree || edu.level || "",
          field_of_study: edu.group_or_subject || edu.field_of_study || "",
          board: edu.board || "",
          grade: edu.gpa_or_cgpa ? String(edu.gpa_or_cgpa) : "",
          city: edu.city || "",
          start_date: edu.start_date || "",
          end_date: edu.passing_year ? String(edu.passing_year) : (edu.end_date || ""),
          description: edu.description || "",
        }));
        wizard.setSectionData("education", mappedEdu);
      }

      // Auto-populate skills if wizard has none
      if ((wizard.data.skills || []).length === 0 && Array.isArray(prof.skills) && prof.skills.length > 0) {
        const mappedSkills = prof.skills.map((s: any) => ({
          skill: typeof s === "string" ? s : (s.skill || s.name || ""),
          level: typeof s === "object" && s.level ? String(s.level) : "80",
        })).filter((s: any) => s.skill.trim().length > 0);
        if (mappedSkills.length > 0) {
          wizard.setSectionData("skills", mappedSkills);
        }
      }

      // Auto-populate objective if empty
      if (!wizard.data.resume_objective?.description && (prof.career_objective || prof.bio || prof.about)) {
        wizard.setSectionData("resume_objective", {
          description: prof.career_objective || prof.bio || prof.about || "",
        });
      }

      // Auto-populate certifications if wizard has none
      if ((wizard.data.certifications || []).length === 0 && Array.isArray(prof.certifications) && prof.certifications.length > 0) {
        const mappedCerts = prof.certifications.map((c: any) => ({
          name: c.name || "",
          issuer: c.organization || c.issuer || "",
          date: c.issue_date || c.date || "",
        }));
        wizard.setSectionData("certifications", mappedCerts);
      }

      // Auto-populate trainings if wizard has none
      if ((wizard.data.training || []).length === 0 && Array.isArray(prof.trainings) && prof.trainings.length > 0) {
        const mappedTrainings = prof.trainings.map((t: any) => ({
          title: t.title || "",
          institute: t.institute_name || t.institute || "",
          duration: t.duration || "",
        }));
        wizard.setSectionData("training", mappedTrainings);
      }
    }).catch(() => {
      if (Object.keys(updates).length > 0) updatePersonal(updates);
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: string, val: string, max?: number) => {
    if (max && val.length > max) return;
    updatePersonal({ [key]: val });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error(isBn ? "শুধুমাত্র ছবি ফাইল অনুমোদিত" : "Only image files allowed"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error(isBn ? "সর্বোচ্চ ১০MB সাইজ অনুমোদিত" : "Max 10MB allowed"); return; }
    setUploadingPhoto(true);
    try {
      const compressed = await compressToWebp(file);

      // Read as base64 Data URL immediately so the photo renders in UI & Live CV preview right away
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (dataUrl) {
          updatePersonal({ photo_url: dataUrl });
          toast.success(isBn ? "ছবি সফলভাবে যুক্ত হয়েছে!" : "Photo added successfully!");
        }

        // Also upload to server if authenticated
        if (user) {
          try {
            const formData = new FormData();
            formData.append("photo", compressed);
            await api.post("/candidate/cv/profile/upload-photo", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch (apiErr: any) {
            console.warn("Server photo upload sync notice:", apiErr);
          }
        }
      };
      reader.readAsDataURL(compressed);
    } catch (err: any) {
      toast.error(isBn ? "ছবি প্রক্রিয়াকরণ ব্যর্থ" : "Photo processing failed");
    } finally {
      setUploadingPhoto(false);
    }
    e.target.value = "";
  };

  const sigInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSig, setUploadingSig] = useState(false);

  const handleSigChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isBn ? "শুধুমাত্র ছবি ফাইল অনুমোদিত" : "Only image files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isBn ? "সর্বোচ্চ ৫MB সাইজ অনুমোদিত" : "Max 5MB allowed");
      return;
    }
    setUploadingSig(true);
    try {
      const compressed = await compressToWebp(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (dataUrl) {
          updatePersonal({ signature_url: dataUrl });
          toast.success(isBn ? "স্বাক্ষর যুক্ত হয়েছে!" : "Signature added successfully!");
        }
      };
      reader.readAsDataURL(compressed);
    } catch {
      toast.error(isBn ? "স্বাক্ষর প্রক্রিয়াকরণ ব্যর্থ" : "Signature processing failed");
    } finally {
      setUploadingSig(false);
    }
    e.target.value = "";
  };

  const photoDisplay = p.photo_url
    ? (p.photo_url.startsWith("http") || p.photo_url.startsWith("blob:") || p.photo_url.startsWith("data:")) ? p.photo_url : getStorageUrl(p.photo_url)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="border-b pb-3">
          <h2 className="text-xl font-bold">{isBn ? "ব্যক্তিগত তথ্যাবলী" : "Personal Details"}</h2>
          <p className="text-sm text-muted-foreground">{isBn ? "আপনার সঠিক ও পেশাদার তথ্য প্রদান করুন" : "Provide your accurate contact & personal information"}</p>
        </div>

        {/* Profile Photo */}
        <div className="flex items-center gap-4 p-3 bg-muted/20 border rounded-xl">
          <button type="button" onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer shrink-0 bg-background">
            {uploadingPhoto ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : photoDisplay ? (
              <img src={photoDisplay} alt="Photo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground/40" />
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <div className="text-sm space-y-1">
            <p className="font-semibold">{isBn ? "প্রোফাইল ছবি যুক্ত করুন" : "Add Profile Photo"}</p>
            <p className="text-muted-foreground text-xs">JPEG/PNG/WebP – max 10MB. (পাসপোর্ট সাইজ ছবি প্রস্তাবিত)</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{isBn ? "প্রথম নাম" : "First Name"} <span className="text-destructive">*</span></Label>
            <div className="relative"><Input value={p.first_name} onChange={(e) => { set("first_name", e.target.value, MAX_CHARS.full_name); set("full_name", (e.target.value + " " + p.last_name).trim()); }} placeholder={isBn ? "নামের প্রথম অংশ" : "John"} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{p.first_name.length}/{MAX_CHARS.full_name}</span></div>
          </div>
          <div className="space-y-1.5">
            <Label>{isBn ? "শেষের নাম" : "Last Name"} <span className="text-destructive">*</span></Label>
            <div className="relative"><Input value={p.last_name} onChange={(e) => { set("last_name", e.target.value, MAX_CHARS.full_name); set("full_name", (p.first_name + " " + e.target.value).trim()); }} placeholder={isBn ? "নামের শেষ অংশ" : "Doe"} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{p.last_name.length}/{MAX_CHARS.full_name}</span></div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{isBn ? "পেশাগত উপাধি / পদবী" : "Professional Title / Designation"}</Label>
          <div className="relative"><Input value={p.current_position} onChange={(e) => set("current_position", e.target.value, 80)} placeholder={isBn ? "যেমন: সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার / মার্কেটিং ম্যানেজার" : "e.g. Senior Software Engineer / Marketing Manager"} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{p.current_position.length}/80</span></div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{isBn ? "ইমেইল ঠিকানা" : "Email Address"} <span className="text-destructive">*</span></Label>
            <div className="relative"><Input type="email" value={p.email} onChange={(e) => set("email", e.target.value, MAX_CHARS.email)} placeholder="example@email.com" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{p.email.length}/{MAX_CHARS.email}</span></div>
          </div>
          <div className="space-y-1.5">
            <Label>{isBn ? "মোবাইল নম্বর" : "Phone Number"} <span className="text-destructive">*</span></Label>
            <div className="relative"><Input type="tel" value={p.phone} onChange={(e) => set("phone", e.target.value, MAX_CHARS.phone)} placeholder="+880 17XXXXXXXX" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{p.phone.length}/{MAX_CHARS.phone}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{isBn ? "বিকল্প ফোন / WhatsApp" : "Alternative Phone / WhatsApp"}</Label>
            <Input type="tel" value={p.alt_phone || ""} onChange={(e) => set("alt_phone", e.target.value, 30)} placeholder="+880 18XXXXXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label>{isBn ? "জাতীয় পরিচয়পত্র (NID) / পাসপোর্ট নং" : "NID / Passport Number"}</Label>
            <Input value={p.nid || ""} onChange={(e) => set("nid", e.target.value, 40)} placeholder="NID / Passport No." />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label>{isBn ? "বর্তমান ঠিকানা" : "Present Address"}</Label>
          <div className="relative"><Input value={p.address} onChange={(e) => set("address", e.target.value, MAX_CHARS.address)} placeholder={isBn ? "বাসা নং, রোড, এলাকা" : "House, Road, Area"} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{p.address.length}/{MAX_CHARS.address}</span></div>
        </div>

        <div className="space-y-1.5">
          <Label>{isBn ? "স্থায়ী ঠিকানা (ঐচ্ছিক)" : "Permanent Address (Optional)"}</Label>
          <Input value={p.permanent_address || ""} onChange={(e) => set("permanent_address", e.target.value, MAX_CHARS.address)} placeholder={isBn ? "গ্রাম/মহল্লা, ডাকঘর, উপজেলা, জেলা" : "Village/Area, Post, Upazila, District"} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{isBn ? "শহর / জেলা" : "City / District"}</Label>
            <div className="relative"><Input value={p.city} onChange={(e) => set("city", e.target.value, MAX_CHARS.city)} placeholder={isBn ? "যেমন: ঢাকা" : "e.g. Dhaka"} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{p.city.length}/{MAX_CHARS.city}</span></div>
          </div>
          <div className="space-y-1.5">
            <Label>{isBn ? "পোস্ট কোড / জিপ কোড" : "Postal / Zip Code"}</Label>
            <div className="relative"><Input value={p.zip_code} onChange={(e) => set("zip_code", e.target.value, MAX_CHARS.zip_code)} placeholder="e.g. 1205" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{p.zip_code.length}/{MAX_CHARS.zip_code}</span></div>
          </div>
        </div>

        {/* Collapsible Additional Details */}
        <div className="border rounded-xl p-4 bg-muted/20 space-y-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowMore(!showMore)}>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {isBn ? "অতিরিক্ত ব্যক্তিগত ও পারিবারিক তথ্য" : "Additional Personal & Family Details"}
            </h3>
            {showMore ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>

          {showMore && (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{isBn ? "পিতার নাম" : "Father's Name"}</Label>
                  <Input value={p.father_name || ""} onChange={(e) => set("father_name", e.target.value, 80)} placeholder={isBn ? "পিতার পূর্ণ নাম" : "Father's Full Name"} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "মাতার নাম" : "Mother's Name"}</Label>
                  <Input value={p.mother_name || ""} onChange={(e) => set("mother_name", e.target.value, 80)} placeholder={isBn ? "মাতার পূর্ণ নাম" : "Mother's Full Name"} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{isBn ? "জন্ম তারিখ" : "Date of Birth"}</Label>
                  <Input type="date" value={p.dob} onChange={(e) => set("dob", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "জন্মস্থান / জেলা" : "Place of Birth"}</Label>
                  <Input value={p.place_of_birth} onChange={(e) => set("place_of_birth", e.target.value, 50)} placeholder={isBn ? "যেমন: ঢাকা, বাংলাদেশ" : "e.g. Dhaka, Bangladesh"} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>{isBn ? "লিঙ্গ" : "Gender"}</Label>
                  <Select value={p.gender || ""} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger><SelectValue placeholder={isBn ? "বাছাই করুন" : "Select"} /></SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => <SelectItem key={g.val} value={g.val}>{isBn ? g.bn : g.en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "বৈবাহিক অবস্থা" : "Marital Status"}</Label>
                  <Select value={p.marital_status || ""} onValueChange={(v) => set("marital_status", v)}>
                    <SelectTrigger><SelectValue placeholder={isBn ? "বাছাই করুন" : "Select"} /></SelectTrigger>
                    <SelectContent>
                      {MARITAL.map((m) => <SelectItem key={m.val} value={m.val}>{isBn ? m.bn : m.en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "ধর্ম" : "Religion"}</Label>
                  <Select value={p.religion || ""} onValueChange={(v) => set("religion", v)}>
                    <SelectTrigger><SelectValue placeholder={isBn ? "বাছাই করুন" : "Select"} /></SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map((r) => <SelectItem key={r.val} value={r.val}>{isBn ? r.bn : r.en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>{isBn ? "রক্তের গ্রুপ" : "Blood Group"}</Label>
                  <Select value={p.blood_group || ""} onValueChange={(v) => set("blood_group", v)}>
                    <SelectTrigger><SelectValue placeholder={isBn ? "বাছাই করুন" : "Select"} /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "জাতীয়তা" : "Nationality"}</Label>
                  <Input value={p.nationality || "Bangladeshi"} onChange={(e) => set("nationality", e.target.value)} placeholder="Bangladeshi" />
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "ড্রাইভিং লাইসেন্স" : "Driving License"}</Label>
                  <Input value={p.driving_license} onChange={(e) => set("driving_license", e.target.value)} placeholder="e.g. Light / Professional" />
                </div>
              </div>

              {/* Social / Portfolio Links */}
              <div className="space-y-3 pt-3 border-t">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">{isBn ? "অনলাইন ও সোশ্যাল লিংক" : "Online & Social Profiles"}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">LinkedIn URL</Label>
                    <Input value={p.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">GitHub / Portfolio</Label>
                    <Input value={p.github} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/..." className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Website / Blog</Label>
                    <Input value={p.website} onChange={(e) => set("website", e.target.value)} placeholder="https://mysite.com" className="h-8 text-sm" />
                  </div>
                </div>
              </div>

              {/* Digital Signature Section */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                      {isBn ? "ডিজিটাল স্বাক্ষর (Signature) - ঐচ্ছিক" : "Digital Signature (Optional)"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isBn 
                        ? "আপনার স্বাক্ষরের ছবি থাকলে আপলোড করুন। আপলোড না করলেও প্রিন্ট করার পর হাতে স্বাক্ষর করার জন্য সিভির নিচে নির্দিষ্ট জায়গা থাকবে।"
                        : "Upload a signature image or leave blank to sign by hand on the printed CV."}
                    </p>
                  </div>
                  {p.signature_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-7 text-xs hover:bg-destructive/10"
                      onClick={() => updatePersonal({ signature_url: "" })}
                    >
                      {isBn ? "স্বাক্ষর মুছুন" : "Remove Signature"}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-4 p-3 border rounded-xl bg-card">
                  {p.signature_url ? (
                    <div className="h-16 px-4 py-2 border rounded-lg bg-background flex items-center justify-center border-dashed border-primary/40">
                      <img
                        src={p.signature_url}
                        alt="Signature"
                        className="max-h-12 max-w-[160px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-36 border border-dashed rounded-lg bg-muted/40 flex flex-col items-center justify-center text-[11px] text-muted-foreground text-center p-1">
                      <span>{isBn ? "কোনো স্বাক্ষর নেই" : "No Signature"}</span>
                      <span className="text-[9px] text-muted-foreground/70">{isBn ? "(হাতে স্বাক্ষর হবে)" : "(Will sign by hand)"}</span>
                    </div>
                  )}

                  <div>
                    <input
                      ref={sigInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSigChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingSig}
                      onClick={() => sigInputRef.current?.click()}
                      className="gap-2 text-xs"
                    >
                      {uploadingSig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      {p.signature_url
                        ? (isBn ? "স্বাক্ষর পরিবর্তন করুন" : "Change Signature")
                        : (isBn ? "স্বাক্ষরের ছবি আপলোড" : "Upload Signature Image")}
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      PNG, JPG, WebP (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          {onPrev && (
            <Button variant="outline" onClick={onPrev} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {isBn ? "পূর্ববর্তী ধাপ (টেমপ্লেট নির্বাচন)" : "Previous (Choose Template)"}
            </Button>
          )}
          <Button
            onClick={() => {
              if (!p.first_name || !p.email || !p.phone) {
                toast.error(isBn ? "অনুগ্রহ করে লাল তারকাচিহ্নিত ফিল্ডগুলো পূরণ করুন" : "Please fill in required fields");
                return;
              }
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
                toast.error(isBn ? "সঠিক ইমেইল দিন" : "Enter a valid email");
                return;
              }
              onNext();
            }}
            className="gap-2"
          >
            {isBn ? "পরবর্তী ধাপ (অভিজ্ঞতা ও শিক্ষা)" : "Next Step (Experiences)"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-2">
        <Card className="sticky top-24 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"><CardContent className="p-5 text-sm text-muted-foreground space-y-3">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Shield className="w-4 h-4 text-primary" />
            <span>{isBn ? "পেশাদার সিভির নির্দেশনা" : "Professional CV Tips"}</span>
          </div>
          <ul className="text-xs space-y-2 list-disc pl-4 text-muted-foreground">
            <li>{isBn ? "পেশাদার ছবি ব্যবহার করুন যা স্পষ্ট এবং ফরমাল।" : "Use a clear, formal passport-style photo."}</li>
            <li>{isBn ? "মোবাইল নম্বর ও ইমেইল সঠিক দিন যাতে নিয়োগকর্তা সরাসরি যোগাযোগ করতে পারেন।" : "Ensure your phone and email are active for recruiter reach."}</li>
            <li>{isBn ? "সব তথ্য পূরণ করা ঐচ্ছিক হলেও যত বেশি তথ্য দিবেন সিভি তত বেশি শক্তিশালী হবে।" : "Adding comprehensive details increases your interview chances."}</li>
          </ul>
        </CardContent></Card>
      </div>
    </div>
  );
}
