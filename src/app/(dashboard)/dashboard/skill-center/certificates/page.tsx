"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, CheckCircle, ExternalLink, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Certificate {
  id: number;
  certificate_number: string;
  course_title: string;
  recipient_name: string;
  type: string;
  score: number | null;
  issued_at: string;
  expires_at: string | null;
  is_verified: boolean;
  file_path: string | null;
  description: string | null;
}

export default function CertificatesPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const params = filter !== "all" ? `?type=${filter}` : "";
    api.get(`/certificates/mine${params}`).then((res) => {
      setCertificates(res.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  const handleDownload = async (cert: Certificate) => {
    try {
      const res = await api.get(`/certificates/${cert.id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data as any);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cert.certificate_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(isBn ? "ডাউনলোড ব্যর্থ" : "Download failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isBn ? "আমার সার্টিফিকেট" : "My Certificates"}</h1>
        <p className="text-muted-foreground mt-1">
          {isBn ? "আপনার অর্জিত সার্টিফিকেটসমূহ" : "Your earned certificates"}
        </p>
      </div>

      <div className="flex gap-2">
        {[
          { value: "all", label: isBn ? "সব" : "All" },
          { value: "course_completion", label: isBn ? "কোর্স সম্পন্ন" : "Course" },
          { value: "assessment_pass", label: isBn ? "পরীক্ষা পাস" : "Assessment" },
        ].map((f) => (
          <Button key={f.value} variant={filter === f.value ? "default" : "outline"} size="sm" onClick={() => setFilter(f.value)}>
            {f.label}
          </Button>
        ))}
      </div>

      {certificates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{cert.certificate_number}</p>
                      <p className="font-semibold text-sm">{cert.course_title}</p>
                    </div>
                  </div>
                  {cert.is_verified && (
                    <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600">
                      <CheckCircle className="h-3 w-3 mr-1" /> {isBn ? "যাচাইকৃত" : "Verified"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {isBn ? "প্রদান" : "Issued"}: {new Date(cert.issued_at).toLocaleDateString()}
                  </div>
                  {cert.score !== null && (
                    <p>{isBn ? "স্কোর" : "Score"}: {cert.score}%</p>
                  )}
                  {cert.type && (
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {cert.type.replace("_", " ")}
                    </Badge>
                  )}
                </div>

                <Button size="sm" className="w-full" onClick={() => handleDownload(cert)}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> {isBn ? "ডাউনলোড" : "Download"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <Award className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="font-semibold">{isBn ? "কোনো সার্টিফিকেট নেই" : "No Certificates Yet"}</h3>
            <p className="text-sm text-muted-foreground">
              {isBn ? "কোর্স সম্পন্ন করলে সার্টিফিকেট পাবেন" : "Complete a course to earn your first certificate"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
