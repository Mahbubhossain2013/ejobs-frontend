"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Building2, ShieldCheck, CheckCircle2, Search, Users, MessageSquare, Star, Lock } from "lucide-react";

const STEPS = [
  { step: 1, icon: Search, text: "Company remotely posts a job" },
  { step: 2, icon: Users, text: "Candidates apply with proposals" },
  { step: 3, icon: MessageSquare, text: "Company reviews and starts work" },
  { step: 4, icon: CheckCircle2, text: "Work delivered and approved" },
  { step: 5, icon: Star, text: "Payment released from escrow" },
];

interface Props {
  open: boolean;
  onToggle: () => void;
  isBn: boolean;
  siteName: string;
  isAuthenticated: boolean;
}

export default function RemoteSidebar({ open, onToggle, isBn, siteName, isAuthenticated }: Props) {
  return (
    <aside className="space-y-6 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onToggle} className="shrink-0 h-6 w-6 rounded hover:bg-muted flex items-center justify-center">
          {open ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg> : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>}
        </button>
        {open && <h3 className="font-semibold text-sm whitespace-nowrap">{isBn ? "সাইডবার" : "Sidebar"}</h3>}
      </div>
      {open && (
        <>
          <Card><CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-4">{isBn ? "কিভাবে কাজ করে" : "How It Works"}</h3>
            <div className="space-y-3">
              {STEPS.map((step) => (
                <div key={step.step} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><step.icon className="h-3.5 w-3.5 text-primary" /></div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </CardContent></Card>
          <Card className="border-primary/20"><CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Lock className="h-4 w-4 text-primary" />{isBn ? "নিরাপদ পেমেন্ট" : "Secure Payment"}</h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0"><Building2 className="h-4 w-4 text-primary" /></div><p>{`Company → ${siteName}`}</p></div>
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0"><ShieldCheck className="h-4 w-4 text-primary" /></div><div><p className="font-medium text-foreground">Payment Held in Escrow</p><p className="text-[11px]">{isBn ? "নিরাপদে সংরক্ষিত" : "Securely held until work completion"}</p></div></div>
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center shrink-0"><CheckCircle2 className="h-4 w-4 text-green-600" /></div><div><p className="font-medium text-foreground">Released After Approval</p><p className="text-[11px]">{isBn ? "অনুমোদনের পর মুক্তি" : "Funds released to freelancer"}</p></div></div>
            </div>
          </CardContent></Card>
          {!isAuthenticated && (
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"><CardContent className="p-5 text-center space-y-3">
              <Zap className="h-8 w-8 mx-auto" />
              <h3 className="font-semibold">{isBn ? "দ্রুত শুরু করুন" : "Start Hiring Today"}</h3>
              <p className="text-xs text-primary-foreground/80">{isBn ? "আপনার প্রতিভা প্রদর্শন করুন" : "Showcase your talent to top companies"}</p>
              <Button variant="secondary" size="sm" className="w-full" asChild><Link href="/register">{isBn ? "ফ্রি অ্যাকাউন্ট খুঁজুন" : "Create Free Account"}</Link></Button>
            </CardContent></Card>
          )}
        </>
      )}
    </aside>
  );
}