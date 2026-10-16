import { NextRequest, NextResponse } from "next/server";
import { getFPLBootstrapData } from "@/lib/fpl";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("id");

  if (!leagueId) {
    return NextResponse.json({ success: false, error: "League ID required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `FPL API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawStandings = data.standings?.results || [];

    // Enrich top 15 rivals with live captain and chip data
    let playerMap = new Map<number, string>();
    let currentEvent = 6;
    try {
      const bootstrap = await getFPLBootstrapData();
      currentEvent = bootstrap.currentEvent;
      bootstrap.players.forEach((p) => playerMap.set(p.id, p.web_name));
    } catch (e) {
      console.warn("Bootstrap load error in league route:", e);
    }

    const enrichedStandings = await Promise.all(
      rawStandings.map(async (entry: any, index: number) => {
        // Only enrich top 15 in parallel for speed
        if (index >= 15) return entry;

        try {
          const picksRes = await fetch(
            `https://fantasy.premierleague.com/api/entry/${entry.entry}/event/${currentEvent}/picks/`,
            { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" }
          );
          if (picksRes.ok) {
            const picksData = await picksRes.json();
            const capPick = picksData.picks?.find((p: any) => p.is_captain);
            const capName = capPick ? playerMap.get(capPick.element) || "Unknown" : null;
            return {
              ...entry,
              captain_name: capName,
              active_chip: picksData.active_chip || null,
              transfers_made: picksData.entry_history?.event_transfers ?? null,
              transfers_cost: picksData.entry_history?.event_transfers_cost ?? 0,
            };
          }
        } catch {
          // Keep raw entry on pick fetch failure
        }
        return entry;
      })
    );

    return NextResponse.json({
      success: true,
      league: {
        id: data.league?.id,
        name: data.league?.name,
        created: data.league?.created,
        admin_entry: data.league?.admin_entry,
      },
      standings: enrichedStandings,
      has_next: data.standings?.has_next || false,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
