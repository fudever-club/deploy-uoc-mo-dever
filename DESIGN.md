---
name: "Deploy Ước Mơ — FU-DEVER Design System"
description: "Mid-Autumn festive & modern SE tech aesthetic for interactive event web applications"
colors:
  bg-night: "#12203a"
  bg-midnight: "#0b132b"
  red-primary: "#993c1d"
  red-deep: "#712b13"
  amber-gold: "#fac775"
  amber-cream: "#faeeda"
  brand-blue: "#0091ea"
  brand-blue-light: "#85b7eb"
  surface-light: "#ffffff"
  text-primary: "#1f2937"
  text-muted: "#4b5563"
typography:
  display:
    fontFamily: "Outfit, 'Plus Jakarta Sans', sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "Outfit, 'Plus Jakarta Sans', sans-serif"
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  small:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.3
  micro:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.2
  nano:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: "9px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.red-primary}"
    textColor: "{colors.amber-cream}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
  badge-tag:
    backgroundColor: "{colors.amber-gold}"
    textColor: "{colors.red-deep}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
---

# Design System: Deploy Ước Mơ (FU-DEVER Club Day 2026)

## Overview

**Creative North Star: "The Digital Mid-Autumn Lantern Flight"**

Thiết kế kết hợp tinh thần lễ hội Trung Thu truyền thống (đèn lồng đỏ trầm, ánh trăng vàng ấm) với thẩm mỹ hiện đại, tinh gọn của một câu lạc bộ Kỹ thuật phần mềm (FU-DEVER). Giao diện mang lại cảm xúc ấm áp, thiêng liêng nhưng đảm bảo độ tin cậy và hiệu năng cao nhất trên môi trường thực tế.

**Key Characteristics:**
- **Festive Depth & Atmosphere**: Nền trời đêm sâu thẳm (`#12203A`) tương phản với ánh đèn lồng ấm áp (`#993C1D`, `#FAC775`).
- **Mobile-First Clarity**: Nhập liệu dễ dàng, nút bấm lớn (>=44px), tương phản cao, hỗ trợ tiếng Việt có dấu.
- **Ultra-Lean Motion**: Chuyển động lơ lửng (floating physics) mượt mà 60fps qua GPU-accelerated CSS transforms.

## Colors

Bảng màu được tính toán để đạt độ tương phản WCAG AAA trên cả nền sáng (Form nhập liệu) lẫn nền tối (Màn hình Display).

### Primary
- **Deep Lantern Red** (`#993C1D`): Nền thẻ đèn lồng, nút hành động chính (Primary CTA).
- **Amber Gold** (`#FAC775`): Viền sáng đèn lồng, điểm nhấn phát quang, icon trăng/sao.

### Secondary
- **Midnight Sky** (`#12203A` / `#0B132B`): Nền trời đêm Display vô tận.
- **Warm Cream** (`#FAEEDA`): Màu chữ chính trên nền tối, tạo cảm giác dịu mắt hơn màu trắng tinh.

### Tertiary
- **FU-DEVER Tech Blue** (`#0091EA`): Điểm nhấn nhận diện thương hiệu công nghệ, logo badge và icon accent.
- **Sky Blue Light** (`#85B7EB`): Text phụ và đường viền xanh công nghệ trên nền tối.

### Neutral
- **Surface Light** (`#FFFFFF`): Nền card và container trên chế độ ban ngày.
- **Slate Text** (`#1F2937`): Màu chữ chính trên nền sáng.
- **Muted Gray** (`#4B5563`): Màu chữ phụ chú thích.

### Named Rules
**The Rarity of Blue Rule.** Màu xanh FU-DEVER (`#0091EA`) chỉ chiếm ≤ 10% bề mặt UI, đóng vai trò điểm nhấn công nghệ, không cạnh tranh với sắc đỏ-vàng Trung Thu.
**The No Gray On Color Rule.** Không bao giờ dùng màu xám trên nền đỏ/vàng/xanh; luôn dùng biến thể màu có cùng tông hoặc `#FAEEDA` để giữ độ trong trẻo.

## Typography

**Display Font:** Outfit / Be Vietnam Pro
**Body Font:** Plus Jakarta Sans / System-UI

### Hierarchy
- **Display** (Bold 700, clamp(2rem, 5vw, 3.5rem), line-height 1.15): Tiêu đề chính trang web và banner sự kiện.
- **Headline** (Bold 700, clamp(1.5rem, 3.5vw, 2.25rem), line-height 1.25): Tiêu đề section và modal.
- **Title** (SemiBold 600, 1.25rem, line-height 1.4): Tên tác giả trên đèn lồng, tiêu đề card.
- **Body** (Regular 400, 1rem, line-height 1.6): Nội dung ước mơ, mô tả chi tiết.
- **Label** (Medium 500, 0.875rem, line-height 1.4): Tag phân loại, badge trạng thái.

## Layout

- **Mobile Form (`/`)**: Container trung tâm 100% max-w-lg, padding 16px/24px, nhịp spacing chuẩn 8pt grid.
- **Display Stage (`/display`)**: Toàn màn hình (100vw, 100vh), bố cục phi đối xứng với các góc cố định (Logo, Stat Counter) và vùng trời trung tâm cho đèn lồng.
- **Admin Dashboard (`/admin`)**: Bố cục bảng dữ liệu desktop-first với thanh công cụ lọc và nút thao tác nhanh.

## Elevation & Depth

Hệ thống kết hợp giữa lớp phủ mờ tinh tế (Glassmorphism `backdrop-filter: blur(16px)`) và ánh sáng phát quang nhẹ quanh đèn lồng (`0 0 20px rgba(250, 199, 117, 0.4)`).

### Named Rules
**The Organic Glow Rule.** Ánh sáng đèn lồng luôn có bán kính tán xạ mềm mại (blur ≥ 16px) và nhịp thở chậm (3s–5s), không dùng viền cứng hoặc bóng đổ gắt.

## Shapes

- Bo góc chuẩn: `8px` cho input/button nhỏ, `12px–16px` cho card, `9999px` (pill) cho chip và badge.
- Nút bấm chính có viền phản chiếu ánh vàng tinh tế (`border: 1px solid rgba(250, 199, 117, 0.35)`).

## Components

### Buttons
- **Shape:** Bo góc `12px` hoặc pill `9999px`.
- **Primary:** Nền đỏ trầm `#993C1D`, chữ vàng kem `#FAEEDA`, padding `12px 24px`, hiệu ứng hover chuyển sắc độ sang `#712B13` kèm độ nhấc nhẹ `transform: translateY(-1px)`.
- **Secondary:** Nền kính mờ `glass-panel`, viền vàng nhạt `border: 1px solid rgba(250, 199, 117, 0.35)`.

### Chips & Tags
- **Selected:** Nền đỏ `#993C1D`, chữ vàng kem `#FAEEDA`, shadow nhẹ.
- **Unselected:** Nền trong suốt hoặc xám nhạt, viền mỏng `border-slate-300`, chữ xám `#4B5563`.

### Lantern Cards (Display Screen)
- Nền đỏ trầm gradient mềm, chữ vàng kem, hiệu ứng lơ lửng nhẹ nhàng, bo góc `12px`, padding `12px 16px`.

## Do's and Don'ts

### Do:
- **Do** đảm bảo mọi input và button trên điện thoại có chiều cao tối thiểu 44px.
- **Do** dùng easing giảm tốc tự nhiên (`cubic-bezier(0.16, 1, 0.3, 1)`) cho đèn lồng bay lên.
- **Do** hỗ trợ hiển thị tiếng Việt hoàn hảo, không bị vỡ font hay lỗi dấu.

### Don't:
- **Don't** dùng `animate-bounce` giật cục cho các phần tử trang trọng.
- **Don't** dùng chữ xám mờ trên nền đỏ hoặc nền vàng làm giảm độ tương phản.
- **Don't** lạm dụng hiệu ứng nặng làm rớt FPS màn hình Display.
