"use client";

import { ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useHydrated } from "@/hooks/use-hydrated";
import { cartCount, useCart } from "@/stores/cart";
import { useCustomer } from "@/stores/customer";

export function CartButton() {
  const items = useCart((s) => s.items);
  // Cart lives in localStorage — render the badge only after hydration.
  const mounted = useHydrated();
  const n = mounted ? cartCount(items) : 0;
  return (
    <Link href="/cart" className="relative inline-flex size-10 items-center justify-center rounded-full sm:size-11 text-ink transition-colors hover:bg-cream" aria-label={`Shopping bag${n ? `, ${n} ${n === 1 ? "item" : "items"}` : ""}`}>
      <ShoppingBag className="size-[22px]" strokeWidth={1.6} />
      {n > 0 && (
        <span className="absolute top-1 right-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-rose-deep px-1 text-[10px] leading-[18px] font-semibold text-warm-white">
          {n > 99 ? "99+" : n}
        </span>
      )}
    </Link>
  );
}

export function AccountButton() {
  const customer = useCustomer((s) => s.customer);
  return (
    <Link
      href={customer ? "/account" : "/account/login"}
      className="inline-flex size-10 items-center justify-center rounded-full sm:size-11 text-ink transition-colors hover:bg-cream"
      aria-label={customer ? `My account (${customer.firstName})` : "Sign in"}
    >
      <User className="size-[22px]" strokeWidth={1.6} />
    </Link>
  );
}
