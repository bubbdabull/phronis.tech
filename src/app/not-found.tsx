import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-phronis-teal">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-phronis-foreground">Page not found</h1>
      <Link href="/" className="mt-8 inline-block text-sm text-phronis-teal underline-offset-4 hover:underline">
        Back home
      </Link>
    </div>
  );
}
