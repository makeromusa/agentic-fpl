"use client";

import React from "react";
import { TrendingUp, TrendingDown, Clock, Zap } from "lucide-react";
import { PricePrediction } from "@/lib/types";

interface PriceWatchProps {
  predictions: PricePrediction[];
}

function PlayerRow({
  item,
  direction,
}: {
  item: PricePrediction;
  direction: "rise" | "fall";
}) {
  const isRise = direction === "rise";
  const barColor = isRise
    ? item.threshold_reached
      ? "bg-fpl-green shadow-[0_0_6px_#00ff87]"
      : "bg-emerald-600"
    : "bg-rose-500";
  const changeColor = isRise ? "text-fpl-green" : "text-rose-400";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0">
      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-[var(--text-primary)] truncate">
            {item.player.web_name}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] shrink-0">
            {item.player.team_short}
          </span>
          {item.threshold_reached && (
            <span className="shrink-0 ml-auto">
              <Zap className="w-3 h-3 text-amber-400" />
            </span>
          )}
        </div>
        {/* Velocity bar */}
        <div className="mt-1.5 w-full bg-[var(--bg-base)] rounded-full h-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${item.velocity_percent}%` }}
          />
        </div>
      </div>

      {/* Price change + velocity */}
      <div className="text-right shrink-0">
        <div className={`font-mono text-sm font-bold ${changeColor}`}>
          {item.projected_change}
        </div>
        <div className="text-[10px] font-mono text-[var(--text-muted)]">
          {item.velocity_percent}%
        </div>
      </div>
    </div>
  );
}

export default function PriceWatch({ predictions }: PriceWatchProps) {
  const risers = predictions.filter((p) => p.direction === "rise");
  const fallers = predictions.filter((p) => p.direction === "fall");

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-fpl-green/10 border border-fpl-green/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-fpl-green" />
            </span>
            Midnight Price Change Predictor
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 ml-9">
            Real-time transfer velocity tracking price changes at 1:30 AM UTC
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold shrink-0">
          <Clock className="w-3.5 h-3.5" />
          Next change: ~1:30 AM UTC
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Risers */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-fpl-green/10 border border-fpl-green/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-fpl-green" />
            </div>
            <span className="text-xs font-bold text-fpl-green uppercase tracking-wider">
              Rising Imminently
            </span>
          </div>
          <div>
            {risers.slice(0, 4).map((item) => (
              <PlayerRow key={item.player.id} item={item} direction="rise" />
            ))}
          </div>
        </div>

        {/* Fallers */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Falling Imminently
            </span>
          </div>
          <div>
            {fallers.slice(0, 4).map((item) => (
              <PlayerRow key={item.player.id} item={item} direction="fall" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
