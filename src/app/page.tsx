"use client";

import React, { useState, useEffect } from "react";
import Pitch from "@/components/Pitch";
import RivalSpy from "@/components/RivalSpy";
import HorizonPlanner from "@/components/HorizonPlanner";
import PriceWatch from "@/components/PriceWatch";
import PepRoulette from "@/components/PepRoulette";
import CopilotChat from "@/components/CopilotChat";
import LiveMatchdayRadar from "@/components/LiveMatchdayRadar";
import TransferSimulator from "@/components/TransferSimulator";
import FixtureTicker from "@/components/FixtureTicker";
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
  ChevronRight,
  Hash,
  Users,
  User,
  Calculator,
  BarChart3,
  Zap,
} from "lucide-react";

// ─── Skeleton Components ─────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ""}`} />;
}

function SkeletonStatsBar() {
  return (
    <div
      className="border-b px-4 lg:px-8 py-3"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-9 h-9 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <SkeletonBlock className="w-28 h-3" />
            <SkeletonBlock className="w-20 h-2.5" />
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          {[72, 56, 80, 64].map((w, i) => (
            <SkeletonBlock key={i} className={`w-${w === 72 ? 20 : w === 56 ? 16 : w === 80 ? 24 : 18} h-7 rounded-full`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonMainContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Pitch skeleton */}
        <div className="card p-4 space-y-3">
          <SkeletonBlock className="w-32 h-4 mb-4" />
          <div className="flex justify-center">
            <SkeletonBlock className="w-full h-64 rounded-xl" />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
        {/* Player inspector skeleton */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="w-36 h-3.5" />
              <SkeletonBlock className="w-48 h-2.5" />
            </div>
            <div className="flex gap-4">
              <SkeletonBlock className="w-12 h-8" />
              <SkeletonBlock className="w-12 h-8" />
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className="card p-4 space-y-3">
          <SkeletonBlock className="w-28 h-4 mb-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className={`h-3 w-${i % 2 === 0 ? "full" : "4/5"}`} />
          ))}
          <SkeletonBlock className="h-10 rounded-lg mt-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Welcome Empty State ──────────────────────────────────────────────────────

function WelcomeCard({ onExampleLoad }: { onExampleLoad: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7">
        <div
          className="card p-8 flex flex-col items-center text-center gap-6"
          style={{ background: "var(--bg-surface)" }}
        >
          {/* Icon cluster */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center glow-green"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,255,135,0.12), rgba(0,212,255,0.08))",
                border: "1px solid rgba(0,255,135,0.2)",
              }}
            >
              <Sparkles className="w-9 h-9" style={{ color: "var(--green)" }} />
            </div>
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
              }}
            >
              <Zap className="w-4 h-4" style={{ color: "var(--amber)" }} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-heading" style={{ color: "var(--text-primary)" }}>
              Welcome to{" "}
              <span className="text-gradient-green">Agentic FPL</span>
            </h2>
            <p className="text-body max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
              Your AI-powered squad intelligence platform. Enter your FPL Team ID above to unlock
              personalised analysis, transfer recommendations and rival intelligence.
            </p>
          </div>

          {/* How-to steps */}
          <div
            className="w-full rounded-xl p-4 text-left space-y-3"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p className="text-label" style={{ color: "var(--text-muted)" }}>
              How to find your Team ID
            </p>
            {[
              {
                step: "1",
                text: (
                  <>
                    Visit{" "}
                    <span className="font-mono-num" style={{ color: "var(--cyan)" }}>
                      fantasy.premierleague.com
                    </span>{" "}
                    and sign in
                  </>
                ),
              },
              {
                step: "2",
                text: 'Click on "My Team" or "Points" in the navigation',
              },
              {
                step: "3",
                text: (
                  <>
                    Check the URL — it will contain{" "}
                    <span
                      className="font-mono-num px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(0,255,135,0.08)",
                        color: "var(--green)",
                        border: "1px solid rgba(0,255,135,0.15)",
                        fontSize: "0.75rem",
                      }}
                    >
                      /entry/123456/
                    </span>
                  </>
                ),
              },
              {
                step: "4",
                text: "Copy the number and paste it into the Team ID field above",
              },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-mono-num"
                  style={{
                    background: "rgba(0,255,135,0.1)",
                    border: "1px solid rgba(0,255,135,0.2)",
                    color: "var(--green)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                  }}
                >
                  {step}
                </div>
                <p className="text-caption" style={{ color: "var(--text-secondary)" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onExampleLoad}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "rgba(0,255,135,0.08)",
              border: "1px solid rgba(0,255,135,0.2)",
              color: "var(--green)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(0,255,135,0.14)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(0,255,135,0.08)";
            }}
          >
            <Activity className="w-4 h-4" />
            Load example manager
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: feature highlights */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {[
          {
            icon: Shield,
            color: "var(--green)",
            bg: "rgba(0,255,135,0.08)",
            border: "rgba(0,255,135,0.15)",
            title: "Pitch & Squad Analysis",
            desc: "Visual squad layout with per-player stats, form, and injury status.",
          },
          {
            icon: Users,
            color: "var(--cyan)",
            bg: "rgba(0,212,255,0.08)",
            border: "rgba(0,212,255,0.15)",
            title: "Rival Spy",
            desc: "Track mini-league rivals, captain picks, and differentials at a glance.",
          },
          {
            icon: Calendar,
            color: "var(--amber)",
            bg: "rgba(251,191,36,0.08)",
            border: "rgba(251,191,36,0.15)",
            title: "5-GW Horizon Planner",
            desc: "AI-generated transfer plans optimised over the next 5 gameweeks.",
          },
          {
            icon: TrendingUp,
            color: "#a78bfa",
            bg: "rgba(167,139,250,0.08)",
            border: "rgba(167,139,250,0.15)",
            title: "Price Watch & Pep Roulette",
            desc: "Predicted price rises and rotation risk index for key assets.",
          },
          {
            icon: Bot,
            color: "var(--cyan)",
            bg: "rgba(0,212,255,0.08)",
            border: "rgba(0,212,255,0.15)",
            title: "AI Copilot",
            desc: "Conversational Gemini-powered assistant that knows your squad inside-out.",
          },
        ].map(({ icon: Icon, color, bg, border, title, desc }) => (
          <div
            key={title}
            className="card p-4 flex items-start gap-3"
            style={{ background: "var(--bg-surface)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-subheading" style={{ color: "var(--text-primary)" }}>
                {title}
              </p>
              <p className="text-caption mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Manager Stats Bar ────────────────────────────────────────────────────────

function ManagerStatsBar({ manager }: { manager: any }) {
  const initials = [manager.player_first_name?.[0], manager.player_last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <div
      className="border-b px-4 lg:px-8 py-2.5"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        {/* Identity */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-mono-num text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,135,0.2), rgba(0,212,255,0.1))",
              border: "1px solid rgba(0,255,135,0.25)",
              color: "var(--green)",
            }}
          >
            {initials || "?"}
          </div>
          <div>
            <p
              className="text-subheading leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {manager.name}
            </p>
            <p className="text-caption" style={{ color: "var(--text-muted)" }}>
              {manager.player_first_name} {manager.player_last_name}
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="stat-pill">
            <Trophy className="w-3.5 h-3.5" style={{ color: "var(--amber)" }} />
            <span className="text-label">Points</span>
            <span
              className="font-mono-num font-semibold text-xs"
              style={{ color: "var(--green)" }}
            >
              {manager.summary_overall_points}
            </span>
          </div>

          <div className="stat-pill">
            <BarChart3 className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
            <span className="text-label">Rank</span>
            <span
              className="font-mono-num font-semibold text-xs"
              style={{ color: "var(--text-primary)" }}
            >
              #{manager.summary_overall_rank?.toLocaleString()}
            </span>
          </div>

          <div className="stat-pill">
            <Wallet className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
            <span className="text-label">Bank</span>
            <span
              className="font-mono-num font-semibold text-xs"
              style={{ color: "var(--text-primary)" }}
            >
              £{(manager.last_deadline_bank / 10).toFixed(1)}m
            </span>
          </div>

          <div className="stat-pill">
            <Hash className="w-3.5 h-3.5" style={{ color: "var(--cyan)" }} />
            <span className="text-label">Value</span>
            <span
              className="font-mono-num font-semibold text-xs"
              style={{ color: "var(--cyan)" }}
            >
              £{(manager.last_deadline_value / 10).toFixed(1)}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "pitch", label: "Pitch & Squad", icon: Shield },
  { id: "rivals", label: "Rival Spy", icon: Trophy },
  { id: "matchday", label: "Live Matchday", icon: Activity },
  { id: "simulator", label: "Transfer Sandbox & RMT", icon: Calculator },
  { id: "fixtures", label: "Fixture Heatmap", icon: Calendar },
  { id: "horizon", label: "Horizon Planner", icon: TrendingUp },
  { id: "market", label: "Price Watch & Pep Roulette", icon: Zap },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div
      className="border-b"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--bg-base)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  borderBottom: "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <span
                    className="tab-active-indicator"
                    style={{ background: "var(--green)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Player Inspector Card ────────────────────────────────────────────────────

function PlayerInspector({ player }: { player: EnrichedPlayer }) {
  return (
    <div
      className="card p-4"
      style={{ background: "var(--bg-surface)" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-subheading" style={{ color: "var(--text-primary)" }}>
              {player.first_name} {player.second_name}
            </h3>
            <span className="badge-green font-mono-num">{player.team_short}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-caption">
              Form{" "}
              <strong
                className="font-mono-num font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {player.form}
              </strong>
            </span>
            <span style={{ color: "var(--border-default)" }}>·</span>
            <span className="text-caption">
              Ownership{" "}
              <strong
                className="font-mono-num font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {player.selected_by_percent}%
              </strong>
            </span>
            <span style={{ color: "var(--border-default)" }}>·</span>
            <span className="text-caption">
              ICT{" "}
              <strong
                className="font-mono-num font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {player.ict_index}
              </strong>
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-3 rounded-lg px-3 py-2"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="text-right">
            <p className="text-label">Cost</p>
            <p
              className="font-mono-num font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              £{(player.now_cost / 10).toFixed(1)}m
            </p>
          </div>
          <div
            className="w-px h-8"
            style={{ background: "var(--border-subtle)" }}
          />
          <div className="text-right">
            <p className="text-label">Total Pts</p>
            <p
              className="font-mono-num font-bold text-sm"
              style={{ color: "var(--green)" }}
            >
              {player.total_points}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [managerId, setManagerId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("pitch");

  const [manager, setManager] = useState<any>(null);
  const [squad, setSquad] = useState<EnrichedPlayer[]>([]);
  const [horizonPlans, setHorizonPlans] = useState<TransferPlan[]>([]);
  const [pricePredictions, setPricePredictions] = useState<PricePrediction[]>([]);
  const [rotationRisks, setRotationRisks] = useState<RotationRisk[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<EnrichedPlayer | null>(null);

  const fetchData = async (idToFetch: string) => {
    if (!idToFetch.trim()) return;
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = inputValue.trim();
    if (!id) return;
    setManagerId(id);
    fetchData(id);
  };

  const handleExampleLoad = () => {
    const exampleId = "542192";
    setInputValue(exampleId);
    setManagerId(exampleId);
    fetchData(exampleId);
  };

  const hasManager = !!manager && !loading;
  const isInitial = !managerId && !loading;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 glass border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center glow-green-sm shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(55,0,60,0.9), rgba(90,0,100,0.8))",
                border: "1px solid rgba(0,255,135,0.35)",
              }}
            >
              <Sparkles className="w-4.5 h-4.5" style={{ color: "var(--green)" }} />
            </div>
            <div>
              <h1
                className="text-sm font-bold tracking-tight leading-none"
                style={{ color: "var(--text-primary)" }}
              >
                AGENTIC{" "}
                <span className="font-mono-num" style={{ color: "var(--green)" }}>
                  FPL
                </span>
                <span
                  className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded align-middle"
                  style={{
                    background: "rgba(55,0,60,0.8)",
                    border: "1px solid rgba(68,17,81,0.8)",
                    color: "var(--cyan)",
                  }}
                >
                  AI PLATFORM
                </span>
              </h1>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                Game-Theory & Multi-Agent Tactical Optimizer
              </p>
            </div>
          </div>

          {/* Team ID Search */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <div className="relative flex-1 sm:w-64">
              <Search
                className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter Team ID…"
                className="input-base pl-8 pr-3"
                style={{ paddingLeft: "2rem" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
              style={{
                background: loading
                  ? "rgba(0,255,135,0.06)"
                  : "rgba(0,255,135,0.1)",
                border: "1px solid rgba(0,255,135,0.25)",
                color: "var(--green)",
              }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Loading…" : "Load"}
            </button>
            <a
              href="/auth"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-elevated)] shrink-0"
              title="Sign in / Sign up"
            >
              <User className="w-3.5 h-3.5 text-[#00ff87]" />
              <span className="hidden sm:inline">Sign In</span>
            </a>
          </form>
        </div>
      </header>

      {/* ── Manager Stats Bar ───────────────────────────────────────────── */}
      {loading && !manager && <SkeletonStatsBar />}
      {hasManager && <ManagerStatsBar manager={manager} />}

      {/* ── Tab Navigation ──────────────────────────────────────────────── */}
      {hasManager && (
        <TabBar active={activeTab} onChange={setActiveTab} />
      )}

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1">
        {/* Loading skeleton */}
        {loading && <SkeletonMainContent />}

        {/* Empty / welcome state */}
        {isInitial && (
          <WelcomeCard onExampleLoad={handleExampleLoad} />
        )}

        {/* No manager loaded yet but ID was set (loading finished, no data) */}
        {!loading && managerId && !manager && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              <Award className="w-6 h-6" style={{ color: "var(--amber)" }} />
            </div>
            <p className="text-subheading" style={{ color: "var(--text-primary)" }}>
              Manager not found
            </p>
            <p className="text-caption text-center max-w-xs" style={{ color: "var(--text-secondary)" }}>
              We couldn't find a manager with Team ID{" "}
              <span className="font-mono-num" style={{ color: "var(--cyan)" }}>
                {managerId}
              </span>
              . Please double-check and try again.
            </p>
          </div>
        )}

        {/* Main dashboard grid */}
        {hasManager && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7/12: Main Tab Panel */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {activeTab === "pitch" && (
                <>
                  <Pitch
                    squad={squad}
                    selectedPlayerId={selectedPlayer?.id}
                    onSelectPlayer={(p) => setSelectedPlayer(p)}
                  />
                  {selectedPlayer && (
                    <PlayerInspector player={selectedPlayer} />
                  )}
                </>
              )}

              {activeTab === "rivals" && <RivalSpy manager={manager} />}
              {activeTab === "matchday" && <LiveMatchdayRadar squad={squad} manager={manager} />}
              {activeTab === "simulator" && <TransferSimulator squad={squad} manager={manager} />}
              {activeTab === "fixtures" && <FixtureTicker />}
              {activeTab === "horizon" && <HorizonPlanner plans={horizonPlans} />}
              {activeTab === "market" && (
                <div className="space-y-5">
                  <PriceWatch predictions={pricePredictions} />
                  <PepRoulette risks={rotationRisks} />
                </div>
              )}
            </div>

            {/* Right 5/12: AI Copilot */}
            <div className="lg:col-span-5 sticky top-20">
              <CopilotChat squad={squad} manager={manager} />
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-4 px-4 text-center"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        <p className="text-caption" style={{ color: "var(--text-muted)" }}>
          Agentic FPL Intelligence Platform &nbsp;·&nbsp; Built with Next.js 15, Supabase & Google Gemini
        </p>
      </footer>
    </div>
  );
}
