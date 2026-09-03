import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "Chat with our AI career assistant for personalized guidance and job recommendations.",
};

export default function AiAssistantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
