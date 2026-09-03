import CvDatabaseClient from "./CvDatabaseClient";

export const metadata = {
  title: "CV Database | JobBazar Employer",
  description: "Search and download candidate CVs in bulk",
};

export default function CvDatabasePage() {
  return <CvDatabaseClient />;
}
