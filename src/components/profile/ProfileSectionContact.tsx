"use client";

import React from "react";
import Field from "./Field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DIVISIONS_BN, DIVISIONS_EN, DISTRICTS_BN, DISTRICTS_EN, THANAS_BN, THANAS_EN, UNIONS_BN, POST_OFFICES_BN } from "@/lib/bd-data";

interface Props {
  isBn: boolean;
  phone: string; setPhone: (v: string) => void;
  altPhone: string; setAltPhone: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  presentAddress: string; setPresentAddress: (v: string) => void;
  permanentAddress: string; setPermanentAddress: (v: string) => void;
  division: string; setDivision: (v: string) => void;
  district: string; setDistrict: (v: string) => void;
  upazila: string; setUpazila: (v: string) => void;
  unionName: string; setUnionName: (v: string) => void;
  postOffice: string; setPostOffice: (v: string) => void;
  postalCode: string; setPostalCode: (v: string) => void;
}

export default function ProfileSectionContact({
  isBn, phone, setPhone, altPhone, setAltPhone,
  email, setEmail, presentAddress, setPresentAddress,
  permanentAddress, setPermanentAddress,
  division, setDivision, district, setDistrict,
  upazila, setUpazila, unionName, setUnionName,
  postOffice, setPostOffice, postalCode, setPostalCode,
}: Props) {
  const divisions = isBn ? DIVISIONS_BN : DIVISIONS_EN;
  const districts = isBn ? DISTRICTS_BN : DISTRICTS_EN;
  const thanas = isBn ? THANAS_BN : THANAS_EN;
  const unions = isBn ? UNIONS_BN : {};
  const postOffices = isBn ? POST_OFFICES_BN : {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "মোবাইল নম্বর" : "Mobile Number"} required>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" />
        </Field>
        <Field label={isBn ? "বিকল্প মোবাইল" : "Alternative Mobile"}>
          <Input value={altPhone} onChange={(e) => setAltPhone(e.target.value)} />
        </Field>
      </div>
      <Field label={isBn ? "ইমেইল" : "Email Address"} required>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label={isBn ? "বর্তমান ঠিকানা" : "Present Address"} required>
        <Textarea value={presentAddress} onChange={(e) => setPresentAddress(e.target.value)} rows={2} />
      </Field>
      <Field label={isBn ? "স্থায়ী ঠিকানা" : "Permanent Address"} required>
        <Textarea value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} rows={2} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={isBn ? "বিভাগ" : "Division"}>
          <Select value={division} onValueChange={(v) => { setDivision(v); setDistrict(""); setUpazila(""); setUnionName(""); setPostOffice(""); }}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{Object.entries(divisions).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label={isBn ? "জেলা" : "District"}>
          <Select value={district} onValueChange={(v) => { setDistrict(v); setUpazila(""); setUnionName(""); setPostOffice(""); }} disabled={!division}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{(districts[division] || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label={isBn ? "উপজেলা" : "Upazila"}>
          <Select value={upazila} onValueChange={(v) => { setUpazila(v); setUnionName(""); setPostOffice(""); }} disabled={!district}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{(thanas[district] || []).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={isBn ? "ইউনিয়ন" : "Union"}>
          <Input value={unionName} onChange={(e) => setUnionName(e.target.value)} disabled={!upazila} placeholder={isBn ? "ইউনিয়ন লিখুন" : "Type union name"} />
        </Field>
        <Field label={isBn ? "পোস্ট অফিস" : "Post Office"}>
          <Input value={postOffice} onChange={(e) => setPostOffice(e.target.value)} disabled={!upazila} placeholder={isBn ? "পোস্ট অফিস লিখুন" : "Type post office"} />
        </Field>
        <Field label={isBn ? "পোস্টাল কোড" : "Postal Code"}>
          <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
        </Field>
      </div>
    </div>
  );
}