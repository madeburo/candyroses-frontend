"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderDetails } from "@/components/order/order-details";
import { api } from "@/lib/client-api";
import type { PublicOrder } from "@/lib/types";

export default function AccountOrderPage() {
  const { number } = useParams<{ number: string }>();
  const [order, setOrder] = useState<PublicOrder | null | undefined>(undefined);
  useEffect(() => {
    void api.get<PublicOrder>(`/customer/orders/${encodeURIComponent(number)}`).then(setOrder).catch(() => setOrder(null));
  }, [number]);
  return (
    <div>
      <Link href="/account" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All orders
      </Link>
      {order === undefined ? (
        <Loader2 className="size-5 animate-spin text-muted" />
      ) : order === null ? (
        <p className="text-muted">Order not found.</p>
      ) : (
        <>
          <h2 className="mb-8 font-display text-3xl">Order #{order.number}</h2>
          <OrderDetails order={order} />
        </>
      )}
    </div>
  );
}
