import { getDreams } from "./storage";

// Fallback mind-reading comments from Buggy
const STATIC_MIND_READING_LINES = [
  "Buggy nhìn sâu vào đôi mắt bạn và thấy một coder tràn đầy nhiệt huyết muốn rinh trọn học bổng FPTU!",
  "Trực giác của Buggy mách bảo bạn đang ấp ủ ước mơ trở thành Software Engineer triệu đô cùng FU-DEVER!",
  "Buggy ngửi thấy mùi cà phê và ước mơ vượt qua mọi kỳ đồ án Capstone điểm 10 rực rỡ!",
  "Tần số tư duy của bạn khớp 100% với một nhà vô địch Hackathon tương lai!",
];

export async function readDreamWithGemini(
  nickname: string,
  score: number,
  correctCount: number
): Promise<string> {
  const fallback =
    STATIC_MIND_READING_LINES[
      Math.floor(Math.random() * STATIC_MIND_READING_LINES.length)
    ];

  // 1. Try finding dream from Deploy Ước Mơ system by matched nickname
  let matchedDream = "";
  try {
    const dreams = await getDreams(false, 50);
    const matched = dreams.find(
      (d) =>
        d.name &&
        d.name.toLowerCase().trim() === nickname.toLowerCase().trim()
    );
    if (matched) {
      matchedDream = `Ước mơ đã gửi ở gian hàng: "${matched.content}" (Chủ đề: ${matched.tag})`;
    }
  } catch {
    // ignore
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return matchedDream
      ? `Buggy thấy bạn đã gửi ước mơ: "${matchedDream}". Hãy biến nó thành hiện thực cùng FU-DEVER nhé!`
      : fallback;
  }

  // 2. Fast non-blocking AI call with 1.5s strict timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const prompt = `Bạn là mascot Buggy bọ rùa của CLB FU-DEVER (FPT University Da Nang).
Hãy viết 1 câu bình luận ngắn (dưới 25 từ), hài hước, xéo xắt nhẹ nhàng, xưng ngôi thứ 3 "Buggy" (KHÔNG dùng tôi/mình).
Người chơi: "${nickname}", vừa đấu xong 5 câu đúng ${correctCount}/5 với điểm ${score}.
${matchedDream ? `Thông tin ước mơ của bạn này: ${matchedDream}` : ""}
Chỉ trả về đúng 1 câu thoại ngắn.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 60, temperature: 0.8 },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) {
        return text.replace(/["']/g, "");
      }
    }
  } catch (e) {
    // Silent fallback on timeout or failure
  } finally {
    clearTimeout(timeoutId);
  }

  return fallback;
}
