"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus } from "lucide-react";

interface Props {
  skills: string[];
  isBn: boolean;
}

export default function ProfileSkills({ skills, isBn }: Props) {
  if (!skills.length) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            {isBn ? "দক্ষতা" : "Skills"}
          </h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/dashboard/profile"><Plus className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 12).map((skill: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-sm px-3 py-1">{skill}</Badge>
          ))}
          {skills.length > 12 && (
            <Badge variant="outline" className="text-sm px-3 py-1">+{skills.length - 12} more</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}