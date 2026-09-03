"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PremiumLockProps {
  featureKey: string;
  featureName?: string;
  className?: string;
  children?: React.ReactNode;
  blurAmount?: 'sm' | 'md' | 'lg';
}

export function PremiumLock({
  featureKey,
  featureName = 'this feature',
  className,
  children,
  blurAmount = 'md',
}: PremiumLockProps) {
  const [hovered, setHovered] = useState(false);

  const blurClass = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
  }[blurAmount];

  return (
    <TooltipProvider>
      <div
        className={cn('relative group', className)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Blurred content */}
        <div className={cn('pointer-events-none select-none', blurClass)}>
          {children}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="lg"
                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25"
              >
                <Link href="/pricing">
                  <Lock className="h-4 w-4" />
                  <Sparkles className="h-4 w-4" />
                  Unlock {featureName}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upgrade your plan to access {featureKey}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
