import { NextRequest, NextResponse } from "next/server";
import { getFPLBootstrapData } from "@/lib/fpl";

export async function GET(req: NextRequest) {
  try {
    const bootstrap = await getFPLBootstrapData();
    const currentEvent = bootstrap.currentEvent;
    const fromGw = currentEvent + 1; // e.g. GW7
    const toGw = fromGw + 4; // 5 gameweek window

    const teamMap = new Map<number, { name: string; short_name: string }>();
    bootstrap.teams.forEach((t) => teamMap.set(t.id, { name: t.name, short_name: t.short_name }));

    const res = await fetch("https://fantasy.premierleague.com/api/fixtures/", {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Could not fetch fixtures" }, { status: res.status });
    }

    const allFixtures = await res.json();
    const windowFixtures = allFixtures.filter((f: any) => f.event >= fromGw && f.event <= toGw);

    // Build per-team fixture schedule for the 5-GW window
    const teamSchedules: Record<
      number,
      {
        team_id: number;
        team_name: string;
        short_name: string;
        fixtures: Array<{
          event: number;
          opponent: string;
          opponent_id: number;
          is_home: boolean;
          difficulty: number;
          kickoff: string;
        }>;
        total_difficulty: number;
        average_difficulty: number;
      }
    > = {};

    bootstrap.teams.forEach((t) => {
      teamSchedules[t.id] = {
        team_id: t.id,
        team_name: t.name,
        short_name: t.short_name,
        fixtures: [],
        total_difficulty: 0,
        average_difficulty: 0,
      };
    });

    windowFixtures.forEach((f: any) => {
      const homeTeam = teamMap.get(f.team_h);
      const awayTeam = teamMap.get(f.team_a);

      if (teamSchedules[f.team_h]) {
        teamSchedules[f.team_h].fixtures.push({
          event: f.event,
          opponent: awayTeam?.short_name || "AWA",
          opponent_id: f.team_a,
          is_home: true,
          difficulty: f.team_h_difficulty || 3,
          kickoff: f.kickoff_time,
        });
        teamSchedules[f.team_h].total_difficulty += f.team_h_difficulty || 3;
      }

      if (teamSchedules[f.team_a]) {
        teamSchedules[f.team_a].fixtures.push({
          event: f.event,
          opponent: homeTeam?.short_name || "HOM",
          opponent_id: f.team_h,
          is_home: false,
          difficulty: f.team_a_difficulty || 3,
          kickoff: f.kickoff_time,
        });
        teamSchedules[f.team_a].total_difficulty += f.team_a_difficulty || 3;
      }
    });

    // Calculate averages and sort by easiest schedule
    const schedulesList = Object.values(teamSchedules).map((s) => ({
      ...s,
      average_difficulty: s.fixtures.length > 0 ? parseFloat((s.total_difficulty / s.fixtures.length).toFixed(2)) : 3.0,
    })).sort((a, b) => a.average_difficulty - b.average_difficulty);

    return NextResponse.json({
      success: true,
      window: { from: fromGw, to: toGw },
      teams: schedulesList,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
