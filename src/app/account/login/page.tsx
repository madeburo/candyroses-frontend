import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/account/auth-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <h1 className="heading-lg text-center">Sign in</h1>
        <p className="mt-3 mb-8 text-center text-muted">Track orders, save addresses and check out faster.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
