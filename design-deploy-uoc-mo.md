# DESIGN.md — "Deploy Ước Mơ" (FU-DEVER Club Day 2026)

Tài liệu thiết kế dùng làm nguồn tham chiếu cho Antigravity khi build UI. Đi kèm `spec-deploy-uoc-mo.md` (requirements) và `task-list-deploy-uoc-mo.md` (chia việc).

---

## 1. Nguyên tắc thiết kế

- **Ấm áp, lễ hội, nhưng gọn nhẹ** — tinh thần Trung Thu (đèn lồng, đêm trăng) chứ không phải giao diện dashboard khô khan.
- **Mobile-first cho form** — 90% người dùng thao tác trên điện thoại cá nhân qua QR, màn hình nhỏ, ánh sáng ngoài trời/gian hàng đông người → chữ phải to rõ, nút bấm dễ chạm.
- **Display screen là "sân khấu"** — không có tương tác chuột/bàn phím, chỉ để xem, chạy tự động nhiều giờ, phải nhẹ và ổn định.
- **Phẳng, không màu mè quá mức** — không dùng gradient cầu kỳ, không hiệu ứng nặng; giữ hiệu năng tốt để chạy mượt suốt sự kiện.
- **Thương hiệu FU-DEVER là điểm nhấn, không phải nền** — theo đúng quyết định: Trung Thu (đỏ-vàng) làm chủ đạo, xanh dương của logo là accent.

## 2. Bảng màu

Nguồn: bảng màu trang trí Club Day (đỏ-vàng) + logo FU-DEVER (xanh dương #0091EA + đỏ).

| Token | Hex | Dùng cho |
|---|---|---|
| `--bg-night` | `#12203A` | Nền màn hình Display |
| `--red-500` | `#993C1D` | Nền thẻ đèn lồng / dream card (đỏ trầm) |
| `--red-700` | `#712B13` | Biến thể đậm hơn cho đa dạng thẻ |
| `--amber-400` | `#FAC775` | Chữ nhấn, viền sáng, icon trăng/sao |
| `--amber-100` | `#FAEEDA` | Chữ chính trên nền tối (dễ đọc) |
| `--brand-blue` | `#0091EA` | Logo, accent nút CTA, icon thương hiệu |
| `--brand-blue-light` | `#85B7EB` | Text/icon xanh nhạt trên nền tối |
| `--surface` | `#FFFFFF` | Nền form (chế độ sáng, ban ngày dễ đọc) |
| `--text-on-light` | `#2C2C2A` | Chữ chính trên nền trắng (form) |
| `--text-muted-on-light` | `#5F5E5A` | Chữ phụ trên nền trắng |

**Quy tắc phối màu:**
- Form (nền sáng): nền trắng/kem nhạt, tiêu đề + nút CTA dùng đỏ-vàng, logo xanh dùng làm icon nhỏ đi kèm — không đảo ngược (không nền xanh).
- Display & Dream Card (nền tối/đỏ): chữ luôn dùng `--amber-100` hoặc `--amber-400`, không dùng đen/xám trên nền tối.
- Không dùng quá 3 tông màu chính trong 1 màn hình cùng lúc (đỏ + vàng + 1 điểm xanh).

## 3. Typography

- Font hệ thống (system-ui / sans-serif mặc định của trình duyệt) để load nhanh trên điện thoại tại gian hàng — không cần font custom nếu không có sẵn.
- Nếu muốn có chất "công nghệ", dùng 1 font tiêu đề dạng geometric sans (ví dụ Google Fonts "Be Vietnam Pro" — hỗ trợ tốt tiếng Việt có dấu) cho heading, còn phần thân vẫn dùng font hệ thống.
- Cỡ chữ (mobile form):
  - Tiêu đề hoạt động: 20–22px, medium
  - Label input: 13–14px
  - Nội dung input: 16px (>=16px để iOS không tự zoom khi focus input)
  - Nút CTA: 15–16px, medium
- Cỡ chữ (display screen, xem từ xa):
  - Tên trên đèn lồng: tối thiểu 14px
  - Bộ đếm tổng: 16–18px
- Luôn dùng **chữ thường theo câu** (sentence case), tránh IN HOA toàn bộ trừ nhãn ngắn/badge.

## 4. Khoảng cách & bo góc

- Đơn vị cơ bản: bội số của 4px (4, 8, 12, 16, 24, 32...).
- Bo góc: input/nút `8px`, card `12–16px`, chip/tag/badge `999px` (bo tròn hết — pill).
- Padding card ngoài cùng (form, dream card): `16–20px`.
- Khoảng cách giữa các field trong form: `12px`.

## 5. Component spec

### 5.1 Màn hình giới thiệu (trước form)
- Full màn hình điện thoại, nền trắng/kem.
- Icon trăng/đèn lồng + tên hoạt động "Deploy ước mơ" + 1-2 câu mô tả ngắn (thẻ nền vàng nhạt, bo góc 12px).
- 1 nút CTA duy nhất "Bắt đầu" — màu đỏ chủ đạo, full-width, cao 44–48px (dễ chạm).

### 5.2 Form nhập ước mơ
- Input "Tên" — text input thường, placeholder "Có thể để trống", không required.
- Textarea "Ước mơ của bạn" — tối thiểu 3 dòng hiển thị, tự giãn theo nội dung (auto-resize) hoặc scroll nội bộ nếu dài, không giới hạn ký tự nhưng có thể hiện counter nhẹ (không bắt buộc).
- Chọn tag: dạng **chip ngang có thể wrap xuống dòng**, chỉ chọn 1 tag tại 1 thời điểm (radio behavior). Tag đang chọn: nền đỏ, chữ trắng/kem. Tag chưa chọn: viền mỏng, chữ xám.
- Checkbox đồng ý: bắt buộc, đặt ngay trên nút gửi, chữ nhỏ (12px), không được thiết kế mờ nhạt đến mức bị bỏ qua — dùng `--text-on-light` đậm vừa đủ để đọc rõ.
- Nút "Gửi ước mơ": full-width, màu đỏ chủ đạo/đen trung tính, disable + hiện lỗi rõ ràng nếu chưa tick đồng ý hoặc chưa nhập nội dung ước mơ (không được submit im lặng).

### 5.3 Màn hình cảm ơn
- Hiện ngắn gọn: icon check/sparkle + "Cảm ơn bạn đã gửi ước mơ" + có thể thêm 1 câu ấm áp ngắn.
- Tự động chuyển sang Dream Card sau ~1.5–2 giây, hoặc có nút "Xem thiệp của bạn" nếu muốn chủ động hơn.

### 5.4 Dream Card
- Tỉ lệ dọc 9:16 (chuẩn story) — kích thước xuất ảnh khuyến nghị 1080×1920px.
- Bố cục 3 vùng dọc: (trên) nhãn sự kiện + ngày · (giữa) tên + nội dung ước mơ, canh giữa hoặc canh trái tuỳ độ dài chữ, tự co cỡ chữ nếu ước mơ quá dài · (dưới) logo FU-DEVER + hashtag, có đường kẻ mỏng phân cách phía trên.
- Nền: 1 trong các biến thể đỏ trầm (`--red-500`/`--red-700`), có thể thêm 1–2 hình tròn mờ trang trí (như hoạ tiết trăng) — không dùng ảnh nền phức tạp để tránh nặng khi render.
- Nút "Tải ảnh về máy" đặt dưới card (ngoài vùng ảnh xuất ra), rõ ràng, full-width.

### 5.5 Màn hình Display (`/display`)
- Nền `--bg-night`, full-screen, không có thanh điều hướng/menu nào (chạy standalone suốt sự kiện).
- Góc trên trái: nhãn nhỏ "Deploy ước mơ · Club day 2026" kèm icon trăng, mờ nhạt (không phải điểm nhấn chính).
- Góc trên phải: **bộ đếm tổng** dạng pill nền mờ (`rgba(255,255,255,0.08)`), icon sparkle + số + "ước mơ đã bay lên".
- Góc dưới trái: logo FU-DEVER (icon + chữ) cố định, xanh nhạt trên nền tối.
- Vài chấm tròn trắng mờ rải rác phía trên làm hiệu ứng "sao" (tĩnh hoặc nhấp nháy rất nhẹ — không lạm dụng animation để tránh giật khi nhiều đèn lồng).
- **Đèn lồng** = thẻ chữ nhật bo góc nhỏ (không cần vẽ hình lồng đèn phức tạp), nền đỏ trầm, gồm: tên (dòng 1, đậm) + trích đoạn ước mơ (dòng 2, rút gọn bằng dấu "..." nếu dài, tối đa ~30 ký tự hiển thị).
- **Animation khi có ước mơ mới:**
  1. Thẻ xuất hiện ở mép dưới màn hình, opacity 0 → 1, dịch chuyển từ dưới lên vị trí đích trong ~1.5–2 giây (ease-out).
  2. Vị trí đích: chọn ngẫu nhiên trong lưới ảo (grid ảo chia màn hình thành ô), có kiểm tra để không đè lên thẻ đã có gần đó.
  3. Sau khi đến vị trí, thẻ đứng yên (tích luỹ), có thể có chuyển động bồng bềnh rất nhẹ (dao động dọc vài px, lặp vô hạn, để không bị "chết cứng") — animation này phải rẻ về hiệu năng (dùng CSS transform, không dùng JS tính toán liên tục).
  4. Khi số lượng vượt ngưỡng (ví dụ >80–100 thẻ), giảm dần kích thước thẻ mới hoặc chuyển sang layout dạng lưới đều thay vì random để tránh tràn màn hình.

### 5.6 Trang Admin (`/admin`)
- Không cần đầu tư thẩm mỹ nhiều — ưu tiên rõ ràng, dễ thao tác nhanh trong lúc sự kiện.
- Màn hình đăng nhập: 1 input mật khẩu + nút đăng nhập, tối giản.
- Danh sách dạng bảng/list: mỗi dòng gồm tên, trích ước mơ, tag, thời gian, 2 nút hành động (Ẩn/Hiện, Xoá) rõ ràng — dùng icon quen thuộc (mắt, thùng rác).
- Nút "Export CSV" đặt nổi bật ở đầu trang.

## 6. Trạng thái & edge case cần thiết kế

- **Không nhập tên:** hiển thị "Ẩn danh" thay cho tên trên đèn lồng và dream card.
- **Ước mơ rất dài:** trên đèn lồng → cắt ngắn + "..."; trên dream card → tự động giảm cỡ chữ theo độ dài (2–3 mức cỡ chữ tuỳ ngưỡng ký tự) để không tràn khung.
- **Gửi khi thiếu mạng:** hiện thông báo lỗi rõ ràng ngay trên form ("Không gửi được, vui lòng thử lại"), không mất nội dung đã nhập (giữ nguyên trong textarea).
- **Danh sách trống lúc đầu sự kiện:** màn hình Display cần có trạng thái khởi đầu đẹp (không trống trơn xấu xí) — ví dụ vẫn hiện nền sao + logo + dòng "Hãy là người đầu tiên gửi ước mơ" cho đến khi có thẻ đầu tiên.
- **Admin xoá 1 ước mơ đang hiển thị:** thẻ đó cần biến mất khỏi Display gần như ngay lập tức (qua realtime), không cần đợi refresh.

## 7. Responsive

- Form/màn hình giới thiệu/cảm ơn/dream card: tối ưu cho khung 360–430px width (điện thoại phổ thông), test thêm ở màn hình nhỏ (iPhone SE, ~375px) để chắc chắn nút CTA không bị tràn.
- Display: tối ưu cho tỉ lệ ngang laptop tiêu chuẩn (16:9, ví dụ 1366×768 hoặc 1920×1080) — không cần responsive nhiều chế độ vì chỉ chạy trên 1 máy cố định.
- Admin: chạy trên cùng máy Nhật thao tác — ưu tiên desktop layout, không cần tối ưu mobile.

## 8. Ghi chú kỹ thuật liên quan thiết kế

- Ưu tiên CSS thuần/Tailwind cho toàn bộ hiệu ứng — tránh thư viện animation nặng nếu không cần thiết, vì Display phải chạy ổn định nhiều giờ trên 1 máy.
- Dream card nên render bằng canvas (client-side) để xuất ảnh đúng pixel như thiết kế, tránh sai khác giữa các trình duyệt khi dùng screenshot HTML.
- Toàn bộ màu sắc nên khai báo dưới dạng CSS variable/theme config (không hard-code hex rải rác) để dễ tinh chỉnh nhanh nếu cần đổi tông màu sát ngày sự kiện.

---

*Xem 3 mockup minh hoạ (form, display, dream card) đã gửi trong hội thoại làm tham chiếu trực quan khi build theo file này.*
