"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PRICING } from "@/lib/constants";
import { PayMongoButton } from "./PayMongoButton";
import { ManualPaymentForm } from "./ManualPaymentForm";

interface Props {
  paymentProvider: "manual" | "paymongo";
  hasPendingRequest: boolean;
}

export function PlanCards({ paymentProvider, hasPendingRequest }: Props) {
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");

  if (paymentProvider === "manual") {
    return (
      <ManualPaymentForm
        plan={selected}
        onPlanChange={setSelected}
        hasPendingRequest={hasPendingRequest}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Monthly */}
        <div
          onClick={() => setSelected("monthly")}
          className={cn(
            "rounded-2xl p-5 space-y-3 flex flex-col cursor-pointer transition-colors",
            selected === "monthly"
              ? "border-2 border-primary"
              : "border border-border"
          )}
        >
          <div>
            <p className="font-semibold text-foreground text-sm">Monthly</p>
            <p className="text-2xl font-bold text-foreground mt-1">{PRICING.monthly.display}</p>
            <p className="text-xs text-muted-foreground">{PRICING.monthly.period}</p>
          </div>
          <div className="flex-1" />
          <PayMongoButton plan="monthly" />
        </div>

        {/* Annual — Best Value */}
        <div
          onClick={() => setSelected("annual")}
          className={cn(
            "rounded-2xl p-5 space-y-3 flex flex-col cursor-pointer transition-colors relative overflow-hidden",
            selected === "annual"
              ? "border-2 border-primary"
              : "border border-border"
          )}
        >
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Best Value
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Annual</p>
            <p className="text-2xl font-bold text-foreground mt-1">{PRICING.annual.display}</p>
            <p className="text-xs text-muted-foreground">{PRICING.annual.period}</p>
            <p className="text-xs text-primary font-medium mt-0.5">Save 16%</p>
          </div>
          <div className="flex-1" />
          <PayMongoButton plan="annual" />
        </div>
      </div>
    </div>
  );
}
