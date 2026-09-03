"use client";

import { Field, TextInput } from "../shared";
import { DIVISIONS_BN, DIVISIONS_EN, DISTRICTS_BN, DISTRICTS_EN } from "@/lib/bd-data";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfileState } from "../types";

export default function AddressStep({ state, isBn }: { state: ProfileState; isBn: boolean }) {
  const s = state;
  const divisions = isBn ? DIVISIONS_BN : DIVISIONS_EN;
  const districts = isBn ? DISTRICTS_BN : DISTRICTS_EN;

  return (
    <div className="space-y-4">
      <Field label={isBn ? "ঠিকানা" : "Head Office"} required>
        <Textarea value={s.headOffice} onChange={(e) => s.setHeadOffice(e.target.value)} rows={2} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "দেশ" : "Country"}><TextInput value={s.country} onChange={s.setCountry} /></Field>
        <Field label={isBn ? "পোস্টাল কোড" : "Postal Code"}><TextInput value={s.postalCode} onChange={s.setPostalCode} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "বিভাগ" : "Division"}>
          <Select value={s.division} onValueChange={(v) => { s.setDivision(v); s.setDistrict(""); }}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{Object.entries(divisions).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label={isBn ? "জেলা" : "District"}>
          <Select value={s.district} onValueChange={s.setDistrict} disabled={!s.division}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{(districts[s.division] || []).map((d: string) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Google Map Embed">
        <TextInput value={s.googleMap} onChange={s.setGoogleMap} placeholder="https://www.google.com/maps/embed?..." />
      </Field>
    </div>
  );
}