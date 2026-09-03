import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description:
    "Choose the right plan for your career or hiring needs. Affordable pricing for individuals and companies.",
};

export default function PricingPage() {
  return <PricingClient />;
}
