# 🏮 Deploy Ước Mơ — FU-DEVER Club Day 2026

> Hệ thống web app tương tác thả đèn lồng ước mơ và xuất thiệp **Dream Card Story (9:16)** cá nhân hóa dành cho tân sinh viên K22 tại gian hàng **CLB Lập trình FU-DEVER** (Đại học FPT Đà Nẵng).

![FU-DEVER Logo](public/assets/logo/logo-dever.png)

---

## 🌟 Hệ Sinh Thái Chức Năng Đầy Đủ

### 1. Form Gửi Ước Mơ (Mobile-First `/`)
- **Giao diện Trung Thu ấm áp**: Tông đỏ trầm (`#993C1D`), vàng kim (`#FAC775`) kết hợp accent xanh thương hiệu DEVER (`#0091EA`, `#00F5D4`).
- **Gợi ý nhanh (Inspiration Prompts)**: Giúp tân sinh viên K22 dễ dàng lấy ý tưởng (GPA 3.8, FAANG, Vô địch Hackathon, Gia nhập FU-DEVER...).
- **Chọn biểu cảm Mascot Buggy**: Đính kèm 1 trong 8 sticker Buggy độc quyền lên đèn lồng và thiệp.
- **Tùy biến phong cách thiệp**: Chọn giữa 3 chủ đề (🏮 Cổ Điển Hoàng Kim, 🚀 DEVER Tech Blue, 👑 Hoàng Kim Lễ Hội).
- **Thanh thả cảm xúc Live Reactions (`ReactionBar`)**: Gửi tức thì biểu cảm (🏮, ❤️, ✨, 🚀, 🐞, 🔥) bay lên màn hình Display!
- **Hỗ trợ PWA (Progressive Web App)**: Cài đặt trực tiếp lên màn hình chính điện thoại như ứng dụng native (`/manifest.json`).

### 2. Bầu Trời Đèn Lồng Real-Time (`/display`)
- **Hiệu ứng Fullscreen Night Sky (`#12203A`)**: Mặt trăng rằm tỏa sáng, sao băng lướt qua bầu trời, đom đóm dạ quang với bộ khử rung vật lý HTML5 Canvas (`LanternSkyCanvas`).
- **Real-time Server-Sent Events (SSE) & Supabase Cloud**: Cập nhật tức thì khi có sinh viên gửi ước mơ tại gian hàng.
- **Chế độ Spotlight Xoay Tua**: Tự động chiếu nổi bật từng ước mơ truyền cảm hứng mỗi 12 giây cho khách tham quan.
- **Thanh lọc chủ đề**: Lọc nhanh theo 6 danh mục (Sự nghiệp, Học tập, Trải nghiệm, Gia đình, Ước mơ lớn, Khác).
- **Live Reaction Stream**: Hiển thị emoji cảm xúc bay lên từ dưới đáy màn hình theo thời gian thực.
- **Live Broadcast Announcement**: Hiển thị thông báo phát thanh khẩn cấp trực tiếp từ Admin.
- **Âm thanh Web Audio API**: Tiếng chuông khánh ấm áp phát ra khi có đèn lồng mới bay lên.

### 3. Studio Dream Card (Story 9:16)
- **Chuẩn tỷ lệ 1080×1920px (Canvas 2D HD)**: Tự động co giãn kích thước chữ, hiển thị tên, logo chính thức, ngày 12/09/2026 và hashtags `#FUDEVER #ClubDay2026 #DeployUocMo`.
- **Tải ảnh 1 chạm**: Hỗ trợ tối ưu trên iOS Safari và Android Chrome.

### 4. Bảng Quản Trị Gian Hàng (`/admin`)
- Đăng nhập bảo mật bằng mật khẩu quản trị (`dever2026`).
- **Phát thông báo trực tiếp (Live Announcement Broadcaster)** lên toàn bộ màn hình display.
- **Thử nghiệm gian hàng (Rehearsal Simulator)**: Tạo nhanh 5 ước mơ mẫu để test hiển thị trước giờ G.
- **Phân tích từ khóa xu hướng (Word Cloud Analyzer)**: Tự động trích xuất các từ khóa hot nhất trong ước mơ sinh viên (`#LậpTrình`, `#HọcBổng`, `#ICPC`, `#Startup`, `#FAANG`...).
- Thống kê phân bố chủ đề ước mơ dạng thanh trực quan.
- Bật/Tắt hiển thị (Ẩn/Hiện) và Xóa ước mơ nhạy cảm ngay lập tức.
- Xuất file **Excel CSV (hỗ trợ UTF-8 BOM tiếng Việt chuẩn)** và sao lưu raw JSON.

### 5. In Poster Standee Chuẩn Gian Hàng (`/standee`)
- Giao diện thiết kế Standee tỷ lệ dọc chuẩn in ấn (60x160cm) chứa mã QR độ phân giải cao 1000px, linh vật Buggy và hướng dẫn 3 bước tham gia.
- Hỗ trợ in trực tiếp hoặc tải QR HD.

### 6. Minigame Vòng Quay May Mắn (`/admin/lucky-draw`)
- Vòng quay số may mắn hồi hộp phục vụ minigame bốc thăm trúng quà tặng gian hàng (Sticker DEVER, Áo CLB, Thư chúc mừng...).
- Hiệu ứng pháo hoa Confetti và ghi nhận lịch sử trúng thưởng.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, Canvas Confetti.
- **Canvas Rendering**: HTML5 Canvas 2D Engine xuất ảnh Story 1080x1920 và hạt đom đóm sao băng thời gian thực.
- **Real-time Engine**: Dual-engine (Supabase Cloud Realtime + Server-Sent Events SSE Local Fallback cho mạng offline nội bộ tại gian hàng).
- **Kiểm thử tự động**: Vitest (7 unit tests) + Playwright (10 E2E tests trên Desktop Chromium & Mobile Chrome).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local

```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình biến môi trường (.env.local)
cp .env.example .env.local

# 3. Chạy môi trường phát triển
npm run dev

# 4. Chạy kiểm thử tự động
npm run test       # Unit tests (Vitest: 7 passed)
npx playwright test   # End-to-End tests (Playwright: 10 passed)

# 5. Build bản production
npm run build
npm start
```

---

## 🏮 Brand Assets & Palette

- **Night Sky**: `#12203A` / `#0B132B`
- **Crimson Red**: `#993C1D` / `#712B13`
- **Imperial Gold**: `#FAC775` / `#FAEEDA`
- **Brand DEVER Blue**: `#0091EA` / `#85B7EB`
- **Tech Glow**: `#00F5D4`

© 2026 FU-DEVER — Câu Lạc Bộ Lập Trình Trường Đại Học FPT Đà Nẵng.
