import type { Metadata } from "next";
import CvPreviewClient from "./CvPreviewClient";

export function generateStaticParams() {
  return [{ uuid: "__placeholder__" }];
}

export const metadata: Metadata = {
  title: "CV Preview",
  description: "Preview your CV resume",
};

export default function CvPreviewPage() {
  return <CvPreviewClient />;
}
