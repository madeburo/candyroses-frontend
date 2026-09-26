"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { mergeServerCart } from "@/components/layout/cart-sync";
import { Field } from "@/components/ui/field";
import { api, errorText } from "@/lib/client-api";
import type { Customer } from "@/lib/types";
import { useCustomer } from "@/stores/customer";

const loginSchema = z.object({ email: z.email("Enter a valid email"), password: z.string().min(1, "Enter your password") });
const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().max(100),
  email: z.email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, "Enter a valid phone number"),
  password: z.string().min(8, "At least 8 characters").max(256),
  marketingOptIn: z.boolean(),
});

function safeNext(v: string | null) {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/account";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setCustomer = useCustomer((s) => s.set);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const e = form.formState.errors;
  const submit = form.handleSubmit(async (v) => {
    setError(null);
    try {
      const r = await api.post<{ customer: Customer }>("/customer/auth/login", v);
      setCustomer(r.customer);
      await mergeServerCart().catch(() => undefined);
      router.replace(safeNext(params.get("next")));
      router.refresh();
    } catch (err) {
      setError(errorText(err));
    }
  });
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Email" htmlFor="email" error={e.email?.message}>
        <input id="email" type="email" autoComplete="email" className="input" aria-invalid={!!e.email} {...form.register("email")} />
      </Field>
      <Field label="Password" htmlFor="password" error={e.password?.message}>
        <input id="password" type="password" autoComplete="current-password" className="input" aria-invalid={!!e.password} {...form.register("password")} />
      </Field>
      {error && (
        <p className="rounded-xl bg-danger/5 p-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />} Sign in
      </button>
      <p className="text-center text-sm text-muted">
        New to Candy Roses?{" "}
        <Link href={`/account/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="font-semibold text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setCustomer = useCustomer((s) => s.set);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", marketingOptIn: false },
  });
  const e = form.formState.errors;
  const submit = form.handleSubmit(async (v) => {
    setError(null);
    try {
      const r = await api.post<{ customer: Customer }>("/customer/auth/register", { ...v, lastName: v.lastName || undefined, phone: v.phone || undefined });
      setCustomer(r.customer);
      await mergeServerCart().catch(() => undefined);
      router.replace(safeNext(params.get("next")));
      router.refresh();
    } catch (err) {
      setError(errorText(err));
    }
  });
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={e.firstName?.message}>
          <input id="firstName" autoComplete="given-name" className="input" aria-invalid={!!e.firstName} {...form.register("firstName")} />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={e.lastName?.message}>
          <input id="lastName" autoComplete="family-name" className="input" {...form.register("lastName")} />
        </Field>
      </div>
      <Field label="Email" htmlFor="email" error={e.email?.message}>
        <input id="email" type="email" autoComplete="email" className="input" aria-invalid={!!e.email} {...form.register("email")} />
      </Field>
      <Field label="Phone (optional)" htmlFor="phone" error={e.phone?.message}>
        <input id="phone" type="tel" autoComplete="tel" className="input" {...form.register("phone")} />
      </Field>
      <Field label="Password" htmlFor="password" error={e.password?.message} hint="At least 8 characters">
        <input id="password" type="password" autoComplete="new-password" className="input" aria-invalid={!!e.password} {...form.register("password")} />
      </Field>
      {error && (
        <p className="rounded-xl bg-danger/5 p-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />} Create account
      </button>
      <p className="text-center text-xs text-muted">
        By creating an account you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/account/login" className="font-semibold text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
