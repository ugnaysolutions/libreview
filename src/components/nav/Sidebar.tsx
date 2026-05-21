"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ClipboardList, PlayCircle, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: Home },
  { href: "/practice", label: "Practice", Icon: BookOpen },
  { href: "/mock-exam", label: "Mock Exam", Icon: ClipboardList },
  { href: "/resources", label: "Resources", Icon: PlayCircle },
  { href: "/progress", label: "Progress", Icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-white min-h-screen sticky top-0 h-screen">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <span className="text-xl font-bold text-primary font-heading">
          {APP_NAME}
        </span>
      </div>
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5 shrink-0", active && "stroke-[2.5px]")}
                    aria-hidden
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
