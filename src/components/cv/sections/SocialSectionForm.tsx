"use client";

import { useState } from "react";
import { Globe, Link2, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toSafeStrings } from "./utils";

const SOCIAL_ICON_MAP: Record<string, typeof Globe> = {
  linkedin: Link2,
  github: Code,
  twitter: Globe,
  facebook: Globe,
  portfolio: Globe,
};

const PLATFORMS = ["linkedin", "github", "twitter", "facebook", "portfolio"];

const LABELS: Record<string, { en: string; bn: string }> = {
  linkedin: { en: "LinkedIn", bn: "LinkedIn" },
  github: { en: "GitHub", bn: "GitHub" },
  twitter: { en: "Twitter / X", bn: "Twitter / X" },
  facebook: { en: "Facebook", bn: "Facebook" },
  portfolio: { en: "Portfolio URL", bn: "পোর্টফোলিও URL" },
};

export default function SocialSectionForm({ data, onChange, isBn }: { data: Record<string, any>; onChange: (d: any) => void; isBn: boolean }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    onChange(toSafeStrings({ ...data, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: value.trim() && !/^https?:\/\//i.test(value) ? (isBn ? "https:// দিয়ে শুরু করুন" : "Must start with http(s)") : "" }));
  };

  return (
    <div className="space-y-2">
      {PLATFORMS.map((p) => {
        const Icon = SOCIAL_ICON_MAP[p] || Globe;
        return (
          <div key={p} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input value={data[p] || ""} onChange={(e) => handleChange(p, e.target.value)} placeholder={isBn ? LABELS[p].bn : LABELS[p].en} className="h-8 text-sm" />
            </div>
            {errors[p] && <p className="text-xs text-destructive pl-[26px]">{errors[p]}</p>}
          </div>
        );
      })}
    </div>
  );
}