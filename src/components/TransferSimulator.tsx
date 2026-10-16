"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, Search, Calculator, ShieldCheck } from "lucide-react";
import { EnrichedPlayer, FPLPlayer } from "@/lib/types";

interface TransferSimulatorProps {
  squad: EnrichedPlayer[];
  manager?: any;
}

export default function TransferSimulator({ squad, manager }: TransferSimulatorProps) {
  const [allPlayers, setAllPlayers] = useState<FPLPlayer[]>([]);
  const [loadingPool, setLoadingPool] = useState(true);

  // Selected player to SELL from user squad
  const [sellPlayerId, setSellPlayerId] = useState<number>(squad[0]?.id || 0);
  // Selected player to BUY from all players
  const [buyPlayerId, setBuyPlayerId] = useState<number>(0);
  // Free transfers available (1 or 2)
  const [freeTransfers, setFreeTransfers] = useState<number>(1);
  const [transfersCount, setTransfersCount] = useState<number>(1);
  const [searchBuy, setSearchBuy] = useState("");

  useEffect(() => {
    async function loadBootstrap() {
      try {
        const res = await fetch("/api/fpl/bootstrap");
        const data = await res.json();
        if (data.success) {
          setAllPlayers(data.players || []);
        }
      } catch (e) {
        console.error("Failed to load bootstrap players:", e);
      } finally {
        setLoadingPool(false);
      }
    }
    loadBootstrap();
  }, []);

  const sellPlayer = squad.find((p) => p.id === sellPlayerId) || squad[0];
  const buyPlayer = allPlayers.find((p) => p.id === buyPlayerId);

  // Calculate finances
  const currentBank = manager?.last_deadline_bank || 10; // in tenths (£1.0m)
  const sellValue = sellPlayer ? sellPlayer.now_cost : 0;
  const buyCost = buyPlayer ? buyPlayer.now_cost : 0;
  const newBankTenths = currentBank + sellValue - buyCost;
  const isAffordable = newBankTenths >= 0;

  // Hit calculation
  const pointHit = Math.max(0, (transfersCount - freeTransfers) * 4);

  // 3-GW Expected Points Delta Projection
  const sellExpectedPts = sellPlayer ? parseFloat(sellPlayer.form || "3.0") * 3 : 12;
  const buyExpectedPts = buyPlayer ? parseFloat(buyPlayer.form || "5.0") * 3 : 15;
  const netPtsGain = buyPlayer ? Math.round((buyExpectedPts - sellExpectedPts - pointHit) * 10) / 10 : 0;

  // RMT Score (Rate My Team 0-100)
  const baseRmt = 78;
  const rmtDelta = buyPlayer
    ? Math.round((parseFloat(buyPlayer.form) - parseFloat(sellPlayer?.form || "3.0")) * 2.5) - (pointHit > 0 ? 3 : 0)
    : 0;
  const finalRmt = Math.min(99, Math.max(45, baseRmt + rmtDelta));

  // Filter buyable players matching sell position
  const filteredBuyPool = allPlayers
    .filter((p) => {
      const matchPos = sellPlayer ? p.element_type === sellPlayer.element_type : true;
      const notInSquad = !squad.some((sp) => sp.id === p.id);
      const matchSearch =
        p.web_name.toLowerCase().includes(searchBuy.toLowerCase()) ||
        p.team_short?.toLowerCase().includes(searchBuy.toLowerCase());
      return matchPos && notInSquad && matchSearch;
    })
    .sort((a, b) => parseFloat(b.form || "0") - parseFloat(a.form || "0"))
    .slice(0, 15);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                "What-If" Transfer Simulator &amp; RMT Optimizer
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Test transfers in a risk-free sandbox with live budget and 3-GW point projections
              </p>
            </div>
          </div>
        </div>

        {/* Free Transfers Selector */}
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs">
          <span className="text-[var(--text-muted)]">Free Transfers:</span>
          <button
            onClick={() => setFreeTransfers(1)}
            className={`px-2 py-0.5 rounded font-mono font-bold ${
              freeTransfers === 1 ? "bg-[#00ff87] text-black" : "text-gray-300"
            }`}
          >
            1 FT
          </button>
          <button
            onClick={() => setFreeTransfers(2)}
            className={`px-2 py-0.5 rounded font-mono font-bold ${
              freeTransfers === 2 ? "bg-[#00ff87] text-black" : "text-gray-300"
            }`}
          >
            2 FT
          </button>
        </div>
      </div>

      {/* Transfer Sandbox Bench */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sell Picker */}
        <div className="bg-[var(--bg-elevated)] border border-rose-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              1. Select Player to Sell (OUT)
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">From Your Active 15</span>
          </div>

          <select
            value={sellPlayerId}
            onChange={(e) => {
              setSellPlayerId(Number(e.target.value));
              setBuyPlayerId(0); // reset buy
            }}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] focus:border-rose-400 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
          >
            {squad.map((p) => (
              <option key={p.id} value={p.id}>
                {p.web_name} ({p.team_short}) — £{(p.now_cost / 10).toFixed(1)}m | Form: {p.form} | {p.total_points}pts
              </option>
            ))}
          </select>

          {sellPlayer && (
            <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{sellPlayer.web_name}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {sellPlayer.team_short} · {["GK", "DEF", "MID", "FWD"][sellPlayer.element_type - 1]}
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-rose-400">Sell: £{(sellPlayer.now_cost / 10).toFixed(1)}m</div>
                <div className="text-[10px] text-[var(--text-muted)]">Form {sellPlayer.form}</div>
              </div>
            </div>
          )}
        </div>

        {/* Buy Picker */}
        <div className="bg-[var(--bg-elevated)] border border-[#00ff87]/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#00ff87] uppercase tracking-wider">
              2. Select Target to Buy (IN)
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Filtered to same position</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchBuy}
              onChange={(e) => setSearchBuy(e.target.value)}
              placeholder="Search replacement..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] focus:border-[#00ff87] rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <select
            value={buyPlayerId}
            onChange={(e) => setBuyPlayerId(Number(e.target.value))}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] focus:border-[#00ff87] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value={0}>-- Select a Transfer Target --</option>
            {filteredBuyPool.map((p) => (
              <option key={p.id} value={p.id}>
                {p.web_name} ({p.team_short}) — £{(p.now_cost / 10).toFixed(1)}m | Form: {p.form} | {p.total_points}pts
              </option>
            ))}
          </select>

          {buyPlayer && (
            <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{buyPlayer.web_name}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {buyPlayer.team_short} · {["GK", "DEF", "MID", "FWD"][buyPlayer.element_type - 1]}
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-[#00ff87]">Buy: £{(buyPlayer.now_cost / 10).toFixed(1)}m</div>
                <div className="text-[10px] text-[var(--text-muted)]">Form {buyPlayer.form}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financials & Impact Assessment Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Remaining Bank</div>
          <div
            className={`text-base font-bold font-mono mt-1 ${
              isAffordable ? "text-emerald-300" : "text-rose-400"
            }`}
          >
            £{(newBankTenths / 10).toFixed(1)}m
          </div>
          <div className="text-[9px] text-[var(--text-muted)]">
            {isAffordable ? "✅ Transfer budget valid" : "❌ Insufficient funds"}
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Transfer Points Cost</div>
          <div className={`text-base font-bold font-mono mt-1 ${pointHit > 0 ? "text-amber-400" : "text-[#00ff87]"}`}>
            {pointHit > 0 ? `-${pointHit} pts` : "0 pts (Free)"}
          </div>
          <div className="text-[9px] text-[var(--text-muted)]">
            {pointHit > 0 ? "1 Transfer hit taken" : "Covered by Free Transfer"}
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">3-GW Point Delta</div>
          <div
            className={`text-base font-bold font-mono mt-1 ${
              netPtsGain >= 0 ? "text-[#00ff87]" : "text-rose-400"
            }`}
          >
            {buyPlayer ? (netPtsGain >= 0 ? `+${netPtsGain} pts` : `${netPtsGain} pts`) : "—"}
          </div>
          <div className="text-[9px] text-[var(--text-muted)]">Net expected returns</div>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">RMT Squad Rating</div>
          <div className="text-base font-bold font-mono text-purple-300 mt-1">{finalRmt}/100</div>
          <div className="text-[9px] text-[var(--text-muted)]">
            {finalRmt >= 80 ? "⭐ Elite squad balance" : "Solid competitive structure"}
          </div>
        </div>
      </div>

      {/* AI Transfer Verdict Card */}
      {buyPlayer && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            isAffordable && netPtsGain >= 0
              ? "bg-emerald-500/10 border-emerald-500/25"
              : "bg-rose-500/10 border-rose-500/25"
          }`}
        >
          {isAffordable && netPtsGain >= 0 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}

          <div className="text-xs space-y-1">
            <div className="font-bold text-white">
              Tactical Evaluation: {sellPlayer?.web_name} ➔ {buyPlayer.web_name}
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {!isAffordable
                ? `This transfer is currently unaffordable by £${Math.abs(newBankTenths / 10).toFixed(1)}m. Consider downgrading a bench asset first to release funds.`
                : netPtsGain > 0
                ? `Statistically positive (+EV) move. Replacing ${sellPlayer?.web_name} (Form ${sellPlayer?.form}) with ${buyPlayer.web_name} (Form ${buyPlayer.form}) projects a net gain of +${netPtsGain} pts over the next 3 fixtures even after factoring in points deductions.`
                : `Marginal move. The projected difference (+${netPtsGain} pts) may not justify taking an immediate transfer without waiting for press conference updates.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
