"use client";

import React, { useState, useEffect } from "react";
import Pitch from "@/components/Pitch";
import RivalSpy from "@/components/RivalSpy";
import HorizonPlanner from "@/components/HorizonPlanner";
import PriceWatch from "@/components/PriceWatch";
import PepRoulette from "@/components/PepRoulette";
import CopilotChat from "@/components/CopilotChat";
import { EnrichedPlayer, PricePrediction, RotationRisk, TransferPlan } from "@/lib/types";
import {
  Trophy,
  Wallet,
  Shield,
  Activity,
  Calendar,
  TrendingUp,
  Bot,
  RefreshCw,
  Search,
  Sparkles,
  Award,
} from "lucide-react";

export default function Home() {
  const [managerId, setManagerId] = useState("542192");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pitch" | "rivals" | "horizon" | "market">("pitch");

  const [manager, setManager] = useState<any>(null);
  const [squad, setSquad] = useState<EnrichedPlayer[]>([]);
  const [horizonPlans, setHorizonPlans] = useState<TransferPlan[]>([]);
  const [pricePredictions, setPricePredictions] = useState<PricePrediction[]>([]);
  const [rotationRisks, setRotationRisks] = useState<RotationRisk[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<EnrichedPlayer | null>(null);

  const fetchData = async (idToFetch: string) => {
    setLoading(true);
    try {
      // 1. Fetch Manager & Squad
      const managerRes = await fetch(`/api/fpl/manager?id=${idToFetch}`);
      const managerData = await managerRes.json();
      if (managerData.success) {
        setManager(managerData.manager);
        setSquad(managerData.squad);
        setHorizonPlans(managerData.horizonPlans);
        if (managerData.squad.length > 0) {
          setSelectedPlayer(managerData.squad[0]);
        }
      }

      // 2. Fetch Bootstrap data (Prices & Pep Roulette)
      const bootRes = await fetch("/api/fpl/bootstrap");
      const bootData = await bootRes.json();
      if (bootData.success) {
        setPricePredictions(bootData.pricePredictions);
        setRotationRisks(bootData.rotationRisks);
      }
    } catch (e) {
      console.error("Error fetching FPL data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(managerId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(managerId);
  };

  return (
    <div className="min-h-screen bg-[#0e0013] text-gray-100 flex flex-col font-sans selection:bg-fpl-green selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#14001a]/90 backdrop-blur-md border-b border-[#330b3d] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fpl-purple to-[#5a0063] border border-fpl-green flex items-center justify-center shadow-[0_0_15px_rgba(0,255,135,0.3)]">
              <Sparkles className="w-5 h-5 text-fpl-green" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                AGENTIC <span className="text-fpl-green font-mono">FPL</span>
                <span className="text-[10px] bg-fpl-purple text-fpl-cyan font-bold px-1.5 py-0.5 rounded border border-[#441151]">
                  AI PLATFORM
                </span>
              </h1>
              <p className="text-[11px] text-gray-400">Game-Theory & Multi-Agent Tactical Optimizer</p>
            </div>
          </div>

          {/* Search Manager ID or Squad Name */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                placeholder="Team ID or Squad Name..."
                className="w-full bg-[#1e0329] border border-[#330b3d] rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-fpl-green font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-fpl-purple hover:bg-[#49024f] text-fpl-green border border-fpl-green/40 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Sync
            </button>
          </form>
        </div>
      </header>

      {/* Manager Summary Stats Bar */}
      {manager && (
        <div className="bg-[#180121] border-b border-[#290333] px-4 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-gray-200">{manager.name}</span>
              <span className="text-gray-400 font-mono text-[11px]">({manager.player_first_name} {manager.player_last_name})</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 font-mono">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-gray-400">Points:</span>
                <span className="font-bold text-fpl-green">{manager.summary_overall_points}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-gray-400">Rank:</span>
                <span className="font-bold text-white">#{manager.summary_overall_rank?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-gray-400">In Bank:</span>
                <span className="font-bold text-white">£{(manager.last_deadline_bank / 10).toFixed(1)}m</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Team Value:</span>
                <span className="font-bold text-fpl-cyan">£{(manager.last_deadline_value / 10).toFixed(1)}m</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-4">
        <div className="flex gap-2 border-b border-[#290333] pb-2 overflow-x-auto">
          {[
            { id: "pitch", label: "Pitch & Squad", icon: Shield },
            { id: "rivals", label: "Rival Spy (Mini-League)", icon: Trophy },
            { id: "horizon", label: "5-GW Horizon Planner", icon: Calendar },
            { id: "market", label: "Price Watch & Pep Roulette", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-fpl-green text-black shadow-md shadow-fpl-green/20"
                    : "bg-[#180121] hover:bg-[#250233] text-gray-300 hover:text-white border border-[#330b3d]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-fpl-green" />
            <p className="text-xs text-gray-400">Compiling FPL Intelligence & Relational Caches...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7/12: Main Tab Panel */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {activeTab === "pitch" && (
                <div className="space-y-4">
                  <Pitch
                    squad={squad}
                    selectedPlayerId={selectedPlayer?.id}
                    onSelectPlayer={(p) => setSelectedPlayer(p)}
                  />

                  {/* Selected Player Inspector */}
                  {selectedPlayer && (
                    <div className="bg-[#170220] border border-[#330b3d] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{selectedPlayer.first_name} {selectedPlayer.second_name}</span>
                          <span className="text-[10px] bg-fpl-purple border border-fpl-border px-1.5 py-0.2 rounded font-mono text-fpl-green">
                            {selectedPlayer.team_short}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Form: <strong className="text-white">{selectedPlayer.form}</strong> · Ownership: <strong className="text-white">{selectedPlayer.selected_by_percent}%</strong> · ICT: <strong className="text-white">{selectedPlayer.ict_index}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        <div className="text-right">
                          <div className="text-gray-400 text-[10px]">Cost</div>
                          <div className="font-bold text-white">£{(selectedPlayer.now_cost / 10).toFixed(1)}m</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400 text-[10px]">Total Pts</div>
                          <div className="font-bold text-fpl-green">{selectedPlayer.total_points}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "rivals" && <RivalSpy />}
              {activeTab === "horizon" && <HorizonPlanner plans={horizonPlans} />}
              {activeTab === "market" && (
                <div className="space-y-6">
                  <PriceWatch predictions={pricePredictions} />
                  <PepRoulette risks={rotationRisks} />
                </div>
              )}
            </div>

            {/* Right 5/12: AI Copilot Assistant */}
            <div className="lg:col-span-5 sticky top-20">
              <CopilotChat squad={squad} manager={manager} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#290333] bg-[#0c0010] py-4 px-4 text-center text-xs text-gray-500">
        Agentic FPL Intelligence Platform · Built with Next.js 15, PostgreSQL & Google Gemini
      </footer>
    </div>
  );
}
