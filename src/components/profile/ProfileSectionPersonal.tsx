"use client";

import React from "react";
import Field from "./Field";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from "lucide-react";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];

interface Props {
  isBn: boolean;
  fullNameBn: string; setFullNameBn: (v: string) => void;
  fullNameEn: string; setFullNameEn: (v: string) => void;
  fatherName: string; setFatherName: (v: string) => void;
  motherName: string; setMotherName: (v: string) => void;
  dob: string; setDob: (v: string) => void;
  gender: string; setGender: (v: string) => void;
  maritalStatus: string; setMaritalStatus: (v: string) => void;
  nationality: string; setNationality: (v: string) => void;
  nationalId: string; setNationalId: (v: string) => void;
  birthRegNo: string; setBirthRegNo: (v: string) => void;
  avatarPreview: string;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileSectionPersonal({
  isBn,
  fullNameBn, setFullNameBn,
  fullNameEn, setFullNameEn,
  fatherName, setFatherName,
  motherName, setMotherName,
  dob, setDob,
  gender, setGender,
  maritalStatus, setMaritalStatus,
  nationality, setNationality,
  nationalId, setNationalId,
  birthRegNo, setBirthRegNo,
  avatarPreview, onAvatarChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="relative">
          <DefaultAvatar src={avatarPreview || null} name={fullNameEn} className="h-20 w-20" />
          <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer">
            <Camera className="h-3.5 w-3.5" />
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={onAvatarChange} />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium">{isBn ? "প্রোফাইল ফটো" : "Profile Photo"}</p>
          <p className="text-xs text-muted-foreground">
            {isBn ? "JPEG/PNG/WebP — সর্বোচ্চ ৪০০KB। স্বয়ংক্রিয়ভাবে WebP-তে সংকুচিত হবে।" : "JPEG/PNG/WebP — max 400KB. Auto-compressed to WebP."}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name (বাংলা)"><Input value={fullNameBn} onChange={(e) => setFullNameBn(e.target.value)} placeholder="বাংলায় পুরো নাম" /></Field>
        <Field label="Full Name (English)" required><Input value={fullNameEn} onChange={(e) => setFullNameEn(e.target.value)} placeholder="Full Name" /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "পিতার নাম" : "Father's Name"}><Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} /></Field>
        <Field label={isBn ? "মাতার নাম" : "Mother's Name"}><Input value={motherName} onChange={(e) => setMotherName(e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={isBn ? "জন্ম তারিখ" : "Date of Birth"}><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></Field>
        <Field label={isBn ? "লিঙ্গ" : "Gender"}>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{GENDER_OPTIONS.map((g) => <SelectItem key={g} value={g.toLowerCase()}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label={isBn ? "বৈবাহিক অবস্থা" : "Marital Status"}>
          <Select value={maritalStatus} onValueChange={setMaritalStatus}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{MARITAL_STATUS.map((s) => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={isBn ? "জাতীয়তা" : "Nationality"}><Input value={nationality} onChange={(e) => setNationality(e.target.value)} /></Field>
        <Field label={isBn ? "জাতীয় পরিচয়পত্র" : "National ID (Optional)"}><Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} /></Field>
        <Field label={isBn ? "জন্ম নিবন্ধন নম্বর" : "Birth Reg No (Optional)"}><Input value={birthRegNo} onChange={(e) => setBirthRegNo(e.target.value)} /></Field>
      </div>
    </div>
  );
}