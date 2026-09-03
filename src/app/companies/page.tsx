import type { Metadata } from "next";
import CompaniesListClient from "./CompaniesListClient";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Explore top companies hiring now. View company profiles, reviews, and open positions.",
};

export default function CompaniesPage() {
  return <CompaniesListClient />;
}
