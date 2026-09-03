"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Edit3 } from "lucide-react";

interface Props {
  skills: string[];
  isBn: boolean;
}

const SKILL_LEVELS: Record<string, number> = {
  "React.js": 90, "React": 90, "Next.js": 85, "JavaScript (ES6+)": 85, "JavaScript": 85,
  "TypeScript": 80, "HTML5": 90, "HTML": 90, "CSS3 / SASS": 80, "CSS": 80, "Tailwind CSS": 80,
  "Redux Toolkit": 70, "Redux": 70, "Node.js": 75, "Python": 70, "PHP": 65,
  "Laravel": 75, "Vue.js": 70, "Angular": 65, "Django": 60, "MySQL": 70, "PostgreSQL": 65,
};

function getSkillLevel(skill: string): number {
  if (SKILL_LEVELS[skill] !== undefined) return SKILL_LEVELS[skill];
  if (SKILL_LEVELS[skill.replace(/\s*\(.*\)/, "")] !== undefined) return SKILL_LEVELS[skill.replace(/\s*\(.*\)/, "")];
  const base = 60 + Math.floor(Math.random() * 20);
  return base;
}

export default function ProfileTopSkills({ skills, isBn }: Props) {
  if (!skills.length) return null;

  const displaySkills = skills.slice(0, 8);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            {isBn ? "শীর্ষ দক্ষতা" : "Top Skills"}
          </h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/dashboard/profile">
              <Edit3 className="h-3.5 w-3.5" /> {isBn ? "এডিট" : "Edit"}
            </Link>
          </Button>
        </div>
        <div className="space-y-3">
          {displaySkills.map((skill, i) => {
            const level = getSkillLevel(skill);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{skill}</span>
                  <span className="text-xs text-muted-foreground">{level}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}