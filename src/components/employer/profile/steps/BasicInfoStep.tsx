"use client";

import React from "react";
import { Camera, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { Field, TextInput, SelectInput } from "../shared";
import { COMPANY_TYPES, COMPANY_SIZES, type ProfileState } from "../types";

export default function BasicInfoStep({ state, isBn }: { state: ProfileState; isBn: boolean }) {
  const s = state;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="relative">
          <DefaultAvatar name={s.companyName || "C"} src={s.logoPreview} className="h-20 w-20 text-lg" />
          <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer">
            <Camera className="h-3.5 w-3.5" />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { s.setLogoFile(f); s.setLogoPreview(URL.createObjectURL(f)); } }} />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium">{isBn ? "কোম্পানি লোগো" : "Company Logo"}</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, max 400KB</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-1">{isBn ? "কোভার ফোটো" : "Cover Photo"}</p>
        {s.coverPreview && <img src={s.coverPreview} alt="Cover" className="w-full h-32 object-cover rounded-lg mb-2" />}
        <label>
          <Button size="sm" variant="outline" asChild><span><Upload className="h-4 w-4 mr-1" /> {isBn ? "কোভার আপলোড করুন" : "Upload Cover"}</span></Button>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { s.setCoverFile(f); s.setCoverPreview(URL.createObjectURL(f)); } }} />
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "কোম্পানির নাম (English)" : "Company Name (English)"} required>
          <TextInput value={s.companyName} onChange={s.setCompanyName} />
        </Field>
        <Field label={isBn ? "কোম্পানির নাম (বাংলা)" : "Company Name (বাংলা)"}>
          <TextInput value={s.companyNameBn} onChange={s.setCompanyNameBn} placeholder="বাংলায় নাম" />
        </Field>
      </div>
      <Field label={isBn ? "ট্যাগলাইন" : "Tagline"}>
        <TextInput value={s.tagline} onChange={s.setTagline} placeholder="e.g. Building the future" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "কোম্পানির ধরন" : "Company Type"}>
          <SelectInput value={s.companyType} onChange={s.setCompanyType} options={COMPANY_TYPES.map((t) => ({ value: t, label: t }))} />
        </Field>
        <Field label={isBn ? "শিল্পের ধরন" : "Industry"} required>
          <TextInput value={s.industry} onChange={s.setIndustry} placeholder="e.g. Technology" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={isBn ? "ব্যবসায়িক নিবন্ধন" : "Business Reg No."}>
          <TextInput value={s.businessRegNo} onChange={s.setBusinessRegNo} />
        </Field>
        <Field label={isBn ? "ট্রেড লাইসেন্স" : "Trade License No."}>
          <TextInput value={s.tradeLicenseNo} onChange={s.setTradeLicenseNo} />
        </Field>
        <Field label={isBn ? "প্রতিষ্ঠার বছর" : "Year Founded"}>
          <TextInput type="number" value={s.foundedYear} onChange={s.setFoundedYear} placeholder="YYYY" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "কোম্পানির সাইজ" : "Company Size"}>
          <SelectInput value={s.companySize} onChange={s.setCompanySize} options={COMPANY_SIZES.map((v) => ({ value: v, label: v }))} />
        </Field>
        <Field label={isBn ? "কর্মী সংখ্যা" : "Employee Count"}>
          <TextInput type="number" value={s.employeeCount} onChange={s.setEmployeeCount} />
        </Field>
      </div>
      <Field label={isBn ? "কোম্পানি বিবরণ" : "Description"} required>
        <Textarea value={s.description} onChange={(e) => s.setDescription(e.target.value)} rows={4} placeholder="Tell candidates about your company..." />
      </Field>
    </div>
  );
}