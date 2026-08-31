import { NextResponse } from "next/server";
import { broadcastGlitchEffect } from "@/lib/duel-storage";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    broadcastGlitchEffect();
    return NextResponse.json({ success: true, message: "Glitch effect triggered" });
  } catch (err) {
    console.error("POST /api/duel/glitch error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to trigger glitch" },
      { status: 500 }
    );
  }
}
