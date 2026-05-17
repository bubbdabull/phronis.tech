"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, TrendingUp } from "lucide-react";

import { cn } from "@/_lib/utils";

const TABS = [
  { href: "/member", label: "Home", exact: true, icon: Home },
  { href: "/member/social", label: "Social", icon: MessageCircle },
  { href: "/member/trades", label: "Trades", icon: TrendingUp },
] as const;

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MemberMobileNav() {
  const pathname = usePathname() ?? "";
  if (!pathname.startsWith("/member")) return null;

  return (
    <nav
      aria-label="Member sections"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-phronis-base/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(pathname, tab.href, "exact" in tab && tab.exact);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-2 text-[10px] font-medium",
                  active ? "text-phronis-teal" : "text-phronis-muted",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
