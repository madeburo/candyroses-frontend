"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { PromoForm } from "@/components/cart/promo-form";
import { Summary } from "@/components/cart/summary";
import { Field } from "@/components/ui/field";
import { useHydrated } from "@/hooks/use-hydrated";
import { useQuote } from "@/hooks/use-quote";
import { api, ApiError, errorText } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import type { PaymentMethod, PublicOrder, ShippingMethod } from "@/lib/types";
import { US_STATES } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import { useCustomer } from "@/stores/customer";

const schema = z
  .object({
    email: z.email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid phone number"),
    firstName: z.string().trim().min(1, "Required").max(100),
    lastName: z.string().trim().min(1, "Required").max(100),
    shippingMethodCode: z.string().min(1, "Choose a shipping method"),
    requiresAddress: z.boolean(),
    addressLine1: z.string().trim().max(255),
    addressLine2: z.string().trim().max(255),
    city: z.string().trim().max(120),
    region: z.string().trim().max(120),
    postalCode: z.string().trim().max(20),
    paymentMethod: z.string().min(1, "Choose a payment method"),
    comment: z.string().max(1000),
    saveAddress: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (!v.requiresAddress) return;
    if (v.addressLine1.length < 3) ctx.addIssue({ code: "custom", path: ["addressLine1"], message: "Enter your street address" });
    if (!v.city) ctx.addIssue({ code: "custom", path: ["city"], message: "Required" });
    if (!v.region) ctx.addIssue({ code: "custom", path: ["region"], message: "Choose a state" });
    if (!/^\d{5}(-\d{4})?$/.test(v.postalCode)) ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Enter a 5-digit ZIP code" });
  });

type Values = z.infer<typeof schema>;

function newKey() {
  return crypto.randomUUID();
}

export function CheckoutView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const items = useCart((s) => s.items);
  const promoCode = useCart((s) => s.promoCode);
  const clear = useCart((s) => s.clear);
  const customer = useCustomer((s) => s.customer);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[] | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);
  const [placing, setPlacing] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      shippingMethodCode: "",
      requiresAddress: true,
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      paymentMethod: "",
      comment: "",
      saveAddress: true,
    },
  });
  const { register, handleSubmit, setValue, formState, control, getValues } = form;
  const errors = formState.errors;
  const shippingCode = useWatch({ control, name: "shippingMethodCode" });
  const email = useWatch({ control, name: "email" });
  const paymentCode = useWatch({ control, name: "paymentMethod" });
  const region = useWatch({ control, name: "region" });
  const requiresAddress = useWatch({ control, name: "requiresAddress" });
  const { quote, loading, refresh } = useQuote({
    shippingMethodCode: shippingCode,
    email: z.email().safeParse(email).success ? email : undefined,
    // Pickup orders are taxed at the store's location; the server treats an empty state as untaxed.
    region: requiresAddress ? region : undefined,
  });

  useEffect(() => {
    void api.get<ShippingMethod[]>("/shipping-methods").then((m) => {
      setShippingMethods(m);
      if (m[0] && !getValues("shippingMethodCode")) {
        const preferred = m.find((x) => x.requiresAddress) ?? m[0];
        setValue("shippingMethodCode", preferred.code);
        setValue("requiresAddress", preferred.requiresAddress);
      }
    });
    void api.get<PaymentMethod[]>("/payment-methods").then((m) => {
      setPaymentMethods(m);
      const first = m.find((x) => x.available);
      if (first && !getValues("paymentMethod")) setValue("paymentMethod", first.code);
    });
  }, [getValues, setValue]);

  // Prefill from the customer account.
  useEffect(() => {
    if (!customer) return;
    const v = getValues();
    if (!v.email) setValue("email", customer.email);
    if (!v.firstName) setValue("firstName", customer.firstName);
    if (!v.lastName && customer.lastName) setValue("lastName", customer.lastName);
    if (!v.phone && customer.phone) setValue("phone", customer.phone);
    void api
      .get<{ addressLine1: string; addressLine2: string | null; city: string; region: string | null; postalCode: string | null; isDefault: boolean }[]>("/customer/addresses")
      .then((list) => {
        const a = list.find((x) => x.isDefault) ?? list[0];
        if (a && !getValues("addressLine1")) {
          setValue("addressLine1", a.addressLine1);
          setValue("addressLine2", a.addressLine2 ?? "");
          setValue("city", a.city);
          setValue("region", a.region ?? "");
          setValue("postalCode", a.postalCode ?? "");
        }
      })
      .catch(() => undefined);
  }, [customer, getValues, setValue]);

  const method = shippingMethods?.find((m) => m.code === shippingCode);
  const payment = paymentMethods?.find((p) => p.code === paymentCode);

  const onSubmit = handleSubmit(async (v) => {
    setSubmitError(null);
    setPlacing(true);
    try {
      const res = await api.post<{ order: Pick<PublicOrder, "number" | "accessToken">; payment: { type: "redirect"; url: string } | { type: "none" } | null; paymentError: { message: string } | null }>("/checkout", {
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        contact: { email: v.email, phone: v.phone, firstName: v.firstName, lastName: v.lastName },
        shippingMethodCode: v.shippingMethodCode,
        address: v.requiresAddress
          ? { country: "United States", region: v.region, city: v.city, addressLine1: v.addressLine1, addressLine2: v.addressLine2 || undefined, postalCode: v.postalCode, recipient: `${v.firstName} ${v.lastName}` }
          : undefined,
        promoCode: promoCode || undefined,
        paymentMethod: v.paymentMethod,
        comment: v.comment || undefined,
        idempotencyKey,
        saveAddress: !!customer && v.saveAddress,
      });
      clear();
      setIdempotencyKey(newKey());
      if (res.payment?.type === "redirect") {
        window.location.assign(res.payment.url);
        return;
      }
      router.replace(`/order/${res.order.accessToken}?placed=1`);
    } catch (e) {
      setPlacing(false);
      if (e instanceof ApiError && ["CART_INVALID", "INSUFFICIENT_STOCK"].includes(e.code)) refresh();
      if (e instanceof ApiError && e.code.startsWith("PROMO")) refresh();
      // A validation/stock failure means nothing was created — allow a fresh attempt.
      if (e instanceof ApiError && e.status < 500) setIdempotencyKey(newKey());
      setSubmitError(errorText(e));
    }
  });

  if (!hydrated) return <div className="container-page min-h-[60vh]" />;
  if (!items.length && !placing) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="heading-lg">Your bag is empty</h1>
        <Link href="/catalog" className="btn-primary mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  const inputProps = (name: keyof Values) => ({
    id: name,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    ...register(name),
  });

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="heading-lg">Checkout</h1>
        <p className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
          <Lock className="size-4" /> Secure checkout
        </p>
      </div>
      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="contact-h">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 id="contact-h" className="font-display text-2xl">
                Contact
              </h2>
              {!customer && (
                <Link href="/account/login?next=/checkout" className="text-sm underline underline-offset-4">
                  Sign in for faster checkout
                </Link>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" error={errors.email?.message} className="sm:col-span-2" hint="We’ll send your order confirmation here">
                <input className="input" type="email" autoComplete="email" inputMode="email" {...inputProps("email")} />
              </Field>
              <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
                <input className="input" autoComplete="given-name" {...inputProps("firstName")} />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
                <input className="input" autoComplete="family-name" {...inputProps("lastName")} />
              </Field>
              <Field label="Phone" htmlFor="phone" error={errors.phone?.message} className="sm:col-span-2" hint="For delivery updates only">
                <input className="input" type="tel" autoComplete="tel" inputMode="tel" placeholder="(555) 123-4567" {...inputProps("phone")} />
              </Field>
            </div>
          </section>

          <section aria-labelledby="ship-h">
            <h2 id="ship-h" className="mb-4 font-display text-2xl">
              Delivery
            </h2>
            {!shippingMethods ? (
              <Loader2 className="size-5 animate-spin text-muted" />
            ) : (
              <fieldset className="space-y-3">
                <legend className="sr-only">Shipping method</legend>
                {shippingMethods.map((m) => {
                  const on = shippingCode === m.code;
                  const shownPrice = on && quote?.shipping ? quote.shipping.price : m.price;
                  return (
                    <label key={m.code} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors", on ? "border-ink bg-cream/60" : "border-line hover:border-ink/40")}>
                      <input
                        type="radio"
                        value={m.code}
                        checked={on}
                        onChange={() => {
                          setValue("shippingMethodCode", m.code, { shouldValidate: true });
                          setValue("requiresAddress", m.requiresAddress);
                        }}
                        className="mt-1 size-4 accent-ink"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex justify-between gap-3 font-medium">
                          {m.name}
                          <span className="shrink-0 tabular-nums">{shownPrice === 0 ? "Free" : formatPrice(shownPrice)}</span>
                        </span>
                        <span className="mt-0.5 block text-sm text-muted">
                          {[m.description, m.estimatedDays].filter(Boolean).join(" · ")}
                          {m.freeFromAmount && m.price > 0 ? ` · Free over ${formatPrice(m.freeFromAmount)}` : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
                {errors.shippingMethodCode && <p className="text-sm text-danger">{errors.shippingMethodCode.message}</p>}
              </fieldset>
            )}

            {method?.requiresAddress !== false && (
              <div className="mt-6 grid gap-4 sm:grid-cols-6">
                <Field label="Street address" htmlFor="addressLine1" error={errors.addressLine1?.message} className="sm:col-span-6">
                  <input className="input" autoComplete="address-line1" {...inputProps("addressLine1")} />
                </Field>
                <Field label="Apartment, suite, etc. (optional)" htmlFor="addressLine2" className="sm:col-span-6">
                  <input className="input" autoComplete="address-line2" {...inputProps("addressLine2")} />
                </Field>
                <Field label="City" htmlFor="city" error={errors.city?.message} className="sm:col-span-3">
                  <input className="input" autoComplete="address-level2" {...inputProps("city")} />
                </Field>
                <Field label="State" htmlFor="region" error={errors.region?.message} className="sm:col-span-2">
                  <select className="input" autoComplete="address-level1" {...inputProps("region")}>
                    <option value="">Select</option>
                    {US_STATES.map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ZIP code" htmlFor="postalCode" error={errors.postalCode?.message} className="sm:col-span-1">
                  <input className="input" autoComplete="postal-code" inputMode="numeric" maxLength={10} {...inputProps("postalCode")} />
                </Field>
                <p className="text-sm text-muted sm:col-span-6">Country: United States</p>
                {customer && (
                  <label className="flex items-center gap-2 text-sm sm:col-span-6">
                    <input type="checkbox" className="size-4 accent-ink" {...register("saveAddress")} /> Save this address to my account
                  </label>
                )}
              </div>
            )}
          </section>

          <section aria-labelledby="pay-h">
            <h2 id="pay-h" className="mb-4 font-display text-2xl">
              Payment
            </h2>
            {!paymentMethods ? (
              <Loader2 className="size-5 animate-spin text-muted" />
            ) : (
              <fieldset className="space-y-3">
                <legend className="sr-only">Payment method</legend>
                {paymentMethods.map((p) => (
                  <label
                    key={p.code}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-4 transition-colors",
                      !p.available ? "cursor-not-allowed border-line opacity-60" : paymentCode === p.code ? "cursor-pointer border-ink bg-cream/60" : "cursor-pointer border-line hover:border-ink/40",
                    )}
                  >
                    <input type="radio" value={p.code} disabled={!p.available} {...register("paymentMethod")} className="mt-1 size-4 accent-ink" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 font-medium">
                        {p.title}
                        {!p.available && <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted uppercase">Coming soon</span>}
                      </span>
                      <span className="block text-sm text-muted">{p.description}</span>
                    </span>
                  </label>
                ))}
                {!paymentMethods.some((p) => p.available) && (
                  <p className="rounded-xl bg-cream p-4 text-sm text-ink-soft">
                    Online payment is being set up and will be available very soon. To place an order now, please{" "}
                    <Link href="/contact" className="underline underline-offset-4">
                      contact us
                    </Link>
                    .
                  </p>
                )}
              </fieldset>
            )}
          </section>

          <section>
            <Field label="Order notes (optional)" htmlFor="comment" hint="Gift message, preferred delivery time, etc.">
              <textarea className="input h-auto min-h-24 py-3" rows={3} {...inputProps("comment")} />
            </Field>
          </section>
        </div>

        <aside className="h-fit space-y-5 rounded-[1.5rem] bg-cream/70 p-5 sm:p-7 lg:sticky lg:top-32 xl:top-44">
          <h2 className="font-display text-2xl">Your order</h2>
          <ul className="max-h-72 space-y-4 overflow-y-auto pr-1">
            {items.map((i) => {
              const line = quote?.lines.find((l) => l.variantId === i.variantId);
              return (
                <li key={i.variantId} className="flex gap-3">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-warm-white">
                    {i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                    <span className="absolute -top-0 -right-0 flex size-5 items-center justify-center rounded-bl-lg bg-ink text-[11px] font-semibold text-warm-white">{i.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="line-clamp-2 font-medium">{i.productName}</p>
                    <p className="text-muted">{i.variantTitle}</p>
                    {line?.issue && <p className="text-danger">{line.issue.message}</p>}
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{formatPrice((line?.unitPrice ?? i.price) * i.quantity)}</p>
                </li>
              );
            })}
          </ul>
          <PromoForm quote={quote} loading={loading} />
          {quote ? (
            <div className={cn("transition-opacity", loading && "opacity-60")}>
              <Summary quote={quote} showShipping shippingPending={!shippingCode} />
            </div>
          ) : (
            <Loader2 className="mx-auto size-5 animate-spin text-muted" />
          )}
          {quote?.shippingError && <p className="text-sm text-danger">{quote.shippingError.message}</p>}
          {submitError && (
            <p className="flex gap-2 rounded-xl bg-danger/5 p-3 text-sm text-danger" role="alert">
              <AlertCircle className="size-4 shrink-0" /> {submitError}
            </p>
          )}
          <button type="submit" disabled={placing || !quote || quote.hasIssues || !payment?.available} className="btn-primary w-full">
            {placing && <Loader2 className="size-4 animate-spin" />}
            {payment?.online ? `Continue to ${payment.title}` : "Place order"}
            {quote && !placing ? ` · ${formatPrice(quote.total, quote.currency)}` : ""}
          </button>
          <p className="text-center text-xs leading-relaxed text-muted">
            By placing your order you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}
