"use client";

import { Field, TextInput } from "../shared";
import type { ProfileState } from "../types";

export default function ContactStep({ state, isBn }: { state: ProfileState; isBn: boolean }) {
  const s = state;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "যোগাযোগকারী" : "Contact Person"} required><TextInput value={s.contactPerson} onChange={s.setContactPerson} /></Field>
        <Field label={isBn ? "পদবি" : "Designation"} required><TextInput value={s.contactDesignation} onChange={s.setContactDesignation} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "মোবাইল" : "Mobile"} required><TextInput value={s.contactPhone} onChange={s.setContactPhone} /></Field>
        <Field label={isBn ? "বিকল্প ফোন" : "Alt Phone"}><TextInput value={s.contactAltPhone} onChange={s.setContactAltPhone} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "ইমেইল" : "Email"} required><TextInput type="email" value={s.contactEmail} onChange={s.setContactEmail} /></Field>
        <Field label={isBn ? "ওয়েবসাইট" : "Website"}><TextInput value={s.website} onChange={s.setWebsite} placeholder="https://" /></Field>
      </div>
    </div>
  );
}