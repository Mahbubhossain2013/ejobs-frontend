import type { Metadata } from "next";
import ContactClient from "./ContactClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    `Get in touch with ${siteName}.bd. Have questions about jobs, hiring, or our platform? We're here to help.`,
};

export default function ContactPage() {
  return <ContactClient />;
}
