import type { Metadata } from "next";
import CategoryJobsClient from "./CategoryJobsClient";

export function generateStaticParams() {
  return [{ category_id: "__placeholder__" }];
}

type Props = { params: Promise<{ category_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category_id } = await params;
  try {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const cleanApiUrl = rawApiUrl.replace(/\/$/, "");
    const apiUrl = cleanApiUrl.endsWith("/api") ? cleanApiUrl : `${cleanApiUrl}/api`;
    const res = await fetch(`${apiUrl}/categories/${category_id}`, { next: { revalidate: 300 } });
    const json = await res.json();
    const cat = json?.data?.category;
    if (cat) {
      const name = cat.name_en || cat.name_bn || "Category";
      const nameBn = cat.name_bn || name;
      return {
        title: `${nameBn} (${name}) Jobs`,
        description: `Browse all ${name} jobs. Find the best opportunities in ${nameBn}.`,
      };
    }
  } catch {}
  return { title: "Category Jobs" };
}

export default async function CategoryPage({ params }: Props) {
  const { category_id } = await params;
  return <CategoryJobsClient categoryId={category_id} />;
}
