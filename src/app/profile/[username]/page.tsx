import type { Metadata } from "next";
import PublicProfileClient from "./PublicProfileClient";

export function generateStaticParams() {
  return [{ username: "__placeholder__" }];
}

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} - Profile`, description: `Public profile of ${username}` };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  return <PublicProfileClient username={username} />;
}
