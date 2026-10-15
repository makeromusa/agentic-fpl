"use client";

import React from "react";
import { Calendar, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { TransferPlan } from "@/lib/types";

interface HorizonProps {
  plans: TransferPlan[];
}

export default function HorizonPlanner({ plans }: HorizonProps) {
  return (
    <div className="bg-[#170220] border border-[#330b3d] rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-fpl-cyan" /> 5-Gameweek Horizon & Chip Trajectory
        </h3>
        <p className="text-xs text-gray-400">Multi-week transfer roadmap with optimal chip windows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.gameweek}
            className="bg-[#1e0329] border border-[#330b3d] hover:border-fpl-cyan/60 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-md relative overflow-hidden"
          >
            {plan.chip_suggested && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-black text-[10px] font-black px-2 py-0.5 rounded-bl shadow">
                CHIP: {plan.chip_suggested.toUpperCase()}
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Gameweek {plan.gameweek}
              </div>

              {plan.transfers.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-6 h-6 text-fpl-green mb-1 opacity-80" />
                  <span className="text-xs font-bold text-gray-200">Roll Free Transfer</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Bank 2 free transfers for next week</span>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  {plan.transfers.map((t, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-rose-400 line-through">OUT: {t.sell.web_name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-fpl-green font-bold">IN: {t.buy.web_name}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug">{t.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-[#330b3d] flex justify-between items-center text-xs">
              <span className="text-gray-400">Projected Pts:</span>
              <span className="font-mono font-bold text-fpl-green">{plan.projected_points} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
