import { NextRequest, NextResponse } from "next/server";

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
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `FPL API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const standings = data.standings?.results || [];

    return NextResponse.json({
      success: true,
      league: {
        id: data.league?.id,
        name: data.league?.name,
        created: data.league?.created,
        admin_entry: data.league?.admin_entry,
      },
      standings,
      has_next: data.standings?.has_next || false,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
