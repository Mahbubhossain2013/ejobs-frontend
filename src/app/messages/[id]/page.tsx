import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function MessagesIdRedirect({ params }: { params: { id: string } }) { redirect(`/dashboard/messages/${params.id}`); }
