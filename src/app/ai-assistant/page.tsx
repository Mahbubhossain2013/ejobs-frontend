"use client";

import dynamic from "next/dynamic";

const AiAssistantClient = dynamic(() => import("./AiAssistantClient"), { ssr: false });

export default function AiAssistantPage() {
  return <AiAssistantClient />;
}
