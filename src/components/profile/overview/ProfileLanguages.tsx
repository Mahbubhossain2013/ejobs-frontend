"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Globe } from "lucide-react";

interface Props {
  languages: any[];
  isBn: boolean;
}

export default function ProfileLanguages({ languages, isBn }: Props) {
  if (!languages.length) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            {isBn ? "ভাষা" : "Languages"}
          </h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/dashboard/profile"><Edit3 className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {languages.map((lang: any, i: number) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{lang.name || lang.language}</p>
                <p className="text-[10px] text-muted-foreground">
                  {[lang.read && "Read", lang.write && "Write", lang.speak && "Speak"].filter(Boolean).join(" · ") || lang.proficiency || ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}