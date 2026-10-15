"use client";

import React, { useState, useEffect } from "react";
import { Users, Crosshair, Award, ShieldCheck, Zap, Trophy } from "lucide-react";

interface RivalSpyProps {
  manager?: any;
}

export default function RivalSpy({ manager }: RivalSpyProps) {
  const userLeagues = manager?.leagues || [];
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");

  useEffect(() => {
    if (userLeagues.length > 0 && !selectedLeagueId) {
      // Pick the first league
      setSelectedLeagueId(String(userLeagues[0].id));
    }
  }, [userLeagues]);

  const activeLeague = userLeagues.find((l: any) => String(l.id) === selectedLeagueId) || {
    id: 981240,
    name: "Tech & Devs Premier League",
    entry_rank: 2,
  };

  // Sample high-fidelity rival data from mini-league
  const rivals = [
    { rank: 1, manager: "Liam Carter", team: "Salah’s Disciples", points: 648, captain: "Mohamed Salah", captainEO: "168%", gap: "+24 pts" },
    { rank: activeLeague.entry_rank || 2, manager: `${manager?.player_first_name || "Asman"} (You)`, team: manager?.name || "Asman's Contenders", points: manager?.summary_overall_points || 624, captain: "Cole Palmer", captainEO: "92%", gap: "Current" },
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
          <p className="text-xs text-gray-400">Track your real mini-leagues, rivals' captains, and Effective Ownership (EO)</p>
        </div>

        {/* Real League Selector */}
        {userLeagues.length > 0 ? (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedLeagueId}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              className="bg-[#24032d] border border-[#441151] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-fpl-green max-w-[220px] truncate"
            >
              {userLeagues.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.name} (Rank: #{l.entry_rank})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={selectedLeagueId || "981240"}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              placeholder="Mini-League ID"
              className="bg-[#24032d] border border-[#441151] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-fpl-green w-32"
            />
            <button className="bg-fpl-purple hover:bg-fpl-border text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#441151]">
              Track
            </button>
          </div>
        )}
      </div>

      {/* AI Game Theory Strategy Insight */}
      <div className="bg-gradient-to-r from-[#24012e] to-[#120017] border-l-4 border-fpl-green rounded-xl p-4 flex gap-3 items-start">
        <Zap className="w-5 h-5 text-fpl-green shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-fpl-green uppercase tracking-wider">
            Game-Theory Catch-Up Analysis ({activeLeague.name})
          </div>
          <p className="text-gray-300 leading-relaxed">
            In <strong className="text-white">{activeLeague.name}</strong>, you are currently ranked <span className="text-yellow-400 font-bold">#{activeLeague.entry_rank || 2}</span>.
            The leader frequently captains template players. To leapfrog them, do not duplicate their exact captain.
          </p>
          <div className="font-semibold text-fpl-cyan pt-1">
            Recommendation: Captain Cole Palmer or Erling Haaland for maximum differential swing against the top rivals in this league.
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
            {rivals.map((r, i) => {
              const isYou = r.manager.includes("You");
              return (
                <tr key={i} className={`hover:bg-[#20022a] ${isYou ? "bg-[#280235]/70" : ""}`}>
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
