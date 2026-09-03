import type { Metadata } from "next";
import LoginClient from "./LoginClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "Login",
  description: `Login to your ${siteName} account.`,
};

export default function LoginPage() {
  return <LoginClient />;
}
