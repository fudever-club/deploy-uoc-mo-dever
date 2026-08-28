import { NextRequest, NextResponse } from "next/server";
import { broadcastReaction } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { emoji, count } = await req.json();
    const validEmojis = ["🏮", "❤️", "✨", "🚀", "🐞", "🎉", "🔥"];
    const chosenEmoji = validEmojis.includes(emoji) ? emoji : "🏮";
    const reactionCount = typeof count === "number" && count > 0 ? Math.min(20, count) : 1;

    const reaction = broadcastReaction(chosenEmoji, reactionCount);
    return NextResponse.json({ success: true, data: reaction });
  } catch (err) {
    console.error("POST reaction error:", err);
    return NextResponse.json({ success: false, error: "Lỗi gửi biểu cảm" }, { status: 500 });
  }
}
