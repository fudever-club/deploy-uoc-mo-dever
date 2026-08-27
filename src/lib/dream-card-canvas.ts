import { Dream } from "@/types/dream";
import { DREAM_CATEGORIES, EVENT_INFO } from "./constants";

export interface RenderCardOptions {
  width?: number;
  height?: number;
}

export async function renderDreamCardToDataUrl(
  dream: Dream,
  options: RenderCardOptions = {}
): Promise<string> {
  const width = options.width || 1080;
  const height = options.height || 1920;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context from canvas");

  const theme = dream.theme || "classic";
  const mascotIndex = dream.mascotIndex || 1;

  // 1. BACKGROUND RENDERING BASED ON THEME
  if (theme === "tech") {
    // Cyber / Tech DEVER Theme (Deep Navy + Cyan Accent)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#08101e");
    bgGradient.addColorStop(0.4, "#0f203c");
    bgGradient.addColorStop(0.8, "#12203a");
    bgGradient.addColorStop(1, "#050914");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Cyan glowing ambient light
    const glowGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 10, width * 0.8, height * 0.2, 350);
    glowGrad.addColorStop(0, "rgba(0, 145, 234, 0.45)");
    glowGrad.addColorStop(0.5, "rgba(0, 245, 212, 0.15)");
    glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, 350, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === "gold") {
    // Imperial Warm Gold Theme
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#3a1306");
    bgGradient.addColorStop(0.3, "#712b13");
    bgGradient.addColorStop(0.7, "#993c1d");
    bgGradient.addColorStop(1, "#260a03");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const goldMoon = ctx.createRadialGradient(width * 0.5, height * 0.18, 30, width * 0.5, height * 0.18, 320);
    goldMoon.addColorStop(0, "rgba(250, 199, 117, 0.55)");
    goldMoon.addColorStop(0.6, "rgba(250, 199, 117, 0.15)");
    goldMoon.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = goldMoon;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.18, 320, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Classic Crimson Festival Theme
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#2a0808");
    bgGradient.addColorStop(0.35, "#712b13");
    bgGradient.addColorStop(0.7, "#993c1d");
    bgGradient.addColorStop(1, "#1c0606");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const moonGrad = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, 260);
    moonGrad.addColorStop(0, "rgba(250, 199, 117, 0.45)");
    moonGrad.addColorStop(0.5, "rgba(250, 199, 117, 0.12)");
    moonGrad.addColorStop(1, "rgba(250, 199, 117, 0)");
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, 260, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparkling background stars
  ctx.fillStyle = theme === "tech" ? "rgba(133, 183, 235, 0.7)" : "rgba(250, 238, 218, 0.7)";
  const starCoords = [
    [120, 150, 4],
    [240, 280, 2.5],
    [880, 340, 3.5],
    [980, 520, 2],
    [150, 680, 3],
    [920, 1100, 2.5],
    [100, 1350, 3],
    [950, 1500, 3.5],
  ];
  starCoords.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Border Frame
  const borderColor = theme === "tech" ? "rgba(0, 145, 234, 0.6)" : "rgba(250, 199, 117, 0.5)";
  const innerBorderColor = theme === "tech" ? "rgba(0, 245, 212, 0.4)" : "rgba(250, 199, 117, 0.8)";

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.strokeStyle = innerBorderColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(55, 55, width - 110, height - 110);

  // Corner Accents
  const drawCorner = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = theme === "tech" ? "#00f5d4" : "#fac775";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.lineTo(0, 0);
    ctx.lineTo(25, 0);
    ctx.stroke();
    ctx.restore();
  };
  drawCorner(65, 65, 0);
  drawCorner(width - 65, 65, Math.PI / 2);
  drawCorner(width - 65, height - 65, Math.PI);
  drawCorner(65, height - 65, -Math.PI / 2);

  // 2. HEADER SECTION
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Event Tag Pill
  ctx.fillStyle = theme === "tech" ? "#00f5d4" : "#fac775";
  ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("🏮 FU-DEVER CLUB DAY 2026 🏮", width / 2, 140);

  // Main Activity Title
  ctx.fillStyle = "#faeeda";
  ctx.font = "900 68px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("DEPLOY ƯỚC MƠ", width / 2, 230);

  // Subtitle / Date
  ctx.fillStyle = "rgba(250, 238, 218, 0.85)";
  ctx.font = "30px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Kỷ niệm ngày hội CLB · 12/09/2026", width / 2, 295);

  // Category Tag Pill
  const categoryInfo = DREAM_CATEGORIES.find((c) => c.id === dream.tag);
  if (categoryInfo) {
    const pillText = `${categoryInfo.emoji} ${categoryInfo.label}`;
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const pillWidth = ctx.measureText(pillText).width + 60;
    const pillHeight = 56;
    const pillX = (width - pillWidth) / 2;
    const pillY = 360;

    ctx.fillStyle = theme === "tech" ? "rgba(0, 145, 234, 0.25)" : "rgba(250, 199, 117, 0.2)";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 28);
    ctx.fill();
    ctx.strokeStyle = theme === "tech" ? "rgba(0, 245, 212, 0.6)" : "rgba(250, 199, 117, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = theme === "tech" ? "#00f5d4" : "#fac775";
    ctx.fillText(pillText, width / 2, pillY + pillHeight / 2);
  }

  // 3. MIDDLE CONTENT CARD
  const cardX = 90;
  const cardY = 460;
  const cardW = width - 180;
  const cardH = 920;

  ctx.fillStyle = theme === "tech" ? "rgba(8, 16, 30, 0.75)" : "rgba(18, 32, 58, 0.65)";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 32);
  ctx.fill();
  ctx.strokeStyle = theme === "tech" ? "rgba(0, 145, 234, 0.4)" : "rgba(250, 199, 117, 0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Try to load and draw Mascot Buggy Sticker on the card
  try {
    const mascotImg = new Image();
    mascotImg.crossOrigin = "anonymous";
    mascotImg.src = `/assets/buggy/${mascotIndex}.png`;
    await new Promise<void>((resolve) => {
      mascotImg.onload = () => {
        const mW = 120;
        const mH = 120;
        ctx.drawImage(mascotImg, cardX + cardW - 140, cardY + 25, mW, mH);
        resolve();
      };
      mascotImg.onerror = () => resolve();
      setTimeout(resolve, 500);
    });
  } catch {
    // skip mascot if load issue
  }

  // Traditional Seal Stamp (Triện Đỏ "ĐỖ ĐẠT" or "FU-DEVER")
  ctx.save();
  ctx.translate(cardX + 60, cardY + 55);
  ctx.rotate(-0.1);
  ctx.strokeStyle = theme === "tech" ? "#00f5d4" : "#B22222";
  ctx.fillStyle = theme === "tech" ? "rgba(0, 245, 212, 0.15)" : "rgba(178, 34, 34, 0.2)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, 95, 42, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = theme === "tech" ? "#00f5d4" : "#ff4d4d";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(theme === "tech" ? "DEVER" : "ĐỖ ĐẠT", 47.5, 21);
  ctx.restore();

  // Dreamer Name
  const dreamerName = dream.name && dream.name.trim().length > 0 ? dream.name.trim() : "Ẩn danh";
  ctx.fillStyle = theme === "tech" ? "#00f5d4" : "#fac775";
  ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`✨ ${dreamerName} ✨`, width / 2, cardY + 90);

  // Quote open
  ctx.fillStyle = theme === "tech" ? "rgba(0, 245, 212, 0.4)" : "rgba(250, 199, 117, 0.4)";
  ctx.font = "italic 80px Georgia, serif";
  ctx.fillText("“", width / 2, cardY + 180);

  // Dream Content auto-scaling font size
  const maxContentWidth = cardW - 120;
  const rawText = dream.content.trim();
  let fontSize = 42;
  if (rawText.length > 250) fontSize = 32;
  else if (rawText.length > 150) fontSize = 36;
  else if (rawText.length < 60) fontSize = 48;

  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.fillStyle = "#ffffff";

  // Word wrap
  const words = rawText.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxContentWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = fontSize * 1.55;
  const totalTextHeight = lines.length * lineHeight;
  const startY = cardY + 230 + (cardH - 350 - totalTextHeight) / 2;

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + idx * lineHeight);
  });

  // Quote close
  ctx.fillStyle = theme === "tech" ? "rgba(0, 245, 212, 0.4)" : "rgba(250, 199, 117, 0.4)";
  ctx.font = "italic 80px Georgia, serif";
  ctx.fillText("”", width / 2, cardY + cardH - 80);

  // 4. FOOTER SECTION
  ctx.strokeStyle = theme === "tech" ? "rgba(0, 145, 234, 0.5)" : "rgba(250, 199, 117, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, height - 380);
  ctx.lineTo(width - 140, height - 380);
  ctx.stroke();

  // Draw Official Logo
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "/assets/logo/logo-dever-white.png";
    await new Promise<void>((resolve) => {
      logoImg.onload = () => {
        const logoW = 240;
        const logoH = (logoImg.naturalHeight / logoImg.naturalWidth) * logoW || 75;
        ctx.drawImage(logoImg, (width - logoW) / 2, height - 340, logoW, logoH);
        resolve();
      };
      logoImg.onerror = () => resolve();
      setTimeout(resolve, 800);
    });
  } catch {
    ctx.fillStyle = "#0091ea";
    ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("FU-DEVER", width / 2, height - 300);
  }

  // Club Tagline
  ctx.fillStyle = "#faeeda";
  ctx.font = "26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("CLB LẬP TRÌNH FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG", width / 2, height - 210);

  // Hashtags
  ctx.fillStyle = theme === "tech" ? "#00f5d4" : "#fac775";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(EVENT_INFO.hashtags.join("   "), width / 2, height - 150);

  return canvas.toDataURL("image/png");
}

export function downloadDreamCard(dataUrl: string, filename = "Deploy_Uoc_Mo_FU_DEVER.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
