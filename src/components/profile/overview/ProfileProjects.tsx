"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Plus, ExternalLink } from "lucide-react";

interface Props {
  projects: any[];
  isBn: boolean;
}

export default function ProfileProjects({ projects, isBn }: Props) {
  if (!projects.length) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Code className="h-5 w-5 text-muted-foreground" />
            {isBn ? "প্রকল্প" : "Projects"}
          </h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/dashboard/profile"><Plus className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((proj: any, i: number) => (
            <div key={i} className="p-4 rounded-xl border border-border/50 hover:border-border transition-colors">
              <h4 className="font-semibold text-sm mb-1">{proj.name || proj.project_name}</h4>
              {proj.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{proj.description}</p>}
              {proj.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {proj.technologies.slice(0, 3).map((t: string, j: number) => (
                    <Badge key={j} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
              {proj.url && (
                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />View
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}