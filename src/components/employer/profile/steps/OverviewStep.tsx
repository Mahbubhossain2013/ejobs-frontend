"use client";

import { Field, ArrayInput } from "../shared";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileState } from "../types";

export default function OverviewStep({ state, isBn }: { state: ProfileState; isBn: boolean }) {
  const s = state;
  return (
    <div className="space-y-4">
      <Field label={isBn ? "মিশন" : "Mission"}><Textarea value={s.mission} onChange={(e) => s.setMission(e.target.value)} rows={3} /></Field>
      <Field label={isBn ? "ভিশন" : "Vision"}><Textarea value={s.vision} onChange={(e) => s.setVision(e.target.value)} rows={3} /></Field>
      <Field label={isBn ? "মূল্যবোধ" : "Values"}><Textarea value={s.values} onChange={(e) => s.setValues(e.target.value)} rows={3} /></Field>
      <Field label={isBn ? "সেবা/পণ্য" : "Services/Products"}><Textarea value={s.servicesProducts} onChange={(e) => s.setServicesProducts(e.target.value)} rows={3} /></Field>
      <Field label={isBn ? "কাজের কালচার" : "Working Culture"}><Textarea value={s.workingCulture} onChange={(e) => s.setWorkingCulture(e.target.value)} rows={3} /></Field>
      <Field label={isBn ? "কেন আমাদের সাথে" : "Why Join Us"}>
        <ArrayInput items={s.whyJoinUs} setItems={s.setWhyJoinUs} placeholder="Add a benefit..." isBn={isBn} />
      </Field>
      <Field label={isBn ? "শীর্ষ দক্ষতা" : "Top Skills"}>
        <ArrayInput items={s.topSkills} setItems={s.setTopSkills} placeholder="Add a skill..." isBn={isBn} />
      </Field>
      <Field label={isBn ? "হাইলাইটস" : "Highlights"}>
        <ArrayInput items={s.highlights} setItems={s.setHighlights} placeholder="Add a highlight..." isBn={isBn} />
      </Field>
    </div>
  );
}