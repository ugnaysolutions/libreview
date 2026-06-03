"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ClipboardList, PlayCircle, BarChart2, LogOut, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";
import { NotificationBell, type Notification } from "@/components/nav/NotificationBell";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: Home },
  { href: "/practice", label: "Practice", Icon: BookOpen },
  { href: "/mock-exam", label: "Mock Exam", Icon: ClipboardList },
  { href: "/resources", label: "Resources", Icon: PlayCircle },
  { href: "/progress", label: "Progress", Icon: BarChart2 },
];

interface User {
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface BottomNavProps {
  user: User;
  isPremium?: boolean;
  unreadCount: number;
  notifications: Notification[];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function BottomNav({ user, isPremium, unreadCount, notifications }: BottomNavProps) {
  const pathname = usePathname();
  const firstName = user.name.split(" ")[0];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      {/* User identity bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 min-w-0 rounded-lg px-1 py-0.5 transition-opacity",
            pathname === "/settings" || pathname.startsWith("/settings/")
              ? "opacity-100"
              : "hover:opacity-75"
          )}
        >
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={28}
              height={28}
              className="rounded-full shrink-0 object-cover"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">
                {getInitials(user.name)}
              </span>
            </div>
          )}
          <span className="text-xs font-semibold text-foreground truncate">
            {firstName}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {!isPremium && (
            <Link
              href="/upgrade"
              className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg"
            >
              <Zap className="h-3 w-3" aria-hidden />
              Upgrade
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </form>
          <NotificationBell unreadCount={unreadCount} notifications={notifications} direction="up" align="right" />
        </div>
      </div>

      {/* Tab row */}
      <ul className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "stroke-[2.5px]")}
                  aria-hidden
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
