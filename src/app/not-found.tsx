import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-7xl text-rose-deep">404</p>
      <h1 className="mt-4 font-display text-3xl">This page is out of stock</h1>
      <p className="mt-3 max-w-md text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
        <Link href="/catalog" className="btn-secondary">
          Shop all
        </Link>
      </div>
    </div>
  );
}
