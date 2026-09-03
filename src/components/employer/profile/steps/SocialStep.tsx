"use client";

import { Field, TextInput } from "../shared";
import type { ProfileState } from "../types";

export default function SocialStep({ state }: { state: ProfileState }) {
  const s = state;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Facebook"><TextInput value={s.facebookPage} onChange={s.setFacebookPage} placeholder="https://facebook.com/..." /></Field>
      <Field label="LinkedIn"><TextInput value={s.linkedinPage} onChange={s.setLinkedinPage} placeholder="https://linkedin.com/company/..." /></Field>
    </div>
  );
}