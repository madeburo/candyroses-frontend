import type { Metadata } from "next";
import { ProsePage } from "@/components/content/prose-page";
import { AgeSizeChart } from "@/components/product/age-size-chart";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Size Guide — Girls’ Sizes 1–10 Years",
  description: "Candy Roses size chart for girls ages 1–10: height, chest, waist and hip measurements for every size, in inches and centimeters, plus how to measure.",
  path: "/size-guide",
});

export default function SizeGuidePage() {
  return (
    <ProsePage title="Size guide" eyebrow="Customer care">
      <p>
        Every Candy Roses piece is made to order, so choosing the right size matters. Our sizes follow your child’s age — use the chart below to check her height and
        measurements against each size.
      </p>
      <div className="not-prose">
        <AgeSizeChart showIntro={false} />
      </div>
    </ProsePage>
  );
}
