"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

interface Props {
  certifications: any[];
  isBn: boolean;
}

export default function ProfileCertifications({ certifications, isBn }: Props) {
  if (!certifications.length) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-muted-foreground" />
          {isBn ? "সার্টিফিকেশন" : "Certifications"}
        </h2>
        <div className="space-y-2">
          {certifications.map((cert: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cert.name || cert.title}</p>
                <p className="text-xs text-muted-foreground">{cert.issuer || cert.organization} {cert.year ? `(${cert.year})` : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}