import { redirect } from "next/navigation";

export default function MessagesRedirect() {
  // Role-based redirect handled by middleware or client-side; default to candidate
  redirect("/dashboard/messages");
}
