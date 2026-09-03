export function generateStaticParams() {
  return [{ number: "__placeholder__" }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
