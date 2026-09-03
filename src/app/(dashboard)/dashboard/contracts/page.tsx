"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api-client";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileText, PenLine, XCircle, CheckCircle, User, DollarSign,
  Calendar, Shield, Check, Send, Loader2, Clock, AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Contract {
  id: number;
  title: string;
  project_scope: string | null;
  budget: number;
  platform_fee: number;
  total_amount: number;
  delivery_date: string | null;
  status: string;
  offer_status: string;
  deliverables?: string[] | null;
  budget_type?: string | null;
  ownership_clause: string | null;
  confidentiality_clause: string | null;
  penalty_clause: string | null;
  dispute_clause: string | null;
  additional_terms: string | null;
  offer_sent_at?: string | null;
  offer_expires_at?: string | null;
  employer_signed_at: string | null;
  candidate_signed_at: string | null;
  rejection_reason: string | null;
  terminated_at: string | null;
  created_at: string;
  employer: { id: number; name: string; avatar: string | null; username: string };
  candidate: { id: number; name: string; avatar: string | null; username: string };
  job: { id: number; title: string };
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-gray-500", icon: <FileText className="w-3 h-3" /> },
  pending_employer: { label: "Awaiting Employer", color: "bg-yellow-500", icon: <Clock className="w-3 h-3" /> },
  pending_candidate: { label: "Pending Offer", color: "bg-yellow-500", icon: <Clock className="w-3 h-3" /> },
  candidate_accepted: { label: "Accepted", color: "bg-blue-500", icon: <Check className="w-3 h-3" /> },
  candidate_rejected: { label: "Rejected", color: "bg-red-500", icon: <XCircle className="w-3 h-3" /> },
  employer_signed: { label: "Employer Signed", color: "bg-purple-500", icon: <Shield className="w-3 h-3" /> },
  candidate_signed: { label: "Candidate Signed", color: "bg-indigo-500", icon: <Shield className="w-3 h-3" /> },
  active: { label: "Active", color: "bg-green-500", icon: <CheckCircle className="w-3 h-3" /> },
  completed: { label: "Completed", color: "bg-green-700", icon: <CheckCircle className="w-3 h-3" /> },
  terminated: { label: "Terminated", color: "bg-red-500", icon: <XCircle className="w-3 h-3" /> },
  disputed: { label: "Disputed", color: "bg-orange-500", icon: <AlertCircle className="w-3 h-3" /> },
};

const FILTERS = ["all", "pending_candidate", "candidate_accepted", "active", "completed", "terminated"];
const FILTER_LABELS: Record<string, string> = {
  all: "All",
  pending_candidate: "Pending",
  candidate_accepted: "Accepted",
  active: "Active",
  completed: "Completed",
  terminated: "Terminated",
};

export default function ContractsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && resolvedTheme === "dark";
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Contract | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [signing, setSigning] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await api.get(`/candidate/contracts${params}`);
      setContracts(res.data.data?.data || []);
    } catch {
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const handleAccept = async (c: Contract) => {
    setAccepting(true);
    try {
      await api.post(`/candidate/contracts/${c.id}/accept`);
      toast.success("Offer accepted!");
      setSelected(null);
      setDetailOpen(false);
      fetchContracts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept");
    } finally {
      setAccepting(false);
    }
  };

  const handleRequestOtp = async (contractId: number) => {
    setOtpSending(true);
    try {
      await api.post(`/candidate/contracts/${contractId}/request-otp`);
      toast.success("OTP sent to your email");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleSign = async () => {
    if (!selected || !otp) return;
    setSigning(true);
    try {
      await api.post(`/candidate/contracts/${selected.id}/sign`, { otp });
      toast.success("Contract signed successfully!");
      setSignDialogOpen(false);
      setOtp("");
      setSelected(null);
      fetchContracts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signing failed");
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason) return;
    setRejecting(true);
    try {
      await api.post(`/candidate/contracts/${selected.id}/reject`, { rejection_reason: rejectReason });
      toast.success("Contract rejected");
      setRejectOpen(false);
      setRejectReason("");
      setSelected(null);
      fetchContracts();
    } catch {
      toast.error("Failed to reject contract");
    } finally {
      setRejecting(false);
    }
  };

  const getStatusInfo = (c: Contract) => {
    const key = c.offer_status || c.status;
    return STATUS_MAP[key] || STATUS_MAP.draft;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Contracts & Agreements</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Manage, sign, and track your contracts</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? "bg-blue-600 text-white" : isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              {FILTER_LABELS[f] || f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className={`h-32 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />)}
          </div>
        ) : contracts.length === 0 ? (
          <Card className={isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className={`w-12 h-12 mb-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
              <p className={`text-lg font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>No contracts found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {contracts.map((c) => {
              const s = getStatusInfo(c);
              return (
                <Card key={c.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"}`}
                  onClick={() => { setSelected(c); setDetailOpen(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{c.title}</h3>
                          <Badge className={`${s.color} text-white text-[10px] flex items-center gap-1`}>
                            {s.icon}{s.label}
                          </Badge>
                        </div>
                        <div className={`flex items-center gap-4 mt-2 text-xs ${isDark ? "text-gray-400" : "text-gray-500"} flex-wrap`}>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(c.total_amount)}</span>
                          {c.delivery_date && (
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(c.delivery_date)}</span>
                          )}
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{c.employer.name}</span>
                        </div>
                      </div>
                      {c.offer_status === "pending_candidate" && (
                        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" onClick={() => { setSelected(c); setRejectOpen(true); }}
                            className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50">
                            <XCircle className="w-3 h-3 mr-1" />Reject
                          </Button>
                          <Button size="sm" onClick={() => handleAccept(c)} disabled={accepting}
                            className="h-7 text-xs bg-green-600 hover:bg-green-700">
                            <Check className="w-3 h-3 mr-1" />Accept
                          </Button>
                        </div>
                      )}
                      {c.offer_status === "candidate_accepted" && (
                        <Button size="sm" className="shrink-0 h-7 text-xs"
                          onClick={(e) => { e.stopPropagation(); setSelected(c); setSignDialogOpen(true); handleRequestOtp(c.id); }}>
                          <PenLine className="w-3 h-3 mr-1" />Sign
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className={`max-w-2xl max-h-[85vh] overflow-y-auto ${isDark ? "bg-gray-800" : "bg-white"}`}>
          {selected && (() => {
            const s = getStatusInfo(selected);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>{selected.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    Contract #{selected.id}
                    <Badge className={`${s.color} text-white text-[10px] flex items-center gap-1`}>
                      {s.icon}{s.label}
                    </Badge>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Budget</Label>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{formatCurrency(selected.budget)}</p>
                    </div>
                    <div>
                      <Label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Platform Fee (10%)</Label>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{formatCurrency(selected.platform_fee)}</p>
                    </div>
                    <div>
                      <Label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Amount</Label>
                      <p className={`font-semibold text-green-600`}>{formatCurrency(selected.total_amount)}</p>
                    </div>
                    <div>
                      <Label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Delivery Date</Label>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{selected.delivery_date ? formatDate(selected.delivery_date) : "N/A"}</p>
                    </div>
                  </div>

                  {selected.project_scope && (
                    <div>
                      <Label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Project Scope</Label>
                      <p className={`text-sm mt-1 whitespace-pre-wrap ${isDark ? "text-gray-300" : "text-gray-700"}`}>{selected.project_scope}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1 text-sm ${selected.employer_signed_at ? "text-green-600" : "text-gray-400"}`}>
                      <Shield className="w-4 h-4" />
                      Employer: {selected.employer_signed_at ? `Signed ${formatDate(selected.employer_signed_at)}` : "Not signed"}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${selected.candidate_signed_at ? "text-green-600" : "text-gray-400"}`}>
                      <Shield className="w-4 h-4" />
                      Candidate: {selected.candidate_signed_at ? `Signed ${formatDate(selected.candidate_signed_at)}` : "Not signed"}
                    </div>
                  </div>

                  {selected.offer_sent_at && (
                    <div className={`flex gap-4 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      <span>Sent: {formatDate(selected.offer_sent_at)}</span>
                      {selected.offer_expires_at && <span>Expires: {formatDate(selected.offer_expires_at)}</span>}
                    </div>
                  )}

                  {selected.ownership_clause && (
                    <div><Label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ownership</Label><p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{selected.ownership_clause}</p></div>
                  )}
                  {selected.confidentiality_clause && (
                    <div><Label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Confidentiality</Label><p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{selected.confidentiality_clause}</p></div>
                  )}
                  {selected.penalty_clause && (
                    <div><Label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Penalty</Label><p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{selected.penalty_clause}</p></div>
                  )}
                  {selected.additional_terms && (
                    <div><Label className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Additional Terms</Label><p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{selected.additional_terms}</p></div>
                  )}

                  {selected.rejection_reason && (
                    <div className={`p-3 rounded-lg ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                      <Label className="text-xs text-red-500">Rejection Reason</Label>
                      <p className="text-sm text-red-600">{selected.rejection_reason}</p>
                    </div>
                  )}

                  {selected.offer_status === "pending_candidate" && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => handleAccept(selected)} disabled={accepting}
                        className="bg-green-600 hover:bg-green-700">
                        {accepting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                        Accept Offer
                      </Button>
                      <Button variant="outline" onClick={() => { setDetailOpen(false); setRejectOpen(true); }} className="text-red-600 hover:text-red-700">
                        <XCircle className="w-4 h-4 mr-1" />Reject
                      </Button>
                    </div>
                  )}

                  {selected.offer_status === "candidate_accepted" && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => { setDetailOpen(false); setSignDialogOpen(true); handleRequestOtp(selected.id); }} disabled={otpSending}>
                        {otpSending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <PenLine className="w-4 h-4 mr-1" />}
                        {otpSending ? "Sending OTP..." : "Sign Contract"}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Sign Dialog */}
      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
        <DialogContent className={`max-w-sm ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <Shield className="w-5 h-5" />
              Digital Signature
            </DialogTitle>
            <DialogDescription>Enter the OTP sent to your email to sign this contract.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {!otpSending ? (
              <Button onClick={() => selected && handleRequestOtp(selected.id)} className="w-full">
                <Send className="w-4 h-4 mr-2" />Resend OTP
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />Sending OTP...
              </div>
            )}
            <Input placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
            <div className="flex gap-2">
              <Button onClick={handleSign} disabled={signing || otp.length !== 6} className="flex-1">
                {signing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <PenLine className="w-4 h-4 mr-1" />}
                {signing ? "Signing..." : "Confirm & Sign"}
              </Button>
              <Button variant="outline" onClick={() => { setSignDialogOpen(false); setOtp(""); }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className={`max-w-md ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>Reject Contract</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this contract.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea placeholder="Rejection reason (min 10 characters)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleReject} disabled={rejecting || rejectReason.length < 10} className="flex-1">
                {rejecting ? "Rejecting..." : "Reject Contract"}
              </Button>
              <Button variant="outline" onClick={() => { setRejectOpen(false); setRejectReason(""); }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
