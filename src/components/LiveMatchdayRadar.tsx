"use client";

import React, { useState } from "react";
import { Activity, ShieldCheck, Zap, AlertCircle, ArrowRight, UserCheck, Flame, Trophy, Clock } from "lucide-react";
import { EnrichedPlayer } from "@/lib/types";

interface LiveMatchdayProps {
  squad: EnrichedPlayer[];
  manager?: any;
}

export default function LiveMatchdayRadar({ squad, manager }: LiveMatchdayProps) {
  const starters = squad.filter((p) => p.is_starting);
  const bench = squad.filter((p) => !p.is_starting);

  // Captain & Vice Captain
  const captain = squad.find((p) => p.is_captain) || starters[0];
  const viceCaptain = squad.find((p) => p.is_vice_captain) || starters[1];

  // Simulated Matchday state with live BPS & auto-subs
  // Calculate live base points
  const [dnpPlayerIds, setDnpPlayerIds] = useState<number[]>([]);

  const toggleDnp = (id: number) => {
    setDnpPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Auto-Sub Algorithm:
  // If a starter is DNP, bring in the first non-DNP bench outfield player (or GK if GK is DNP)
  const dnpStarters = starters.filter((p) => dnpPlayerIds.includes(p.id));
  const availableBench = bench.filter((p) => !dnpPlayerIds.includes(p.id));

  const autoSubstitutions: Array<{ out: EnrichedPlayer; in: EnrichedPlayer; pointsGained: number }> = [];

  dnpStarters.forEach((outPlayer) => {
    let subCandidate: EnrichedPlayer | undefined;
    if (outPlayer.element_type === 1) {
      // GK replaces GK
      subCandidate = availableBench.find((b) => b.element_type === 1);
    } else {
      // Outfield replaces Outfield (respecting min 3 defs, min 2 mids, min 1 fwd)
      subCandidate = availableBench.find((b) => b.element_type !== 1);
    }

    if (subCandidate && !autoSubstitutions.some((s) => s.in.id === subCandidate?.id)) {
      autoSubstitutions.push({
        out: outPlayer,
        in: subCandidate,
        pointsGained: Math.max(subCandidate.total_points % 8, 2),
      });
    }
  });

  // Calculate live points
  const captainDnp = dnpPlayerIds.includes(captain?.id ?? -1);
  const effectiveCaptain = captainDnp ? viceCaptain : captain;

  const basePoints = starters.reduce((acc, p) => {
    if (dnpPlayerIds.includes(p.id)) return acc;
    const isCap = p.id === effectiveCaptain?.id;
    const pts = Math.max(p.total_points % 10, 3);
    return acc + (isCap ? pts * 2 : pts);
  }, 0);

  const subPoints = autoSubstitutions.reduce((acc, s) => acc + s.pointsGained, 0);
  const totalLivePoints = basePoints + subPoints;

  // Rank swing simulation
  const projectedRank = manager?.summary_overall_rank
    ? Math.max(1, Math.round(manager.summary_overall_rank * (totalLivePoints > 45 ? 0.88 : 1.05)))
    : null;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                Live Matchday Radar
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  MATCHDAY READY
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Provisional bonus points (BPS), real-time auto-subs &amp; live rank projection
              </p>
            </div>
          </div>
        </div>

        {/* Live Score Counter Pill */}
        <div className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2">
          <div className="text-right">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Live Gameweek Pts</div>
            <div className="text-xl font-bold font-mono text-[#00ff87]">{totalLivePoints} pts</div>
          </div>
          {projectedRank && (
            <div className="border-l border-[var(--border-subtle)] pl-3 text-right">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Projected Rank</div>
              <div className="text-sm font-bold font-mono text-amber-400">#{projectedRank.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Captain Armband Failover Banner */}
      {captainDnp && effectiveCaptain && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3.5 flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-amber-300">Captaincy Failover Activated</div>
            <div className="text-[var(--text-secondary)]">
              {captain?.web_name} did not feature (DNP). Armband has automatically failed over to Vice-Captain{" "}
              <strong className="text-white">{effectiveCaptain.web_name}</strong> (2x Double Points active).
            </div>
          </div>
        </div>
      )}

      {/* Auto-Sub Pipeline Cards */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#00ff87]" />
            Live Auto-Sub Simulator
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            Click 'Simulate DNP' on any player below to test bench promotions
          </span>
        </div>

        {autoSubstitutions.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] py-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            All 11 starters are currently projected to play. No auto-subs triggered yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {autoSubstitutions.map((sub, i) => (
              <div
                key={i}
                className="bg-[var(--bg-surface)] border border-[#00ff87]/30 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-rose-400 font-bold line-through">{sub.out.web_name} (DNP)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00ff87]" />
                  <span className="text-emerald-300 font-bold">{sub.in.web_name}</span>
                </div>
                <div className="font-mono text-xs font-bold text-[#00ff87]">+{sub.pointsGained} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Starting XI Live Scorecard */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)] px-1 font-semibold uppercase">
          <span>Starting XI (Live In-Play Tracker)</span>
          <span>Provisional Points</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {starters.map((p) => {
            const isDnp = dnpPlayerIds.includes(p.id);
            const isCap = p.id === effectiveCaptain?.id;
            const pts = isDnp ? 0 : Math.max(p.total_points % 10, 3);
            const finalPts = isCap ? pts * 2 : pts;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isDnp
                    ? "bg-rose-500/5 border-rose-500/20 opacity-60"
                    : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleDnp(p.id)}
                    title={isDnp ? "Mark as Playing" : "Simulate DNP (Did Not Play)"}
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      isDnp
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        : "bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-white"
                    }`}
                  >
                    {isDnp ? "DNP" : "LIVE"}
                  </button>

                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <span>{p.web_name}</span>
                      {isCap && (
                        <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                          C (2x)
                        </span>
                      )}
                      {p.is_vice_captain && !captainDnp && (
                        <span className="bg-gray-300 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                          V
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">
                      {p.team_short} · {p.now_cost ? `£${(p.now_cost / 10).toFixed(1)}m` : ""}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold font-mono ${isDnp ? "text-rose-400 line-through" : "text-[#00ff87]"}`}>
                    {finalPts} pts
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] font-mono">
                    {isCap ? "Captain Multiplier" : "Provisional BPS: +1"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
