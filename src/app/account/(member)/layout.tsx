import type { Metadata } from "next";
import { AccountShell } from "@/components/account/account-shell";

export const metadata: Metadata = { title: "My account", robots: { index: false, follow: false } };

export default function Layout({ children }: LayoutProps<"/account">) {
  return <AccountShell>{children}</AccountShell>;
}
