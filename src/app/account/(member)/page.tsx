"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/components/order/labels";
import { Field } from "@/components/ui/field";
import { api, errorText } from "@/lib/client-api";
import { formatDate, formatPrice } from "@/lib/format";
import type { Customer } from "@/lib/types";
import { useCustomer } from "@/stores/customer";

interface OrderRow {
  id: string;
  number: number;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  itemsCount: number;
  createdAt: string;
  previews: { imageUrl: string | null; productName: string }[];
}

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().max(100),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, "Enter a valid phone number"),
  marketingOptIn: z.boolean(),
});

export default function AccountPage() {
  const customer = useCustomer((s) => s.customer)!;
  const setCustomer = useCustomer((s) => s.set);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: customer.firstName, lastName: customer.lastName ?? "", phone: customer.phone ?? "", marketingOptIn: customer.marketingOptIn },
  });
  const e = form.formState.errors;

  useEffect(() => {
    void api.get<OrderRow[]>("/customer/orders?limit=20").then(setOrders).catch(() => setOrders([]));
  }, []);

  const save = form.handleSubmit(async (v) => {
    setMsg(null);
    try {
      const c = await api.patch<Customer>("/customer/me", { ...v, lastName: v.lastName || undefined, phone: v.phone || undefined });
      setCustomer(c);
      setMsg({ ok: true, text: "Profile saved" });
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    }
  });

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section aria-labelledby="orders-h" className="min-w-0">
        <h2 id="orders-h" className="font-display text-2xl">
          Order history
        </h2>
        {!orders ? (
          <Loader2 className="mt-6 size-5 animate-spin text-muted" />
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-cream p-8 text-center">
            <p className="text-muted">You haven’t placed any orders yet.</p>
            <Link href="/catalog" className="btn-primary mt-5">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.number}`} className="flex items-center gap-4 py-4 hover:bg-cream/50">
                  <div className="flex -space-x-3">
                    {o.previews.slice(0, 3).map((p, i) => (
                      <div key={i} className="relative h-16 w-12 overflow-hidden rounded-lg border-2 border-warm-white bg-cream">
                        {p.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Order #{o.number}</p>
                    <p className="text-sm text-muted">
                      {formatDate(o.createdAt)} · {o.itemsCount} {o.itemsCount === 1 ? "item" : "items"}
                    </p>
                    <p className="text-sm">
                      {ORDER_STATUS[o.status]} · <span className="text-muted">{PAYMENT_STATUS[o.paymentStatus]}</span>
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatPrice(o.total, o.currency)}</p>
                  <ChevronRight className="size-4 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="profile-h" className="h-fit rounded-[1.5rem] bg-cream/70 p-6">
        <h2 id="profile-h" className="font-display text-2xl">
          Profile
        </h2>
        <p className="mt-1 text-sm text-muted">{customer.email}</p>
        <form onSubmit={save} noValidate className="mt-5 space-y-4">
          <Field label="First name" htmlFor="firstName" error={e.firstName?.message}>
            <input id="firstName" className="input" {...form.register("firstName")} />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <input id="lastName" className="input" {...form.register("lastName")} />
          </Field>
          <Field label="Phone" htmlFor="phone" error={e.phone?.message}>
            <input id="phone" type="tel" className="input" {...form.register("phone")} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-ink" {...form.register("marketingOptIn")} /> Email me news and offers
          </label>
          {msg && <p className={msg.ok ? "text-sm text-success" : "text-sm text-danger"}>{msg.text}</p>}
          <button type="submit" className="btn-primary w-full" disabled={form.formState.isSubmitting}>
            Save changes
          </button>
        </form>
      </section>
    </div>
  );
}
