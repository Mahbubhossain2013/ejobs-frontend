"use client";

import React from "react";
import Field from "./Field";
import { Input } from "@/components/ui/input";

interface Props {
  linkedinUrl: string; setLinkedinUrl: (v: string) => void;
  githubUrl: string; setGithubUrl: (v: string) => void;
  facebookUrl: string; setFacebookUrl: (v: string) => void;
  portfolioUrl: string; setPortfolioUrl: (v: string) => void;
  twitterUrl: string; setTwitterUrl: (v: string) => void;
  instagramUrl: string; setInstagramUrl: (v: string) => void;
  youtubeUrl: string; setYoutubeUrl: (v: string) => void;
  stackoverflowUrl: string; setStackoverflowUrl: (v: string) => void;
  whatsappUrl: string; setWhatsappUrl: (v: string) => void;
  telegramUrl: string; setTelegramUrl: (v: string) => void;
}

export default function ProfileSectionSocial(props: Props) {
  const fields: { label: string; value: string; set: (v: string) => void; placeholder: string }[] = [
    { label: "LinkedIn", value: props.linkedinUrl, set: props.setLinkedinUrl, placeholder: "https://linkedin.com/in/username" },
    { label: "GitHub", value: props.githubUrl, set: props.setGithubUrl, placeholder: "https://github.com/username" },
    { label: "Twitter / X", value: props.twitterUrl, set: props.setTwitterUrl, placeholder: "https://x.com/username" },
    { label: "Instagram", value: props.instagramUrl, set: props.setInstagramUrl, placeholder: "https://instagram.com/username" },
    { label: "YouTube", value: props.youtubeUrl, set: props.setYoutubeUrl, placeholder: "https://youtube.com/@username" },
    { label: "Stack Overflow", value: props.stackoverflowUrl, set: props.setStackoverflowUrl, placeholder: "https://stackoverflow.com/users/..." },
    { label: "WhatsApp", value: props.whatsappUrl, set: props.setWhatsappUrl, placeholder: "https://wa.me/8801XXXXXXXXX" },
    { label: "Telegram", value: props.telegramUrl, set: props.setTelegramUrl, placeholder: "https://t.me/username" },
    { label: "Portfolio Website", value: props.portfolioUrl, set: props.setPortfolioUrl, placeholder: "https://yoursite.com" },
    { label: "Facebook", value: props.facebookUrl, set: props.setFacebookUrl, placeholder: "https://facebook.com/username" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <Field key={f.label} label={f.label}>
            <Input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} />
          </Field>
        ))}
      </div>
    </div>
  );
}