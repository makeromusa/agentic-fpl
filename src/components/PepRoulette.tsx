"use client";

import React from "react";
import { AlertCircle, HelpCircle, Activity } from "lucide-react";
import { RotationRisk } from "@/lib/types";

interface PepProps {
  risks: RotationRisk[];
}

export default function PepRoulette({ risks }: PepProps) {
  return (
    <div className="bg-[#170220] border border-[#330b3d] rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" /> "Pep Roulette" & Press Conference Decoder
        </h3>
        <p className="text-xs text-gray-400">
          Rotation probabilities derived from press conferences, minute fatigue, and cup congestion
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {risks.map((item) => {
          const badgeColor =
            item.risk_level === "High"
              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
              : item.risk_level === "Moderate"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

          return (
            <div
              key={item.player.id}
              className="bg-[#1e0329] border border-[#330b3d] rounded-xl p-3 flex flex-col justify-between gap-2 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm text-white">{item.player.web_name}</div>
                  <div className="text-[11px] text-gray-400">{item.player.team_short} · £{(item.player.now_cost / 10).toFixed(1)}m</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {item.risk_level} Risk ({item.risk_percentage}%)
                </span>
              </div>

              <div className="text-[11px] text-gray-300 space-y-1">
                {item.factors.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
