import Link from "next/link";
import { getCategories, getCollections, getSettings } from "@/lib/server-api";
import { AccountButton, CartButton } from "./header-actions";
import { Logo } from "./logo";
import { MobileMenu, type NavItem } from "./mobile-menu";
import { SearchButton } from "./search";

/**
 * Menu after "Shop All": categories and collections shown in the menu, in one order set by their
 * "sort order" field in the CMS (shared scale, so a category can sit before a collection).
 */
export async function buildNav(): Promise<NavItem[]> {
  const [categories, collections] = await Promise.all([getCategories(), getCollections()]);
  const items: { order: number; item: NavItem }[] = [
    ...categories
      .filter((c) => c.showInMenu)
      .map((c) => ({
        order: c.sortOrder,
        item: {
          label: c.name,
          href: `/category/${c.slug}`,
          children: c.children.filter((x) => x.showInMenu).map((x) => ({ label: x.name, href: `/category/${x.slug}` })),
        },
      })),
    ...collections
      .filter((c) => c.showInMenu)
      .map((c) => ({ order: c.sortOrder, item: { label: c.name, href: `/collections/${c.slug}`, ...(c.type === "AUTO_SALE" ? { accent: true } : {}) } })),
  ];
  return items.sort((a, b) => a.order - b.order).map((x) => x.item);
}

export async function Header() {
  const [nav, settings] = await Promise.all([buildNav(), getSettings()]);
  return (
    <>
      {settings.announcement && (
        <div className="bg-ink px-4 py-2 text-center text-xs font-medium tracking-wide text-warm-white sm:text-[13px]">{settings.announcement}</div>
      )}
      <header style={{ viewTransitionName: "site-header" }} className="sticky top-0 z-40 border-b border-line/80 bg-warm-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-warm-white/80">
        <div className="container-page grid h-[82px] grid-cols-[1fr_auto_1fr] items-center min-[400px]:h-[88px] sm:h-24 lg:h-28">
          <div className="flex items-center gap-1">
            <MobileMenu nav={nav} settings={settings} />
            <SearchButton />
          </div>
          <Logo />
          <div className="flex items-center justify-end gap-1">
            <AccountButton />
            <CartButton />
          </div>
        </div>
        <nav aria-label="Main navigation" className="hidden border-t border-line/60 xl:block">
          <ul className="container-page flex flex-wrap items-center justify-center gap-x-8 2xl:gap-x-11">
            <li>
              <Link href="/catalog" className="block py-3.5 text-[12.5px] font-semibold tracking-[0.1em] whitespace-nowrap text-ink-soft uppercase transition-colors hover:text-rose-deep">
                Shop All
              </Link>
            </li>
            {nav.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`block py-3.5 text-[12.5px] font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors hover:text-rose-deep ${item.accent ? "text-rose-deep" : "text-ink-soft"}`}
                >
                  {item.label}
                </Link>
                {!!item.children?.length && (
                  <ul className="invisible absolute top-full left-1/2 z-50 min-w-52 -translate-x-1/2 rounded-2xl border border-line bg-warm-white p-2 opacity-0 shadow-soft transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-cream">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
