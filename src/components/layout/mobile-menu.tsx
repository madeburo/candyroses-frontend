"use client";

import { Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { StoreSettings } from "@/lib/types";
import { instagramUrl, whatsappUrl } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  accent?: boolean;
  children?: { label: string; href: string }[];
}

export function MobileMenu({ nav, settings }: { nav: NavItem[]; settings: StoreSettings }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  const ig = instagramUrl(settings.instagram);
  const wa = whatsappUrl(settings.whatsapp);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="inline-flex size-10 items-center justify-center rounded-full sm:size-11 hover:bg-cream xl:hidden" aria-label="Open menu">
          <span aria-hidden className="flex w-7 flex-col gap-[7px]">
            <span className="block h-[1.6px] w-full rounded-full bg-current" />
            <span className="block h-[1.6px] w-full rounded-full bg-current" />
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]" />
        <Dialog.Content className="anim-sheet-left fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-sm flex-col bg-warm-white shadow-xl outline-none">
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <Dialog.Title className="font-display text-2xl">Menu</Dialog.Title>
            <Dialog.Close className="inline-flex size-10 items-center justify-center rounded-full hover:bg-cream" aria-label="Close menu">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Shop navigation</Dialog.Description>
          <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile navigation">
            <ul className="divide-y divide-line">
              <li>
                <Link href="/catalog" className="block py-4 text-[17px] font-medium">
                  Shop All
                </Link>
              </li>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`block py-4 text-[17px] font-medium ${item.accent ? "text-rose-deep" : ""}`}>
                    {item.label}
                  </Link>
                  {!!item.children?.length && (
                    <ul className="-mt-2 mb-3 space-y-1 pl-3">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block py-1.5 text-muted">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              <li>
                <Link href="/shipping">Shipping & Payment</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/account">My Account</Link>
              </li>
            </ul>
          </nav>
          <div className="flex flex-wrap items-center gap-3 border-t border-line p-5 text-sm">
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2">
                <Phone className="size-4" /> {settings.phone}
              </a>
            )}
            <div className="ml-auto flex gap-2">
              {wa && (
                <a href={wa} target="_blank" rel="noreferrer" className="inline-flex size-10 items-center justify-center rounded-full bg-cream" aria-label="WhatsApp">
                  <WhatsAppIcon className="size-5" />
                </a>
              )}
              {ig && (
                <a href={ig} target="_blank" rel="noreferrer" className="inline-flex size-10 items-center justify-center rounded-full bg-cream" aria-label="Instagram">
                  <InstagramIcon className="size-5" />
                </a>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
