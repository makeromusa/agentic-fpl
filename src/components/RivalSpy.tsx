"use client";

import React, { useState } from "react";
import { Users, Crosshair, Award, ShieldCheck, Zap } from "lucide-react";

export default function RivalSpy() {
  const [leagueId, setLeagueId] = useState("981240");
  const [leagueName, setLeagueName] = useState("Tech & Devs Premier League");

  // Sample high-fidelity rival data from mini-league
  const rivals = [
    { rank: 1, manager: "Liam Carter", team: "Salah’s Disciples", points: 648, captain: "Mohamed Salah", captainEO: "168%", gap: "+24 pts" },
    { rank: 2, manager: "Asman Makero (You)", team: "Asman's Contenders", points: 624, captain: "Mohamed Salah", captainEO: "168%", gap: "Current" },
    { rank: 3, manager: "Kavita Rao", team: "Palmer Express", points: 619, captain: "Cole Palmer", captainEO: "84%", gap: "-5 pts" },
    { rank: 4, manager: "David Kim", team: "Haaland Hattrick FC", points: 602, captain: "Erling Haaland", captainEO: "142%", gap: "-22 pts" },
    { rank: 5, manager: "Marcus Bell", team: "Saka Punch", points: 595, captain: "Bukayo Saka", captainEO: "52%", gap: "-29 pts" },
  ];

  return (
    <div className="bg-[#170220] border border-[#330b3d] rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-fpl-green" /> Rival Spy & Game-Theory Engine
          </h3>
          <p className="text-xs text-gray-400">Mini-League Effective Ownership (EO) and Differential Counter-Strategy</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            placeholder="Mini-League ID"
            className="bg-[#24032d] border border-[#441151] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-fpl-green w-32"
          />
          <button className="bg-fpl-purple hover:bg-fpl-border text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#441151]">
            Track
          </button>
        </div>
      </div>

      {/* AI Game Theory Strategy Insight */}
      <div className="bg-gradient-to-r from-[#24012e] to-[#120017] border-l-4 border-fpl-green rounded-xl p-4 flex gap-3 items-start">
        <Zap className="w-5 h-5 text-fpl-green shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-fpl-green uppercase tracking-wider">Game-Theory Catch-Up Analysis</div>
          <p className="text-gray-300 leading-relaxed">
            You are trailing 1st place <strong className="text-white">Liam Carter</strong> by <span className="text-yellow-400 font-bold">24 points</span>.
            Liam owns and captains <strong className="text-white">Mohamed Salah</strong> in 80% of Gameweeks.
            If you captain Salah, you cannot close the gap even with a haul.
          </p>
          <div className="font-semibold text-fpl-cyan pt-1">
            Recommendation: Captain Cole Palmer (CHE) or Bukayo Saka (ARS). Only 1 rival in your top 5 owns Palmer as captain, creating an 80% differential swing.
          </div>
        </div>
      </div>

      {/* Mini-League Standings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#330b3d] text-gray-400">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Manager & Team</th>
              <th className="py-2.5 px-3">Total Pts</th>
              <th className="py-2.5 px-3">Captaincy Pick</th>
              <th className="py-2.5 px-3">Effective Ownership</th>
              <th className="py-2.5 px-3">Gap to Leader</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#260330]">
            {rivals.map((r) => {
              const isYou = r.manager.includes("You");
              return (
                <tr key={r.rank} className={`hover:bg-[#20022a] ${isYou ? "bg-[#280235]/70" : ""}`}>
                  <td className="py-3 px-3 font-bold font-mono">
                    {r.rank === 1 ? <span className="text-yellow-400">🥇 #1</span> : `#${r.rank}`}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-100 flex items-center gap-1.5">
                      {r.team} {isYou && <span className="bg-fpl-green text-black text-[9px] font-black px-1.5 py-0.2 rounded">YOU</span>}
                    </div>
                    <div className="text-[11px] text-gray-400">{r.manager}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-fpl-green">{r.points}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#13011a] border border-[#441151] text-gray-200">
                      <Award className="w-3 h-3 text-amber-400" /> {r.captain}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-300">{r.captainEO}</td>
                  <td className="py-3 px-3 font-mono text-gray-400">{r.gap}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
