"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/wishlist", label: "Wishlist" },
  { href: "/admin/users", label: "Users" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-1">
        <Link
          href="/admin"
          className="font-bold text-sm text-foreground mr-3 shrink-0"
        >
          Admin
        </Link>
        {NAV.map(({ href, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm transition-colors",
              (exact ? pathname === href : pathname.startsWith(href))
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </Link>
        ))}
        <Link
          href="/dashboard"
          className="ml-auto text-xs text-muted-foreground hover:text-foreground"
        >
          ← App
        </Link>
      </div>
    </nav>
  );
}
