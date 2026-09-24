"use client";

import { Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import { useCustomer } from "@/stores/customer";

const TABS = [
  { href: "/account", label: "Overview" },
  { href: "/account/addresses", label: "Addresses" },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const { customer, loaded, load, set } = useCustomer();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  useEffect(() => {
    if (loaded && !customer) router.replace(`/account/login?next=${encodeURIComponent(pathname)}`);
  }, [loaded, customer, router, pathname]);

  if (!customer) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }

  const logout = async () => {
    await api.post("/customer/auth/logout").catch(() => undefined);
    set(null);
    useCart.getState().clear();
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">My account</p>
          <h1 className="heading-lg">Hello, {customer.firstName}</h1>
        </div>
        <button type="button" onClick={logout} className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
      <nav className="mt-8 flex gap-2 border-b border-line" aria-label="Account">
        {TABS.map((t) => {
          const active = t.href === "/account" ? pathname === "/account" || pathname.startsWith("/account/orders") : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={cn("-mb-px border-b-2 px-3 py-3 text-sm font-semibold", active ? "border-ink" : "border-transparent text-muted hover:text-ink")}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
