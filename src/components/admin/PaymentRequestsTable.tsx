"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approvePaymentRequest, rejectPaymentRequest } from "@/app/actions/admin";

interface PaymentRequest {
  id: string;
  user_id: string;
  plan_type: string;
  reference_number: string;
  amount_cents: number;
  created_at: string;
  user_email?: string;
}

interface Props {
  requests: PaymentRequest[];
}

export function PaymentRequestsTable({ requests }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">No pending payment requests.</p>
    );
  }

  function handle(id: string, action: "approve" | "reject") {
    setProcessingId(id);
    setErrors((prev) => ({ ...prev, [id]: "" }));
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approvePaymentRequest(id)
          : await rejectPaymentRequest(id);
      if (!result.success) {
        setErrors((prev) => ({ ...prev, [id]: result.error }));
      }
      setProcessingId(null);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reference #</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submitted</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {requests.map((req) => {
            const loading = isPending && processingId === req.id;
            return (
              <tr key={req.id} className="bg-card hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-foreground">{req.user_email ?? req.user_id}</td>
                <td className="px-4 py-3 capitalize">{req.plan_type}</td>
                <td className="px-4 py-3">₱{(req.amount_cents / 100).toFixed(0)}</td>
                <td className="px-4 py-3 font-mono">{req.reference_number}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handle(req.id, "approve")}
                      disabled={loading}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handle(req.id, "reject")}
                      disabled={loading}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                    >
                      {loading ? "…" : "Reject"}
                    </button>
                    {errors[req.id] && (
                      <span className="text-xs text-red-500">{errors[req.id]}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
