import { NextRequest, NextResponse } from "next/server";
import { broadcastReaction } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { emoji } = await req.json();
    const validEmojis = ["🏮", "❤️", "✨", "🚀", "🐞", "🎉", "🔥"];
    const chosenEmoji = validEmojis.includes(emoji) ? emoji : "🏮";

    const reaction = broadcastReaction(chosenEmoji);
    return NextResponse.json({ success: true, data: reaction });
  } catch (err) {
    console.error("POST reaction error:", err);
    return NextResponse.json({ success: false, error: "Lỗi gửi biểu cảm" }, { status: 500 });
  }
}
