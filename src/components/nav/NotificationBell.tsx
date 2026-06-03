"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Zap, Flame, CalendarDays, BookOpen, BarChart2,
  Target, Clock, TrendingUp, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface Props {
  unreadCount: number;
  notifications: Notification[];
  direction?: "down" | "up";
  align?: "left" | "right";
}

function typeIcon(type: string) {
  switch (type) {
    case "upgrade_teaser": return <Zap className="h-4 w-4 text-amber-500 shrink-0" />;
    case "streak":         return <Flame className="h-4 w-4 text-orange-500 shrink-0" />;
    case "comeback":       return <Clock className="h-4 w-4 text-blue-500 shrink-0" />;
    case "exam_approaching": return <CalendarDays className="h-4 w-4 text-primary shrink-0" />;
    case "expiry_warning": return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />;
    case "mock_nudge":     return <BookOpen className="h-4 w-4 text-primary shrink-0" />;
    case "weekly_summary": return <BarChart2 className="h-4 w-4 text-primary shrink-0" />;
    case "daily_reminder": return <Clock className="h-4 w-4 text-muted-foreground shrink-0" />;
    case "accuracy_milestone": return <Target className="h-4 w-4 text-green-500 shrink-0" />;
    case "weak_topic":     return <TrendingUp className="h-4 w-4 text-amber-500 shrink-0" />;
    case "welcome":        return <Zap className="h-4 w-4 text-primary shrink-0" />;
    default:               return <Bell className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export function NotificationBell({ unreadCount, notifications, direction = "down", align = "left" }: Props) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(notifications);
  const [unread, setUnread] = useState(unreadCount);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setNotifs(notifications);
    setUnread(unreadCount);
  }, [notifications, unreadCount]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function handleMarkRead(id: string, actionUrl: string | null) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    startTransition(async () => {
      await markNotificationRead(id);
      router.refresh();
    });
    if (actionUrl) {
      setOpen(false);
      router.push(actionUrl);
    }
  }

  function handleMarkAll() {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnread(0);
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  const hasUnread = notifs.some(n => !n.is_read);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        className="relative flex items-center justify-center h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-[200] w-80 rounded-2xl border border-border bg-popover shadow-xl",
            align === "right" ? "right-0" : "left-0",
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {hasUnread && (
              <button
                onClick={handleMarkAll}
                disabled={isPending}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) handleMarkRead(n.id, n.action_url);
                    else if (n.action_url) { setOpen(false); router.push(n.action_url); }
                  }}
                  className={cn(
                    "w-full text-left flex gap-3 px-4 py-3 border-b border-border/60 last:border-b-0 transition-colors hover:bg-muted/50",
                    !n.is_read && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  <div className="mt-0.5">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs leading-snug", !n.is_read ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {relativeTime(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
