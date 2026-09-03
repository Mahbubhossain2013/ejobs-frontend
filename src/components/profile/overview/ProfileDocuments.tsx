"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { getStorageUrl } from "@/lib/utils";

interface Props {
  documents: any[];
  isBn: boolean;
}

export default function ProfileDocuments({ documents, isBn }: Props) {
  if (!documents.length) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          {isBn ? "ডকুমেন্ট" : "Documents"}
        </h2>
        <div className="space-y-2">
          {documents.map((doc: any, i: number) => {
            const docUrl = getStorageUrl(doc.file_path) || doc.url || "";
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.file_path || "");
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {isImage && docUrl ? <img src={docUrl} alt={doc.type} className="h-full w-full object-cover" /> : <FileText className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate capitalize">{doc.type?.replace(/_/g, " ") || doc.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{doc.file_path?.split("/").pop() || ""}</p>
                </div>
                {docUrl && <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline shrink-0">View</a>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}