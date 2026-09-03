import type { Metadata } from "next";
import ContractsClient from "./ContractsClient";

export const metadata: Metadata = {
  title: "Contracts",
};

export default function EmployerContractsPage() {
  return <ContractsClient />;
}
