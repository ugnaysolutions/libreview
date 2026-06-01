"use client";

import { useState, useTransition } from "react";
import { sendBroadcastNotification } from "@/app/actions/admin";

export function BroadcastNotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await sendBroadcastNotification(title, body, actionUrl || undefined);
      if (res.success) {
        setResult({ ok: true, msg: "Notification sent to all users!" });
        setTitle("");
        setBody("");
        setActionUrl("");
      } else {
        setResult({ ok: false, msg: res.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. New questions added!"
          required
          className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Message</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="What do you want to tell your users?"
          required
          rows={3}
          className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Action URL <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={actionUrl}
          onChange={e => setActionUrl(e.target.value)}
          placeholder="e.g. /practice"
          className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {result && (
        <p className={`text-sm ${result.ok ? "text-green-600" : "text-red-500"}`}>
          {result.msg}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !title.trim() || !body.trim()}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Sending…" : "Send to all users"}
      </button>
    </form>
  );
}
