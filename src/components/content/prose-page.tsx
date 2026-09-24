import { Breadcrumbs } from "@/components/catalog/breadcrumbs";

export function ProsePage({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumbs items={[{ name: title }]} />
      <article className="mx-auto mt-8 max-w-3xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="heading-lg">{title}</h1>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink-soft [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </article>
    </div>
  );
}
