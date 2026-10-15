"use client";

import React from "react";
import { EnrichedPlayer } from "@/lib/types";
import { ShieldAlert, Award, TrendingUp } from "lucide-react";

interface PitchProps {
  squad: EnrichedPlayer[];
  onSelectPlayer?: (player: EnrichedPlayer) => void;
  selectedPlayerId?: number | null;
}

export default function Pitch({ squad, onSelectPlayer, selectedPlayerId }: PitchProps) {
  // Split into starting 11 and bench (12-15)
  const starters = squad.filter((p) => p.is_starting);
  const bench = squad.filter((p) => !p.is_starting);

  const gks = starters.filter((p) => p.element_type === 1);
  const defs = starters.filter((p) => p.element_type === 2);
  const mids = starters.filter((p) => p.element_type === 3);
  const fwds = starters.filter((p) => p.element_type === 4);

  const formation = `${defs.length}-${mids.length}-${fwds.length}`;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Formation Header */}
      <div className="w-full flex justify-between items-center px-4 py-2 bg-[#1a0022] border border-[#330b3d] rounded-t-xl text-xs text-gray-300">
        <span className="font-semibold text-fpl-green">Formation: {formation}</span>
        <span className="text-gray-400">Starting XI: {starters.length} | Bench: {bench.length}</span>
      </div>

      {/* The Grass Pitch */}
      <div className="relative w-full aspect-[4/5] max-h-[680px] bg-gradient-to-b from-emerald-800 via-green-800 to-emerald-900 border-x-4 border-b-4 border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between py-6 px-2">
        {/* Pitch Field Markings (SVG Overlay) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {/* Halfway line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white -translate-y-1/2"></div>
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full"></div>
          {/* Top Penalty Area */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-b-2 border-x-2 border-white"></div>
          {/* Bottom Penalty Area */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-t-2 border-x-2 border-white"></div>
          {/* Horizontal grass cut stripes */}
          <div className="w-full h-full flex flex-col">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-black/10" : "bg-transparent"}`}></div>
            ))}
          </div>
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
        <div className="relative z-10 flex justify-around items-center px-4">
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
        <div className="relative z-10 flex justify-around items-center px-2">
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

      {/* The Substitutes Bench */}
      <div className="w-full mt-3 bg-[#170220] border border-[#330b3d] rounded-xl p-3 shadow-lg">
        <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Substitutes Bench
        </div>
        <div className="grid grid-cols-4 gap-2">
          {bench.map((p, index) => (
            <div key={p.id} className="relative flex flex-col items-center">
              <span className="absolute -top-1.5 left-2 z-20 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-gray-300">
                {index === 0 ? "GK" : `Sub ${index}`}
              </span>
              <PlayerCard
                player={p}
                isBench
                isSelected={selectedPlayerId === p.id}
                onClick={() => onSelectPlayer?.(p)}
              />
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

  // Position-based jersey colors
  const jerseyBg =
    player.element_type === 1
      ? "bg-amber-400 text-black"
      : player.element_type === 2
      ? "bg-sky-500 text-white"
      : player.element_type === 3
      ? "bg-emerald-500 text-white"
      : "bg-rose-500 text-white";

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center transition-all duration-200 transform hover:scale-105 focus:outline-none ${
        isSelected ? "scale-110 drop-shadow-[0_0_12px_#00ff87]" : ""
      }`}
    >
      {/* Captain / Vice Captain Badges */}
      {player.is_captain && (
        <span className="absolute -top-2 -right-1 z-20 bg-amber-400 text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-white">
          C
        </span>
      )}
      {player.is_vice_captain && (
        <span className="absolute -top-2 -right-1 z-20 bg-gray-200 text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-gray-400">
          V
        </span>
      )}

      {/* Injury Alert Icon */}
      {isInjured && (
        <span className="absolute -top-2 -left-1 z-20 bg-rose-600 text-white p-0.5 rounded-full shadow-md animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
        </span>
      )}

      {/* Mini Kit / Shirt Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold text-xs border-2 border-white/40 ${jerseyBg} ${
          isBench ? "opacity-80" : ""
        }`}
      >
        {player.team_short || "PL"}
      </div>

      {/* Player Label Card */}
      <div className="mt-1 w-20 bg-[#120017]/95 border border-[#330b3d] rounded shadow-lg overflow-hidden text-center group-hover:border-fpl-green">
        <div className="px-1 py-0.5 text-[11px] font-bold text-gray-100 truncate">
          {player.web_name}
        </div>
        <div className="bg-[#1f002b] px-1 py-0.5 flex justify-between items-center text-[10px] font-mono border-t border-[#330b3d]">
          <span className="text-gray-400 font-sans">£{cost}m</span>
          <span className="text-fpl-green font-bold">{player.total_points}pts</span>
        </div>
      </div>
    </button>
  );
}
