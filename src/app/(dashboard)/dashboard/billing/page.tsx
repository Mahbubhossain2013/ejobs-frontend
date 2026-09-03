"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Receipt, Save, Building2, MapPin, Phone, Mail } from "lucide-react";

interface BillingProfile {
  company_name: string;
  vat_number: string;
  billing_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
  phone: string;
  email: string;
  [key: string]: any;
}

const emptyProfile: BillingProfile = {
  company_name: "",
  vat_number: "",
  billing_name: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country_code: "",
  phone: "",
  email: "",
};

export default function BillingPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<BillingProfile>(emptyProfile);

  useEffect(() => {
    api
      .get("/billing/profile")
      .then((res) => {
        if (res.data.status && res.data.data) {
          setProfile({
            company_name: res.data.data.company_name || "",
            vat_number: res.data.data.vat_number || "",
            billing_name: res.data.data.billing_name || "",
            address_line_1: res.data.data.address_line_1 || "",
            address_line_2: res.data.data.address_line_2 || "",
            city: res.data.data.city || "",
            state: res.data.data.state || "",
            postal_code: res.data.data.postal_code || "",
            country_code: res.data.data.country_code || "",
            phone: res.data.data.phone || "",
            email: res.data.data.email || "",
          });
        }
      })
      .catch(() => {
        toast.error(isBn ? "বিলিং প্রোফাইল লোড করতে ব্যর্থ হয়েছে" : "Failed to load billing profile");
      })
      .finally(() => setLoading(false));
  }, [isBn]);

  const handleChange = (field: keyof BillingProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post("/billing/profile", profile);
      if (res.data.status) {
        toast.success(res.data.message || (isBn ? "সফলভাবে সংরক্ষিত হয়েছে" : "Saved successfully"));
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          (isBn ? "সংরক্ষণ করতে ব্যর্থ হয়েছে" : "Failed to save billing profile")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">
          {isBn ? "বিলিং প্রোফাইল" : "Billing Profile"}
        </h1>
      </div>

      <p className="text-sm text-muted-foreground">
        {isBn
          ? "আপনার চালান ও পেমেন্টের জন্য বিলিং তথ্য পরিচালনা করুন।"
          : "Manage your billing information for invoices and payments."}
      </p>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isBn ? "কোম্পানির তথ্য" : "Company Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">
                {isBn ? "কোম্পানির নাম" : "Company Name"}
              </Label>
              <Input
                id="company_name"
                placeholder={isBn ? "কোম্পানির নাম লিখুন" : "Enter company name"}
                value={profile.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_name">
                {isBn ? "বিলিং নাম" : "Billing Name"}
              </Label>
              <Input
                id="billing_name"
                placeholder={isBn ? "বিলিং নাম লিখুন" : "Enter billing name"}
                value={profile.billing_name}
                onChange={(e) => handleChange("billing_name", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vat_number">
              {isBn ? "ভ্যাট নম্বর / ট্যাক্স আইডি" : "VAT Number / Tax ID"}
            </Label>
            <Input
              id="vat_number"
              placeholder={isBn ? "ভ্যাট নম্বর লিখুন" : "Enter VAT number"}
              value={profile.vat_number}
              onChange={(e) => handleChange("vat_number", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isBn ? "ঠিকানা" : "Address"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_line_1">
              {isBn ? "ঠিকানা লাইন ১" : "Address Line 1"}
            </Label>
            <Input
              id="address_line_1"
              placeholder={isBn ? "বাসা/অফিস নম্বর, রাস্তা" : "House/Office number, street"}
              value={profile.address_line_1}
              onChange={(e) => handleChange("address_line_1", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line_2">
              {isBn ? "ঠিকানা লাইন ২" : "Address Line 2"}
            </Label>
            <Input
              id="address_line_2"
              placeholder={isBn ? "এলাকা, উপজেলা (ঐচ্ছিক)" : "Area, district (optional)"}
              value={profile.address_line_2}
              onChange={(e) => handleChange("address_line_2", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{isBn ? "শহর" : "City"}</Label>
              <Input
                id="city"
                placeholder={isBn ? "শহর" : "City"}
                value={profile.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">{isBn ? "রাজ্য/বিভাগ" : "State / Division"}</Label>
              <Input
                id="state"
                placeholder={isBn ? "রাজ্য/বিভাগ" : "State / Division"}
                value={profile.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">{isBn ? "পোস্ট কোড" : "Postal Code"}</Label>
              <Input
                id="postal_code"
                placeholder={isBn ? "পোস্ট কোড" : "Postal Code"}
                value={profile.postal_code}
                onChange={(e) => handleChange("postal_code", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country_code">{isBn ? "দেশ" : "Country"}</Label>
            <Input
              id="country_code"
              placeholder={isBn ? "দেশ কোড (যেমন: BD)" : "Country code (e.g., BD)"}
              value={profile.country_code}
              onChange={(e) => handleChange("country_code", e.target.value)}
              maxLength={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {isBn ? "যোগাযোগ" : "Contact"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {isBn ? "ফোন" : "Phone"}
                </span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={isBn ? "ফোন নম্বর" : "Phone number"}
                value={profile.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {isBn ? "ইমেইল" : "Email"}
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={isBn ? "ইমেইল ঠিকানা" : "Email address"}
                value={profile.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
          <Save className="h-4 w-4 mr-2" />
          {saving
            ? isBn
              ? "সংরক্ষণ হচ্ছে..."
              : "Saving..."
            : isBn
              ? "পরিবর্তন সংরক্ষণ করুন"
              : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
