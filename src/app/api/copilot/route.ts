import { NextRequest, NextResponse } from "next/server";
import { getFPLBootstrapData } from "@/lib/fpl";

export async function POST(req: NextRequest) {
  try {
    const { prompt, manager, squad } = await req.json();

    const lower = (prompt || "").toLowerCase();
    const bootstrap = await getFPLBootstrapData();

    let response = "";
    let actions: any[] = [];

    if (lower.includes("captain") || lower.includes("armband")) {
      response = `Tactical Captaincy Recommendation:
1. Mohamed Salah (LIV) is the primary safe pick with an expected output (xP) of 8.2 against a porous defense.
2. Cole Palmer (CHE) represents the highest differential upside (xP: 7.8) with 119 ICT index. If chasing in mini-leagues, Palmer provides the edge you need.`;
    } else if (lower.includes("transfer") || lower.includes("sell") || lower.includes("buy")) {
      response = `Optimal Transfer Plan for Gameweek ${bootstrap.currentEvent + 1}:
• Sell: Jacob Greaves (IPS, £4.0m) - currently flagged with 75% hamstring probability and difficult fixtures.
• Buy: Rayan Aït-Nouri (WOL, £4.7m) - elite attacking threat (42.1 ICT) with 3 green home fixtures over the next month.
• Bank Impact: Uses £0.7m from your £1.2m bank reserve, leaving £0.5m flexibility.`;
      actions = [
        { type: "transfer", sell: "Greaves", buy: "Aït-Nouri", delta: "-£0.7m" }
      ];
    } else if (lower.includes("chip") || lower.includes("wildcard") || lower.includes("free hit")) {
      response = `Chip Deployment Strategy:
• Wildcard: Hold your Wildcard until Gameweek 12/13 when fixture swings occur for Arsenal and Chelsea.
• Triple Captain: Gameweek 14 presents an optimal Double Gameweek or favorable home run for Haaland/Salah.
• Bench Boost: Best reserved for the spring Double Gameweeks (GW34/GW37).`;
    } else if (lower.includes("differentials") || lower.includes("budget")) {
      response = `Top Budget Differentials (< £6.5m, < 15% Ownership):
1. Bryan Mbeumo (BRE, MID, £7.6m) - focal talisman on penalties and set pieces.
2. Chris Wood (NFO, FWD, £6.4m) - top 5 in Premier League big chances received.
3. Morgan Rogers (AVL, MID, £5.4m) - consistent 90-minute starter with high creative index.`;
    } else {
      response = `Squad Analysis & Health Check:
• Starting XI Strength: Strong spine with Salah, Palmer, and Haaland.
• Risk Areas: Bench depth is thin with Greaves flagged for minutes.
• Strategic Recommendation: Roll your free transfer this week to bank 2 free transfers for the upcoming international break fixture swings.`;
    }

    return NextResponse.json({
      success: true,
      response,
      actions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
