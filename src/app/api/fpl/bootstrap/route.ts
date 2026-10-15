import { NextResponse } from "next/server";
import { getFPLBootstrapData, calculatePricePredictions, calculateRotationRisks } from "@/lib/fpl";

export async function GET() {
  try {
    const data = await getFPLBootstrapData();
    const pricePredictions = calculatePricePredictions(data.players);
    const rotationRisks = calculateRotationRisks(data.players);

    return NextResponse.json({
      success: true,
      currentEvent: data.currentEvent,
      totalPlayers: data.players.length,
      pricePredictions,
      rotationRisks,
      lastFetched: data.lastFetched,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
