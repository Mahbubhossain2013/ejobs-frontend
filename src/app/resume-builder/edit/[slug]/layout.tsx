export function generateStaticParams() {
  return [{ slug: "__placeholder__" }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}