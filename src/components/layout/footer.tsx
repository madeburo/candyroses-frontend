import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import stacked from "../../../public/brand/logo-stacked.webp";
import Link from "next/link";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getCategories, getCollections, getSettings } from "@/lib/server-api";
import { instagramUrl, whatsappUrl } from "@/lib/utils";

export async function Footer() {
  const [settings, categories, collections] = await Promise.all([getSettings(), getCategories(), getCollections()]);
  const ig = instagramUrl(settings.instagram);
  const wa = whatsappUrl(settings.whatsapp);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Image src={stacked} alt="Candy Roses Shop" className="h-28 w-auto" sizes="160px" />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Couture-inspired dresses for little girls’ biggest moments — birthdays, weddings, celebrations and photo shoots.
          </p>
          <div className="mt-5 flex gap-2">
            {ig && (
              <a href={ig} target="_blank" rel="noreferrer" className="inline-flex size-10 items-center justify-center rounded-full sm:size-11 bg-warm-white transition-colors hover:bg-blush" aria-label="Instagram">
                <InstagramIcon className="size-5" />
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="inline-flex size-10 items-center justify-center rounded-full sm:size-11 bg-warm-white transition-colors hover:bg-blush" aria-label="WhatsApp">
                <WhatsAppIcon className="size-5" />
              </a>
            )}
          </div>
        </div>
        <div>
          <p className="eyebrow">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {collections
              .filter((c) => c.showInMenu)
              .map((c) => (
                <li key={c.id}>
                  <Link href={`/collections/${c.slug}`} className="hover:text-rose-deep">
                    {c.name}
                  </Link>
                </li>
              ))}
            {categories.filter((c) => c.showInMenu).map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="hover:text-rose-deep">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Help</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/faq" className="hover:text-rose-deep">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-rose-deep">Shipping & Payment</Link></li>
            <li><Link href="/contact" className="hover:text-rose-deep">Contact Us</Link></li>
            <li><Link href="/account" className="hover:text-rose-deep">My Account</Link></li>
            <li><Link href="/cart" className="hover:text-rose-deep">Shopping Bag</Link></li>
            <li><Link href="/privacy" className="hover:text-rose-deep">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-rose-deep">Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            {settings.phone && (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-rose-deep" />
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-rose-deep">{settings.phone}</a>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-rose-deep" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-rose-deep">{settings.email}</a>
              </li>
            )}
            {settings.address && (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-rose-deep" />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.workingHours && (
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-rose-deep" />
                <span>{settings.workingHours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {settings.storeName}. All rights reserved.</p>
          <p>All prices are in US dollars (USD). Orders ship from Almaty, Kazakhstan.</p>
        </div>
      </div>
    </footer>
  );
}
