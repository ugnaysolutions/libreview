"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PayMongoButton } from "./PayMongoButton";

export function PlanCards() {
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");

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
            <p className="text-2xl font-bold text-foreground mt-1">₱149</p>
            <p className="text-xs text-muted-foreground">per month</p>
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
            <p className="text-2xl font-bold text-foreground mt-1">₱999</p>
            <p className="text-xs text-muted-foreground">per year · ~₱83/mo</p>
            <p className="text-xs text-primary font-medium mt-0.5">Save 44%</p>
          </div>
          <div className="flex-1" />
          <PayMongoButton plan="annual" />
        </div>
      </div>
    </div>
  );
}
