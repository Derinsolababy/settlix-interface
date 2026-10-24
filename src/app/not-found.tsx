import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 font-display text-4xl">Nothing on this page</h1>
      <Link href="/" className="btn-ghost mt-6">Back home</Link>
    </div>
  );
}
