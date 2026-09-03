"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Award, Calendar, User, BookOpen } from "lucide-react";

interface VerificationResult {
  valid: boolean;
  certificate_number: string;
  recipient_name: string;
  course_title: string;
  issued_at: string;
  expires_at: string | null;
  type: string;
  score: number | null;
  is_expired: boolean;
  verification_url: string;
  error?: string;
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const number = params.number as string;
    if (!number) return;

    api.get(`/certificates/verify/${number}`)
      .then((res) => setResult(res.data?.data))
      .catch((err) => setError(err?.response?.data?.message || "Verification failed"))
      .finally(() => setLoading(false));
  }, [params.number]);

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center mb-8">
            <Award className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
            <p className="text-muted-foreground">
              Verify the authenticity of a certificate
            </p>
          </div>

          {error && (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  {result.valid ? (
                    <>
                      <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-emerald-600 mb-2">Certificate Valid</h2>
                      <p className="text-muted-foreground">
                        This certificate has been verified as authentic
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-destructive mb-2">
                        {result.is_expired ? "Certificate Expired" : "Certificate Invalid"}
                      </h2>
                      <p className="text-muted-foreground">
                        {result.is_expired
                          ? "This certificate has expired and is no longer valid"
                          : "This certificate could not be verified"}
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-4 bg-muted/50 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Certificate Number</p>
                      <p className="font-medium">{result.certificate_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Recipient</p>
                      <p className="font-medium">{result.recipient_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Course / Assessment</p>
                      <p className="font-medium">{result.course_title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Issued Date</p>
                      <p className="font-medium">{result.issued_at}</p>
                    </div>
                  </div>

                  {result.expires_at && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className={`font-medium ${result.is_expired ? "text-destructive" : ""}`}>
                          {result.expires_at}
                        </p>
                      </div>
                    </div>
                  )}

                  {result.score !== null && (
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="font-medium">{result.score}%</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Badge variant={result.valid ? "default" : "destructive"}>
                      {result.valid ? "Verified" : result.is_expired ? "Expired" : "Invalid"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
