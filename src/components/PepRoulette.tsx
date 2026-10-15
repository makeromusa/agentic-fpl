"use client";

import React from "react";
import { Activity } from "lucide-react";
import { RotationRisk } from "@/lib/types";

interface PepProps {
  risks: RotationRisk[];
}

type RiskLevel = "High" | "Moderate" | "Low";

const RISK_CONFIG: Record<
  RiskLevel,
  {
    label: string;
    badge: string;
    dot: string;
    gauge: string;
    gaugeBg: string;
    percent: number;
  }
> = {
  High: {
    label: "High",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    dot: "bg-rose-400",
    gauge: "bg-rose-500",
    gaugeBg: "bg-rose-500/10",
    percent: 85,
  },
  Moderate: {
    label: "Moderate",
    badge: "bg-amber-400/15 text-amber-300 border-amber-400/25",
    dot: "bg-amber-400",
    gauge: "bg-amber-400",
    gaugeBg: "bg-amber-400/10",
    percent: 50,
  },
  Low: {
    label: "Low",
    badge: "bg-fpl-green/15 text-fpl-green border-fpl-green/25",
    dot: "bg-fpl-green",
    gauge: "bg-fpl-green",
    gaugeBg: "bg-fpl-green/10",
    percent: 20,
  },
};

export default function PepRoulette({ risks }: PepProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-amber-400" />
          </span>
          "Pep Roulette" &amp; Press Conference Decoder
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 ml-9">
          Rotation probabilities from press conferences, minute fatigue &amp; cup congestion
        </p>
      </div>

      {/* Player Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {risks.map((item) => {
          const level = (item.risk_level as RiskLevel) in RISK_CONFIG
            ? (item.risk_level as RiskLevel)
            : "Low";
          const cfg = RISK_CONFIG[level];

          return (
            <div
              key={item.player.id}
              className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-3 hover:border-[var(--border-focus)] transition-colors duration-200"
            >
              {/* Top row: player + badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {item.player.web_name}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {item.player.team_short} · £{(item.player.now_cost / 10).toFixed(1)}m
                  </div>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Rotation risk gauge */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">
                    Rotation Risk
                  </span>
                  <span className={`text-[11px] font-bold font-mono ${cfg.badge.split(" ")[1]}`}>
                    {item.risk_percentage}%
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full ${cfg.gaugeBg} overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${cfg.gauge}`}
                    style={{ width: `${item.risk_percentage}%` }}
                  />
                </div>
              </div>

              {/* Factors */}
              {item.factors.length > 0 && (
                <div className="space-y-1">
                  {item.factors.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                      <span className="text-[11px] text-[var(--text-muted)] leading-snug">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
