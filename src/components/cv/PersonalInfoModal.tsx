"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useThemeStore } from '@/store/theme-store';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api-client';

interface PersonalInfoModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function PersonalInfoModal({ open, onClose, onComplete }: PersonalInfoModalProps) {
  const { language } = useThemeStore();
  const isBn = language === 'bn';
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    title: '',
  });

  useEffect(() => {
    if (open) {
      api.get('/candidate/cv/profile')
        .then((r) => {
          const info = r.data?.data?.personal_info || {};
          setForm({
            full_name: info.full_name || '',
            email: info.email || '',
            phone: info.phone || '',
            title: info.title || '',
          });
        })
        .catch(() => { /* handled */ });
    }
  }, [open]);

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error(isBn ? "নাম এবং ইমেইল আবশ্যক" : "Name and email are required");
      return;
    }
    setSaving(true);
    try {
      await api.post('/candidate/cv/profile/update', { personal_info: form });
      toast.success(isBn ? "প্রোফাইল সংরক্ষিত হয়েছে!" : "Profile saved successfully!");
      onComplete();
    } catch (e: any) {
      const msg = e?.response?.data?.message || (isBn ? "সংরক্ষণ ব্যর্থ" : "Save failed");
      toast.error(msg);
      if (e?.response?.status === 401) {
        window.location.href = "/login?redirect=" + encodeURIComponent("/resume-builder");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isBn ? 'ব্যক্তিগত তথ্য পূরণ করুন' : 'Complete Your Profile'}</DialogTitle>
          <DialogDescription>
            {isBn
              ? 'সিভি তৈরি করার আগে আপনার ব্যক্তিগত তথ্য পূরণ করুন।'
              : 'Please fill in your personal information before creating a resume.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>{isBn ? "পূর্ণ নাম *" : "Full Name *"}</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder={isBn ? "আপনার পূর্ণ নাম" : "Your full name"}
            />
          </div>
          <div className="space-y-2">
            <Label>{isBn ? "ইমেইল *" : "Email *"}</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={isBn ? "আপনার ইমেইল" : "Your email"}
            />
          </div>
          <div className="space-y-2">
            <Label>{isBn ? "ফোন" : "Phone"}</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={isBn ? "আপনার ফোন নম্বর" : "Your phone number"}
            />
          </div>
          <div className="space-y-2">
            <Label>{isBn ? "পেশাদার শিরোনাম" : "Professional Title"}</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={isBn ? "যেমন: ফ্রন্টএন্ড ডেভেলপার" : "e.g. Frontend Developer"}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            {isBn ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.full_name.trim() || !form.email.trim()}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isBn ? 'সংরক্ষণ করুন' : 'Save & Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
