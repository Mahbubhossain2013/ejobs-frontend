"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "isomorphic-dompurify";

interface Faq {
  id: number;
  title: string;
  content: string;
}

export default function HelpPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    api
      .get("/faqs")
      .then((res) => setFaqs(res.data?.data || []))
      .catch(() => { /* handled */ })
      .finally(() => setLoading(false));
  }, []);

  const filtered = faqs.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.content.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PublicLayout>
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Help Center
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            How can we help you?
          </h1>
          <p className="text-muted-foreground mb-6">
            Browse frequently asked questions or search below.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No FAQs found</p>
              <p className="text-sm mt-1">
                {search ? "Try a different search term." : "No questions have been added yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq) => (
                <Card key={faq.id} className="overflow-hidden">
                  <button
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-sm pr-4">{faq.title}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        openId === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openId === faq.id && (
                    <CardContent className="px-6 pb-4 pt-0">
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.content) }}
                      />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
