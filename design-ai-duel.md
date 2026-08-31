# DESIGN.md — "Buggy AI Arena" (FU-DEVER Club Day 2026)

Đi kèm `spec-ai-duel.md` (nghiệp vụ) và `task-list-ai-duel.md` (chia việc). Dùng chung hệ màu/nguyên tắc nền tảng với `design-deploy-uoc-mo.md`, nhưng thêm lớp "cyberpunk" cho phần đấu trí.

---

## 1. Nguyên tắc thiết kế

- **Cyberpunk × Trung Thu DEVER** — nền tối, neon, hiệu ứng "glitch" nhẹ cho phần đấu trí; vẫn giữ đỏ-vàng Trung Thu làm nền tảng chung của cả gian hàng để 2 hoạt động (Deploy Ước Mơ + Buggy Arena) không bị lệch tông khi đứng cạnh nhau trên cùng màn hình display.
- **Nhịp độ nhanh, căng thẳng có kiểm soát** — đồng hồ đếm ngược, hiệu ứng gấp gáp, nhưng không được rối đến mức người chơi không kịp đọc câu hỏi trên điện thoại.
- **Buggy phải có mặt xuyên suốt** — không chỉ là tên gọi, mà là icon/avatar nhất quán xuất hiện ở form chơi, màn hình kết quả, và Live Arena trên display.
- **Ưu tiên hiệu năng hơn hiệu ứng** — vì đây là hoạt động chạy real-time nhiều giờ với nhiều lượt chơi liên tục.

## 2. Bảng màu (mở rộng từ Deploy Ước Mơ)

| Token | Hex | Dùng cho |
|---|---|---|
| `--bg-arena` | `#0B1220` | Nền khu vực đấu trí (tối hơn nền display Deploy Ước Mơ 1 chút để phân vùng) |
| `--neon-cyan` | `#4CE0D2` | Đường viền, đồng hồ đếm ngược, hiệu ứng "công nghệ" |
| `--neon-magenta` | `#E14CE8` | Điểm nhấn khi streak/combo, hiệu ứng thắng |
| `--gold-win` | `#FAC775` | Điểm số, tier đạt được (đồng bộ với `--amber-400` bên Deploy Ước Mơ) |
| `--red-lose` | `#993C1D` | Trạng thái sai/thua (đồng bộ tông đỏ trầm đã dùng) |
| `--buggy-shell` | `#0091EA` | Màu chủ đạo của Buggy (đồng bộ xanh logo FU-DEVER) |

**Quy tắc:** khu vực Buggy Arena dùng thêm `--neon-cyan`/`--neon-magenta` làm điểm nhấn công nghệ, nhưng vẫn giữ khung nền tối chung với bên đèn lồng để không bị "chỏi" khi 2 khu vực đứng cạnh nhau trên display.

## 3. Ba màn hình chính

### 3.1 `/duel` — Mobile Play (điện thoại người chơi)

**Màn hình 1 — Nhập nickname:**
- 1 input duy nhất "Nickname" + nút "Bắt đầu đấu với Buggy" — không hỏi gì thêm.
- Avatar Buggy hiện lớn, có 1 câu thoại chào mừng (tĩnh) kiểu "Buggy đang chờ đối thủ xứng tầm đây..."

**Màn hình 2 — Trận đấu (5 câu, 10-12s/câu):**
- Đồng hồ đếm ngược dạng vòng tròn tiến độ (progress ring), đổi màu từ `--neon-cyan` → `--red-lose` khi gần hết giờ, kèm rung nhẹ số giây cuối (3-2-1) để tạo cảm giác gấp gáp.
- Câu hỏi hiện to, rõ, phía trên; đáp án dạng nút lớn dễ chạm (tối thiểu 44px cao), xếp dọc.
- Góc trên: điểm số hiện tại + streak indicator (icon lửa/tia chớp khi đang streak).
- Avatar Buggy nhỏ ở góc, đổi biểu cảm (vui/mỉa mai/ngạc nhiên) theo từng câu trả lời — dùng vài trạng thái biểu cảm cố định (sprite/icon), không cần animation phức tạp.
- Sau mỗi câu: hiện ngay đúng/sai (feedback tức thời, <300ms), kèm 1 câu thoại tĩnh của Buggy ứng với tình huống.

**Màn hình 3 — Kết quả:**
- Điểm số tổng lớn, số câu đúng, tier đạt được (badge rõ ràng: Tier 1/2/3, có icon riêng cho từng tier).
- Câu thoại tổng kết của Buggy theo tier (thắng lớn/thắng vừa/thua) — nguồn tĩnh.
- (Nếu bật tính năng mind-reading): 1 câu cà khịa liên quan ước mơ, style riêng biệt (khung nhỏ, có thể có delay loading ngắn trước khi hiện — không chặn phần còn lại của màn hình kết quả).
- **QR đổi thưởng động**, kèm đồng hồ đếm ngược 60–120s hiển thị rõ ("Mã còn hiệu lực: 01:32"), và nút "Tạo lại mã" xuất hiện ngay khi mã hết hạn.
- Nút phụ: "Chơi lại" (nếu cho phép nhiều lượt) / "Xem trên bảng xếp hạng".

### 3.2 `/display` — Split-View trên màn hình gian hàng

- Chia dọc màn hình: trái 65% (Deploy Ước Mơ, giữ nguyên spec cũ), phải 35% (Buggy Live Arena).
- Có đường phân cách mảnh (1-2px, `--neon-cyan` mờ) giữa 2 vùng, không dùng khung viền dày gây rối mắt.

**Vùng Buggy Live Arena (bên phải):**
- Trên cùng: avatar Buggy + trạng thái hiện tại ("Đang đấu với [nickname]..." hoặc "Đang chờ đối thủ...").
- Giữa: câu hỏi hiện tại (rút gọn) + progress ring đếm ngược đồng bộ với điện thoại người chơi + điểm số live.
- 1 dòng bình luận Buggy cập nhật theo diễn biến (text ngắn, đổi liên tục).
- Dưới: **Top 10 leaderboard trong ngày** — dạng list gọn, hạng/nickname/điểm, hạng 1-3 có màu nổi bật (`--gold-win`).
- Toàn vùng nền `--bg-arena`, viền `--neon-cyan` mờ quanh các khối.

### 3.3 `/admin` — God Mode (mở rộng trang admin đã có)

- Thêm 1 tab/section riêng "Buggy Arena" bên cạnh phần quản lý Deploy Ước Mơ đã có — không gộp chung danh sách để tránh rối.
- Danh sách lượt chơi: nickname, điểm, tier, trạng thái mã QR (Chưa dùng / Đã trao / Hết hạn) — dùng badge màu để phân biệt nhanh (xanh lá = đã trao, vàng = chưa dùng, xám = hết hạn).
- Nút **[Xác nhận đã trao quà]** nổi bật, dễ bấm nhanh trong lúc đông người (ưu tiên tốc độ thao tác hơn thẩm mỹ ở đây).
- Nút **[Tặng thêm lượt chơi]** — có ô nhập nickname + xác nhận.
- Nút **[Kích hoạt Glitch Effect]** — nhóm riêng, đánh dấu rõ là tính năng phụ/vui, không lẫn với các nút thao tác nghiệp vụ chính (tránh bấm nhầm giữa lúc đang xử lý trao quà).

## 4. Âm thanh (SFX) — nếu còn thời gian

- Không bắt buộc cho MVP (nhiều gian hàng ồn, loa ngoài mới thực sự cần thiết) — nhưng nếu làm:
  - Tick nhẹ mỗi giây cuối đếm ngược (3-2-1).
  - 1 âm thanh ngắn khi trả lời đúng/sai (khác biệt rõ, không cần phức tạp).
  - 1 âm thanh "fanfare" ngắn khi đạt Tier 2/3.
- Toàn bộ SFX cần có nút tắt tiếng dễ thấy trên `/duel` (nhiều người chơi cùng lúc ở gian hàng đông, âm thanh chồng chéo có thể gây khó chịu hơn là thú vị).

## 5. Trạng thái & edge case cần thiết kế

- **Mất mạng giữa trận:** giữ nguyên tiến độ trận đấu nếu có thể (lưu state phía client), hiện thông báo nhẹ "Đang kết nối lại..." thay vì crash/mất điểm.
- **QR hết hạn trước khi đến quầy:** đã có nút "Tạo lại mã" — cần thiết kế rõ ràng, không để người chơi bối rối tưởng mất thưởng.
- **Nhiều người chơi trùng nickname:** cho phép trùng (không cần unique), nhưng leaderboard hiển thị kèm thời gian chơi để phân biệt nếu cần tra cứu ở `/admin`.
- **Chưa ai chơi (đầu sự kiện):** vùng Buggy Live Arena có trạng thái chờ đẹp — Buggy "đứng chờ" với 1 câu thoại mời gọi, leaderboard hiện "Chưa có ai đấu — bạn sẽ là người đầu tiên?".
- **API Gemini lỗi/timeout (phần mind-reading):** không hiện lỗi, chỉ đơn giản là bỏ qua đoạn cà khịa đó, không ảnh hưởng phần còn lại của màn hình kết quả.

## 6. Ghi chú kỹ thuật liên quan thiết kế

- Toàn bộ câu thoại tĩnh của Buggy nên tách thành 1 file JSON riêng (theo tình huống) để dễ chỉnh sửa/thêm câu sát ngày sự kiện mà không cần đụng vào code logic.
- Đồng hồ đếm ngược và progress ring nên dùng CSS animation/transform thay vì tính toán lại DOM liên tục (giữ hiệu năng ổn định khi chạy nhiều giờ).
- Vùng Live Arena trên `/display` nên poll/subscribe realtime (Supabase) giống cơ chế đã dùng cho đèn lồng Deploy Ước Mơ — tái sử dụng pattern kỹ thuật đã có thay vì tạo cơ chế mới.

---

*Xem `design-deploy-uoc-mo.md` để biết bảng màu/typography nền tảng dùng chung giữa 2 hoạt động.*
