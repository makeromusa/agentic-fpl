"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, Zap, AlertCircle, ShieldAlert, Sparkles } from "lucide-react";
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
      ? "bg-[#00ff87] shadow-[0_0_8px_#00ff87]"
      : "bg-emerald-500"
    : "bg-rose-500";
  const changeColor = isRise ? "text-[#00ff87]" : "text-rose-400";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] px-2 rounded-lg transition-colors">
      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[var(--text-primary)] truncate">
            {item.player.web_name}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
            {item.player.team_short} · £{(item.player.now_cost / 10).toFixed(1)}m
          </span>
          {item.threshold_reached && (
            <span
              title="Locked to change tonight"
              className="ml-auto inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30"
            >
              <Zap className="w-2.5 h-2.5" /> LOCKED
            </span>
          )}
        </div>

        {/* Velocity bar */}
        <div className="mt-1.5 w-full bg-[var(--bg-base)] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(100, item.velocity_percent)}%` }}
          />
        </div>
      </div>

      {/* Price change + velocity */}
      <div className="text-right shrink-0">
        <div className={`font-mono text-xs font-bold ${changeColor}`}>
          {item.projected_change}
        </div>
        <div className="text-[10px] font-mono text-[var(--text-muted)]">
          {item.velocity_percent}% threshold
        </div>
      </div>
    </div>
  );
}

export default function PriceWatch({ predictions }: PriceWatchProps) {
  const risers = predictions.filter((p) => p.direction === "rise");
  const fallers = predictions.filter((p) => p.direction === "fall");

  // Countdown to next 1:30 AM UK Time (Official FPL Price Change Batch)
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    function calculateCountdown() {
      const now = new Date();
      // Price changes occur around 01:30 UTC
      const nextChange = new Date();
      nextChange.setUTCHours(1, 30, 0, 0);
      if (now.getTime() >= nextChange.getTime()) {
        nextChange.setUTCDate(nextChange.getUTCDate() + 1);
      }
      const diffMs = nextChange.getTime() - now.getTime();
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Midnight Market &amp; Price Change Predictor
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Net transfer velocity tracking to prevent getting priced out
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Badge */}
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-xl font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[var(--text-muted)]">Changes in:</span>
          <span className="font-bold text-amber-300">{timeLeft || "Calculating..."}</span>
        </div>
      </div>

      {/* Action Recommendation Banner */}
      <div className="bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex items-start gap-3">
        <Zap className="w-4 h-4 text-[#00ff87] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-white">Transfer Timing Verdict</div>
          <p className="text-[var(--text-muted)] leading-relaxed">
            If your target player has reached <strong className="text-white">95%+ velocity</strong> and your bank balance is tight (£0.0m–£0.1m in reserve), make your transfer before midnight to avoid being priced out. Otherwise, wait until Friday press conferences for injury confirmations.
          </p>
        </div>
      </div>

      {/* Two-Column Grid: Risers & Fallers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risers Column */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-bold text-[#00ff87] flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              Predicted Risers Tonight ({risers.length})
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">+£0.1m</span>
          </div>

          <div className="flex flex-col">
            {risers.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] py-4 text-center">No risers nearing threshold</div>
            ) : (
              risers.map((item) => (
                <PlayerRow key={item.player.id} item={item} direction="rise" />
              ))
            )}
          </div>
        </div>

        {/* Fallers Column */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingDown className="w-3.5 h-3.5" />
              Predicted Fallers Tonight ({fallers.length})
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">-£0.1m</span>
          </div>

          <div className="flex flex-col">
            {fallers.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] py-4 text-center">No fallers nearing threshold</div>
            ) : (
              fallers.map((item) => (
                <PlayerRow key={item.player.id} item={item} direction="fall" />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
