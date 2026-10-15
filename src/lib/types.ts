export interface FPLPlayer {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  team_short?: string;
  element_type: number; // 1: GKP, 2: DEF, 3: MID, 4: FWD
  now_cost: number;     // In tenths (e.g. 152 = £15.2M)
  total_points: number;
  form: string;
  selected_by_percent: string;
  status: string;       // 'a': available, 'd': doubtful, 'i': injured, 's': suspended
  news: string;
  chance_of_playing_next_round: number | null;
  ict_index: string;
  ep_next?: string;     // Expected points next GW
  transfers_in_event: number;
  transfers_out_event: number;
  upcoming_fixtures?: {
    opponent_short: string;
    is_home: boolean;
    difficulty: number;
  }[];
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface FPLPick {
  element: number;
  position: number;     // 1 to 15
  is_captain: boolean;
  is_vice_captain: boolean;
  multiplier: number;
}

export interface FPLManagerSummary {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  last_deadline_bank: number;
  last_deadline_value: number;
  current_event: number;
}

export interface EnrichedPlayer extends FPLPlayer {
  is_captain?: boolean;
  is_vice_captain?: boolean;
  is_starting?: boolean;
  position_index?: number;
}

export interface RivalManager {
  id: number;
  manager_name: string;
  team_name: string;
  rank: number;
  total_points: number;
  captain_name: string;
  picks: number[]; // Player IDs
}

export interface PricePrediction {
  player: FPLPlayer;
  direction: "rise" | "fall";
  velocity_percent: number;
  threshold_reached: boolean;
  projected_change: string;
}

export interface RotationRisk {
  player: FPLPlayer;
  risk_level: "Low" | "Moderate" | "High";
  risk_percentage: number;
  factors: string[];
}

export interface TransferPlan {
  gameweek: number;
  transfers: {
    sell: FPLPlayer;
    buy: FPLPlayer;
    reason: string;
  }[];
  chip_suggested?: "Wildcard" | "Free Hit" | "Bench Boost" | "Triple Captain" | null;
  projected_points: number;
}
