"use client";

import React, { useState, useEffect } from "react";
import { Crosshair, Trophy, Loader2, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus, ShieldCheck, Zap } from "lucide-react";

interface RivalSpyProps {
  manager?: any;
}

interface LeagueEntry {
  rank: number;
  last_rank: number;
  rank_sort: number;
  total: number;
  entry: number;
  player_name: string;
  entry_name: string;
  event_total: number;
}

export default function RivalSpy({ manager }: RivalSpyProps) {
  const rawLeagues = manager?.leagues || [];

  // Filter to prioritize real mini-leagues (private leagues), but fallback to other classic leagues if empty
  const privateLeagues = rawLeagues.filter(
    (l: any) => l.admin_entry !== null || l.league_type === "x" || (!l.short_name?.startsWith("s") && l.short_name !== "overall")
  );
  const displayLeagues = privateLeagues.length > 0 ? privateLeagues : rawLeagues;

  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [standings, setStandings] = useState<LeagueEntry[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);

  useEffect(() => {
    if (displayLeagues.length > 0 && (!selectedLeagueId || !displayLeagues.some((l: any) => String(l.id) === selectedLeagueId))) {
      setSelectedLeagueId(String(displayLeagues[0].id));
    }
  }, [displayLeagues, selectedLeagueId]);

  useEffect(() => {
    if (!selectedLeagueId) return;
    fetchStandings(selectedLeagueId);
  }, [selectedLeagueId]);

  const fetchStandings = async (leagueId: string) => {
    setStandingsLoading(true);
    setStandingsError(null);
    try {
      const res = await fetch(`/api/fpl/league?id=${leagueId}`);
      const data = await res.json();
      if (data.success) {
        setStandings(data.standings || []);
      } else {
        setStandingsError(data.error || "Failed to load live standings");
      }
    } catch {
      setStandingsError("Network error loading mini-league standings");
    } finally {
      setStandingsLoading(false);
    }
  };

  const activeLeague = displayLeagues.find((l: any) => String(l.id) === selectedLeagueId);
  const userEntry = standings.find((s) => s.entry === manager?.id);
  const leaderEntry = standings[0];
  const userRank = userEntry?.rank || activeLeague?.entry_rank || "-";
  const userPoints = userEntry?.total || manager?.summary_overall_points || 0;
  const leaderPoints = leaderEntry?.total || userPoints;
  const pointGap = leaderPoints - userPoints;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
      {/* Header & League Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/20 flex items-center justify-center text-[#00ff87]">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Mini-League Rival Intelligence</h3>
              <p className="text-xs text-[var(--text-muted)]">Live FPL standings &amp; rank differential analysis</p>
            </div>
          </div>
        </div>

        {displayLeagues.length > 0 ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedLeagueId}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              className="flex-1 sm:flex-initial bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:border-[#00ff87] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none transition-colors"
            >
              {displayLeagues.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.entry_rank ? `(#${l.entry_rank})` : ""}
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedLeagueId && fetchStandings(selectedLeagueId)}
              disabled={standingsLoading}
              title="Refresh standings"
              className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[#00ff87]/40 text-[var(--text-muted)] hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${standingsLoading ? "animate-spin text-[#00ff87]" : ""}`} />
            </button>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
            Sync your team ID to view your mini-leagues
          </div>
        )}
      </div>

      {/* League Metrics Strip */}
      {activeLeague && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Your Rank</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">#{userRank}</div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Leader Points</div>
            <div className="text-lg font-bold font-mono text-[var(--text-primary)] mt-1">{leaderPoints} pts</div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Gap to Leader</div>
            <div className={`text-lg font-bold font-mono mt-1 ${pointGap > 0 ? "text-rose-400" : "text-[#00ff87]"}`}>
              {pointGap > 0 ? `-${pointGap} pts` : "Leading 👑"}
            </div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Competitors</div>
            <div className="text-lg font-bold font-mono text-[#00d4ff] mt-1">{standings.length || "—"}</div>
          </div>
        </div>
      )}

      {/* Strategic Catch-Up / Lead Defense Tip */}
      {activeLeague && leaderEntry && (
        <div className="bg-gradient-to-r from-[#20052a] to-[var(--bg-elevated)] border border-[#37003c] rounded-xl p-3.5 flex items-start gap-3">
          <Zap className="w-4 h-4 text-[#00ff87] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-[var(--text-primary)]">
              {pointGap === 0 ? "Defending 1st Place Strategy" : `Targeting 1st Place: ${leaderEntry.entry_name}`}
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              {pointGap === 0
                ? "You hold 1st position in this league. Shield your rank by matching popular template captains and maintaining high effective ownership on core assets."
                : `You are chasing ${leaderEntry.player_name} (${leaderEntry.entry_name}) by ${pointGap} points. Differentiating captaincy and leveraging explosive budget differentials is key to closing the margin.`}
            </p>
          </div>
        </div>
      )}

      {/* Standings Table */}
      <div className="overflow-hidden border border-[var(--border-subtle)] rounded-xl">
        {standingsLoading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#00ff87]" />
            <span className="text-xs text-[var(--text-muted)]">Fetching live standings from FPL API...</span>
          </div>
        ) : standingsError ? (
          <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <span className="text-xs text-[var(--text-secondary)]">{standingsError}</span>
            <button
              onClick={() => selectedLeagueId && fetchStandings(selectedLeagueId)}
              className="mt-2 text-xs bg-[var(--bg-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:text-white"
            >
              Try Again
            </button>
          </div>
        ) : standings.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-muted)]">
            No standings found for this league.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-14">Rank</th>
                  <th className="py-2.5 px-3">Manager &amp; Team</th>
                  <th className="py-2.5 px-3 text-right">GW Pts</th>
                  <th className="py-2.5 px-3 text-right">Total Pts</th>
                  <th className="py-2.5 px-3 text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {standings.slice(0, 30).map((r) => {
                  const isYou = manager?.id && r.entry === manager.id;
                  const rankDiff = r.last_rank ? r.last_rank - r.rank : 0;

                  return (
                    <tr
                      key={r.entry}
                      className={`transition-colors hover:bg-[var(--bg-hover)] ${
                        isYou ? "bg-[#00ff87]/5 font-semibold" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono">
                        {r.rank === 1 ? (
                          <span className="text-amber-400 font-bold">🥇 1</span>
                        ) : r.rank === 2 ? (
                          <span className="text-gray-300 font-bold">🥈 2</span>
                        ) : r.rank === 3 ? (
                          <span className="text-amber-600 font-bold">🥉 3</span>
                        ) : (
                          <span className="text-[var(--text-muted)]">#{r.rank}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[var(--text-primary)]">{r.entry_name}</span>
                          {isYou && (
                            <span className="bg-[#00ff87] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">{r.player_name}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right text-[var(--text-secondary)]">
                        {r.event_total ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right font-bold text-[#00ff87]">
                        {r.total}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {rankDiff > 0 ? (
                          <span className="inline-flex items-center text-[10px] text-emerald-400 font-mono">
                            <TrendingUp className="w-3 h-3 mr-0.5" /> +{rankDiff}
                          </span>
                        ) : rankDiff < 0 ? (
                          <span className="inline-flex items-center text-[10px] text-rose-400 font-mono">
                            <TrendingDown className="w-3 h-3 mr-0.5" /> {rankDiff}
                          </span>
                        ) : (
                          <Minus className="w-3 h-3 text-[var(--text-muted)] mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
