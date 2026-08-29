/**
 * High-performance HTML5 Canvas renderer for 9:16 (1080x1920) Story Cards.
 * Features 2 distinct styles:
 * 1. Thiệp Lụa Hoa Đăng & Thư Gấm Hoàng Gia (Classical Royal Silk Scroll with Postage Stamp & Imperial Seal)
 * 2. Vé Lên Tàu Vũ Trụ DEVER K22 (Luxury Retro Cosmic Boarding Pass with Perforated Stub, Barcode & Visa Stamp)
 */

import { Dream } from "@/types/dream";
import {
  EVENT_INFO,
  DREAM_CATEGORIES,
  getBuggyMascotUrl,
  getDeverStampInfo,
} from "./constants";

export interface RenderCardOptions {
  width?: number;
  height?: number;
}

// Robust typography constants (prevents glyph splitting on Windows Canvas)
const FONT_SANS = "-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace";
const FONT_SERIF = "'Playfair Display', 'Merriweather', 'Times New Roman', serif";

/**
 * Cleanly normalizes Vietnamese text to NFC to prevent accent/glyph splitting bugs in Canvas.
 */
function cleanVietnameseText(text: string): string {
  if (!text) return "";
  return text.normalize("NFC").trim();
}

/**
 * ----------------------------------------------------
 * STYLE 1: THIỆP LỤA HOA ĐĂNG & THƯ GẤM HOÀNG GIA
 * ----------------------------------------------------
 */
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
  const category = DREAM_CATEGORIES.find((c) => c.id === dream.tag);
  const stampInfo = getDeverStampInfo(dream.stampVariant, theme);

  // Theme Palette Tokens
  let bgTop = "#0f172a";
  let bgMid = "#1e112a";
  let bgBot = "#12203A";
  let primaryGold = "#FAC775";
  let secondaryGold = "#FFD166";
  let cardBgGradStart = "rgba(42, 16, 16, 0.92)";
  let cardBgGradEnd = "rgba(18, 32, 58, 0.96)";

  if (theme === "tech") {
    bgTop = "#040914";
    bgMid = "#081b33";
    bgBot = "#020813";
    primaryGold = "#00F5D4";
    secondaryGold = "#0091EA";
    cardBgGradStart = "rgba(4, 25, 48, 0.92)";
    cardBgGradEnd = "rgba(2, 10, 24, 0.97)";
  } else if (theme === "gold") {
    bgTop = "#1a0f00";
    bgMid = "#382004";
    bgBot = "#150a00";
    primaryGold = "#FFD166";
    secondaryGold = "#FAC775";
    cardBgGradStart = "rgba(60, 34, 4, 0.92)";
    cardBgGradEnd = "rgba(24, 12, 0, 0.97)";
  }

  // 1. BACKGROUND WITH SILK TEXTURE & GOLD DUST
  const mainGrad = ctx.createLinearGradient(0, 0, 0, height);
  mainGrad.addColorStop(0, bgTop);
  mainGrad.addColorStop(0.5, bgMid);
  mainGrad.addColorStop(1, bgBot);
  ctx.fillStyle = mainGrad;
  ctx.fillRect(0, 0, width, height);

  // Gold dust specks in celestial background
  for (let i = 0; i < 50; i++) {
    const gx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
    const gy = (Math.cos(i * 33) * 0.5 + 0.5) * height;
    const gr = i % 3 === 0 ? 3 : 1.5;
    ctx.fillStyle = i % 2 === 0 ? "rgba(250, 199, 117, 0.65)" : "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. MAIN SILK SCROLL CONTAINER
  const cardX = 70;
  const cardY = 85;
  const cardW = width - 140;
  const cardH = height - 170;

  // Outer decorative glow
  ctx.save();
  ctx.shadowColor = primaryGold;
  ctx.shadowBlur = 30;
  ctx.fillStyle = `${primaryGold}15`;
  ctx.beginPath();
  ctx.roundRect(cardX - 4, cardY - 4, cardW + 8, cardH + 8, 38);
  ctx.fill();
  ctx.restore();

  // Silk Parchment Body
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGrad.addColorStop(0, cardBgGradStart);
  cardGrad.addColorStop(1, cardBgGradEnd);
  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 32);
  ctx.fill();

  // Double Gold Border
  ctx.strokeStyle = primaryGold;
  ctx.lineWidth = 4.5;
  ctx.stroke();

  ctx.strokeStyle = `${secondaryGold}66`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX + 14, cardY + 14, cardW - 28, cardH - 28, 22);
  ctx.stroke();

  // 3. ORIENTAL CLOUD CORNER FILIGREE
  const drawCornerCloud = (cx: number, cy: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, flipY);
    ctx.strokeStyle = secondaryGold;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.lineTo(0, 0);
    ctx.lineTo(36, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(16, 16, 8, Math.PI, 1.5 * Math.PI);
    ctx.stroke();
    ctx.restore();
  };

  drawCornerCloud(cardX + 26, cardY + 26, 1, 1);
  drawCornerCloud(cardX + cardW - 26, cardY + 26, -1, 1);
  drawCornerCloud(cardX + 26, cardY + cardH - 26, 1, -1);
  drawCornerCloud(cardX + cardW - 26, cardY + cardH - 26, -1, -1);

  // 4. HEADER: IMPERIAL EVENT BANNER
  const bannerY = cardY + 60;
  ctx.textAlign = "center";
  ctx.fillStyle = primaryGold;
  ctx.font = `bold 22px ${FONT_SANS}`;
  ctx.fillText("✦ BẢNG VÀNG HOA ĐĂNG · TRUNG THU ĐẠI HỘI ✦", width / 2, bannerY);

  ctx.fillStyle = theme === "gold" ? "#ffe8a3" : "#ffffff";
  ctx.font = `900 52px ${FONT_SANS}`;
  ctx.fillText(cleanVietnameseText("DEPLOY ƯỚC MƠ"), width / 2, bannerY + 60);

  ctx.fillStyle = `${primaryGold}dd`;
  ctx.font = `bold 22px ${FONT_SANS}`;
  ctx.fillText(cleanVietnameseText("NGÀY HỘI CLB FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG"), width / 2, bannerY + 102);

  // Filigree divider line
  ctx.strokeStyle = `${primaryGold}55`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 80, bannerY + 130);
  ctx.lineTo(width / 2 - 40, bannerY + 130);
  ctx.moveTo(width / 2 + 40, bannerY + 130);
  ctx.lineTo(cardX + cardW - 80, bannerY + 130);
  ctx.stroke();

  ctx.fillStyle = primaryGold;
  ctx.beginPath();
  ctx.arc(width / 2, bannerY + 130, 5, 0, Math.PI * 2);
  ctx.fill();

  // 5. UPPER SECTION: PASSENGER NAMEPLATE & POSTAGE STAMP
  const upperY = bannerY + 155;
  const stampBoxW = 200;
  const stampBoxH = 200;
  const stampBoxX = cardX + cardW - stampBoxW - 40;
  const stampBoxY = upperY;

  // Nameplate Cartouche Box on Left
  const rawName = dream.name && dream.name.trim().length > 0 ? dream.name.trim() : "TÂN SINH VIÊN K22";
  const cleanName = cleanVietnameseText(rawName);
  const nameBoxX = cardX + 40;
  const nameBoxY = upperY;
  const nameBoxW = cardW - stampBoxW - 90;
  const nameBoxH = 180;

  ctx.fillStyle = `${primaryGold}15`;
  ctx.beginPath();
  ctx.roundRect(nameBoxX, nameBoxY, nameBoxW, nameBoxH, 18);
  ctx.fill();
  ctx.strokeStyle = `${primaryGold}88`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Nameplate Header & Category Tag
  ctx.textAlign = "left";
  ctx.fillStyle = `${primaryGold}ee`;
  ctx.font = `bold 16px ${FONT_SANS}`;
  ctx.fillText("📜 HÀNH KHÁCH / KÝ DANH:", nameBoxX + 24, nameBoxY + 34);

  // Category Tag Pill
  if (category) {
    ctx.textAlign = "right";
    ctx.fillStyle = `${secondaryGold}ee`;
    ctx.font = `bold 16px ${FONT_SANS}`;
    const catShort = `${category.emoji} ${category.shortLabel}`;
    ctx.fillText(catShort, nameBoxX + nameBoxW - 24, nameBoxY + 34);
  }

  // Dynamic Name Typography with Width Clamping
  ctx.textAlign = "left";
  ctx.fillStyle = theme === "gold" ? "#ffd166" : "#ffffff";
  let nameFontSize = 34;
  ctx.font = `900 ${nameFontSize}px ${FONT_SANS}`;
  const maxNameW = nameBoxW - 48;
  while (ctx.measureText(cleanName.toUpperCase()).width > maxNameW && nameFontSize > 18) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px ${FONT_SANS}`;
  }
  ctx.fillText(cleanName.toUpperCase(), nameBoxX + 24, nameBoxY + 86);

  // Subtitle info
  ctx.fillStyle = `${primaryGold}aa`;
  ctx.font = `bold 15px ${FONT_MONO}`;
  ctx.fillText("✦ SỐ HIỆU ƯỚC MƠ: #FU-DEVER-K22 ✦", nameBoxX + 24, nameBoxY + 134);

  // 6. POSTAGE STAMP ON RIGHT
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(stampBoxX, stampBoxY, stampBoxW, stampBoxH, 14);
  ctx.fill();

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Stamp inner dotted line
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.roundRect(stampBoxX + 8, stampBoxY + 8, stampBoxW - 16, stampBoxH - 16, 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Stamp Mascot Image
  try {
    const mascotSrc = getBuggyMascotUrl(mascotIndex);
    const mascotImg = new Image();
    mascotImg.crossOrigin = "anonymous";
    mascotImg.src = mascotSrc;
    await new Promise<void>((resolve) => {
      mascotImg.onload = () => {
        ctx.drawImage(mascotImg, stampBoxX + 25, stampBoxY + 18, stampBoxW - 50, stampBoxH - 68);
        resolve();
      };
      mascotImg.onerror = () => resolve();
      setTimeout(resolve, 600);
    });
  } catch {
    // fallback
  }

  // Stamp footer label
  ctx.fillStyle = "#0f172a";
  ctx.textAlign = "center";
  ctx.font = `900 13px ${FONT_MONO}`;
  ctx.fillText("★ VIP DEV ★", stampBoxX + stampBoxW / 2, stampBoxY + stampBoxH - 16);
  ctx.restore();

  // 7. IMPERIAL VERMILION SEAL (Cleanly Anchored at stamp intersection)
  ctx.save();
  ctx.translate(stampBoxX - 10, stampBoxY + stampBoxH - 25);
  ctx.rotate((-8 * Math.PI) / 180);

  ctx.strokeStyle = stampInfo.color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 50, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `${stampInfo.color}20`;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.fill();

  try {
    const stampImg = new Image();
    stampImg.crossOrigin = "anonymous";
    stampImg.src = stampInfo.image;
    await new Promise<void>((resolve) => {
      stampImg.onload = () => {
        ctx.drawImage(stampImg, -32, -32, 64, 64);
        resolve();
      };
      stampImg.onerror = () => resolve();
      setTimeout(resolve, 500);
    });
  } catch {
    // fallback
  }
  ctx.restore();

  // 8. DREAM MANIFESTO BOX (LỜI NGUYỆN CẤT CÁNH)
  const quoteBoxX = cardX + 40;
  const quoteBoxY = upperY + 215;
  const quoteBoxW = cardW - 80;
  const quoteBoxH = cardH - 590;

  ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
  ctx.beginPath();
  ctx.roundRect(quoteBoxX, quoteBoxY, quoteBoxW, quoteBoxH, 22);
  ctx.fill();

  ctx.strokeStyle = `${primaryGold}44`;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = primaryGold;
  ctx.textAlign = "center";
  ctx.font = `bold 22px ${FONT_SANS}`;
  ctx.fillText("✦ LỜI NGUYỆN CẤT CÁNH CÙNG HOA ĐĂNG ✦", width / 2, quoteBoxY + 50);

  // Format and wrap clean Vietnamese text
  const cleanContent = cleanVietnameseText(dream.content);
  const maxContentW = quoteBoxW - 100;

  let fontSize = 34;
  if (cleanContent.length > 200) fontSize = 26;
  else if (cleanContent.length > 100) fontSize = 30;

  ctx.font = `600 ${fontSize}px ${FONT_SANS}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  const words = cleanContent.split(" ");
  const contentLines: string[] = [];
  let curLine = "";
  words.forEach((w) => {
    const test = curLine ? `${curLine} ${w}` : w;
    if (ctx.measureText(test).width > maxContentW && curLine) {
      contentLines.push(curLine);
      curLine = w;
    } else {
      curLine = test;
    }
  });
  if (curLine) contentLines.push(curLine);

  const lineH = fontSize * 1.65;
  const totalH = contentLines.length * lineH;
  const startTextY = quoteBoxY + 110 + Math.max(0, (quoteBoxH - 160 - totalH) / 2);

  contentLines.slice(0, 6).forEach((l, idx) => {
    ctx.fillText(l, width / 2, startTextY + idx * lineH);
  });

  // 9. FOOTER SECTION
  const footerY = cardY + cardH - 165;

  // FU-DEVER Emblem
  const logoW = 115;
  const logoH = 115;
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "/assets/logo/logo-dever-white.png";
    await new Promise<void>((resolve) => {
      logoImg.onload = () => {
        ctx.drawImage(logoImg, (width - logoW) / 2, footerY - 15, logoW, logoH);
        resolve();
      };
      logoImg.onerror = () => resolve();
      setTimeout(resolve, 500);
    });
  } catch {
    ctx.fillStyle = primaryGold;
    ctx.font = `900 32px ${FONT_SANS}`;
    ctx.fillText("FU-DEVER", width / 2, footerY + 45);
  }

  ctx.fillStyle = theme === "gold" ? "#ffe8a3" : "#faeeda";
  ctx.font = `bold 24px ${FONT_SANS}`;
  ctx.fillText(cleanVietnameseText("CLB LẬP TRÌNH FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG"), width / 2, footerY + logoH + 25);

  ctx.fillStyle = primaryGold;
  ctx.font = `bold 20px ${FONT_SANS}`;
  ctx.fillText(EVENT_INFO.hashtags.join("    "), width / 2, footerY + logoH + 62);

  return canvas.toDataURL("image/png");
}

/**
 * ----------------------------------------------------
 * STYLE 2: VÉ LÊN TÀU VŨ TRỤ DEVER K22 (RETRO COSMIC BOARDING PASS)
 * ----------------------------------------------------
 */
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
  const stampInfo = getDeverStampInfo(dream.stampVariant, theme);

  // Clean Vietnamese text to avoid accent bugs
  const passengerName = cleanVietnameseText(dream.name || "TÂN SINH VIÊN K22").toUpperCase();
  const rawWish = cleanVietnameseText(dream.content);

  // 1. LUXURY COSMIC BACKGROUND
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (theme === "tech") {
    bgGrad.addColorStop(0, "#030712");
    bgGrad.addColorStop(0.5, "#0b1d3a");
    bgGrad.addColorStop(1, "#020617");
  } else if (theme === "gold") {
    bgGrad.addColorStop(0, "#1f1001");
    bgGrad.addColorStop(0.5, "#3d2105");
    bgGrad.addColorStop(1, "#120800");
  } else {
    bgGrad.addColorStop(0, "#150406");
    bgGrad.addColorStop(0.5, "#2b0d12");
    bgGrad.addColorStop(1, "#12203A");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Stardust
  ctx.fillStyle = "rgba(250, 199, 117, 0.75)";
  for (let i = 0; i < 45; i++) {
    const sx = (Math.sin(i * 77) * 0.5 + 0.5) * width;
    const sy = (Math.cos(i * 41) * 0.5 + 0.5) * height;
    ctx.beginPath();
    ctx.arc(sx, sy, i % 3 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. BOARDING PASS TICKET BODY CONTAINER
  const passX = 75;
  const passY = 80;
  const passW = width - 150;
  const passH = height - 160;
  const notchY = passY + 1250; // Perforation notch position
  const notchRadius = 34;

  // Draw Ticket Shape with smooth inward notches
  const drawTicketOutline = () => {
    ctx.beginPath();
    ctx.moveTo(passX + 36, passY);
    ctx.lineTo(passX + passW - 36, passY);
    ctx.arcTo(passX + passW, passY, passX + passW, passY + 36, 36);

    // Right Edge with inward notch
    ctx.lineTo(passX + passW, notchY - notchRadius);
    ctx.arc(passX + passW, notchY, notchRadius, -Math.PI / 2, Math.PI / 2, true);
    ctx.lineTo(passX + passW, passY + passH - 36);
    ctx.arcTo(passX + passW, passY + passH, passX + passW - 36, passY + passH, 36);

    // Bottom Edge
    ctx.lineTo(passX + 36, passY + passH);
    ctx.arcTo(passX, passY + passH, passX, passY + passH - 36, 36);

    // Left Edge with inward notch
    ctx.lineTo(passX, notchY + notchRadius);
    ctx.arc(passX, notchY, notchRadius, Math.PI / 2, -Math.PI / 2, true);
    ctx.lineTo(passX, passY + 36);
    ctx.arcTo(passX, passY, passX + 36, passY, 36);
    ctx.closePath();
  };

  // Outer drop shadow for realistic ticket feel
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 15;
  ctx.fillStyle = "#ffffff";
  drawTicketOutline();
  ctx.fill();
  ctx.restore();

  // Ticket Outer Golden / Cyan Border
  ctx.strokeStyle = theme === "tech" ? "#00f5d4" : theme === "gold" ? "#ffd166" : "#fac775";
  ctx.lineWidth = 5;
  drawTicketOutline();
  ctx.stroke();

  // 3. TICKET HEADER (Aerospace Branding)
  const headerH = 200;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(passX, passY, passW, headerH, [36, 36, 0, 0]);
  ctx.clip();

  const headGrad = ctx.createLinearGradient(passX, passY, passX + passW, passY);
  if (theme === "tech") {
    headGrad.addColorStop(0, "#0055a5");
    headGrad.addColorStop(1, "#0091ea");
  } else if (theme === "gold") {
    headGrad.addColorStop(0, "#8a5800");
    headGrad.addColorStop(1, "#c88a10");
  } else {
    headGrad.addColorStop(0, "#712b13");
    headGrad.addColorStop(0.5, "#993c1d");
    headGrad.addColorStop(1, "#b94522");
  }
  ctx.fillStyle = headGrad;
  ctx.fillRect(passX, passY, passW, headerH);
  ctx.restore();

  // Header Typography
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = `900 42px ${FONT_SANS}`;
  ctx.fillText("FU-DEVER SPACEWAYS", passX + 50, passY + 80);

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.font = `bold 20px ${FONT_SANS}`;
  ctx.fillText(cleanVietnameseText("BOARDING PASS · VÉ LÊN TÀU VŨ TRỤ K22"), passX + 50, passY + 126);

  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = `bold 15px ${FONT_MONO}`;
  ctx.fillText("FLIGHT OPERATED BY FU-DEVER AERO", passX + 50, passY + 158);

  ctx.textAlign = "right";
  ctx.fillStyle = "#ffd166";
  ctx.font = `900 34px ${FONT_MONO}`;
  ctx.fillText("FIRST CLASS", passX + passW - 50, passY + 95);

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = `bold 18px ${FONT_MONO}`;
  ctx.fillText("VIP DREAMER", passX + passW - 50, passY + 138);

  // 4. FLIGHT PARAMETER MATRIX (2 Rows with Dedicated Safe Widths)
  const gridY1 = passY + headerH + 45;

  // Row 1: 3 Columns
  const drawCol1 = (label: string, value: string, x: number) => {
    ctx.textAlign = "left";
    ctx.font = `bold 16px ${FONT_SANS}`;
    ctx.fillStyle = "#64748b";
    ctx.fillText(cleanVietnameseText(label), x, gridY1);

    ctx.font = `900 28px ${FONT_SANS}`;
    ctx.fillStyle = "#0f172a";
    ctx.fillText(cleanVietnameseText(value), x, gridY1 + 36);
  };

  drawCol1("FLIGHT / CHUYẾN BAY", "DEVER-K22", passX + 50);
  drawCol1("GATE / CỔNG", "01 (FPTU DAD)", passX + 350);
  drawCol1("SEAT / GHẾ", "22A (VIP DEV)", passX + 640);

  // Row 2: 2 Bounded Columns (Passenger on left max 500px, Category on right)
  const gridY2 = gridY1 + 95;

  // Passenger Col
  ctx.textAlign = "left";
  ctx.font = `bold 16px ${FONT_SANS}`;
  ctx.fillStyle = "#64748b";
  ctx.fillText("PASSENGER / HÀNH KHÁCH", passX + 50, gridY2);

  // Dynamic Passenger Name with measureText clamp so it NEVER touches Category Col
  let passFontSize = 28;
  ctx.font = `900 ${passFontSize}px ${FONT_SANS}`;
  const maxPassW = 460;
  while (ctx.measureText(passengerName).width > maxPassW && passFontSize > 18) {
    passFontSize -= 2;
    ctx.font = `900 ${passFontSize}px ${FONT_SANS}`;
  }
  ctx.fillStyle = "#993c1d";
  ctx.fillText(passengerName, passX + 50, gridY2 + 36);

  // Category Col (Uses shortLabel to avoid right edge blowout)
  const catX = passX + 560;
  ctx.font = `bold 16px ${FONT_SANS}`;
  ctx.fillStyle = "#64748b";
  ctx.fillText("CATEGORY / CHUYÊN MỤC", catX, gridY2);

  ctx.font = `900 26px ${FONT_SANS}`;
  ctx.fillStyle = "#0f172a";
  const catShort = `${category?.emoji || "✨"} ${category?.shortLabel || "Ước Mơ"}`;
  ctx.fillText(cleanVietnameseText(catShort), catX, gridY2 + 36);

  // 5. ROUTE FLIGHT PATH BANNER
  const routeY = gridY2 + 88;
  const routeH = 75;

  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.roundRect(passX + 40, routeY, passW - 80, routeH, 16);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#0f172a";
  ctx.font = `900 22px ${FONT_SANS}`;
  ctx.fillText("FPTU DA NANG (DAD)", passX + 65, routeY + 45);

  ctx.textAlign = "center";
  ctx.fillStyle = "#993c1d";
  ctx.font = `bold 22px ${FONT_MONO}`;
  ctx.fillText("✈ ─── 🚀 ─── 🏮", passX + passW / 2, routeY + 45);

  ctx.textAlign = "right";
  ctx.fillStyle = "#0091ea";
  ctx.font = `900 22px ${FONT_SANS}`;
  ctx.fillText("DEVER PLANET (DEV)", passX + passW - 65, routeY + 45);

  // 6. DREAM MANIFESTO / MISSION STATEMENT BOX
  const wishY = routeY + 105;
  const wishH = 440;

  ctx.fillStyle = "#fffdf9";
  ctx.beginPath();
  ctx.roundRect(passX + 40, wishY, passW - 80, wishH, 20);
  ctx.fill();

  ctx.strokeStyle = theme === "tech" ? "#00f5d4" : theme === "gold" ? "#fac775" : "#fed7aa";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "#993c1d";
  ctx.textAlign = "left";
  ctx.font = `900 20px ${FONT_SANS}`;
  ctx.fillText(cleanVietnameseText("📜 LỜI NGUYỆN CẤT CÁNH / MISSION STATEMENT:"), passX + 65, wishY + 42);

  // Quotation marks decoration
  ctx.fillStyle = "rgba(153, 60, 29, 0.22)";
  ctx.font = `900 58px ${FONT_SERIF}`;
  ctx.fillText("“", passX + 60, wishY + 98);

  // Text Wrapping with clean Vietnamese typography strictly in upper 62% of box
  const wishMaxW = passW - 160;
  let wishFontSize = 30;
  if (rawWish.length > 180) wishFontSize = 24;
  else if (rawWish.length > 90) wishFontSize = 27;

  ctx.font = `600 ${wishFontSize}px ${FONT_SANS}`;
  ctx.fillStyle = "#1e293b";
  ctx.textAlign = "center";

  const wishWords = rawWish.split(" ");
  const wishLines: string[] = [];
  let curWishLine = "";
  wishWords.forEach((w) => {
    const test = curWishLine ? `${curWishLine} ${w}` : w;
    if (ctx.measureText(test).width > wishMaxW && curWishLine) {
      wishLines.push(curWishLine);
      curWishLine = w;
    } else {
      curWishLine = test;
    }
  });
  if (curWishLine) wishLines.push(curWishLine);

  const wishLineH = wishFontSize * 1.55;
  const wishMaxUpperH = wishH - 180;
  const wishTextStartY = wishY + 105 + Math.max(0, (wishMaxUpperH - wishLines.length * wishLineH) / 2);

  wishLines.slice(0, 5).forEach((line, idx) => {
    ctx.fillText(line, passX + passW / 2, wishTextStartY + idx * wishLineH);
  });

  // Mascot Buggy Badge on Bottom Right of Manifesto
  try {
    const mascotImg = new Image();
    mascotImg.crossOrigin = "anonymous";
    mascotImg.src = getBuggyMascotUrl(mascotIndex);
    await new Promise<void>((resolve) => {
      mascotImg.onload = () => {
        ctx.drawImage(mascotImg, passX + passW - 200, wishY + wishH - 165, 145, 145);
        resolve();
      };
      mascotImg.onerror = () => resolve();
      setTimeout(resolve, 600);
    });
  } catch {
    // ignore
  }

  // Authentic Rectangular Visa Stamp on Bottom Left of Manifesto (Rotated -5deg for crisp alignment)
  ctx.save();
  ctx.translate(passX + 225, wishY + wishH - 80);
  ctx.rotate((-5 * Math.PI) / 180);

  const stampW = 340;
  const stampH = 115;
  const stampHalfW = stampW / 2;
  const stampHalfH = stampH / 2;

  ctx.strokeStyle = stampInfo.color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-stampHalfW, -stampHalfH, stampW, stampH, 14);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-stampHalfW + 6, -stampHalfH + 6, stampW - 12, stampH - 12, 10);
  ctx.stroke();

  ctx.fillStyle = `${stampInfo.color}18`;
  ctx.beginPath();
  ctx.roundRect(-stampHalfW + 6, -stampHalfH + 6, stampW - 12, stampH - 12, 10);
  ctx.fill();

  // Stamp Emblem on Left
  const stampIconSize = 68;
  try {
    const stampImg = new Image();
    stampImg.crossOrigin = "anonymous";
    stampImg.src = stampInfo.image;
    await new Promise<void>((resolve) => {
      stampImg.onload = () => {
        ctx.drawImage(stampImg, -stampHalfW + 16, -stampIconSize / 2, stampIconSize, stampIconSize);
        resolve();
      };
      stampImg.onerror = () => resolve();
      setTimeout(resolve, 600);
    });
  } catch {
    // fallback
  }

  // Stamp Text on Right with Perfect Baseline Math & High-Contrast Typography
  ctx.textAlign = "left";
  ctx.fillStyle = stampInfo.color;
  const stampTextX = -stampHalfW + stampIconSize + 28;

  ctx.font = `900 17px ${FONT_MONO}`;
  ctx.fillText("★ FU-DEVER VERIFIED ★", stampTextX, -16);

  ctx.font = `bold 13px ${FONT_MONO}`;
  ctx.fillText("ONBOARDED · CLUB DAY 2026", stampTextX, 8);

  ctx.font = `bold 12px ${FONT_MONO}`;
  ctx.fillText("OFFICIAL EMBLEM · APPROVED", stampTextX, 28);
  ctx.restore();

  // 7. PERFORATED DASHED TEAR LINE
  ctx.save();
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 3.5;
  ctx.setLineDash([16, 12]);
  ctx.beginPath();
  ctx.moveTo(passX + notchRadius + 10, notchY);
  ctx.lineTo(passX + passW - notchRadius - 10, notchY);
  ctx.stroke();
  ctx.restore();

  // 8. TICKET STUB BOTTOM SECTION (LUXURY FLIGHT COUPON)
  const stubY = notchY + 35;

  // Boarding Instruction Pill
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.roundRect(passX + 50, stubY, passW - 100, 46, 12);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#475569";
  ctx.font = `bold 15px ${FONT_MONO}`;
  ctx.fillText("BOARDING TIME: 18:30 · PLEASE BE AT BOOTH GATE 10 MINS BEFORE TAKEOFF", passX + passW / 2, stubY + 28);

  // Vector Barcode Generator
  const barcodeY = stubY + 68;
  const barcodeX = passX + 60;
  const barcodeW = passW - 120;
  const barcodeH = 100;

  ctx.fillStyle = "#0f172a";
  let currentBX = barcodeX;
  const barPattern = [
    3, 1, 4, 2, 1, 5, 2, 4, 1, 3, 2, 4, 6, 2, 1, 3, 4, 1, 2, 5, 2, 1, 4, 3, 2, 5, 1, 4, 2, 3, 1, 5, 2, 3, 4, 2, 1, 5, 3, 2, 4
  ];
  barPattern.forEach((w, idx) => {
    if (idx % 2 === 0) {
      ctx.fillRect(currentBX, barcodeY, w * 2.1, barcodeH);
    }
    currentBX += w * 3.7;
  });

  // Ticket Serial Number
  ctx.textAlign = "center";
  ctx.fillStyle = "#334155";
  ctx.font = `bold 20px ${FONT_MONO}`;
  ctx.fillText("SN: DEVER-K22-FPTU-2026", passX + passW / 2, barcodeY + barcodeH + 32);

  // Footer Branding & Social Hashtags
  ctx.fillStyle = "#0f172a";
  ctx.font = `900 24px ${FONT_SANS}`;
  ctx.fillText(cleanVietnameseText("CLB LẬP TRÌNH FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG"), passX + passW / 2, barcodeY + barcodeH + 78);

  ctx.fillStyle = "#993c1d";
  ctx.font = `bold 20px ${FONT_SANS}`;
  ctx.fillText(EVENT_INFO.hashtags.join("    "), passX + passW / 2, barcodeY + barcodeH + 116);

  return canvas.toDataURL("image/png");
}

export function downloadDreamCard(dataUrl: string, filename = "Deploy_Uoc_Mo_FU_DEVER.png") {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
