'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./brand-logo";

export function GlobalLogo() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Link href="/" className="fixed top-4 left-4 z-50 group outline-none" aria-label="Home">
      <BrandLogo size={40} />
    </Link>
  );
}
