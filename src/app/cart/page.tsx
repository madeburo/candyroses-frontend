import type { Metadata } from "next";
import { CartView } from "./view";

export const metadata: Metadata = { title: "Shopping Bag", robots: { index: false, follow: false } };

export default function CartPage() {
  return <CartView />;
}
