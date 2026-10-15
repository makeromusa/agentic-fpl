import { NextRequest, NextResponse } from "next/server";
import { getFPLBootstrapData, calculateHorizonStrategy } from "@/lib/fpl";
import { EnrichedPlayer, FPLPick } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("id");

  if (!managerId || managerId.trim() === "") {
    return NextResponse.json(
      {
        success: false,
        error: "No FPL Team ID provided. Please enter your numeric Team ID.",
      },
      { status: 400 }
    );
  }

  const trimmed = managerId.trim();
  const isNumeric = /^\d+$/.test(trimmed);

  if (!isNumeric) {
    return NextResponse.json(
      {
        success: false,
        error: `FPL requires your numeric Team ID (e.g. '320069'), not a squad name. You can find this in your browser URL on fantasy.premierleague.com: '/entry/YOUR_ID/event/...'`,
      },
      { status: 400 }
    );
  }

  try {
    const bootstrap = await getFPLBootstrapData();
    const playerMap = new Map<number, any>();
    bootstrap.players.forEach((p) => playerMap.set(p.id, p));

    // 1. Fetch live manager profile with no-store to avoid stale data
    const entryRes = await fetch(`https://fantasy.premierleague.com/api/entry/${trimmed}/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    if (!entryRes.ok) {
      if (entryRes.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: `Team ID #${trimmed} was not found on the official Fantasy Premier League servers. Please check your ID and retry.`,
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `FPL Server returned status ${entryRes.status}. Please try again in a moment.`,
        },
        { status: entryRes.status }
      );
    }

    const entryData = await entryRes.json();

    // 2. Filter & prioritize private/custom leagues
    const rawLeagues = entryData.leagues?.classic || [];
    const filteredLeagues = rawLeagues
      .filter((l: any) => {
        // Exclude generic massive public leagues
        const isSystem = l.league_type === "s" && (l.short_name === "overall" || l.short_name?.startsWith("s"));
        return !isSystem;
      })
      .sort((a: any, b: any) => {
        // Private mini-leagues first
        const aPrivate = a.admin_entry !== null ? 1 : 0;
        const bPrivate = b.admin_entry !== null ? 1 : 0;
        return bPrivate - aPrivate;
      });

    const managerSummary = {
      id: entryData.id,
      name: entryData.name,
      player_first_name: entryData.player_first_name,
      player_last_name: entryData.player_last_name,
      summary_overall_points: entryData.summary_overall_points,
      summary_overall_rank: entryData.summary_overall_rank,
      last_deadline_bank: entryData.last_deadline_bank,
      last_deadline_value: entryData.last_deadline_value,
      current_event: entryData.current_event || bootstrap.currentEvent,
      leagues: filteredLeagues.length > 0 ? filteredLeagues : rawLeagues,
    };

    // 3. Fetch latest active squad picks
    let picks: FPLPick[] = [];
    const targetEvent = entryData.current_event || bootstrap.currentEvent;

    // Try target event, then fallback down if game has not started that event yet
    for (let gw = targetEvent; gw >= 1; gw--) {
      try {
        const picksRes = await fetch(
          `https://fantasy.premierleague.com/api/entry/${trimmed}/event/${gw}/picks/`,
          {
            headers: { "User-Agent": "Mozilla/5.0" },
            cache: "no-store",
          }
        );

        if (picksRes.ok) {
          const picksData = await picksRes.json();
          if (picksData.picks && picksData.picks.length > 0) {
            picks = picksData.picks;
            break;
          }
        }
      } catch (err) {
        console.warn(`Failed fetching picks for GW ${gw}:`, err);
      }
    }

    if (picks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Could not retrieve squad picks for team #${trimmed}. The team may have no picks registered yet this season.`,
        },
        { status: 404 }
      );
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

    // Compute horizon plans based on latest squad
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
