import type { Metadata } from "next";
import { Suspense } from "react";
import { PaypalReturn } from "./view";

export const metadata: Metadata = { title: "Confirming payment", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <PaypalReturn />
    </Suspense>
  );
}
