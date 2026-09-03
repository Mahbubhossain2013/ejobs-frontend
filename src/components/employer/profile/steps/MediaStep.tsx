"use client";

import { Field, TextInput } from "../shared";
import type { ProfileState } from "../types";

export default function MediaStep({ state, isBn }: { state: ProfileState; isBn: boolean }) {
  const s = state;
  return (
    <div className="space-y-4">
      <Field label={isBn ? "ভিডিও URL" : "Company Video URL"}><TextInput value={s.videoUrl} onChange={s.setVideoUrl} placeholder="https://youtube.com/watch?v=..." /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="YouTube"><TextInput value={s.youtubeChannel} onChange={s.setYoutubeChannel} placeholder="https://youtube.com/@..." /></Field>
        <Field label="Instagram"><TextInput value={s.instagramProfile} onChange={s.setInstagramProfile} placeholder="https://instagram.com/..." /></Field>
      </div>
    </div>
  );
}