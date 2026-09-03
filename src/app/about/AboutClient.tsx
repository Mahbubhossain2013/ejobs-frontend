"use client";

import { useEffect, useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import api from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeStore } from "@/store/theme-store";
import DOMPurify from "isomorphic-dompurify";

export default function AboutClient() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { settings } = useThemeStore();
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

  useEffect(() => {
    api
      .get("/pages/about")
      .then((res) => setContent(res.data?.data?.content || ""))
      .catch(() => setContent(""))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">About {siteName}</h1>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : content ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
              <p>Bangladesh&apos;s leading AI-powered job portal connecting talented professionals with top employers.</p>
              <h2 className="text-xl font-semibold text-foreground">Our Mission</h2>
              <p>To bridge the gap between talent and opportunity using AI-powered matching and innovative tools.</p>
              <h2 className="text-xl font-semibold text-foreground">For Everyone</h2>
              <p>Whether you&apos;re a fresh graduate or an experienced professional, we have tools for your career growth.</p>
              <h2 className="text-xl font-semibold text-foreground">For Employers</h2>
              <p>Find the perfect candidate with our AI-powered matching, applicant tracking, and promotion tools.</p>
              <h2 className="text-xl font-semibold text-foreground">Trust &amp; Safety</h2>
              <p>Verified profiles, secure messaging, and AI moderation ensure a safe platform for all users.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
