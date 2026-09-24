"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, errorText } from "@/lib/client-api";

/** PayPal redirects here after approval: capture the payment server-side, then show the order. */
export function PaypalReturn() {
  const params = useSearchParams();
  const router = useRouter();
  const orderToken = params.get("order") ?? "";
  const paypalOrderId = params.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !orderToken || !paypalOrderId) return;
    started.current = true;
    api
      .post<{ status: string }>("/payments/paypal/capture", { orderToken, paypalOrderId })
      .then((r) => router.replace(`/order/${orderToken}?${r.status === "PAID" ? "paid=1" : "payment=pending"}`))
      .catch((e: unknown) => setError(errorText(e, "We could not confirm your payment.")));
  }, [orderToken, paypalOrderId, router]);

  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center text-center">
      {error || !orderToken ? (
        <>
          <h1 className="heading-lg">Payment not confirmed</h1>
          <p className="mt-3 max-w-md text-muted">{error ?? "Missing order information."} You have not been charged twice — you can retry from your order page.</p>
          {orderToken && (
            <Link href={`/order/${orderToken}`} className="btn-primary mt-8">
              View order
            </Link>
          )}
        </>
      ) : (
        <>
          <Loader2 className="size-8 animate-spin text-rose-deep" />
          <h1 className="mt-6 font-display text-3xl">Confirming your payment…</h1>
          <p className="mt-2 text-muted">Please don’t close this page.</p>
        </>
      )}
    </div>
  );
}
