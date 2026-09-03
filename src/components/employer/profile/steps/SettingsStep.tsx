"use client";

import { Field, TextInput } from "../shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ProfileState } from "../types";

export default function SettingsStep({ state, isBn }: { state: ProfileState; isBn: boolean }) {
  const s = state;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3"><Checkbox id="allowPosting" checked={s.allowJobPosting} onCheckedChange={(v) => s.setAllowJobPosting(!!v)} /><Label htmlFor="allowPosting" className="text-sm">{isBn ? "চাকরি পোস্টিং" : "Allow Job Posting"}</Label></div>
        <div className="flex items-center gap-3"><Checkbox id="featuredAllowed" checked={s.featuredAllowed} onCheckedChange={(v) => s.setFeaturedAllowed(!!v)} /><Label htmlFor="featuredAllowed" className="text-sm">{isBn ? "ফিচার্ড জব" : "Featured Job Allowed"}</Label></div>
        <div className="flex items-center gap-3"><Checkbox id="autoApproval" checked={s.autoApproval} onCheckedChange={(v) => s.setAutoApproval(!!v)} /><Label htmlFor="autoApproval" className="text-sm">{isBn ? "অটো অনুমোদন" : "Auto Approval"}</Label></div>
        <Field label={isBn ? "মাসিক পোস্ট সীমা" : "Monthly Posting Limit"}><TextInput type="number" value={s.postingLimit} onChange={s.setPostingLimit} placeholder="Unlimited" /></Field>
      </div>
      <Field label={isBn ? "মেয়াদ (দিন)" : "Job Expiry (days)"}><TextInput type="number" value={s.expiryDays} onChange={s.setExpiryDays} /></Field>
    </div>
  );
}