import type { Metadata } from "next";
import ContractDetailClient from "./ContractDetailClient";

export const metadata: Metadata = {
  title: "Contract Details",
};

export default function ContractDetailPage() {
  return <ContractDetailClient />;
}
