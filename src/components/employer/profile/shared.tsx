"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";

export function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = "text", disabled, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean; className?: string;
}) {
  return <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={className} />;
}

export function SelectInput({ value, onChange, placeholder, options, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; options: { value: string; label: string }[]; disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger><SelectValue placeholder={placeholder || "Select"} /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export function ArrayInput({ items, setItems, placeholder, isBn }: {
  items: string[]; setItems: (v: string[]) => void; placeholder: string; isBn: boolean;
}) {
  const [input, setInput] = React.useState("");

  const add = () => {
    if (!input.trim()) return;
    setItems([...items, input.trim()]);
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" size="sm" variant="outline" onClick={add}>+</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="text-xs gap-1 cursor-pointer hover:bg-destructive/10"
            onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
            {item} <X className="h-3 w-3" />
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function FileUpload({ label, file, setFile, existingPath, accept = ".pdf,.jpg,.jpeg,.png" }: {
  label: string; file: File | null; setFile: (f: File | null) => void; existingPath?: string; accept?: string;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {existingPath && !file && <p className="text-xs text-green-600">Uploaded</p>}
      </div>
      <label>
        <Button size="sm" variant={existingPath && !file ? "outline" : "default"} asChild>
          <span>{existingPath && !file ? "Replace" : "Upload"}</span>
        </Button>
        <input type="file" className="hidden" accept={accept} onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
      </label>
    </div>
  );
}