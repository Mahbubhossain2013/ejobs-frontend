import type { Metadata } from "next";
import RemoteJobsClient from "./RemoteJobsClient";

export const metadata: Metadata = {
  title: "Remote Jobs",
  description:
    "Browse remote job opportunities. Work from anywhere with top companies.",
};

export default function RemoteJobsPage() {
  return <RemoteJobsClient />;
}
