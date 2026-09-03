"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, FileIcon } from "lucide-react";
import type { CandidateDocumentEntry } from "@/types";
import { getStorageUrl } from "@/lib/utils";

const DOC_TYPES = [
  { value: "cv", label: "CV/Resume *" },
  { value: "nid_front", label: "NID Copy (Front)" },
  { value: "nid_back", label: "NID Copy (Back)" },
  { value: "passport", label: "Passport Copy" },
  { value: "academic_cert", label: "Academic Certificates" },
  { value: "experience_cert", label: "Experience Certificates" },
  { value: "photo", label: "Photograph" },
];

interface Props {
  isBn: boolean;
  documents: CandidateDocumentEntry[];
  onUpdate: (docs: CandidateDocumentEntry[]) => void;
}

export default function ProfileSectionDocuments({ documents, onUpdate }: Props) {
  return (
    <div className="space-y-4">
      {DOC_TYPES.map((dt) => {
        const existing = documents.find((d) => d.type === dt.value);
        const previewUrl = existing ? (existing._file ? URL.createObjectURL(existing._file) : getStorageUrl(existing.file_path) || existing.url) : null;
        const isImage = existing && (existing._file?.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(existing.file_path || ""));

        return (
          <div key={dt.value} className="flex items-center gap-4 p-3 rounded-lg border">
            {existing && previewUrl ? (
              <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden border bg-muted">
                {isImage ? <img src={previewUrl} alt={dt.label} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><FileIcon className="h-5 w-5 text-muted-foreground" /></div>}
              </div>
            ) : (
              <div className="h-12 w-12 flex-shrink-0 rounded border bg-muted flex items-center justify-center"><Upload className="h-5 w-5 text-muted-foreground" /></div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{dt.label}</p>
              {existing && <p className="text-xs text-muted-foreground truncate mt-0.5">{(existing.file_path || "").split("/").pop()}</p>}
            </div>
            <label>
              <Button size="sm" variant={existing ? "outline" : "default"} asChild>
                <span><Upload className="h-4 w-4 mr-1" /> {existing ? "Replace" : "Upload"}</span>
              </Button>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const entry: CandidateDocumentEntry = { type: dt.value, label: dt.label.replace(" *", ""), file_path: URL.createObjectURL(file), url: URL.createObjectURL(file), _file: file };
                onUpdate([...documents.filter((d) => d.type !== dt.value), entry]);
              }} />
            </label>
            {existing && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onUpdate(documents.filter((d) => d.type !== dt.value))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}