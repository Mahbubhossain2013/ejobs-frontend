"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

const BUDGET_RANGES = [
  { label: "All Budget", min: "", max: "" },
  { label: "৳ 0 - ৳5,000", min: "0", max: "5000" },
  { label: "৳5,001 - ৳15,000", min: "5001", max: "15000" },
  { label: "৳15,001 - ৳30,000", min: "15001", max: "30000" },
  { label: "৳30,001 - ৳60,000+", min: "30001", max: "60000" },
];

const EXPERIENCE_LEVELS = ["All Levels", "Entry Level", "1 - 2 Years", "3 - 5 Years", "5+ Years"];
const PROJECT_DURATIONS = ["Any Duration", "< 1 Week", "1 - 4 Weeks", "1 - 3 Months", "> 3 Months"];

function RadioOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 w-full text-sm cursor-pointer transition-colors ${selected ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "border-primary" : "border-muted-foreground/30"}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      {label}
    </button>
  );
}

interface Props {
  open: boolean;
  onToggle: () => void;
  isBn: boolean;
  jobType: string;
  setJobType: (v: string) => void;
  experience: string;
  setExperience: (v: string) => void;
  budget: number;
  setBudget: (i: number) => void;
  setBudgetMin: (v: string) => void;
  setBudgetMax: (v: string) => void;
  duration: string;
  setDuration: (v: string) => void;
  skills: string[];
  toggleSkill: (s: string) => void;
  topSkills: { skill: string; count: number }[];
  showAllSkills: boolean;
  setShowAllSkills: (v: boolean) => void;
  onClearAll: () => void;
}

export default function RemoteFilters({
  open, onToggle, isBn, jobType, setJobType,
  experience, setExperience, budget, setBudget, setBudgetMin, setBudgetMax,
  duration, setDuration, skills, toggleSkill, topSkills,
  showAllSkills, setShowAllSkills, onClearAll,
}: Props) {
  return (
    <aside className="space-y-6 min-w-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="shrink-0 h-6 w-6 rounded hover:bg-muted flex items-center justify-center">
            {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {open && <h3 className="font-semibold text-sm whitespace-nowrap">{isBn ? "ফিল্টার" : "Refine Search"}</h3>}
        </div>
        {open && (
          <button onClick={onClearAll} className="shrink-0 text-xs text-primary hover:underline">
            {isBn ? "সব মুছুন" : "Clear All"}
          </button>
        )}
      </div>
      {open && (
        <>
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "চাকরির ধরন" : "Job Type"}</p>
            <div className="space-y-1">
              {["All Types", "Fixed Price", "Hourly", "Long Term", "Short Term"].map((t) => (
                <RadioOption key={t} label={t} selected={jobType === t} onClick={() => setJobType(t)} />
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "অভিজ্ঞতা" : "Experience Level"}</p>
            <div className="space-y-1">
              {EXPERIENCE_LEVELS.map((l) => (
                <RadioOption key={l} label={l} selected={experience === l} onClick={() => setExperience(l)} />
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "বাজেট" : "Budget Range (৳)"}</p>
            <div className="space-y-1">
              {BUDGET_RANGES.map((b, i) => (
                <RadioOption key={i} label={b.label} selected={budget === i} onClick={() => { setBudget(i); setBudgetMin(b.min); setBudgetMax(b.max); }} />
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "সময়কাল" : "Project Duration"}</p>
            <div className="space-y-1">
              {PROJECT_DURATIONS.map((d) => (
                <RadioOption key={d} label={d} selected={duration === d} onClick={() => setDuration(d)} />
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "দক্ষতা" : "Skills"}</p>
            <div className="flex flex-wrap gap-1.5">
              {(showAllSkills ? topSkills : topSkills.slice(0, 5)).map((s) => (
                <button key={s.skill} onClick={() => toggleSkill(s.skill)} className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${skills.includes(s.skill) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground hover:border-primary"}`}>
                  {s.skill}
                </button>
              ))}
              {topSkills.length > 5 && (
                <button onClick={() => setShowAllSkills(!showAllSkills)} className="px-2.5 py-1 text-xs text-primary">
                  {showAllSkills ? "- Less" : "+ More"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}