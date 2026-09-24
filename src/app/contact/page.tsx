import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ProsePage } from "@/components/content/prose-page";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getSettings } from "@/lib/server-api";
import { instagramUrl, whatsappUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact Us", description: "Get in touch with Candy Roses Shop.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const s = await getSettings();
  const wa = whatsappUrl(s.whatsapp, "Hi! I have a question about an order.");
  const ig = instagramUrl(s.instagram);
  const rows = [
    s.phone && { icon: Phone, label: "Phone", value: s.phone, href: `tel:${s.phone.replace(/[^\d+]/g, "")}` },
    s.email && { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    wa && { icon: WhatsAppIcon, label: "WhatsApp", value: s.whatsapp!, href: wa },
    ig && { icon: InstagramIcon, label: "Instagram", value: s.instagram!, href: ig },
    s.address && { icon: MapPin, label: "Studio", value: s.address },
    s.workingHours && { icon: Clock, label: "Hours", value: s.workingHours },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href?: string }[];
  return (
    <ProsePage title="Contact us" eyebrow="We’re here to help">
      <p>Questions about sizing, an order or a special occasion? Reach out — we usually reply within one business day.</p>
      <ul className="not-prose grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.label} className="!ml-0 flex !list-none gap-4 rounded-2xl bg-cream p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warm-white text-rose-deep">
              <r.icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold tracking-wider text-muted uppercase">{r.label}</span>
              {r.href ? (
                <a href={r.href} className="font-medium break-words text-ink !no-underline hover:!underline" target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {r.value}
                </a>
              ) : (
                <span className="font-medium text-ink">{r.value}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </ProsePage>
  );
}
