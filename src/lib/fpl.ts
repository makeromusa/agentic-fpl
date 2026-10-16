import { FPLPlayer, FPLTeam, EnrichedPlayer, PricePrediction, RotationRisk, TransferPlan } from "./types";

// In-memory cache for live FPL bootstrap
let cachedBootstrap: {
  players: FPLPlayer[];
  teams: FPLTeam[];
  currentEvent: number;
  lastFetched: number;
} | null = null;

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export async function getFPLBootstrapData() {
  const now = Date.now();
  if (cachedBootstrap && now - cachedBootstrap.lastFetched < CACHE_TTL_MS) {
    return cachedBootstrap;
  }

  try {
    const res = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      throw new Error(`FPL API status: ${res.status}`);
    }

    const data = await res.json();
    const currentEvent = data.events.find((e: any) => e.is_current)?.id || 
                         data.events.find((e: any) => e.is_next)?.id || 10;

    const teamMap = new Map<number, FPLTeam>();
    data.teams.forEach((t: any) => teamMap.set(t.id, t));

    const players: FPLPlayer[] = data.elements.map((el: any) => {
      const team = teamMap.get(el.team);
      return {
        id: el.id,
        web_name: el.web_name,
        first_name: el.first_name,
        second_name: el.second_name,
        team: el.team,
        team_short: team?.short_name || "PL",
        element_type: el.element_type,
        now_cost: el.now_cost,
        total_points: el.total_points,
        form: el.form,
        selected_by_percent: el.selected_by_percent,
        status: el.status,
        news: el.news || "",
        chance_of_playing_next_round: el.chance_of_playing_next_round,
        ict_index: el.ict_index,
        ep_next: el.ep_next || "0.0",
        transfers_in_event: el.transfers_in_event,
        transfers_out_event: el.transfers_out_event,
      };
    });

    cachedBootstrap = {
      players,
      teams: data.teams,
      currentEvent,
      lastFetched: now,
    };

    return cachedBootstrap;
  } catch (err) {
    console.warn("Failed fetching live FPL bootstrap, using fallback mock data:", err);
    return getFallbackBootstrapData();
  }
}

// Fallback high-fidelity sample data if FPL API is under maintenance or rate-limited
export function getFallbackBootstrapData() {
  const teams: FPLTeam[] = [
    { id: 1, name: "Arsenal", short_name: "ARS", strength: 5, strength_overall_home: 1350, strength_overall_away: 1360, strength_attack_home: 1350, strength_attack_away: 1360, strength_defence_home: 1350, strength_defence_away: 1360 },
    { id: 2, name: "Aston Villa", short_name: "AVL", strength: 4, strength_overall_home: 1220, strength_overall_away: 1230, strength_attack_home: 1220, strength_attack_away: 1230, strength_defence_home: 1220, strength_defence_away: 1230 },
    { id: 3, name: "Chelsea", short_name: "CHE", strength: 4, strength_overall_home: 1280, strength_overall_away: 1290, strength_attack_home: 1280, strength_attack_away: 1290, strength_defence_home: 1280, strength_defence_away: 1290 },
    { id: 4, name: "Liverpool", short_name: "LIV", strength: 5, strength_overall_home: 1370, strength_overall_away: 1380, strength_attack_home: 1370, strength_attack_away: 1380, strength_defence_home: 1370, strength_defence_away: 1380 },
    { id: 5, name: "Manchester City", short_name: "MCI", strength: 5, strength_overall_home: 1390, strength_overall_away: 1400, strength_attack_home: 1390, strength_attack_away: 1400, strength_defence_home: 1390, strength_defence_away: 1400 },
    { id: 6, name: "Newcastle", short_name: "NEW", strength: 4, strength_overall_home: 1240, strength_overall_away: 1250, strength_attack_home: 1240, strength_attack_away: 1250, strength_defence_home: 1240, strength_defence_away: 1250 },
    { id: 7, name: "Tottenham", short_name: "TOT", strength: 4, strength_overall_home: 1250, strength_overall_away: 1260, strength_attack_home: 1250, strength_attack_away: 1260, strength_defence_home: 1250, strength_defence_away: 1260 },
  ];

  const players: FPLPlayer[] = [
    { id: 101, web_name: "Raya", first_name: "David", second_name: "Raya", team: 1, team_short: "ARS", element_type: 1, now_cost: 56, total_points: 58, form: "5.2", selected_by_percent: "32.4", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "24.5", ep_next: "4.8", transfers_in_event: 42100, transfers_out_event: 3200 },
    { id: 102, web_name: "Fabianski", first_name: "Lukasz", second_name: "Fabianski", team: 3, team_short: "WHU", element_type: 1, now_cost: 40, total_points: 12, form: "2.1", selected_by_percent: "18.2", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "10.0", ep_next: "2.0", transfers_in_event: 9800, transfers_out_event: 1100 },
    { id: 201, web_name: "Gabriel", first_name: "Gabriel", second_name: "Magalhães", team: 1, team_short: "ARS", element_type: 2, now_cost: 62, total_points: 52, form: "6.0", selected_by_percent: "28.5", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "45.2", ep_next: "5.5", transfers_in_event: 65000, transfers_out_event: 4000 },
    { id: 202, web_name: "Alexander-Arnold", first_name: "Trent", second_name: "Alexander-Arnold", team: 4, team_short: "LIV", element_type: 2, now_cost: 71, total_points: 49, form: "4.8", selected_by_percent: "31.0", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "68.4", ep_next: "4.5", transfers_in_event: 21000, transfers_out_event: 19000 },
    { id: 203, web_name: "Gvardiol", first_name: "Josko", second_name: "Gvardiol", team: 5, team_short: "MCI", element_type: 2, now_cost: 61, total_points: 44, form: "5.5", selected_by_percent: "35.2", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "55.0", ep_next: "5.0", transfers_in_event: 48000, transfers_out_event: 5100 },
    { id: 204, web_name: "Robinson", first_name: "Antonee", second_name: "Robinson", team: 2, team_short: "FUL", element_type: 2, now_cost: 47, total_points: 38, form: "4.2", selected_by_percent: "19.8", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "39.1", ep_next: "3.8", transfers_in_event: 18000, transfers_out_event: 2300 },
    { id: 205, web_name: "Greaves", first_name: "Jacob", second_name: "Greaves", team: 2, team_short: "IPS", element_type: 2, now_cost: 40, total_points: 21, form: "1.8", selected_by_percent: "7.1", status: "d", news: "Hamstring injury - 75% chance", chance_of_playing_next_round: 75, ict_index: "18.2", ep_next: "1.5", transfers_in_event: 1200, transfers_out_event: 15400 },
    { id: 301, web_name: "Cherki", first_name: "Rayan", second_name: "Cherki", team: 5, team_short: "MCI", element_type: 3, now_cost: 79, total_points: 44, form: "9.0", selected_by_percent: "32.4", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "72.4", ep_next: "8.0", transfers_in_event: 85000, transfers_out_event: 4200 },
    { id: 302, web_name: "Palmer", first_name: "Cole", second_name: "Palmer", team: 3, team_short: "CHE", element_type: 3, now_cost: 97, total_points: 36, form: "5.0", selected_by_percent: "25.4", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "69.0", ep_next: "5.2", transfers_in_event: 28000, transfers_out_event: 9300 },
    { id: 303, web_name: "Saka", first_name: "Bukayo", second_name: "Saka", team: 1, team_short: "ARS", element_type: 3, now_cost: 96, total_points: 34, form: "2.0", selected_by_percent: "16.7", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "59.5", ep_next: "4.0", transfers_in_event: 12000, transfers_out_event: 13100 },
    { id: 304, web_name: "Semenyo", first_name: "Antoine", second_name: "Semenyo", team: 5, team_short: "MCI", element_type: 3, now_cost: 83, total_points: 36, form: "10.0", selected_by_percent: "13.8", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "78.2", ep_next: "7.5", transfers_in_event: 94000, transfers_out_event: 2100 },
    { id: 305, web_name: "Rogers", first_name: "Morgan", second_name: "Rogers", team: 3, team_short: "CHE", element_type: 3, now_cost: 79, total_points: 38, form: "5.5", selected_by_percent: "45.2", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "61.0", ep_next: "5.5", transfers_in_event: 44000, transfers_out_event: 8000 },
    { id: 401, web_name: "Haaland", first_name: "Erling", second_name: "Haaland", team: 5, team_short: "MCI", element_type: 4, now_cost: 156, total_points: 45, form: "6.0", selected_by_percent: "75.4", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "85.0", ep_next: "6.5", transfers_in_event: 31000, transfers_out_event: 18000 },
    { id: 402, web_name: "João Pedro", first_name: "João", second_name: "Pedro", team: 3, team_short: "CHE", element_type: 4, now_cost: 78, total_points: 45, form: "6.0", selected_by_percent: "70.0", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "72.4", ep_next: "6.2", transfers_in_event: 69000, transfers_out_event: 3000 },
    { id: 403, web_name: "Cunha", first_name: "Matheus", second_name: "Cunha", team: 2, team_short: "MUN", element_type: 4, now_cost: 79, total_points: 36, form: "10.0", selected_by_percent: "6.5", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "64.0", ep_next: "7.0", transfers_in_event: 51000, transfers_out_event: 1500 },
  ];

  return { players, teams, currentEvent: 10, lastFetched: Date.now() };
}

// Calculate Price Change Predictions based on transfer velocity
export function calculatePricePredictions(players: FPLPlayer[]): PricePrediction[] {
  return players
    .map((player) => {
      const netTransfers = player.transfers_in_event - player.transfers_out_event;
      const ownershipFraction = parseFloat(player.selected_by_percent) || 5.0;
      // Heuristic FPL price change threshold
      const velocity = Math.min(100, Math.round((Math.abs(netTransfers) / (ownershipFraction * 1200)) * 100));
      const direction: "rise" | "fall" = netTransfers >= 0 ? "rise" : "fall";

      return {
        player,
        direction,
        velocity_percent: velocity,
        threshold_reached: velocity >= 90,
        projected_change: direction === "rise" ? "+£0.1m" : "-£0.1m",
      };
    })
    .sort((a, b) => b.velocity_percent - a.velocity_percent)
    .slice(0, 10);
}

// Calculate Rotation Risk / "Pep Roulette"
export function calculateRotationRisks(players: FPLPlayer[]): RotationRisk[] {
  return players
    .filter((p) => ["MCI", "ARS", "LIV", "CHE"].includes(p.team_short || ""))
    .map((player) => {
      const factors: string[] = [];
      let riskScore = 15;

      if (player.chance_of_playing_next_round && player.chance_of_playing_next_round < 100) {
        riskScore += 45;
        factors.push(`Flagged: ${player.news}`);
      }

      if (["MCI"].includes(player.team_short || "")) {
        riskScore += 25;
        factors.push("Pep Roulette / tactical rotation");
      }

      if (parseFloat(player.form) < 4.0) {
        riskScore += 15;
        factors.push("Dip in recent match minutes & output");
      }

      const risk_level: "Low" | "Moderate" | "High" =
        riskScore > 60 ? "High" : riskScore > 35 ? "Moderate" : "Low";

      return {
        player,
        risk_level,
        risk_percentage: Math.min(95, riskScore),
        factors,
      };
    })
    .sort((a, b) => b.risk_percentage - a.risk_percentage)
    .slice(0, 8);
}

// Generate 5-Gameweek Horizon Strategy
export function calculateHorizonStrategy(currentGW: number, squad: EnrichedPlayer[]): TransferPlan[] {
  const plans: TransferPlan[] = [
    {
      gameweek: currentGW + 1,
      transfers: [
        {
          sell: squad.find((p) => p.element_type === 2 && p.web_name === "Greaves") || squad[14],
          buy: { id: 299, web_name: "Ait-Nouri", first_name: "Rayan", second_name: "Ait-Nouri", team: 6, team_short: "WOL", element_type: 2, now_cost: 47, total_points: 44, form: "5.8", selected_by_percent: "14.2", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "42.1", transfers_in_event: 28000, transfers_out_event: 2100 },
          reason: "Targeting 3 green fixtures; Greaves carries injury uncertainty.",
        },
      ],
      chip_suggested: null,
      projected_points: 64,
    },
    {
      gameweek: currentGW + 2,
      transfers: [],
      chip_suggested: null,
      projected_points: 61,
    },
    {
      gameweek: currentGW + 3,
      transfers: [
        {
          sell: squad.find((p) => p.web_name === "Delap") || squad[13],
          buy: { id: 499, web_name: "Cunha", first_name: "Matheus", second_name: "Cunha", team: 6, team_short: "WOL", element_type: 4, now_cost: 68, total_points: 58, form: "6.8", selected_by_percent: "18.5", status: "a", news: "", chance_of_playing_next_round: 100, ict_index: "74.0", transfers_in_event: 44000, transfers_out_event: 3200 },
          reason: "Roll free transfer in GW" + (currentGW + 2) + " to execute double midfield/forward upgrade.",
        },
      ],
      chip_suggested: null,
      projected_points: 70,
    },
    {
      gameweek: currentGW + 4,
      transfers: [],
      chip_suggested: "Triple Captain",
      projected_points: 92,
    },
  ];

  return plans;
}
