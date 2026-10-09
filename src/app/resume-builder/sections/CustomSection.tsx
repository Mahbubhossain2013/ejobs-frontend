"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Props { data: any[]; onChange: (d: any[]) => void; isBn: boolean; }

export default function CustomSection({ data, onChange, isBn }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Custom section</h3>
      {data.map((sec, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between p-3 hover:bg-muted/50 text-left">
            <span className="text-sm font-medium">{sec.title || "Custom section"}</span>
          </button>
          {openIdx === i && (
            <div className="p-3 border-t space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">{isBn ? "শিরোনাম (Title)" : "Title"}</Label>
                <Input value={sec.title} onChange={(e) => { const n = [...data]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }} placeholder={isBn ? "সেকশনের শিরোনাম" : "Section title"} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{isBn ? "বিবরণ (Description)" : "Description"}</Label>
                  {(() => {
                    const words = (sec.description || "").trim() ? (sec.description || "").trim().split(/\s+/).length : 0;
                    return (
                      <span className={`text-[11px] font-medium ${words >= 250 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
                        {words} / 250 {isBn ? "শব্দ" : "words"}
                      </span>
                    );
                  })()}
                </div>
                <Textarea
                  value={sec.description}
                  onChange={(e) => {
                    const val = e.target.value;
                    const trimmed = val.trim();
                    let finalVal = val;
                    if (trimmed && trimmed.split(/\s+/).length > 250) {
                      finalVal = trimmed.split(/\s+/).slice(0, 250).join(" ");
                    }
                    const n = [...data];
                    n[i] = { ...n[i], description: finalVal };
                    onChange(n);
                  }}
                  rows={3}
                  className="text-sm"
                  placeholder={isBn ? "বিবরণ লিখুন (সর্বোচ্চ ২৫০ শব্দ)..." : "Enter description (max 250 words)..."}
                />
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onChange(data.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5 mr-1" />{isBn ? "মুছে ফেলুন" : "Delete"}</Button>
                <Button size="sm" onClick={() => toast.success(isBn ? "সংরক্ষিত হয়েছে!" : "Saved!")}><Save className="h-3.5 w-3.5 mr-1" />{isBn ? "সংরক্ষণ" : "Save"}</Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => { onChange([...data, { title: "", description: "" }]); setOpenIdx(data.length); }}><Plus className="h-4 w-4 mr-1" />Add extra section</Button>
    </div>
  );
}