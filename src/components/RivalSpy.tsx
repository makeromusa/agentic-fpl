"use client";

import React, { useState, useEffect } from "react";
import {
  Crosshair,
  Trophy,
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
  ShieldAlert,
  Zap,
  X,
  Swords,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from "lucide-react";
import { EnrichedPlayer } from "@/lib/types";

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
  captain_name?: string | null;
  active_chip?: string | null;
  transfers_made?: number | null;
  transfers_cost?: number;
}

interface RivalDetailData {
  rival: {
    id: number;
    name: string;
    player_name: string;
    total_points: number;
    rank: number;
    bank: number;
    value: number;
    transfers_made: number;
    transfers_cost: number;
    active_chip: string | null;
  };
  squad: EnrichedPlayer[];
  captain: EnrichedPlayer | null;
  vice_captain: EnrichedPlayer | null;
  comparison: {
    threat_differentials: EnrichedPlayer[];
    shared_core: EnrichedPlayer[];
    user_captain: EnrichedPlayer | null;
    rival_captain: EnrichedPlayer | null;
    captain_matchup: {
      same: boolean;
      user_pick: string;
      rival_pick: string;
    };
  };
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

  // Modal / Drawer state for inspecting rival squads
  const [inspectingRivalId, setInspectingRivalId] = useState<number | null>(null);
  const [rivalDetail, setRivalDetail] = useState<RivalDetailData | null>(null);
  const [rivalDetailLoading, setRivalDetailLoading] = useState(false);

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

  const handleInspectRival = async (rivalEntryId: number) => {
    setInspectingRivalId(rivalEntryId);
    setRivalDetailLoading(true);
    setRivalDetail(null);
    try {
      const userParam = manager?.id ? `&user_id=${manager.id}` : "";
      const res = await fetch(`/api/fpl/rival-team?id=${rivalEntryId}${userParam}`);
      const data = await res.json();
      if (data.success) {
        setRivalDetail(data);
      }
    } catch (e) {
      console.error("Failed to inspect rival:", e);
    } finally {
      setRivalDetailLoading(false);
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
              <p className="text-xs text-[var(--text-muted)]">Live squad inspection, captaincy clashes &amp; threat matrix</p>
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

      {/* Tactical Overview */}
      {activeLeague && leaderEntry && (
        <div className="bg-gradient-to-r from-[#20052a] to-[var(--bg-elevated)] border border-[#37003c] rounded-xl p-3.5 flex items-start gap-3">
          <Zap className="w-4 h-4 text-[#00ff87] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span>Game-Theory Catch-Up Analysis</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">Click any rival below to inspect their full 15-player team</span>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              {pointGap === 0
                ? "You are leading this league. Shield your rank by matching the most popular template captains and minimizing unnecessary points hits."
                : `You trail ${leaderEntry.player_name} (${leaderEntry.entry_name}) by ${pointGap} pts. Click 'Inspect Squad' to see which differentials they own and where your captaincy can swing the deficit.`}
            </p>
          </div>
        </div>
      )}

      {/* Standings Table */}
      <div className="overflow-hidden border border-[var(--border-subtle)] rounded-xl">
        {standingsLoading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#00ff87]" />
            <span className="text-xs text-[var(--text-muted)]">Analyzing live mini-league squads &amp; captaincy picks...</span>
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
                  <th className="py-2.5 px-3 w-12">Rank</th>
                  <th className="py-2.5 px-3">Manager &amp; Team</th>
                  <th className="py-2.5 px-3">Live Captain</th>
                  <th className="py-2.5 px-3 text-center">Chip</th>
                  <th className="py-2.5 px-3 text-right">GW Pts</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Spy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {standings.slice(0, 30).map((r) => {
                  const isYou = manager?.id && r.entry === manager.id;
                  const chipLabel = r.active_chip ? (
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {r.active_chip === "3xc" ? "TC" : r.active_chip === "bboost" ? "BB" : r.active_chip}
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  );

                  return (
                    <tr
                      key={r.entry}
                      className={`transition-colors hover:bg-[var(--bg-hover)] ${
                        isYou ? "bg-[#00ff87]/5 font-semibold" : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-mono">
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
                      <td className="py-3 px-3">
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
                      <td className="py-3 px-3">
                        {r.captain_name ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-amber-300">
                            👑 {r.captain_name}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">{chipLabel}</td>
                      <td className="py-3 px-3 font-mono text-right text-[var(--text-secondary)]">
                        {r.event_total ?? "—"}
                      </td>
                      <td className="py-3 px-3 font-mono text-right font-bold text-[#00ff87]">
                        {r.total}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleInspectRival(r.entry)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-elevated)] hover:bg-[#00ff87]/15 hover:text-[#00ff87] border border-[var(--border-subtle)] hover:border-[#00ff87]/30 text-[var(--text-secondary)] transition-all"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Rival Deep Squad Inspection Modal ──────────────────────────────── */}
      {inspectingRivalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    {rivalDetail?.rival.name || "Rival Squad Inspection"}
                    {rivalDetail?.rival.active_chip && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        CHIP: {rivalDetail.rival.active_chip.toUpperCase()}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Managed by {rivalDetail?.rival.player_name || "Manager"} · Rank #{rivalDetail?.rival.rank?.toLocaleString() || "—"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingRivalId(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-6">
              {rivalDetailLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00ff87]" />
                  <p className="text-xs text-[var(--text-muted)]">Loading rival starting XI, captaincy and threat differentials...</p>
                </div>
              ) : rivalDetail ? (
                <>
                  {/* Captaincy Clash & Head-to-Head Banner */}
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                        Your Captain
                      </div>
                      <div className="text-sm font-bold text-[#00ff87] flex items-center gap-1.5">
                        👑 {rivalDetail.comparison.captain_matchup.user_pick}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {rivalDetail.comparison.captain_matchup.same
                          ? "✅ Matched captain pick. No rank divergence on this fixture."
                          : "⚔️ Differential captaincy! This match will swing the gap between you."}
                      </div>
                    </div>

                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[var(--border-subtle)] sm:pl-4 pt-3 sm:pt-0">
                      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                        Rival's Captain
                      </div>
                      <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                        👑 {rivalDetail.comparison.captain_matchup.rival_pick}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        Transfers made: <strong className="text-white">{rivalDetail.rival.transfers_made}</strong>
                        {rivalDetail.rival.transfers_cost > 0 && (
                          <span className="text-rose-400 font-mono ml-1">(-{rivalDetail.rival.transfers_cost}pts hit)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Threat Differentials (Rival owns, You do NOT) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        Threat Differentials ({rivalDetail.comparison.threat_differentials.length})
                      </h4>
                      <span className="text-[10px] text-[var(--text-muted)]">Players they own that you don't</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {rivalDetail.comparison.threat_differentials.map((p) => (
                        <div
                          key={p.id}
                          className="bg-[var(--bg-elevated)] border border-rose-500/20 rounded-xl p-2.5 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                              {p.web_name}
                              {p.is_captain && <span className="text-[9px] text-amber-400 font-black">(C)</span>}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] font-mono">
                              {p.team_short} · £{(p.now_cost / 10).toFixed(1)}m
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold font-mono text-[#00ff87]">{p.total_points}pts</div>
                            <div className="text-[10px] text-[var(--text-muted)] font-mono">Form {p.form}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full Rival 15-Player Squad Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#00ff87]" />
                      Rival's Full Squad Sheet
                    </h4>

                    <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] text-[10px] uppercase font-semibold">
                          <tr>
                            <th className="py-2 px-3">Role</th>
                            <th className="py-2 px-3">Player</th>
                            <th className="py-2 px-3">Team</th>
                            <th className="py-2 px-3 text-right">Cost</th>
                            <th className="py-2 px-3 text-right">Form</th>
                            <th className="py-2 px-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                          {rivalDetail.squad.map((p) => (
                            <tr
                              key={p.id}
                              className={`hover:bg-[var(--bg-elevated)] ${
                                !p.is_starting ? "opacity-60 bg-black/10" : ""
                              }`}
                            >
                              <td className="py-2 px-3 font-mono text-[11px]">
                                {p.is_starting ? (
                                  <span className="text-[#00ff87] font-semibold">XI</span>
                                ) : (
                                  <span className="text-[var(--text-muted)]">Sub</span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                                <span>{p.web_name}</span>
                                {p.is_captain && (
                                  <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                    C
                                  </span>
                                )}
                                {p.is_vice_captain && (
                                  <span className="bg-gray-300 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                    V
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-mono text-[var(--text-muted)]">{p.team_short}</td>
                              <td className="py-2 px-3 font-mono text-right text-[var(--text-secondary)]">
                                £{(p.now_cost / 10).toFixed(1)}m
                              </td>
                              <td className="py-2 px-3 font-mono text-right text-[var(--text-secondary)]">{p.form}</td>
                              <td className="py-2 px-3 font-mono text-right font-bold text-[#00ff87]">
                                {p.total_points}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                  Could not load rival details. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
