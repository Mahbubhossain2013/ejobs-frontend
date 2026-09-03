"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/theme-store';
import { CheckCircle } from 'lucide-react';

interface PurchaseSuccessDialogProps {
  open: boolean;
  templateName: string;
  onClose: () => void;
  onUseTemplate: () => void;
}

export default function PurchaseSuccessDialog({ open, templateName, onClose, onUseTemplate }: PurchaseSuccessDialogProps) {
  const { language } = useThemeStore();
  const isBn = language === 'bn';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <DialogHeader>
            <DialogTitle>
              {isBn ? "ক্রয় সফল!" : "Purchase Successful!"}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? `"${templateName}" টেমপ্লেটটি এখন আপনার।`
                : `"${templateName}" template is now yours.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {isBn ? "পরে ব্যবহার করুন" : "Use Later"}
            </Button>
            <Button onClick={onUseTemplate} className="flex-1">
              {isBn ? "এখনই ব্যবহার করুন" : "Use Template Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
