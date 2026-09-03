export function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
