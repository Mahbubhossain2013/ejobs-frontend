"use client";

import React from "react";
import { Field, TextInput } from "../shared";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HR_DESIGNATIONS } from "../types";

interface Member { name: string; email: string; phone: string; designation: string; }

export default function HrTeamStep({ team, setTeam, isBn }: { team: Member[]; setTeam: (v: Member[]) => void; isBn: boolean }) {
  const update = (i: number, key: string, val: string) => {
    const next = [...team]; next[i] = { ...next[i], [key]: val }; setTeam(next);
  };
  return (
    <div className="space-y-4">
      {team.map((m, i) => (
        <div key={i} className="p-4 rounded-lg border space-y-3 relative">
          <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={() => setTeam(team.filter((_, idx) => idx !== i))}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name" required><TextInput value={m.name} onChange={(v) => update(i, "name", v)} /></Field>
            <Field label="Designation">
              <Select value={m.designation} onValueChange={(v) => update(i, "designation", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HR_DESIGNATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Email"><TextInput type="email" value={m.email} onChange={(v) => update(i, "email", v)} /></Field>
            <Field label="Phone"><TextInput value={m.phone} onChange={(v) => update(i, "phone", v)} /></Field>
          </div>
        </div>
      ))}
      {team.length === 0 && <p className="text-sm text-muted-foreground">{isBn ? "কোনো HR সদস্য নেই" : "No HR team members"}</p>}
      <Button size="sm" variant="outline" onClick={() => setTeam([...team, { name: "", email: "", phone: "", designation: "recruiter" }])}>
        <Plus className="h-4 w-4 mr-1" /> {isBn ? "সদস্য যোগ" : "Add Member"}
      </Button>
    </div>
  );
}