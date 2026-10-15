"use client";

import React from "react";
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from "lucide-react";
import { PricePrediction } from "@/lib/types";

interface PriceWatchProps {
  predictions: PricePrediction[];
}

export default function PriceWatch({ predictions }: PriceWatchProps) {
  const risers = predictions.filter((p) => p.direction === "rise");
  const fallers = predictions.filter((p) => p.direction === "fall");

  return (
    <div className="bg-[#170220] border border-[#330b3d] rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-fpl-green" /> Midnight Price Change Predictor
          </h3>
          <p className="text-xs text-gray-400">
            Real-time transfer velocity tracking price rises/falls occurring at 1:30 AM
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" /> Next Change: ~1:30 AM UTC
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risers Column */}
        <div className="bg-[#1e0329] border border-[#330b3d] rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-fpl-green uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Rising Imminently
          </div>
          <div className="space-y-2.5">
            {risers.slice(0, 4).map((item) => (
              <div key={item.player.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">
                    {item.player.web_name} <span className="text-[10px] text-gray-400">({item.player.team_short})</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-fpl-green font-bold">{item.projected_change}</span>
                    <span className="text-[10px] font-mono text-gray-400">({item.velocity_percent}%)</span>
                  </div>
                </div>
                {/* Velocity Progress Bar */}
                <div className="w-full bg-[#120017] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.threshold_reached ? "bg-fpl-green shadow-[0_0_8px_#00ff87]" : "bg-emerald-600"
                    }`}
                    style={{ width: `${item.velocity_percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fallers Column */}
        <div className="bg-[#1e0329] border border-[#330b3d] rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4" /> Falling Imminently
          </div>
          <div className="space-y-2.5">
            {fallers.slice(0, 4).map((item) => (
              <div key={item.player.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">
                    {item.player.web_name} <span className="text-[10px] text-gray-400">({item.player.team_short})</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-rose-400 font-bold">{item.projected_change}</span>
                    <span className="text-[10px] font-mono text-gray-400">({item.velocity_percent}%)</span>
                  </div>
                </div>
                <div className="w-full bg-[#120017] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${item.velocity_percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
