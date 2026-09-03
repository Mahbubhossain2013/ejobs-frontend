"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Contract {
  id: number;
  title: string;
  job_title_custom?: string;
  budget: number;
  platform_fee: number;
  total_amount: number;
  status: string;
  offer_status: string;
  delivery_date?: string;
  created_at: string;
  offer_sent_at?: string;
  employer_signed_at?: string;
  candidate_signed_at?: string;
  candidate?: { id: number; name: string; email: string };
  job?: { id: number; title: string };
}

const STATUS_CONFIG: Record<string, { en: string; bn: string; color: string; icon: React.ReactNode }> = {
  draft: { en: "Draft", bn: "খসড়া", color: "bg-gray-100 text-gray-800", icon: <FileText className="h-3.5 w-3.5" /> },
  pending_candidate: { en: "Pending Candidate", bn: "ক্যান্ডিডেট অপেক্ষমাণ", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3.5 w-3.5" /> },
  candidate_accepted: { en: "Accepted", bn: "গৃহীত", color: "bg-blue-100 text-blue-800", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  candidate_rejected: { en: "Rejected", bn: "প্রত্যাখ্যাত", color: "bg-red-100 text-red-800", icon: <XCircle className="h-3.5 w-3.5" /> },
  employer_signed: { en: "Employer Signed", bn: "এম্প্লয়ার সাইন", color: "bg-purple-100 text-purple-800", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  candidate_signed: { en: "Candidate Signed", bn: "ক্যান্ডিডেট সাইন", color: "bg-indigo-100 text-indigo-800", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  active: { en: "Active", bn: "সক্রিয়", color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  completed: { en: "Completed", bn: "সম্পন্ন", color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  terminated: { en: "Terminated", bn: "বিচ্ছিন্ন", color: "bg-red-100 text-red-800", icon: <XCircle className="h-3.5 w-3.5" /> },
  disputed: { en: "Disputed", bn: "বিরোধ", color: "bg-orange-100 text-orange-800", icon: <AlertCircle className="h-3.5 w-3.5" /> },
};

export default function ContractsClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  const fetchContracts = () => {
    setLoading(true);
    const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    api.get(`/employer/contracts${params}`)
      .then((res) => {
        const data = res.data?.data;
        setContracts(Array.isArray(data) ? data : data?.data || []);
      })
      .catch(() => toast.error(isBn ? "লোড করতে ব্যর্থ" : "Failed to load"))
      .finally(() => setLoading(false));
  };

  const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: contracts.length };
    for (const c of contracts) {
      counts[c.offer_status] = (counts[c.offer_status] || 0) + 1;
    }
    return counts;
  }, [contracts]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isBn ? "চুক্তি" : "Contracts"}</h1>
        <p className="text-muted-foreground mt-1">
          {isBn ? "আপনার সকল চুক্তি ও অফার দেখুন" : "View all your contracts and offers"}
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending_candidate", "candidate_accepted", "active", "completed", "terminated"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="h-8 text-xs"
          >
            {s === "all" ? (isBn ? "সব" : "All") : getStatusConfig(s)[isBn ? "bn" : "en"]}
            <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
              {statusCounts[s] || 0}
            </Badge>
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">{isBn ? "কোনো চুক্তি নেই" : "No contracts yet"}</h3>
          <p className="text-muted-foreground mt-1">
            {isBn ? "Applicants page থেকে কাস্টম হায়ার অফার পাঠান" : "Send a custom hire offer from the Applicants page"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const statusCfg = getStatusConfig(contract.offer_status);
            return (
              <Card
                key={contract.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/employer/contracts/${contract.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{contract.title}</h3>
                        <Badge className={`${statusCfg.color} text-xs`}>
                          {statusCfg.icon}
                          <span className="ml-1">{statusCfg[isBn ? "bn" : "en"]}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                        {contract.candidate && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {contract.candidate.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          ৳{contract.budget.toLocaleString()}
                        </span>
                        {contract.delivery_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(contract.delivery_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      {contract.offer_sent_at && (
                        <p>{isBn ? "প্রেরিত" : "Sent"}: {new Date(contract.offer_sent_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
