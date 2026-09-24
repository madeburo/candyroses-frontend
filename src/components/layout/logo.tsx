import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logo from "../../../public/brand/logo-horizontal.webp";

export function Logo({ className, priority = true }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label="Candy Roses Shop — home">
      <Image src={logo} alt="Candy Roses Shop" priority={priority} sizes="(min-width: 1024px) 260px, 180px" className="h-[54px] w-auto min-[400px]:h-[60px] sm:h-[68px] lg:h-[88px]" />
    </Link>
  );
}
