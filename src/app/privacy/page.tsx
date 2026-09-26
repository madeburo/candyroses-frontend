import type { Metadata } from "next";
import { ProsePage } from "@/components/content/prose-page";
import { getSettings } from "@/lib/server-api";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Candy Roses Shop collects, uses and protects your personal information when you visit our website or place an order.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <ProsePage title="Privacy Policy">
      <p>This policy explains how {s.storeName} (“we”, “us”) collects and uses personal information when you visit our website or place an order.</p>
      <h2>Information we collect</h2>
      <ul>
        <li>Contact details you provide: name, email address, phone number.</li>
        <li>Shipping address for delivering your order.</li>
        <li>Order history and account preferences if you create an account.</li>
        <li>Technical data such as IP address and browser type, used for security and fraud prevention.</li>
      </ul>
      <p>Payment card details are entered directly with our payment providers (for example PayPal) and are never stored on our servers.</p>
      <h2>How we use your information</h2>
      <ul>
        <li>To process, ship and support your orders.</li>
        <li>To manage your account and saved addresses.</li>
        <li>To send marketing emails, only if you opted in. You can unsubscribe at any time.</li>
        <li>To protect our store against fraud and abuse.</li>
      </ul>
      <h2>Sharing</h2>
      <p>We share data only with service providers needed to run the store (payment processors, shipping carriers, hosting). We do not sell your personal information.</p>
      <h2>Cookies</h2>
      <p>We use strictly necessary cookies to keep you signed in, protect forms and remember your shopping bag. We do not use advertising cookies.</p>
      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data{s.email ? (
          <>
            {" "}by emailing <a href={`mailto:${s.email}`}>{s.email}</a>
          </>
        ) : null}. California residents have additional rights under the CCPA/CPRA, including the right to know and delete personal information.
      </p>
      <h2>Children’s privacy</h2>
      <p>Our products are for children, but our website is intended for use by adults. We do not knowingly collect personal information from children under 13.</p>
      <p className="text-sm text-muted">Last updated: {new Date().getFullYear()}</p>
    </ProsePage>
  );
}
