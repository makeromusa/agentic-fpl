import { NextRequest, NextResponse } from "next/server";
import { getFPLBootstrapData } from "@/lib/fpl";
import { EnrichedPlayer, FPLPick } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rivalId = searchParams.get("id");
  const userId = searchParams.get("user_id");

  if (!rivalId) {
    return NextResponse.json({ success: false, error: "Rival ID required" }, { status: 400 });
  }

  try {
    const bootstrap = await getFPLBootstrapData();
    const playerMap = new Map<number, any>();
    bootstrap.players.forEach((p) => playerMap.set(p.id, p));

    // 1. Fetch rival manager profile
    const entryRes = await fetch(`https://fantasy.premierleague.com/api/entry/${rivalId}/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    if (!entryRes.ok) {
      return NextResponse.json({ success: false, error: "Rival manager not found" }, { status: entryRes.status });
    }
    const entryData = await entryRes.json();
    const currentEvent = entryData.current_event || bootstrap.currentEvent;

    // 2. Fetch rival squad picks
    let picks: FPLPick[] = [];
    let entryHistory: any = null;
    let activeChip: string | null = null;

    for (let gw = currentEvent; gw >= 1; gw--) {
      try {
        const picksRes = await fetch(`https://fantasy.premierleague.com/api/entry/${rivalId}/event/${gw}/picks/`, {
          headers: { "User-Agent": "Mozilla/5.0" },
          cache: "no-store",
        });
        if (picksRes.ok) {
          const picksData = await picksRes.json();
          if (picksData.picks && picksData.picks.length > 0) {
            picks = picksData.picks;
            entryHistory = picksData.entry_history;
            activeChip = picksData.active_chip;
            break;
          }
        }
      } catch (e) {
        console.warn(`Failed rival picks GW ${gw}:`, e);
      }
    }

    // 3. Enrich rival players
    const rivalSquad: EnrichedPlayer[] = picks
      .map((pick) => {
        const player = playerMap.get(pick.element);
        if (!player) return null;
        return {
          ...player,
          is_captain: pick.is_captain,
          is_vice_captain: pick.is_vice_captain,
          is_starting: pick.position <= 11,
          position_index: pick.position,
        };
      })
      .filter(Boolean);

    const rivalCaptain = rivalSquad.find((p) => p.is_captain);
    const rivalViceCaptain = rivalSquad.find((p) => p.is_vice_captain);

    // 4. If userId provided, fetch user squad to build differential matrix
    let userSquadIds = new Set<number>();
    let userCaptain: any = null;

    if (userId) {
      try {
        const userPicksRes = await fetch(`https://fantasy.premierleague.com/api/entry/${userId}/event/${currentEvent}/picks/`, {
          headers: { "User-Agent": "Mozilla/5.0" },
          cache: "no-store",
        });
        if (userPicksRes.ok) {
          const userPicksData = await userPicksRes.json();
          userPicksData.picks?.forEach((p: any) => {
            userSquadIds.add(p.element);
            if (p.is_captain) {
              userCaptain = playerMap.get(p.element) || null;
            }
          });
        }
      } catch (err) {
        console.warn("Could not fetch user squad for comparison:", err);
      }
    }

    const rivalSquadIds = new Set(rivalSquad.map((p) => p.id));

    // Threat differentials = rival has, user does NOT have
    const threatDifferentials = rivalSquad.filter((p) => !userSquadIds.has(p.id));
    // Shared core = both own
    const sharedCore = rivalSquad.filter((p) => userSquadIds.has(p.id));

    return NextResponse.json({
      success: true,
      rival: {
        id: entryData.id,
        name: entryData.name,
        player_name: `${entryData.player_first_name} ${entryData.player_last_name}`,
        total_points: entryData.summary_overall_points,
        rank: entryData.summary_overall_rank,
        bank: entryData.last_deadline_bank,
        value: entryData.last_deadline_value,
        transfers_made: entryHistory?.event_transfers || 0,
        transfers_cost: entryHistory?.event_transfers_cost || 0,
        active_chip: activeChip,
      },
      squad: rivalSquad,
      captain: rivalCaptain,
      vice_captain: rivalViceCaptain,
      comparison: {
        threat_differentials: threatDifferentials,
        shared_core: sharedCore,
        user_captain: userCaptain,
        rival_captain: rivalCaptain,
        captain_matchup: {
          same: userCaptain && rivalCaptain ? userCaptain.id === rivalCaptain.id : false,
          user_pick: userCaptain?.web_name || "Unset",
          rival_pick: rivalCaptain?.web_name || "Unset",
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
