import { Dream } from "@/types/dream";
import { DREAM_CATEGORIES, EVENT_INFO, getBuggyMascotUrl, getDeverStampInfo } from "./constants";

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
    // Cyber / Tech DEVER Theme (Deep Midnight Navy + Cyber Cyan Glow)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#030814");
    bgGradient.addColorStop(0.35, "#091a38");
    bgGradient.addColorStop(0.7, "#0c2856");
    bgGradient.addColorStop(1, "#02050e");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Cyan glowing ambient light
    const glowGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 10, width * 0.8, height * 0.2, 380);
    glowGrad.addColorStop(0, "rgba(0, 245, 212, 0.45)");
    glowGrad.addColorStop(0.5, "rgba(0, 145, 234, 0.2)");
    glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, 380, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === "gold") {
    // Imperial Radiant Warm Amber & Gold Theme (Distinct from Crimson Red)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#2c1800");
    bgGradient.addColorStop(0.25, "#593404");
    bgGradient.addColorStop(0.6, "#8c5408");
    bgGradient.addColorStop(0.85, "#b87c12");
    bgGradient.addColorStop(1, "#1c0f00");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Luminous Imperial Moon & Golden Aura
    const goldMoon = ctx.createRadialGradient(width * 0.5, height * 0.18, 30, width * 0.5, height * 0.18, 360);
    goldMoon.addColorStop(0, "rgba(255, 215, 0, 0.65)");
    goldMoon.addColorStop(0.4, "rgba(250, 199, 117, 0.3)");
    goldMoon.addColorStop(0.8, "rgba(255, 209, 102, 0.08)");
    goldMoon.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = goldMoon;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.18, 360, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Classic Crimson Festival Theme (Deep Red Velvet & Festive Lantern)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#280505");
    bgGradient.addColorStop(0.3, "#61100b");
    bgGradient.addColorStop(0.7, "#993c1d");
    bgGradient.addColorStop(1, "#180303");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Warm Orange-Red Moon Glow
    const moonGrad = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, 280);
    moonGrad.addColorStop(0, "rgba(250, 199, 117, 0.5)");
    moonGrad.addColorStop(0.5, "rgba(230, 70, 30, 0.18)");
    moonGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, 280, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparkling background stars
  ctx.fillStyle =
    theme === "tech"
      ? "rgba(0, 245, 212, 0.8)"
      : theme === "gold"
      ? "rgba(255, 223, 128, 0.9)"
      : "rgba(250, 238, 218, 0.75)";
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
  const borderColor =
    theme === "tech"
      ? "rgba(0, 145, 234, 0.7)"
      : theme === "gold"
      ? "rgba(255, 209, 102, 0.85)"
      : "rgba(250, 199, 117, 0.55)";
  const innerBorderColor =
    theme === "tech"
      ? "rgba(0, 245, 212, 0.6)"
      : theme === "gold"
      ? "rgba(255, 238, 187, 0.9)"
      : "rgba(224, 86, 56, 0.6)";

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
    ctx.strokeStyle = theme === "tech" ? "#00f5d4" : theme === "gold" ? "#ffd166" : "#fac775";
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
  ctx.fillStyle = theme === "tech" ? "#00f5d4" : theme === "gold" ? "#ffd166" : "#fac775";
  ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("🏮 FU-DEVER CLUB DAY 2026 🏮", width / 2, 140);

  // Main Activity Title
  ctx.fillStyle = theme === "gold" ? "#fff6db" : "#faeeda";
  ctx.font = "900 68px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("DEPLOY ƯỚC MƠ", width / 2, 230);

  // Subtitle / Date
  ctx.fillStyle =
    theme === "tech"
      ? "rgba(133, 183, 235, 0.9)"
      : theme === "gold"
      ? "rgba(255, 238, 187, 0.9)"
      : "rgba(250, 238, 218, 0.85)";
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

    ctx.fillStyle =
      theme === "tech"
        ? "rgba(0, 145, 234, 0.3)"
        : theme === "gold"
        ? "rgba(255, 209, 102, 0.25)"
        : "rgba(250, 199, 117, 0.2)";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 28);
    ctx.fill();
    ctx.strokeStyle =
      theme === "tech"
        ? "rgba(0, 245, 212, 0.7)"
        : theme === "gold"
        ? "rgba(255, 209, 102, 0.85)"
        : "rgba(250, 199, 117, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = theme === "tech" ? "#00f5d4" : theme === "gold" ? "#ffd166" : "#fac775";
    ctx.fillText(pillText, width / 2, pillY + pillHeight / 2);
  }

  // 3. MIDDLE CONTENT CARD
  const cardX = 90;
  const cardY = 460;
  const cardW = width - 180;
  const cardH = 880;

  ctx.fillStyle =
    theme === "tech"
      ? "rgba(4, 12, 28, 0.85)"
      : theme === "gold"
      ? "rgba(36, 20, 2, 0.88)"
      : "rgba(28, 6, 6, 0.82)";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 32);
  ctx.fill();
  ctx.strokeStyle =
    theme === "tech"
      ? "rgba(0, 245, 212, 0.55)"
      : theme === "gold"
      ? "rgba(255, 209, 102, 0.75)"
      : "rgba(250, 199, 117, 0.4)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Try to load and draw Mascot Buggy Sticker on the card
  try {
    const mascotSrc = getBuggyMascotUrl(mascotIndex);
    const mascotImg = new Image();
    mascotImg.crossOrigin = "anonymous";
    mascotImg.src = mascotSrc;
    await new Promise<void>((resolve) => {
      if (mascotImg.complete && mascotImg.naturalWidth > 0) {
        const mW = 135;
        const mH = 135;
        ctx.drawImage(mascotImg, cardX + cardW - 155, cardY + 20, mW, mH);
        resolve();
        return;
      }
      mascotImg.onload = () => {
        const mW = 135;
        const mH = 135;
        ctx.drawImage(mascotImg, cardX + cardW - 155, cardY + 20, mW, mH);
        resolve();
      };
      mascotImg.onerror = () => {
        console.warn("Could not load mascot sticker from:", mascotSrc);
        resolve();
      };
      setTimeout(resolve, 1500);
    });
  } catch (e) {
    console.warn("Mascot draw error:", e);
  }

  // Traditional DEVER Seal Stamp (Top Right)
  const stampInfo = getDeverStampInfo(dream.stampVariant, theme);
  ctx.save();
  ctx.translate(cardX + cardW - 75, cardY + 50);
  ctx.rotate((6 * Math.PI) / 180);

  ctx.strokeStyle = stampInfo.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `${stampInfo.color}20`;
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();

  try {
    const stampImg = new Image();
    stampImg.crossOrigin = "anonymous";
    stampImg.src = stampInfo.image;
    await new Promise<void>((resolve) => {
      stampImg.onload = () => {
        ctx.drawImage(stampImg, -26, -26, 52, 52);
        resolve();
      };
      stampImg.onerror = () => resolve();
      setTimeout(resolve, 600);
    });
  } catch {
    // ignore
  }
  ctx.restore();

  // Dreamer Name
  const dreamerName = dream.name && dream.name.trim().length > 0 ? dream.name.trim() : "Ẩn danh";
  ctx.fillStyle =
    theme === "tech"
      ? "#00f5d4"
      : theme === "gold"
      ? "#ffd166"
      : "#fac775";
  ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`✨ ${dreamerName} ✨`, width / 2, cardY + 80);

  // Quote open
  ctx.fillStyle =
    theme === "tech"
      ? "rgba(0, 245, 212, 0.5)"
      : theme === "gold"
      ? "rgba(255, 209, 102, 0.65)"
      : "rgba(250, 199, 117, 0.4)";
  ctx.font = "italic 70px Georgia, serif";
  ctx.fillText("“", width / 2, cardY + 160);

  // Dream Content auto-scaling font size with newline support
  const maxContentWidth = cardW - 120;
  const rawText = dream.content.trim();
  const rawParagraphs = rawText.split(/\r?\n/);

  let fontSize = 38;
  if (rawText.length > 250 || rawParagraphs.length > 6) fontSize = 28;
  else if (rawText.length > 140 || rawParagraphs.length > 4) fontSize = 32;
  else if (rawText.length < 60 && rawParagraphs.length <= 2) fontSize = 44;

  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.fillStyle = theme === "gold" ? "#fffbf0" : "#ffffff";

  // Word wrap while respecting user newlines / poem stanzas
  const lines: string[] = [];
  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }
    const words = trimmed.split(" ");
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
  }

  const lineHeight = fontSize * 1.55;
  const totalTextHeight = lines.length * lineHeight;
  const availableContentH = cardH - 300;
  const startY = cardY + 200 + Math.max(0, (availableContentH - totalTextHeight) / 2);

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + idx * lineHeight);
  });

  // Quote close
  ctx.fillStyle =
    theme === "tech"
      ? "rgba(0, 245, 212, 0.5)"
      : theme === "gold"
      ? "rgba(255, 209, 102, 0.65)"
      : "rgba(250, 199, 117, 0.4)";
  ctx.font = "italic 70px Georgia, serif";
  ctx.fillText("”", width / 2, cardY + cardH - 60);

  // 4. FOOTER SECTION
  ctx.strokeStyle =
    theme === "tech"
      ? "rgba(0, 145, 234, 0.6)"
      : theme === "gold"
      ? "rgba(255, 209, 102, 0.6)"
      : "rgba(250, 199, 117, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(160, 1410);
  ctx.lineTo(width - 160, 1410);
  ctx.stroke();

  // Draw Official Logo
  const logoW = 150;
  const logoH = 150;
  const logoY = 1450;
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "/assets/logo/logo-dever-white.png";
    await new Promise<void>((resolve) => {
      logoImg.onload = () => {
        ctx.drawImage(logoImg, (width - logoW) / 2, logoY, logoW, logoH);
        resolve();
      };
      logoImg.onerror = () => resolve();
      setTimeout(resolve, 800);
    });
  } catch {
    ctx.fillStyle = "#0091ea";
    ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("FU-DEVER", width / 2, logoY + 75);
  }

  // Club Tagline
  ctx.fillStyle =
    theme === "tech"
      ? "#85b7eb"
      : theme === "gold"
      ? "#ffeaa7"
      : "#faeeda";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("CLB LẬP TRÌNH FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG", width / 2, 1660);

  // Hashtags
  ctx.fillStyle =
    theme === "tech"
      ? "#00f5d4"
      : theme === "gold"
      ? "#ffd166"
      : "#fac775";
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(EVENT_INFO.hashtags.join("   "), width / 2, 1725);

  return canvas.toDataURL("image/png");
}

export async function renderBoardingPassCardToDataUrl(
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
  const mascotIndex = dream.mascotIndex || "11";
  const category = DREAM_CATEGORIES.find((c) => c.id === dream.tag);

  // 1. COSMIC BACKGROUND
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (theme === "tech") {
    bgGrad.addColorStop(0, "#040914");
    bgGrad.addColorStop(0.5, "#0a1936");
    bgGrad.addColorStop(1, "#02050e");
  } else if (theme === "gold") {
    bgGrad.addColorStop(0, "#1f1001");
    bgGrad.addColorStop(0.5, "#4a2a06");
    bgGrad.addColorStop(1, "#120800");
  } else {
    bgGrad.addColorStop(0, "#190404");
    bgGrad.addColorStop(0.5, "#3d0b0b");
    bgGrad.addColorStop(1, "#12203A");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Stardust
  ctx.fillStyle = "rgba(250, 199, 117, 0.7)";
  for (let i = 0; i < 40; i++) {
    const sx = Math.random() * width;
    const sy = Math.random() * height;
    const sr = Math.random() * 2.5 + 1;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. BOARDING PASS TICKET BODY CONTAINER
  const passX = 70;
  const passY = 100;
  const passW = width - 140;
  const passH = height - 200;
  const notchY = passY + 1240; // Perforation notch

  // Draw Ticket Base Shape
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "#ffffff";
  ctx.roundRect(passX, passY, passW, passH, 36);
  ctx.fill();

  // Cut out Left and Right Perforation Notches
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(passX, notchY, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(passX + passW, notchY, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ticket Outer Shadow / Border
  ctx.strokeStyle = theme === "tech" ? "#00f5d4" : theme === "gold" ? "#ffd166" : "#fac775";
  ctx.lineWidth = 6;
  ctx.stroke();

  // 3. TICKET HEADER (Airline / Space Agency Style)
  const headerH = 180;
  const headGrad = ctx.createLinearGradient(passX, passY, passX + passW, passY);
  if (theme === "tech") {
    headGrad.addColorStop(0, "#0091ea");
    headGrad.addColorStop(1, "#00f5d4");
  } else if (theme === "gold") {
    headGrad.addColorStop(0, "#b87c12");
    headGrad.addColorStop(1, "#ffd166");
  } else {
    headGrad.addColorStop(0, "#993c1d");
    headGrad.addColorStop(1, "#e63946");
  }

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(passX, passY, passW, headerH, [36, 36, 0, 0]);
  ctx.fillStyle = headGrad;
  ctx.fill();
  ctx.restore();

  // Header Title & Logo
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("FU-DEVER SPACEWAYS", passX + 45, passY + 80);

  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText("BOARDING PASS · VÉ LÊN TÀU K22", passX + 45, passY + 125);

  ctx.textAlign = "right";
  ctx.font = "black 48px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("FIRST CLASS", passX + passW - 45, passY + 100);

  // 4. FLIGHT PARAMETER GRID
  const gridY = passY + headerH + 50;

  const drawField = (label: string, value: string, x: number, y: number) => {
    ctx.textAlign = "left";
    ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(label, x, y);

    ctx.font = "black 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(value, x, y + 42);
  };

  drawField("FLIGHT / CHUYẾN BAY", "DEVER-K22", passX + 45, gridY);
  drawField("GATE / CỔNG", "01 (FPTU DNG)", passX + 340, gridY);
  drawField("SEAT / GHẾ", "22A (VIP DEV)", passX + 640, gridY);

  const gridY2 = gridY + 110;
  drawField("PASSENGER / HÀNH KHÁCH", (dream.name || "TÂN SINH VIÊN K22").toUpperCase(), passX + 45, gridY2);
  drawField("TAG / CHUYÊN MỤC", `${category?.emoji || "✨"} ${category?.label || "Ước Mơ"}`, passX + 540, gridY2);

  // Destination Route Banner
  const routeY = gridY2 + 100;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(passX + 35, routeY, passW - 70, 75);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(passX + 35, routeY, passW - 70, 75);

  ctx.fillStyle = "#0f172a";
  ctx.textAlign = "left";
  ctx.font = "black 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("FPTU DA NANG (DAD)", passX + 55, routeY + 46);

  ctx.textAlign = "center";
  ctx.fillStyle = "#993c1d";
  ctx.font = "bold 24px monospace";
  ctx.fillText("✈ ─── 🚀 ─── 🏮", passX + passW / 2, routeY + 46);

  ctx.textAlign = "right";
  ctx.fillStyle = "#0091ea";
  ctx.font = "black 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("DEVER PLANET (DEV)", passX + passW - 55, routeY + 46);

  // 5. DREAM MANIFESTO / MISSION STATEMENT BOX
  const wishY = routeY + 105;
  const wishH = 360;

  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(passX + 35, wishY, passW - 70, wishH);
  ctx.strokeStyle = theme === "tech" ? "#00f5d4" : theme === "gold" ? "#fac775" : "#fed7aa";
  ctx.lineWidth = 2;
  ctx.strokeRect(passX + 35, wishY, passW - 70, wishH);

  ctx.fillStyle = "#993c1d";
  ctx.textAlign = "left";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("📜 LỜI NGUYỆN CẤT CÁNH / MISSION STATEMENT:", passX + 55, wishY + 45);

  // Multi-line dream content
  ctx.fillStyle = "#1e293b";
  ctx.font = "italic 28px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";

  const rawLines = dream.content.split("\n");
  const lines: string[] = [];
  const maxW = passW - 130;

  rawLines.forEach((raw) => {
    const words = raw.split(" ");
    let line = "";
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
  });

  const textStartY = wishY + 110;
  lines.slice(0, 5).forEach((l, idx) => {
    ctx.fillText(`“ ${l} ”`, passX + passW / 2, textStartY + idx * 46);
  });

  // Mascot Sticker
  try {
    const mascotImg = new Image();
    mascotImg.crossOrigin = "anonymous";
    mascotImg.src = getBuggyMascotUrl(mascotIndex);
    await new Promise<void>((resolve) => {
      mascotImg.onload = () => {
        ctx.drawImage(mascotImg, passX + passW - 190, wishY + wishH - 160, 140, 140);
        resolve();
      };
      mascotImg.onerror = () => resolve();
      setTimeout(resolve, 800);
    });
  } catch {
    // ignore
  }

  // 6. AUTHENTIC DEVER RUBBER VISA STAMP
  const stampInfo = getDeverStampInfo(dream.stampVariant, theme);
  ctx.save();
  ctx.translate(passX + 175, wishY + wishH - 75);
  ctx.rotate((-13 * Math.PI) / 180);

  // Outer double stamp border
  ctx.strokeStyle = stampInfo.color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-135, -55, 270, 110, 16);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-128, -48, 256, 96, 12);
  ctx.stroke();

  // Semi-transparent ink tint
  ctx.fillStyle = `${stampInfo.color}15`;
  ctx.beginPath();
  ctx.roundRect(-128, -48, 256, 96, 12);
  ctx.fill();

  // Draw Official Stamp Emblem Image (on the left)
  const stampSize = 74;
  try {
    const stampImg = new Image();
    stampImg.crossOrigin = "anonymous";
    stampImg.src = stampInfo.image;
    await new Promise<void>((resolve) => {
      stampImg.onload = () => {
        ctx.drawImage(stampImg, -120, -37, stampSize, stampSize);
        resolve();
      };
      stampImg.onerror = () => resolve();
      setTimeout(resolve, 800);
    });
  } catch {
    // fallback
  }

  // Text on the right of stamp
  ctx.textAlign = "left";
  ctx.fillStyle = stampInfo.color;
  ctx.font = "black 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace";
  ctx.fillText("★ FU-DEVER VERIFIED ★", -35, -12);

  ctx.font = "bold 14px monospace";
  ctx.fillText("ONBOARDED · CLUB DAY 2026", -35, 12);

  ctx.font = "bold 11px monospace";
  ctx.fillText(stampInfo.label.toUpperCase(), -35, 32);

  ctx.restore();

  // 7. PERFORATED DASHED LINE
  ctx.save();
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(passX + 35, notchY);
  ctx.lineTo(passX + passW - 35, notchY);
  ctx.stroke();
  ctx.restore();

  // 8. TICKET STUB BOTTOM SECTION
  const stubY = notchY + 45;

  // Barcode lines generator
  ctx.fillStyle = "#0f172a";
  const barcodeX = passX + 60;
  const barcodeW = passW - 120;
  const barcodeH = 110;

  let currentBX = barcodeX;
  const barPattern = [3, 1, 4, 2, 1, 5, 2, 4, 1, 3, 2, 4, 6, 2, 1, 3, 4, 1, 2, 5, 2, 1, 4, 3, 2, 5, 1, 4, 2, 3, 1, 5, 2, 3, 4];
  barPattern.forEach((w, idx) => {
    if (idx % 2 === 0) {
      ctx.fillRect(currentBX, stubY, w * 2.2, barcodeH);
    }
    currentBX += w * 4.2;
  });

  // Ticket Serial Number
  ctx.textAlign = "center";
  ctx.fillStyle = "#475569";
  ctx.font = "bold 20px monospace";
  ctx.fillText(`SN: DEVER-K22-FPTU-${Date.now().toString(36).toUpperCase()}`, passX + passW / 2, stubY + barcodeH + 35);

  // Footer Branding & Hashtags
  ctx.fillStyle = "#0f172a";
  ctx.font = "black 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("CLB LẬP TRÌNH FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG", passX + passW / 2, stubY + barcodeH + 80);

  ctx.fillStyle = "#993c1d";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(EVENT_INFO.hashtags.join("    "), passX + passW / 2, stubY + barcodeH + 120);

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

