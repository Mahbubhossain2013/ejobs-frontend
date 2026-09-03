import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: `Reset your ${siteName} account password.`,
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
