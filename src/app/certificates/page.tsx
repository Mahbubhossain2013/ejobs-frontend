"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Award, Download, Eye, Trash2, ExternalLink } from "lucide-react";

interface Certificate {
  id: number;
  certificate_number: string;
  recipient_name: string;
  course_title: string;
  type: string;
  score: number | null;
  issued_at: string;
  expires_at: string | null;
  is_verified: boolean;
  generated_at: string | null;
}

export default function CertificatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    api.get("/certificates/my")
      .then((res) => setCertificates(res.data?.data?.data || []))
      .catch(() => toast.error("Failed to load certificates"))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    setDeleting(id);
    try {
      await api.delete(`/certificates/${id}`);
      setCertificates((prev) => prev.filter((c) => c.id !== id));
      toast.success("Certificate deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "course_completion":
        return <Badge className="bg-emerald-100 text-emerald-800">Course Completion</Badge>;
      case "assessment_pass":
        return <Badge className="bg-blue-100 text-blue-800">Assessment Passed</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">My Certificates</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              View and download your earned certificates from skill courses and assessments.
            </p>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-20">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No certificates yet</p>
              <Button onClick={() => router.push("/skills")}>
                Browse Skill Courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      {getTypeBadge(cert.type)}
                      {cert.is_verified && (
                        <Badge variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{cert.course_title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      Recipient: {cert.recipient_name}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Certificate No: {cert.certificate_number}
                    </p>

                    {cert.score !== null && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="text-xl font-bold">{cert.score}%</p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground space-y-1 mb-4">
                      <p>Issued: {cert.issued_at}</p>
                      {cert.expires_at && (
                        <p>Expires: {cert.expires_at}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <a href={`/api/certificates/${cert.id}/download`} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" /> Download
                        </a>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                      >
                        <a href={`/verify?number=${cert.certificate_number}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" /> Verify
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(cert.id)}
                        disabled={deleting === cert.id}
                      >
                        {deleting === cert.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
