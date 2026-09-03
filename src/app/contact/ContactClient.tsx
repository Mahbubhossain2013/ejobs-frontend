"use client";

import { useEffect, useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import api from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "isomorphic-dompurify";

export default function ContactClient() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pubSettings, setPubSettings] = useState<any>({});

  useEffect(() => {
    api
      .get("/pages/contact")
      .then((res) => setContent(res.data?.data?.content || ""))
      .catch(() => setContent(""))
      .finally(() => setLoading(false));

    api
      .get("/settings/public")
      .then((res) => setPubSettings(res.data?.data || {}))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await api.post("/contact", formData);
      if (res.data?.status) {
        setSubmitResult({ success: true, message: "Message sent successfully. We'll get back to you soon." });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitResult({ success: false, message: res.data?.message || "Failed to send message." });
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err.response?.data?.message || "Failed to send message. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const defaultEmail = "support@" + (process.env.NEXT_PUBLIC_APP_NAME?.toLowerCase() || "ejobs") + ".bd";

  return (
    <PublicLayout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <h1 className="text-4xl font-bold text-center mb-6">Contact Us</h1>
          <p className="text-muted-foreground text-center mb-12">
            Have questions? We&apos;d love to hear from you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Mail, label: "Email", value: pubSettings.support_email || defaultEmail },
              { icon: Phone, label: "Phone", value: pubSettings.support_phone || "+880 1XXX-XXXXXX" },
              { icon: MapPin, label: "Address", value: "Dhaka, Bangladesh" },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-5 text-center">
                  <item.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : content ? (
            <Card>
              <CardContent className="p-6">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                  {submitResult && (
                    <p className={`text-sm ${submitResult.success ? "text-green-600" : "text-red-600"}`}>
                      {submitResult.message}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
