import { NextRequest, NextResponse } from "next/server";
import { readDreamWithGemini } from "@/lib/gemini-mind-reader";

export async function POST(req: NextRequest) {
  try {
    const { nickname, score, correctCount } = await req.json();
    if (!nickname) {
      return NextResponse.json(
        { success: false, error: "Nickname required" },
        { status: 400 }
      );
    }

    const aiLine = await readDreamWithGemini(
      nickname,
      score ?? 0,
      correctCount ?? 0
    );

    return NextResponse.json({
      success: true,
      data: {
        aiComment: aiLine,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: {
        aiComment:
          "Buggy chúc bạn một ngày Club Day rực rỡ và sớm trở thành coder cừ khôi cùng FU-DEVER!",
      },
    });
  }
}
