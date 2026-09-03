import type { Metadata } from "next";
import CompanyDetailClient from "./CompanyDetailClient";

export function generateStaticParams() {
  return [{ slug: "__placeholder__" }];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";
  return {
    title: name,
    description: `View ${name} company profile, open positions, and reviews on ${siteName}.`,
    openGraph: {
      title: `${name} | ${siteName}`,
      description: `View ${name} company profile, open positions, and reviews on ${siteName}.`,
      type: "website",
    },
  };
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <CompanyDetailClient slug={slug} />;
}
