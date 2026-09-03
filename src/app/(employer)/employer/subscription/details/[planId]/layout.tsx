export function generateStaticParams() {
  return [{ planId: "__placeholder__" }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
