"use client";

import "./globals.css";

// Replaces the root layout when it fails, so it renders its own <html> and <body>.
export default function GlobalError() {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center bg-cream px-4 py-16 text-center text-ink">
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image is unavailable outside the root layout */}
        <img src="/brand/logo-horizontal.webp" alt="Candy Roses Shop" className="h-16 w-auto" />
        <h1 className="font-display mt-10 text-4xl">This page couldn’t load</h1>
        <p className="mt-3 max-w-md text-muted">Please reload the page. If the problem persists, contact us and we’ll help right away.</p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={() => window.location.reload()} className="btn-primary">
            Reload
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full reload is intended here */}
          <a href="/" className="btn-secondary">
            Home
          </a>
        </div>
      </body>
    </html>
  );
}
