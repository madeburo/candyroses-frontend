import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/account/auth-form";

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <h1 className="heading-lg text-center">Create account</h1>
        <p className="mt-3 mb-8 text-center text-muted">Save your details, track orders and get early access to new arrivals.</p>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
