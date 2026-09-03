"use client";

import React from "react";
import Field from "./Field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Trash2, FileIcon, X } from "lucide-react";
import type { CandidateCertificationEntry } from "@/types";
import { getStorageUrl } from "@/lib/utils";

interface CertEntry extends CandidateCertificationEntry { _cert_file?: File; }

interface Props {
  isBn: boolean;
  certifications: CertEntry[];
  onUpdate: (i: number, field: string, value: string) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
  onFileChange: (i: number, file: File | undefined) => void;
}

export default function ProfileSectionCertifications({ isBn, certifications, onUpdate, onRemove, onAdd, onFileChange }: Props) {
  return (
    <div className="space-y-4">
      {certifications.map((c, i) => (
        <div key={i} className="p-4 rounded-lg border space-y-3 relative">
          <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={() => onRemove(i)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Certification Name" required><Input value={c.name} onChange={(e) => onUpdate(i, "name", e.target.value)} /></Field>
            <Field label="Organization"><Input value={c.organization || ""} onChange={(e) => onUpdate(i, "organization", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Issue Date"><Input type="date" value={c.issue_date || ""} onChange={(e) => onUpdate(i, "issue_date", e.target.value)} /></Field>
            <Field label="Expiry Date"><Input type="date" value={c.expiry_date || ""} onChange={(e) => onUpdate(i, "expiry_date", e.target.value)} /></Field>
          </div>
          <div>
            <Label className="text-sm font-medium">{isBn ? "সার্টিফিকেট ফাইল" : "Certificate File"}</Label>
            <div className="flex items-center gap-3 mt-1.5">
              {c.certificate_path && <img src={getStorageUrl(c.certificate_path)} alt="cert" className="h-14 w-14 object-cover rounded border" />}
              {c._cert_file && (
                <div className="relative">
                  {c._cert_file.type.startsWith("image/") ? (
                    <img src={URL.createObjectURL(c._cert_file)} alt="preview" className="h-14 w-14 object-cover rounded border" />
                  ) : (
                    <div className="h-14 w-14 flex items-center justify-center rounded border bg-muted"><FileIcon className="h-6 w-6 text-muted-foreground" /></div>
                  )}
                  <button onClick={() => onFileChange(i, undefined)} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="cursor-pointer">
                <Button size="sm" variant="outline" type="button" asChild>
                  <span><Upload className="h-3 w-3 mr-1" />{c.certificate_path || c._cert_file ? "Replace" : "Upload"}</span>
                </Button>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange(i, f); }} />
              </label>
            </div>
          </div>
        </div>
      ))}
      {certifications.length === 0 && <p className="text-sm text-muted-foreground">No certifications added</p>}
      <Button size="sm" variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1" /> {isBn ? "সার্টিফিকেশন যোগ করুন" : "Add Certification"}
      </Button>
    </div>
  );
}