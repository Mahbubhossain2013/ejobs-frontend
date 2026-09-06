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

    const p = wizard.data.personal;
    if (p.first_name && p.email) return;

    const updates: Record<string, string> = {};
    if (user.name) {
      const parts = user.name.split(" ");
      updates.first_name = parts[0] || "";
      updates.last_name = parts.slice(1).join(" ") || "";
      updates.full_name = user.name;
    }
    if (user.email) updates.email = user.email;

    api.get("/candidate/dashboard").then((res) => {
      const prof = res.data?.user?.profile || {};
      if (prof.phone) updates.phone = prof.phone;
      if (prof.city) updates.city = prof.city;
      if (prof.current_position) updates.current_position = prof.current_position;
      if (prof.date_of_birth) updates.dob = prof.date_of_birth;
      if (prof.gender) updates.gender = prof.gender;
      if (prof.nationality) updates.nationality = prof.nationality;
      if (prof.linkedin_url) updates.linkedin = prof.linkedin_url;
      if (prof.github_url) updates.github = prof.github_url;
      if (prof.avatar) updates.photo_url = getStorageUrl(prof.avatar) || "";
      if (prof.present_address || prof.address) updates.address = prof.present_address || prof.address;
      if (prof.permanent_address) updates.permanent_address = prof.permanent_address;
      if (prof.marital_status) updates.marital_status = prof.marital_status;
      if (prof.father_name) updates.father_name = prof.father_name;
      if (prof.mother_name) updates.mother_name = prof.mother_name;
      if (prof.religion) updates.religion = prof.religion;
      if (prof.blood_group) updates.blood_group = prof.blood_group;
      if (prof.nid) updates.nid = prof.nid;
      updatePersonal(updates);
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

      // Check if user is logged in
      const hasAuth = !!user;

      if (hasAuth) {
        try {
          const formData = new FormData();
          formData.append("photo", compressed);
          const res = await api.post("/candidate/cv/profile/upload-photo", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const photoUrl = res.data?.data?.photo_url || res.data?.photo_url;
          if (photoUrl) {
            updatePersonal({ photo_url: photoUrl });
            toast.success(isBn ? "ছবি সফলভাবে আপলোড হয়েছে!" : "Photo uploaded successfully!");
            return;
          }
        } catch (apiErr: any) {
          // If 401 unauthenticated, continue to local FileReader fallback smoothly
          if (apiErr?.response?.status !== 401) {
            console.warn("API photo upload failed, using local preview", apiErr);
          }
        }
      }

      // Guest / Offline / Fallback: Read as base64 Data URL so the photo renders in CV preview immediately
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (dataUrl) {
          updatePersonal({ photo_url: dataUrl });
          toast.success(isBn ? "ছবি যুক্ত করা হয়েছে!" : "Photo added successfully!");
        }
      };
      reader.readAsDataURL(compressed);
    } catch (err: any) {
      toast.error(isBn ? "ছবি প্রক্রিয়াকরণ ব্যর্থ" : "Photo processing failed");
    } finally {
      setUploadingPhoto(false);
    }
    e.target.value = "";
  };

  const photoDisplay = p.photo_url
    ? (p.photo_url.startsWith("http") || p.photo_url.startsWith("blob:")) ? p.photo_url : getStorageUrl(p.photo_url)
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
