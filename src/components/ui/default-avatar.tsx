"use client";

import { useThemeStore } from "@/store/theme-store";
import { cn, getInitials, getStorageUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DefaultAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallback?: React.ReactNode;
}

export function DefaultAvatar({ src, name, className, fallback }: DefaultAvatarProps) {
  const resolved = getStorageUrl(src);
  const imageSrc = resolved || undefined;

  return (
    <Avatar className={className}>
      {imageSrc && <AvatarImage src={imageSrc} alt={name || "Avatar"} className="object-cover" />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold select-none">
        {fallback || getInitials(name || "U")}
      </AvatarFallback>
    </Avatar>
  );
}

interface CompanyLogoProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  children?: React.ReactNode;
}

export function CompanyLogo({ src, name, className, children }: CompanyLogoProps) {
  const { settings } = useThemeStore();
  const roundLogo = getStorageUrl(settings.round_logo || settings.site_logo);

  if (src) {
    const resolved = getStorageUrl(src);
    return (
      <img
        src={resolved || undefined}
        alt={name || "Company"}
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }

  if (roundLogo) {
    return (
      <img
        src={roundLogo}
        alt={name || "Company"}
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }

  return <>{children}</>;
}
