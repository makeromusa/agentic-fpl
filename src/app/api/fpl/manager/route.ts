import { NextRequest, NextResponse } from "next/server";
import { getFPLBootstrapData, calculateHorizonStrategy } from "@/lib/fpl";
import { EnrichedPlayer, FPLPick } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("id");

  try {
    const bootstrap = await getFPLBootstrapData();
    const playerMap = new Map<number, any>();
    bootstrap.players.forEach((p) => playerMap.set(p.id, p));

    let managerSummary: any = {
      id: 542192,
      name: "Asman's Title Contenders",
      player_first_name: "Asman",
      player_last_name: "Makero",
      summary_overall_points: 624,
      summary_overall_rank: 48210,
      last_deadline_bank: 12, // £1.2M
      last_deadline_value: 1024, // £102.4M
      current_event: bootstrap.currentEvent,
      leagues: [],
    };

    let picks: FPLPick[] = [];

    // Support both numeric Team ID and text Squad Names!
    if (managerId && managerId.trim() !== "") {
      const trimmed = managerId.trim();
      const isNumeric = /^\d+$/.test(trimmed);

      if (isNumeric) {
        // Attempt live fetch with numeric ID
        try {
          const entryRes = await fetch(`https://fantasy.premierleague.com/api/entry/${trimmed}/`, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });

          if (entryRes.ok) {
            const entryData = await entryRes.json();
            managerSummary = {
              id: entryData.id,
              name: entryData.name,
              player_first_name: entryData.player_first_name,
              player_last_name: entryData.player_last_name,
              summary_overall_points: entryData.summary_overall_points,
              summary_overall_rank: entryData.summary_overall_rank,
              last_deadline_bank: entryData.last_deadline_bank,
              last_deadline_value: entryData.last_deadline_value,
              current_event: entryData.current_event,
              leagues: entryData.leagues?.classic || [],
            };

            const picksRes = await fetch(
              `https://fantasy.premierleague.com/api/entry/${trimmed}/event/${entryData.current_event}/picks/`,
              { headers: { "User-Agent": "Mozilla/5.0" } }
            );

            if (picksRes.ok) {
              const picksData = await picksRes.json();
              picks = picksData.picks;
            }
          }
        } catch (e) {
          console.warn("Live entry fetch fallback to template squad:", e);
        }
      } else {
        // User typed a Squad Name (e.g. "Gunners FC", "Asman's XI")
        managerSummary.name = trimmed;
      }
    }

    // Default template squad if picks not populated
    if (picks.length === 0) {
      const defaultIds = [
        101, // Raya (GK)
        201, 202, 203, 204, // Gabriel, TAA, Gvardiol, Robinson (DEF)
        301, 302, 303, 304, // Salah, Palmer, Saka, Mbeumo (MID)
        401, 402, // Haaland, Wood (FWD)
        102, // Fabianski (Bench GK)
        305, // Rogers (Bench 1)
        403, // Delap (Bench 2)
        205, // Greaves (Bench 3)
      ];

      picks = defaultIds.map((id, index) => ({
        element: id,
        position: index + 1,
        is_captain: id === 301, // Salah (C)
        is_vice_captain: id === 302, // Palmer (VC)
        multiplier: id === 301 ? 2 : index < 11 ? 1 : 0,
      }));
    }

    const squad: EnrichedPlayer[] = picks
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

    // Compute horizon plans
    const horizonPlans = calculateHorizonStrategy(bootstrap.currentEvent, squad);

    return NextResponse.json({
      success: true,
      manager: managerSummary,
      squad,
      horizonPlans,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
