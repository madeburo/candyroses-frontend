import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ONLINE_METHODS } from "@/components/order/labels";
import { OrderDetails } from "@/components/order/order-details";
import { PayButton } from "@/components/order/pay-button";
import { formatDateTime } from "@/lib/format";
import type { PublicOrder } from "@/lib/types";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

const API = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");

async function getOrder(token: string): Promise<PublicOrder> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound();
  const res = await fetch(`${API}/api/v1/orders/by-token/${token}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Order lookup failed: ${res.status}`);
  return ((await res.json()) as { data: PublicOrder }).data;
}

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const o = await getOrder(token);
  const awaitingOnline = ONLINE_METHODS.has(o.paymentMethod) && ["PENDING", "FAILED"].includes(o.paymentStatus) && o.status === "NEW";
  const justPlaced = sp.placed === "1" || sp.paid === "1";

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        {justPlaced && o.status !== "CANCELLED" && (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-blush px-4 py-2 text-sm font-medium text-rose-deep">
            <CheckCircle2 className="size-4" /> {sp.paid === "1" ? "Payment received — thank you!" : "Thank you! Your order has been placed."}
          </p>
        )}
        <h1 className="heading-lg">Order #{o.number}</h1>
        <p className="mt-3 text-muted">
          {o.status === "CANCELLED"
            ? "This order has been cancelled."
            : `A confirmation will be sent to ${o.email}. We’ll let you know when your order ships.`}
        </p>
        {sp.payment === "cancelled" && awaitingOnline && <p className="mt-4 rounded-xl bg-danger/5 px-4 py-3 text-sm text-danger">Payment was cancelled. Your items are reserved for a limited time.</p>}
        {awaitingOnline && (
          <div className="mt-6 space-y-2">
            <PayButton token={o.accessToken} label="Complete payment" />
            {o.paymentExpiresAt && <p className="text-sm text-muted">Your items are reserved until {formatDateTime(o.paymentExpiresAt)}.</p>}
          </div>
        )}
      </header>
      <OrderDetails order={o} />
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/catalog" className="btn-secondary">
          Continue shopping
        </Link>
        <Link href="/contact" className="btn-secondary">
          Questions? Contact us
        </Link>
      </div>
    </div>
  );
}
