"use client";

import { Download, Paperclip } from "lucide-react";

interface MessageAttachmentProps {
  url: string | null;
  name: string;
  mine?: boolean;
}

export function MessageAttachment({ url, name, mine }: MessageAttachmentProps) {
  if (!url) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith("blob:");

  if (isImage) {
    return (
      <div className="relative group mb-1.5">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={url}
            alt={name}
            className="rounded-lg max-h-48 object-cover"
            loading="lazy"
          />
        </a>
        <a
          href={url}
          download={name}
          title="Download"
          aria-label="Download attachment"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg mb-1.5 ${
        mine ? "bg-primary-foreground/10" : "bg-background/50"
      }`}
    >
      <Paperclip className="h-4 w-4 shrink-0" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs truncate min-w-0 flex-1 hover:underline"
        title={name}
      >
        {name}
      </a>
      <a
        href={url}
        download={name}
        title="Download"
        aria-label="Download attachment"
        className="shrink-0 hover:opacity-70 transition-opacity"
      >
        <Download className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
