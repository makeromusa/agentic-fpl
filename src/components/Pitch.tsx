"use client";

import React from "react";
import { EnrichedPlayer } from "@/lib/types";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface PitchProps {
  squad: EnrichedPlayer[];
  onSelectPlayer?: (player: EnrichedPlayer) => void;
  selectedPlayerId?: number | null;
}

export default function Pitch({ squad, onSelectPlayer, selectedPlayerId }: PitchProps) {
  const starters = squad.filter((p) => p.is_starting);
  const bench = squad.filter((p) => !p.is_starting);

  const gks = starters.filter((p) => p.element_type === 1);
  const defs = starters.filter((p) => p.element_type === 2);
  const mids = starters.filter((p) => p.element_type === 3);
  const fwds = starters.filter((p) => p.element_type === 4);

  const formation = `${defs.length}-${mids.length}-${fwds.length}`;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Formation Bar */}
      <div className="w-full flex justify-between items-center px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-t-2xl text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--text-primary)]">Formation</span>
          <span className="font-mono-num font-bold text-[#00ff87] bg-[#00ff87]/10 px-2 py-0.5 rounded-full border border-[#00ff87]/20">
            {formation}
          </span>
        </div>
        <div className="text-[var(--text-muted)] text-[11px] font-mono-num">
          Starting XI: {starters.length} · Bench: {bench.length}
        </div>
      </div>

      {/* Modern Pitch Area */}
      <div className="relative w-full aspect-[4/5] max-h-[660px] bg-gradient-to-b from-[#113824] via-[#0d2e1d] to-[#0a2316] border-x border-b border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col justify-between py-6 px-3">
        {/* Pitch Lines & Shading Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle horizontal grass cut bands */}
          <div className="w-full h-full flex flex-col opacity-25">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 ${i % 2 === 0 ? "bg-black/20" : "bg-white/5"}`}
              />
            ))}
          </div>

          {/* SVG Field Markings */}
          <svg className="absolute inset-0 w-full h-full stroke-white/20 fill-none" strokeWidth="1.5">
            {/* Outer border */}
            <rect x="12" y="12" width="calc(100% - 24px)" height="calc(100% - 24px)" rx="12" />
            {/* Halfway line */}
            <line x1="12" y1="50%" x2="calc(100% - 12px)" y2="50%" />
            {/* Center circle */}
            <circle cx="50%" cy="50%" r="54" />
            <circle cx="50%" cy="50%" r="2" fill="rgba(255,255,255,0.3)" />
            {/* Top Penalty Area */}
            <rect x="calc(50% - 90px)" y="12" width="180" height="90" rx="4" />
            <rect x="calc(50% - 45px)" y="12" width="90" height="35" rx="2" />
            {/* Bottom Penalty Area */}
            <rect x="calc(50% - 90px)" y="calc(100% - 102px)" width="180" height="90" rx="4" />
            <rect x="calc(50% - 45px)" y="calc(100% - 47px)" width="90" height="35" rx="2" />
          </svg>
        </div>

        {/* Goalkeeper Line */}
        <div className="relative z-10 flex justify-center items-center gap-4">
          {gks.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              isSelected={selectedPlayerId === p.id}
              onClick={() => onSelectPlayer?.(p)}
            />
          ))}
        </div>

        {/* Defenders Line */}
        <div className="relative z-10 flex justify-around items-center px-2">
          {defs.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              isSelected={selectedPlayerId === p.id}
              onClick={() => onSelectPlayer?.(p)}
            />
          ))}
        </div>

        {/* Midfielders Line */}
        <div className="relative z-10 flex justify-around items-center px-1">
          {mids.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              isSelected={selectedPlayerId === p.id}
              onClick={() => onSelectPlayer?.(p)}
            />
          ))}
        </div>

        {/* Forwards Line */}
        <div className="relative z-10 flex justify-around items-center px-6">
          {fwds.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              isSelected={selectedPlayerId === p.id}
              onClick={() => onSelectPlayer?.(p)}
            />
          ))}
        </div>
      </div>

      {/* Substitutes Bench */}
      <div className="w-full mt-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-xl">
        <div className="text-xs font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Substitutes Bench
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">Order prioritized for auto-subs</span>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {bench.map((p, index) => (
            <div key={p.id} className="relative flex flex-col items-center">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] whitespace-nowrap">
                {index === 0 ? "GK" : `Sub ${index}`}
              </span>
              <div className="pt-2 w-full flex justify-center">
                <PlayerCard
                  player={p}
                  isBench
                  isSelected={selectedPlayerId === p.id}
                  onClick={() => onSelectPlayer?.(p)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  player,
  isBench = false,
  isSelected = false,
  onClick,
}: {
  player: EnrichedPlayer;
  isBench?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const isInjured = player.chance_of_playing_next_round !== null && player.chance_of_playing_next_round < 100;
  const cost = (player.now_cost / 10).toFixed(1);

  // Clean position badges
  const posBadgeColor =
    player.element_type === 1
      ? "from-amber-500 to-amber-700"
      : player.element_type === 2
      ? "from-sky-500 to-blue-700"
      : player.element_type === 3
      ? "from-emerald-500 to-teal-700"
      : "from-rose-500 to-red-700";

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center transition-all duration-200 transform hover:-translate-y-1 focus:outline-none ${
        isSelected ? "scale-105" : ""
      }`}
    >
      {/* Captain / Vice Captain Badges */}
      {player.is_captain && (
        <span
          title="Captain (Double Points)"
          className="absolute -top-1.5 -right-1.5 z-20 bg-gradient-to-tr from-amber-400 to-amber-300 text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white"
        >
          C
        </span>
      )}
      {player.is_vice_captain && (
        <span
          title="Vice-Captain"
          className="absolute -top-1.5 -right-1.5 z-20 bg-gradient-to-tr from-gray-200 to-gray-400 text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white"
        >
          V
        </span>
      )}

      {/* Injury Alert */}
      {isInjured && (
        <span
          title={player.news || "Injury Doubt"}
          className="absolute -top-1.5 -left-1.5 z-20 bg-rose-600 text-white p-0.5 rounded-full shadow-lg animate-pulse"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
        </span>
      )}

      {/* Team Shirt Roundel */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${posBadgeColor} flex items-center justify-center shadow-md font-bold text-[11px] text-white border border-white/20 transition-all ${
          isSelected ? "ring-2 ring-[#00ff87] ring-offset-2 ring-offset-[#0a2316]" : ""
        } ${isBench ? "opacity-85" : ""}`}
      >
        {player.team_short || "PL"}
      </div>

      {/* Player Label Card */}
      <div
        className={`mt-1.5 w-20 sm:w-22 bg-[var(--bg-elevated)]/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden text-center transition-colors ${
          isSelected ? "border-[#00ff87]" : "border-[var(--border-subtle)] group-hover:border-[var(--border-default)]"
        }`}
      >
        <div className="px-1 py-0.5 text-[11px] font-semibold text-[var(--text-primary)] truncate">
          {player.web_name}
        </div>
        <div className="bg-[var(--bg-surface)] px-1 py-0.5 flex justify-between items-center text-[10px] font-mono-num border-t border-[var(--border-subtle)]">
          <span className="text-[var(--text-muted)] text-[9px]">£{cost}m</span>
          <span className="text-[#00ff87] font-semibold">{player.total_points}pts</span>
        </div>
      </div>
    </button>
  );
}
