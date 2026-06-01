"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ClipboardList, PlayCircle, BarChart2, LogOut, Zap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
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
  isPremium?: boolean;
}

interface SidebarProps {
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

export function Sidebar({ user, isPremium, unreadCount, notifications }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-white min-h-screen sticky top-0 h-screen">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <span className="text-xl font-bold text-primary font-heading">
          {APP_NAME}
        </span>
        <NotificationBell unreadCount={unreadCount} notifications={notifications} direction="down" />
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

      {/* User footer */}
      <div className="border-t border-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={36}
              height={36}
              className="rounded-full shrink-0 object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {getInitials(user.name)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        {!isPremium && (
          <Link
            href="/upgrade"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <Zap className="h-4 w-4 shrink-0" aria-hidden />
            Upgrade to Premium
          </Link>
        )}

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors",
            pathname === "/settings" || pathname.startsWith("/settings/")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" aria-hidden />
          Settings
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
