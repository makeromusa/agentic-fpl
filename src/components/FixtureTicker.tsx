"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Loader2, ArrowUpDown, Search, Zap, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

interface Fixture {
  event: number;
  opponent: string;
  opponent_id: number;
  is_home: boolean;
  difficulty: number;
  kickoff: string;
}

interface TeamSchedule {
  team_id: number;
  team_name: string;
  short_name: string;
  fixtures: Fixture[];
  total_difficulty: number;
  average_difficulty: number;
}

export default function FixtureTicker() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<TeamSchedule[]>([]);
  const [windowInfo, setWindowInfo] = useState<{ from: number; to: number }>({ from: 7, to: 11 });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"easiest" | "hardest" | "alpha">("easiest");

  useEffect(() => {
    async function loadFixtures() {
      try {
        const res = await fetch("/api/fpl/fixtures");
        const data = await res.json();
        if (data.success) {
          setSchedules(data.teams);
          setWindowInfo(data.window);
        }
      } catch (e) {
        console.error("Failed to load fixtures:", e);
      } finally {
        setLoading(false);
      }
    }
    loadFixtures();
  }, []);

  const filtered = schedules
    .filter(
      (s) =>
        s.team_name.toLowerCase().includes(search.toLowerCase()) ||
        s.short_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "easiest") return a.average_difficulty - b.average_difficulty;
      if (sortBy === "hardest") return b.average_difficulty - a.average_difficulty;
      return a.team_name.localeCompare(b.team_name);
    });

  const greenRuns = [...schedules].sort((a, b) => a.average_difficulty - b.average_difficulty).slice(0, 3);
  const redTraps = [...schedules].sort((a, b) => b.average_difficulty - a.average_difficulty).slice(0, 3);

  const getFdrBadge = (fdr: number, isHome: boolean, opp: string) => {
    let colorClass = "";
    if (fdr <= 2) colorClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    else if (fdr === 3) colorClass = "bg-slate-500/15 text-slate-300 border-slate-500/30";
    else if (fdr === 4) colorClass = "bg-amber-500/15 text-amber-300 border-amber-500/30";
    else colorClass = "bg-rose-500/15 text-rose-300 border-rose-500/30";

    return (
      <div
        className={`px-2 py-1.5 rounded-lg border text-center transition-all hover:scale-105 ${colorClass}`}
      >
        <div className="font-mono font-bold text-xs">
          {opp} <span className="text-[10px] font-normal">({isHome ? "H" : "A"})</span>
        </div>
        <div className="text-[9px] font-mono opacity-80">FDR {fdr}</div>
      </div>
    );
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fpl-cyan/10 border border-fpl-cyan/20 flex items-center justify-center text-fpl-cyan">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                5-Gameweek Fixture Swing Matrix (GW{windowInfo.from}–GW{windowInfo.to})
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Dynamic FDR heatmap &amp; multi-gameweek transfer window detector
              </p>
            </div>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search club..."
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[#00ff87] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none"
          >
            <option value="easiest">Easiest First</option>
            <option value="hardest">Hardest First</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Swing Detector Highlights */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Prime Green Runs */}
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Target Assets (Green Fixture Waves)
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                {greenRuns.map((c, i) => (
                  <span key={c.team_id} className="inline-block mr-3">
                    <strong>{c.short_name}</strong> (Avg FDR: <span className="font-mono text-emerald-300 font-bold">{c.average_difficulty}</span>)
                    {i < 2 ? " ·" : ""}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Prioritize incoming transfers from these clubs ahead of their extended easy schedules.
              </p>
            </div>
          </div>

          {/* Red Trap Warning */}
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Danger Traps (Red Fixture Clusters)
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                {redTraps.map((c, i) => (
                  <span key={c.team_id} className="inline-block mr-3">
                    <strong>{c.short_name}</strong> (Avg FDR: <span className="font-mono text-rose-300 font-bold">{c.average_difficulty}</span>)
                    {i < 2 ? " ·" : ""}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Consider selling or benching assets from these clubs before tough fixture blocks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Heatmap Grid */}
      <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-xl">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#00ff87]" />
            <span className="text-xs text-[var(--text-muted)]">Compiling 5-GW fixture difficulty matrix...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Club</th>
                <th className="py-2.5 px-2 text-center">Avg FDR</th>
                {Array.from({ length: windowInfo.to - windowInfo.from + 1 }).map((_, i) => (
                  <th key={i} className="py-2.5 px-2 text-center">
                    GW{windowInfo.from + i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((team) => (
                <tr key={team.team_id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-[var(--text-primary)]">{team.team_name}</div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">{team.short_name}</div>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        team.average_difficulty <= 2.8
                          ? "bg-emerald-500/20 text-emerald-400"
                          : team.average_difficulty >= 3.6
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {team.average_difficulty}
                    </span>
                  </td>
                  {team.fixtures.map((f, idx) => (
                    <td key={idx} className="py-2 px-1.5 min-w-[85px]">
                      {getFdrBadge(f.difficulty, f.is_home, f.opponent)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
