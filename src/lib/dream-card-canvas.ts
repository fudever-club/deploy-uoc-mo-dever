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
  const mascotIndex = dream.mascotIndex || "11";
  const categoryInfo = DREAM_CATEGORIES.find((c) => c.id === dream.tag);
  const stampInfo = getDeverStampInfo(dream.stampVariant, theme);

  // 1. CLASSICAL SILK & CELESTIAL BACKGROUND
  if (theme === "tech") {
    // Cyber Silk Space
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#030814");
    bgGrad.addColorStop(0.3, "#071733");
    bgGrad.addColorStop(0.7, "#0c2856");
    bgGrad.addColorStop(1, "#020610");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Radiant Cyan Star Aura
    const aura = ctx.createRadialGradient(width * 0.5, 260, 20, width * 0.5, 260, 480);
    aura.addColorStop(0, "rgba(0, 245, 212, 0.35)");
    aura.addColorStop(0.5, "rgba(0, 145, 234, 0.15)");
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(width * 0.5, 260, 480, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === "gold") {
    // Imperial Golden Silk Decree
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#261300");
    bgGrad.addColorStop(0.25, "#4d2b02");
    bgGrad.addColorStop(0.65, "#7a4605");
    bgGrad.addColorStop(0.9, "#a6680a");
    bgGrad.addColorStop(1, "#1c0c00");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Golden Full Moon
    const moon = ctx.createRadialGradient(width * 0.5, 240, 30, width * 0.5, 240, 420);
    moon.addColorStop(0, "rgba(255, 223, 128, 0.7)");
    moon.addColorStop(0.4, "rgba(250, 199, 117, 0.25)");
    moon.addColorStop(0.8, "rgba(255, 209, 102, 0.08)");
    moon.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = moon;
    ctx.beginPath();
    ctx.arc(width * 0.5, 240, 420, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Royal Crimson Lantern Heritage
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#230404");
    bgGrad.addColorStop(0.25, "#520c07");
    bgGrad.addColorStop(0.65, "#802011");
    bgGrad.addColorStop(0.88, "#993c1d");
    bgGrad.addColorStop(1, "#1a0202");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Warm Lantern Horizon Glow
    const moon = ctx.createRadialGradient(width * 0.5, 240, 20, width * 0.5, 240, 400);
    moon.addColorStop(0, "rgba(255, 214, 153, 0.65)");
    moon.addColorStop(0.35, "rgba(250, 199, 117, 0.3)");
    moon.addColorStop(0.7, "rgba(153, 60, 29, 0.15)");
    moon.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = moon;
    ctx.beginPath();
    ctx.arc(width * 0.5, 240, 400, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. SUBTLE GOLD DUST & SILK SPECKS
  const goldColor = theme === "tech" ? "rgba(0, 245, 212, " : theme === "gold" ? "rgba(255, 223, 128, " : "rgba(250, 199, 117, ";
  const specks = [
    [100, 120, 3, 0.8], [220, 250, 2, 0.6], [880, 180, 4, 0.9], [960, 420, 2.5, 0.7],
    [140, 580, 3.5, 0.85], [920, 920, 2, 0.5], [120, 1280, 3, 0.7], [940, 1420, 3.5, 0.85],
    [320, 160, 2, 0.5], [760, 280, 2.5, 0.6], [180, 950, 2, 0.4], [860, 1220, 3, 0.7],
    [540, 130, 4, 0.9], [420, 380, 2, 0.5], [680, 410, 2.5, 0.6], [500, 1820, 3, 0.7]
  ];
  specks.forEach(([x, y, r, a]) => {
    ctx.fillStyle = `${goldColor}${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. IMPERIAL DOUBLE-LINED FILIGREE BORDER
  const primaryGold = theme === "tech" ? "#00f5d4" : theme === "gold" ? "#ffd166" : "#fac775";
  const secondaryGold = theme === "tech" ? "#0091ea" : theme === "gold" ? "#b87c12" : "#993c1d";

  // Outer solid frame
  ctx.strokeStyle = primaryGold;
  ctx.lineWidth = 4;
  ctx.strokeRect(38, 38, width - 76, height - 76);

  // Inner dashed delicate border
  ctx.save();
  ctx.strokeStyle = `${primaryGold}bb`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(52, 52, width - 104, height - 104);
  ctx.restore();

  // Classical Oriental Cloud Filigree Corners
  const drawCornerFiligree = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = primaryGold;
    ctx.lineWidth = 2.5;

    // Corner bracket
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(0, 0);
    ctx.lineTo(40, 0);
    ctx.stroke();

    // Inner curve / cloud swirl
    ctx.beginPath();
    ctx.arc(16, 16, 12, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // Little diamond accent
    ctx.fillStyle = primaryGold;
    ctx.beginPath();
    ctx.arc(6, 6, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  drawCornerFiligree(62, 62, 0);
  drawCornerFiligree(width - 62, 62, Math.PI / 2);
  drawCornerFiligree(width - 62, height - 62, Math.PI);
  drawCornerFiligree(62, height - 62, -Math.PI / 2);

  // 4. HEADER: IMPERIAL CEREMONY BANNER & MOON LANTERN
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Top Ribbon / Dynasty header
  ctx.fillStyle = primaryGold;
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', serif";
  ctx.fillText("✦ BẢNG VÀNG HOA ĐĂNG · TRUNG THU ĐẠI HỘI ✦", width / 2, 115);

  // Main Event Proclamation Title
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = theme === "gold" ? "#fffbf0" : "#faeeda";
  ctx.font = "900 70px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif";
  ctx.fillText("DEPLOY ƯỚC MƠ", width / 2, 195);
  ctx.restore();

  // Subtitle / Date
  ctx.fillStyle = `${primaryGold}dd`;
  ctx.font = "24px -apple-system, BlinkMacSystemFont, 'Segoe UI', serif";
  ctx.fillText("NGÀY HỘI CLB FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG", width / 2, 255);

  // 5. CATEGORY GEMSTONE PILL
  if (categoryInfo) {
    const pillText = `${categoryInfo.emoji} ${categoryInfo.label}`;
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const pillW = ctx.measureText(pillText).width + 64;
    const pillH = 50;
    const pillX = (width - pillW) / 2;
    const pillY = 295;

    ctx.fillStyle = `${secondaryGold}44`;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 25);
    ctx.fill();

    ctx.strokeStyle = `${primaryGold}aa`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = primaryGold;
    ctx.fillText(pillText, width / 2, pillY + pillH / 2);
  }

  // 6. MAIN SILK SCROLL CONTENT CARD
  const cardX = 80;
  const cardY = 385;
  const cardW = width - 160;
  const cardH = 970;

  // Silk Card Background with rich gradient
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
  if (theme === "tech") {
    cardGrad.addColorStop(0, "rgba(4, 15, 36, 0.92)");
    cardGrad.addColorStop(1, "rgba(2, 8, 20, 0.95)");
  } else if (theme === "gold") {
    cardGrad.addColorStop(0, "rgba(42, 22, 2, 0.94)");
    cardGrad.addColorStop(1, "rgba(22, 11, 1, 0.96)");
  } else {
    cardGrad.addColorStop(0, "rgba(45, 9, 8, 0.92)");
    cardGrad.addColorStop(1, "rgba(22, 3, 3, 0.95)");
  }

  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  // Outer & Inner Gold Trim on Card
  ctx.strokeStyle = `${primaryGold}99`;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.strokeStyle = `${primaryGold}33`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cardX + 12, cardY + 12, cardW - 24, cardH - 24, 20);
  ctx.stroke();

  // 7. VINTAGE POSTAGE STAMP WITH PERFORATED EDGES (TOP RIGHT OF SCROLL)
  const stampBoxX = cardX + cardW - 190;
  const stampBoxY = cardY + 30;
  const stampBoxW = 160;
  const stampBoxH = 190;

  ctx.save();
  // Draw perforated stamp paper
  ctx.fillStyle = "#fffcf2";
  ctx.beginPath();
  ctx.roundRect(stampBoxX, stampBoxY, stampBoxW, stampBoxH, 6);
  ctx.fill();

  // Stamp inner artwork frame
  ctx.strokeStyle = secondaryGold;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(stampBoxX + 8, stampBoxY + 8, stampBoxW - 16, stampBoxH - 36);

  // Stamp Header
  ctx.fillStyle = secondaryGold;
  ctx.textAlign = "center";
  ctx.font = "black 10px monospace";
  ctx.fillText("FU-DEVER 2026", stampBoxX + stampBoxW / 2, stampBoxY + 18);

  // Draw Mascot Buggy on the Postage Stamp
  try {
    const mascotSrc = getBuggyMascotUrl(mascotIndex);
    const mascotImg = new Image();
    mascotImg.crossOrigin = "anonymous";
    mascotImg.src = mascotSrc;
    await new Promise<void>((resolve) => {
      mascotImg.onload = () => {
        ctx.drawImage(mascotImg, stampBoxX + 18, stampBoxY + 28, stampBoxW - 36, stampBoxH - 74);
        resolve();
      };
      mascotImg.onerror = () => resolve();
      setTimeout(resolve, 800);
    });
  } catch {
    // ignore
  }

  // Stamp Value / Denomination
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 12px monospace";
  ctx.fillText("★ VIP DEV ★", stampBoxX + stampBoxW / 2, stampBoxY + stampBoxH - 12);

  ctx.restore();

  // 8. IMPERIAL VERMILION SEAL DAMPENED ACROSS THE POSTAGE STAMP
  ctx.save();
  ctx.translate(stampBoxX - 10, stampBoxY + stampBoxH - 25);
  ctx.rotate((-14 * Math.PI) / 180);

  // Circular Double Seal Border
  ctx.strokeStyle = stampInfo.color;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `${stampInfo.color}22`;
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.fill();

  // Draw Chosen DEVER Stamp Emblem inside seal
  try {
    const stampImg = new Image();
    stampImg.crossOrigin = "anonymous";
    stampImg.src = stampInfo.image;
    await new Promise<void>((resolve) => {
      stampImg.onload = () => {
        ctx.drawImage(stampImg, -34, -34, 68, 68);
        resolve();
      };
      stampImg.onerror = () => resolve();
      setTimeout(resolve, 600);
    });
  } catch {
    // fallback text
  }
  ctx.restore();

  // 9. DREAMER NAME: IMPERIAL TABLET CARTOUCHE (BẢNG DANH VỊ)
  const dreamerName = dream.name && dream.name.trim().length > 0 ? dream.name.trim() : "TÂN SINH VIÊN K22";
  const nameBoxW = cardW - 240;
  const nameBoxX = cardX + 35;
  const nameBoxY = cardY + 45;

  ctx.save();
  ctx.fillStyle = `${primaryGold}18`;
  ctx.beginPath();
  ctx.roundRect(nameBoxX, nameBoxY, nameBoxW, 76, 16);
  ctx.fill();
  ctx.strokeStyle = `${primaryGold}77`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = `${primaryGold}cc`;
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace";
  ctx.fillText("📜 HÀNH KHÁCH / KÝ DANH:", nameBoxX + 22, nameBoxY + 28);

  ctx.fillStyle = theme === "gold" ? "#ffd166" : "#ffffff";
  ctx.font = "black 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(dreamerName.toUpperCase(), nameBoxX + 22, nameBoxY + 58);
  ctx.restore();

  // 10. THE MANIFESTO SCROLL / DREAM QUOTE
  const quoteBoxX = cardX + 35;
  const quoteBoxY = cardY + 240;
  const quoteBoxW = cardW - 70;
  const quoteBoxH = cardH - 280;

  // Inner parchment for content
  ctx.fillStyle = theme === "tech" ? "rgba(0, 245, 212, 0.04)" : "rgba(250, 199, 117, 0.05)";
  ctx.beginPath();
  ctx.roundRect(quoteBoxX, quoteBoxY, quoteBoxW, quoteBoxH, 18);
  ctx.fill();
  ctx.strokeStyle = `${primaryGold}33`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Section Header inside card
  ctx.fillStyle = primaryGold;
  ctx.textAlign = "center";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', serif";
  ctx.fillText("✦ LỜI NGUYỆN CẤT CÁNH CÙNG HOA ĐĂNG ✦", width / 2, quoteBoxY + 45);

  // Classical Opening Quote
  ctx.fillStyle = `${primaryGold}66`;
  ctx.font = "italic 72px Georgia, serif";
  ctx.fillText("『", quoteBoxX + 55, quoteBoxY + 110);

  // Dream Content Multi-line Wrapping
  const maxContentW = quoteBoxW - 130;
  const rawText = dream.content.trim();
  const rawParas = rawText.split(/\r?\n/);

  let fontSize = 34;
  if (rawText.length > 250 || rawParas.length > 6) fontSize = 25;
  else if (rawText.length > 140 || rawParas.length > 4) fontSize = 29;
  else if (rawText.length < 60 && rawParas.length <= 2) fontSize = 38;

  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif`;
  ctx.fillStyle = theme === "gold" ? "#fffdf5" : "#ffffff";
  ctx.textAlign = "center";

  const lines: string[] = [];
  for (const p of rawParas) {
    const trimmed = p.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }
    const words = trimmed.split(" ");
    let curLine = "";
    for (let i = 0; i < words.length; i++) {
      const test = curLine ? `${curLine} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxContentW && curLine) {
        lines.push(curLine);
        curLine = words[i];
      } else {
        curLine = test;
      }
    }
    if (curLine) lines.push(curLine);
  }

  const lineH = fontSize * 1.58;
  const totalTextH = lines.length * lineH;
  const textStartY = quoteBoxY + 120 + Math.max(0, (quoteBoxH - 220 - totalTextH) / 2);

  lines.slice(0, 9).forEach((line, idx) => {
    ctx.fillText(line, width / 2, textStartY + idx * lineH);
  });

  // Classical Closing Quote
  ctx.fillStyle = `${primaryGold}66`;
  ctx.font = "italic 72px Georgia, serif";
  ctx.fillText("』", width - quoteBoxX - 55, quoteBoxY + quoteBoxH - 45);

  // 11. FOOTER: OFFICIAL LOGO EMBLEM & VERIFICATION HASHTAGS
  const footerY = 1430;

  // Divider with diamond centerpiece
  ctx.strokeStyle = `${primaryGold}55`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, footerY);
  ctx.lineTo(width / 2 - 40, footerY);
  ctx.moveTo(width / 2 + 40, footerY);
  ctx.lineTo(width - 140, footerY);
  ctx.stroke();

  // Diamond icon in divider
  ctx.fillStyle = primaryGold;
  ctx.beginPath();
  ctx.arc(width / 2, footerY, 6, 0, Math.PI * 2);
  ctx.fill();

  // FU-DEVER White Emblem Logo
  const logoW = 145;
  const logoH = 145;
  const logoY = footerY + 25;
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
    ctx.fillStyle = primaryGold;
    ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText("FU-DEVER", width / 2, logoY + 70);
  }

  // Club Affiliation Title
  ctx.fillStyle = theme === "gold" ? "#ffeaa7" : "#faeeda";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("CLB LẬP TRÌNH FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG", width / 2, logoY + logoH + 45);

  // Social Hashtags
  ctx.fillStyle = primaryGold;
  ctx.font = "bold 23px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(EVENT_INFO.hashtags.join("   "), width / 2, logoY + logoH + 95);

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

