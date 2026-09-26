import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";
import { JsonLd } from "@/components/json-ld";
import { CartSync } from "@/components/layout/cart-sync";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import { returnPolicyJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/server-api";
import { SITE_URL, instagramUrl } from "@/lib/utils";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "cyrillic"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], style: ["normal", "italic"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.seoTitle ?? `${s.storeName} — Princess & Party Dresses for Girls`;
  const description = s.seoDescription ?? "Princess dresses, birthday outfits and costumes for girls. Shipped across the USA.";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${s.storeName}` },
    description,
    keywords: s.seoKeywords ?? undefined,
    applicationName: s.storeName,
    openGraph: {
      type: "website",
      siteName: s.storeName,
      locale: "en_US",
      title,
      description,
      images: [{ url: s.ogImageUrl ?? "/og.jpg", width: 1200, height: 630, alt: s.storeName }],
    },
    twitter: { card: "summary_large_image", title, description, images: [s.ogImageUrl ?? "/og.jpg"] },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffdfa",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const sameAs = [instagramUrl(s.instagram)].filter(Boolean);
  return (
    <html lang="en" className={`${manrope.variable} ${cormorant.variable}`}>
      <body className="flex min-h-svh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-warm-white">
          Skip to content
        </a>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: s.storeName,
              url: SITE_URL,
              logo: `${SITE_URL}/icon.png`,
              description: s.seoDescription ?? "Princess dresses, birthday outfits and costumes for girls, shipped across the USA.",
              areaServed: { "@type": "Country", name: "United States" },
              hasMerchantReturnPolicy: returnPolicyJsonLd(),
              ...(sameAs.length ? { sameAs } : {}),
              ...(s.phone || s.email
                ? { contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: s.phone ?? undefined, email: s.email ?? undefined, areaServed: "US", availableLanguage: ["en"] } }
                : {}),
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: s.storeName,
              url: SITE_URL,
              publisher: { "@id": `${SITE_URL}/#organization` },
              inLanguage: "en-US",
              potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" },
            },
          ]}
        />
        <Header />
        <main id="main" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <CartSync />
        {/* Umami analytics; data-domains keeps local/dev visits out of the stats */}
        <Script
          src="https://umami.madeburo.com/mb.js"
          data-website-id="bc4cf8ac-bef5-4b0e-af90-7ed45f67ac95"
          data-domains="candyrosesshop.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
