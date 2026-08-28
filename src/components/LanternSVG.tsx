"use client";

import React from "react";

export type LanternShape =
  | "hoian_lotus"     // Đèn Hội An Hoa Sen tròn
  | "star"            // Đèn Ông Sao truyền thống
  | "keoquan"         // Đèn Kéo Quân lục giác
  | "garlic_silk"     // Đèn Củ Tỏi Cung Đình
  | "carp_dragon"     // Đèn Cá Chép Vượt Vũ Môn
  | "cyber_dever";    // Đèn Lăng Kính Công Nghệ DEVER

export interface LanternShapeInfo {
  id: LanternShape;
  name: string;
  emoji: string;
  description: string;
  primaryColor: string;
}

export const LANTERN_SHAPES: LanternShapeInfo[] = [
  {
    id: "hoian_lotus",
    name: "Đèn Lụa Hội An",
    emoji: "🏮",
    description: "Dáng quả cầu hoa sen ấm áp, khung nan tre bọc lụa gấm truyền thống",
    primaryColor: "#E63946",
  },
  {
    id: "star",
    name: "Đèn Ông Sao",
    emoji: "⭐",
    description: "Ngôi sao 5 cánh rực rỡ tượng trưng cho ước mơ soi sáng màn đêm",
    primaryColor: "#FFB703",
  },
  {
    id: "keoquan",
    name: "Đèn Kéo Quân",
    emoji: "🏯",
    description: "Lục giác cung đình cổ truyền mang bóng hình văn hóa dân gian",
    primaryColor: "#993C1D",
  },
  {
    id: "garlic_silk",
    name: "Đèn Củ Tỏi Quý Tộc",
    emoji: "🪔",
    description: "Dáng đèn gốm lụa thon thả thanh nhã của phố cổ Hội An",
    primaryColor: "#FB8500",
  },
  {
    id: "carp_dragon",
    name: "Đèn Cá Chép Vượt Sóng",
    emoji: "🎏",
    description: "Biểu tượng đỗ đạt, kiên trì vượt vũ môn hóa rồng của sinh viên",
    primaryColor: "#0091EA",
  },
  {
    id: "cyber_dever",
    name: "Đèn Cyber Neon DEVER",
    emoji: "🚀",
    description: "Khối lăng kính công nghệ hologram phát sáng viền cyan neon",
    primaryColor: "#00F5D4",
  },
];

interface LanternSVGProps {
  shape?: LanternShape;
  size?: number;
  glow?: boolean;
  className?: string;
}

export const LanternSVG: React.FC<LanternSVGProps> = ({
  shape = "hoian_lotus",
  size = 64,
  glow = true,
  className = "",
}) => {
  const glowStyle = glow ? { filter: "drop-shadow(0 0 16px rgba(250, 199, 117, 0.65))" } : {};

  switch (shape) {
    // 1. ĐÈN ÔNG SAO (Traditional Five-pointed Star Lantern)
    case "star":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={glowStyle}
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF275" />
              <stop offset="50%" stopColor="#FF5722" />
              <stop offset="100%" stopColor="#B71C1C" />
            </radialGradient>
            <radialGradient id="centerCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#FAC775" />
              <stop offset="100%" stopColor="#FF9800" />
            </radialGradient>
          </defs>
          {/* Top Hanging Ring */}
          <circle cx="50" cy="8" r="4" fill="none" stroke="#FAC775" strokeWidth="2.5" />
          <line x1="50" y1="12" x2="50" y2="18" stroke="#FAC775" strokeWidth="2" />

          {/* Outer Star Frame */}
          <polygon
            points="50,18 61,38 83,40 66,54 71,76 50,64 29,76 34,54 17,40 39,38"
            fill="url(#starGrad)"
            stroke="#FAC775"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Bamboo Ribs */}
          <line x1="50" y1="18" x2="50" y2="64" stroke="#FAC775" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="83" y1="40" x2="29" y2="76" stroke="#FAC775" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="17" y1="40" x2="71" y2="76" stroke="#FAC775" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Central Radiant Circle Core */}
          <circle cx="50" cy="50" r="14" fill="url(#centerCore)" stroke="#FAC775" strokeWidth="2" />
          <circle cx="50" cy="50" r="6" fill="#FFFFFF" opacity="0.9" />
        </svg>
      );

    // 2. ĐÈN KÉO QUÂN LỤC GIÁC (Hexagonal Shadow Revolving Lantern)
    case "keoquan":
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 100 115"
          style={glowStyle}
          className={`overflow-visible ${className}`}
        >
          <defs>
            <linearGradient id="keoQuanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E63946" />
              <stop offset="50%" stopColor="#993C1D" />
              <stop offset="100%" stopColor="#4A1204" />
            </linearGradient>
            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FAC775" />
              <stop offset="100%" stopColor="#B37D14" />
            </linearGradient>
          </defs>
          {/* Top Hanging Ring */}
          <circle cx="50" cy="6" r="4" fill="none" stroke="#FAC775" strokeWidth="2.5" />
          <line x1="50" y1="10" x2="50" y2="16" stroke="#FAC775" strokeWidth="2" />

          {/* Curved Palace Pagoda Roof Top */}
          <path
            d="M 22 28 Q 50 14 78 28 L 74 34 L 26 34 Z"
            fill="url(#roofGrad)"
            stroke="#FAC775"
            strokeWidth="2"
          />
          {/* Roof Corners Upturns */}
          <circle cx="22" cy="28" r="2.5" fill="#FAC775" />
          <circle cx="78" cy="28" r="2.5" fill="#FAC775" />

          {/* Hexagonal Main Body */}
          <polygon
            points="28,34 72,34 82,78 68,92 32,92 18,78"
            fill="url(#keoQuanGrad)"
            stroke="#FAC775"
            strokeWidth="2.5"
          />

          {/* Inner Glowing Paper Windows */}
          <polygon
            points="34,40 66,40 74,74 62,86 38,86 26,74"
            fill="#FAEEDA"
            fillOpacity="0.85"
            stroke="#FAC775"
            strokeWidth="1.5"
          />

          {/* Silhouette Figure Shadow Inside */}
          <path
            d="M 45 68 Q 50 56 55 68 Z M 48 54 A 3 3 0 1 1 52 54"
            fill="#993C1D"
            opacity="0.75"
          />

          {/* Wooden Base */}
          <rect x="34" y="92" width="32" height="6" rx="2" fill="url(#roofGrad)" stroke="#FAC775" strokeWidth="1.5" />
        </svg>
      );

    // 3. ĐÈN CỦ TỎI QUÝ TỘC (Garlic / Diamond Royal Silk Lantern)
    case "garlic_silk":
      return (
        <svg
          width={size}
          height={size * 1.2}
          viewBox="0 0 100 120"
          style={glowStyle}
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="garlicGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFF176" />
              <stop offset="35%" stopColor="#FB8500" />
              <stop offset="80%" stopColor="#D00000" />
              <stop offset="100%" stopColor="#6A040F" />
            </radialGradient>
          </defs>
          {/* Top Hanging Ring */}
          <circle cx="50" cy="8" r="4" fill="none" stroke="#FAC775" strokeWidth="2.5" />
          <line x1="50" y1="12" x2="50" y2="20" stroke="#FAC775" strokeWidth="2" />

          {/* Top Finial Cap */}
          <ellipse cx="50" cy="20" rx="12" ry="4" fill="#FAC775" stroke="#B37D14" strokeWidth="1.5" />

          {/* Garlic Silk Contoured Body */}
          <path
            d="M 50 20 C 78 26 86 56 74 86 C 66 100 58 104 50 104 C 42 104 34 100 26 86 C 14 56 22 26 50 20 Z"
            fill="url(#garlicGrad)"
            stroke="#FAC775"
            strokeWidth="2.5"
          />

          {/* Curved Silk Rib Lines */}
          <path
            d="M 50 20 C 64 36 68 70 50 104"
            fill="none"
            stroke="#FAC775"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          <path
            d="M 50 20 C 36 36 32 70 50 104"
            fill="none"
            stroke="#FAC775"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          <line x1="50" y1="20" x2="50" y2="104" stroke="#FAC775" strokeWidth="1.5" strokeOpacity="0.9" />

          {/* Bottom Wooden Cap */}
          <ellipse cx="50" cy="104" rx="10" ry="3.5" fill="#FAC775" stroke="#B37D14" strokeWidth="1.5" />
        </svg>
      );

    // 4. ĐÈN CÁ CHÉP VƯỢT SÓNG (Carp Dragon Lantern)
    case "carp_dragon":
      return (
        <svg
          width={size * 1.15}
          height={size}
          viewBox="0 0 115 100"
          style={glowStyle}
          className={`overflow-visible ${className}`}
        >
          <defs>
            <linearGradient id="carpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F5D4" />
              <stop offset="40%" stopColor="#0091EA" />
              <stop offset="100%" stopColor="#003366" />
            </linearGradient>
          </defs>
          {/* Top Hanging Ring */}
          <circle cx="50" cy="8" r="4" fill="none" stroke="#FAC775" strokeWidth="2.5" />
          <line x1="50" y1="12" x2="50" y2="24" stroke="#FAC775" strokeWidth="2" />

          {/* Tail Fin */}
          <path
            d="M 85 50 Q 110 30 105 50 Q 110 70 85 50 Z"
            fill="#00F5D4"
            stroke="#FAC775"
            strokeWidth="2"
          />
          {/* Dorsal Top Fin */}
          <path d="M 40 28 Q 55 16 70 30 Z" fill="#00F5D4" stroke="#FAC775" strokeWidth="2" />
          {/* Ventral Bottom Fin */}
          <path d="M 45 72 Q 55 84 65 72 Z" fill="#00F5D4" stroke="#FAC775" strokeWidth="2" />

          {/* Carp Fish Body */}
          <path
            d="M 15 50 Q 30 25 60 28 Q 85 35 88 50 Q 85 65 60 72 Q 30 75 15 50 Z"
            fill="url(#carpGrad)"
            stroke="#FAC775"
            strokeWidth="2.5"
          />

          {/* Carp Scales Detail */}
          <path
            d="M 40 42 Q 48 50 40 58 M 52 38 Q 60 50 52 62 M 64 42 Q 72 50 64 58"
            fill="none"
            stroke="#FAC775"
            strokeWidth="1.8"
            strokeOpacity="0.8"
          />

          {/* Carp Glowing Eye */}
          <circle cx="28" cy="46" r="4.5" fill="#FFFFFF" stroke="#FAC775" strokeWidth="1.5" />
          <circle cx="28" cy="46" r="2" fill="#12203A" />
        </svg>
      );

    // 5. ĐÈN CYBER NEON DEVER (Hologram Prism IT Lantern)
    case "cyber_dever":
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 100 115"
          style={glowStyle}
          className={`overflow-visible ${className}`}
        >
          <defs>
            <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F5D4" />
              <stop offset="50%" stopColor="#0091EA" />
              <stop offset="100%" stopColor="#7000FF" />
            </linearGradient>
          </defs>
          {/* Top Hanging Ring */}
          <circle cx="50" cy="8" r="4" fill="none" stroke="#00F5D4" strokeWidth="2.5" />
          <line x1="50" y1="12" x2="50" y2="22" stroke="#00F5D4" strokeWidth="2" />

          {/* Hologram Isometric Cube/Prism */}
          <polygon points="50,22 84,40 50,58 16,40" fill="#00F5D4" fillOpacity="0.35" stroke="#00F5D4" strokeWidth="2" />
          <polygon points="16,40 50,58 50,96 16,78" fill="#0091EA" fillOpacity="0.5" stroke="#00F5D4" strokeWidth="2" />
          <polygon points="50,58 84,40 84,78 50,96" fill="#7000FF" fillOpacity="0.5" stroke="#00F5D4" strokeWidth="2" />

          {/* Inner Glowing Code Core */}
          <circle cx="50" cy="58" r="10" fill="#FFFFFF" shadow-color="#00F5D4" />
          <text x="50" y="62" fill="#050914" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="monospace">
            &lt;/&gt;
          </text>

          {/* Tech Circuit Traces */}
          <line x1="28" y1="52" x2="38" y2="70" stroke="#00F5D4" strokeWidth="1.5" strokeDasharray="2,2" />
          <line x1="72" y1="52" x2="62" y2="70" stroke="#00F5D4" strokeWidth="1.5" strokeDasharray="2,2" />
        </svg>
      );

    // 6. ĐÈN LỤA HỘI AN HOA SEN (Classic Round Lotus Silk Lantern - Default)
    case "hoian_lotus":
    default:
      return (
        <svg
          width={size}
          height={size * 1.15}
          viewBox="0 0 100 115"
          style={glowStyle}
          className={`overflow-visible ${className}`}
        >
          <defs>
            <radialGradient id="lotusGrad" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#FFD166" />
              <stop offset="30%" stopColor="#EF476F" />
              <stop offset="75%" stopColor="#993C1D" />
              <stop offset="100%" stopColor="#4F1004" />
            </radialGradient>
          </defs>
          {/* Top Hanging Ring */}
          <circle cx="50" cy="8" r="4" fill="none" stroke="#FAC775" strokeWidth="2.5" />
          <line x1="50" y1="12" x2="50" y2="20" stroke="#FAC775" strokeWidth="2" />

          {/* Top Wooden Crown Cap */}
          <rect x="36" y="20" width="28" height="5" rx="2.5" fill="#FAC775" stroke="#B37D14" strokeWidth="1.5" />

          {/* Balloon Silk Lantern Body */}
          <ellipse cx="50" cy="62" rx="34" ry="38" fill="url(#lotusGrad)" stroke="#FAC775" strokeWidth="2.5" />

          {/* Curved Bamboo Ribs */}
          <ellipse cx="50" cy="62" rx="22" ry="38" fill="none" stroke="#FAC775" strokeWidth="1.5" strokeOpacity="0.8" />
          <ellipse cx="50" cy="62" rx="10" ry="38" fill="none" stroke="#FAC775" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="50" y1="24" x2="50" y2="100" stroke="#FAC775" strokeWidth="1.5" strokeOpacity="0.9" />

          {/* Inner Golden Candle Light */}
          <circle cx="50" cy="62" r="9" fill="#FFF8E7" opacity="0.9" />
          <circle cx="50" cy="62" r="18" fill="#FAC775" opacity="0.25" />

          {/* Bottom Wooden Cap */}
          <rect x="38" y="99" width="24" height="5" rx="2" fill="#FAC775" stroke="#B37D14" strokeWidth="1.5" />
        </svg>
      );
  }
};
