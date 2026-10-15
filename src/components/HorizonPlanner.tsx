"use client";

import React from "react";
import { Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { TransferPlan } from "@/lib/types";

interface HorizonProps {
  plans: TransferPlan[];
}

export default function HorizonPlanner({ plans }: HorizonProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-fpl-cyan/10 border border-fpl-cyan/20 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-fpl-cyan" />
            </span>
            5-Gameweek Horizon &amp; Chip Trajectory
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 ml-9">
            Multi-week transfer roadmap with optimal chip windows
          </p>
        </div>
      </div>

      {/* Gameweek Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {plans.map((plan, idx) => (
          <div
            key={plan.gameweek}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-fpl-cyan/40 rounded-xl flex flex-col transition-colors duration-200 overflow-hidden"
          >
            {/* GW Label Bar */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-fpl-cyan/10 flex items-center justify-center text-[10px] font-black text-fpl-cyan">
                  {plan.gameweek}
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  GW{plan.gameweek}
                </span>
              </div>
              {plan.chip_suggested && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25 uppercase tracking-wide">
                  {plan.chip_suggested}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="mx-3 h-px bg-[var(--border-subtle)]" />

            {/* Transfer Content */}
            <div className="px-3 py-3 flex-1">
              {plan.transfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-4 gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-fpl-green/10 border border-fpl-green/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-fpl-green" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">Roll Transfer</span>
                  <span className="text-[10px] text-[var(--text-muted)] leading-snug">
                    Bank free transfer for next week
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {plan.transfers.map((t, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-rose-400 font-semibold truncate max-w-[70px]">
                          {t.sell.web_name}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                        <span className="text-fpl-green font-bold truncate max-w-[70px]">
                          {t.buy.web_name}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] leading-snug line-clamp-2">
                        {t.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mx-3 mb-3 pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Proj. Pts</span>
              <span className="font-mono text-sm font-black text-fpl-green">
                {plan.projected_points}
                <span className="text-[10px] font-medium text-[var(--text-muted)] ml-0.5">pts</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
