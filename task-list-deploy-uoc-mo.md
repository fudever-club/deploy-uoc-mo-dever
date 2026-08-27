# TASK LIST: "Deploy Ước Mơ" — cho Antigravity Coding Agent

Chia theo nhóm chức năng. Mỗi nhóm có mục tiêu MVP rõ ràng — agent hoàn thành xong "MVP đạt khi" là coi như xong nhóm đó, có thể chuyển tiếp.

Xem chi tiết đầy đủ về nội dung/UX/màu sắc trong `spec-deploy-uoc-mo.md`.

---

## Nhóm 0 — Project setup & hạ tầng

**Việc cần làm:**
- Khởi tạo project Next.js (App Router), TypeScript.
- Cài đặt Tailwind CSS (khuyến nghị, để làm nhanh phần UI đỏ-vàng).
- Tạo project Supabase mới, lấy `SUPABASE_URL` + `SUPABASE_ANON_KEY`, cấu hình `.env.local`.
- Kết nối repo với Vercel để auto-deploy khi push.

**MVP đạt khi:** Chạy `npm run dev` local ra trang mặc định, deploy thử lên Vercel ra 1 URL public thành công, kết nối Supabase test thành công (đọc/ghi 1 record thử).

---

## Nhóm 1 — Data model (Supabase)

**Việc cần làm:**
- Tạo bảng `dreams`:
  - `id` (uuid, primary key, default random)
  - `name` (text, nullable)
  - `content` (text, not null)
  - `tag` (text, nullable — 1 trong 6 tag gợi ý)
  - `consent` (boolean, not null, default false)
  - `created_at` (timestamptz, default now())
  - `hidden` (boolean, not null, default false — dùng cho admin ẩn khỏi display)
- Bật Row Level Security phù hợp:
  - Cho phép `insert` công khai (ai cũng gửi được từ form).
  - Cho phép `select` công khai chỉ với `hidden = false` (cho display xem).
  - Riêng trang admin cần đọc được cả bản ghi `hidden = true` và có quyền `update`/`delete` (dùng service role key ở phía server, không lộ ra client).
- Bật Realtime cho bảng `dreams`.

**MVP đạt khi:** Insert 1 dòng test qua SQL editor, thấy subscribe realtime nhận được event ngay lập tức từ 1 script/test đơn giản.

---

## Nhóm 2 — Form gửi ước mơ (trang chính `/`)

**Việc cần làm:**
- Màn hình giới thiệu ngắn (tên hoạt động + mô tả 1-2 câu + nút "Bắt đầu").
- Form: input Tên (optional), textarea Nội dung ước mơ (không giới hạn ký tự), chọn 1 trong 6 tag (dạng chip/button), checkbox đồng ý (bắt buộc).
- Validate: content không rỗng, checkbox phải tick mới submit được.
- Submit → insert vào Supabase (`consent = true`).
- Sau khi gửi thành công → chuyển sang màn hình "Cảm ơn 🎉" → chuyển tiếp sang Dream Card (nhóm 4).
- Responsive chuẩn mobile-first (đây là màn hình chính sinh viên dùng qua điện thoại).
- Style theo bảng màu đỏ-vàng chủ đạo + logo FU-DEVER.

**MVP đạt khi:** Trên điện thoại thật, quét QR → điền form → gửi thành công → thấy "Cảm ơn" → thấy Dream Card, dữ liệu xuất hiện đúng trong Supabase.

---

## Nhóm 3 — Màn hình Display (`/display`)

**Việc cần làm:**
- Subscribe realtime bảng `dreams` (chỉ `hidden = false`).
- Khi có record mới → render 1 "đèn lồng" bay từ dưới lên, dừng lại và **tích luỹ** trên màn hình (không biến mất).
- Logic chống chồng lấn: vị trí random có kiểm tra va chạm, hoặc giảm kích thước dần khi số lượng tăng, hoặc sắp xếp dạng lưới linh hoạt.
- Đèn lồng hiện: tên (nếu có) + vài từ đầu ước mơ.
- Bộ đếm tổng số ước mơ đã gửi, góc màn hình.
- Nền tối + hiệu ứng sao/trăng nhẹ, logo FU-DEVER cố định 1 góc.
- Tối ưu để chạy mượt liên tục nhiều giờ (tránh memory leak khi số lượng đèn lồng lớn — cân nhắc giới hạn hiệu ứng animation phức tạp nếu số lượng vượt ngưỡng, ví dụ >100).

**MVP đạt khi:** Mở `/display` trên máy display, gửi thử vài chục ước mơ liên tiếp từ nhiều thiết bị khác nhau, tất cả hiện đúng, không chồng lấn nghiêm trọng, không giật lag.

---

## Nhóm 4 — Dream Card (ảnh cá nhân)

**Việc cần làm:**
- Component hiển thị card tỉ lệ 9:16 với: tên/ước mơ vừa gửi, ngày sự kiện, logo FU-DEVER, hashtag.
- Render thành ảnh tải về được (dùng canvas / html-to-image / server-side image generation — agent tự chọn giải pháp phù hợp với Next.js).
- Nút "Tải ảnh về máy" hoạt động tốt trên trình duyệt mobile (Safari iOS và Chrome Android).

**MVP đạt khi:** Trên điện thoại thật, bấm tải ảnh → ảnh lưu về máy đúng nội dung, đúng tỉ lệ, hiển thị đẹp, không bị cắt chữ.

---

## Nhóm 5 — Trang Admin (`/admin`)

**Việc cần làm:**
- Màn hình đăng nhập bằng 1 mật khẩu chung (so sánh với biến môi trường, lưu session đơn giản — không cần hệ thống auth phức tạp).
- Danh sách toàn bộ ước mơ (kể cả đã ẩn), có thể sort theo thời gian mới nhất.
- Nút Ẩn/Hiện và Xoá cho từng dòng (update `hidden` hoặc delete trong Supabase).
- Nút **Export CSV** toàn bộ dữ liệu.

**MVP đạt khi:** Đăng nhập bằng mật khẩu đúng, ẩn 1 ước mơ → biến mất khỏi `/display` ngay lập tức, export CSV mở được bằng Excel, dữ liệu đầy đủ đúng cột.

---

## Nhóm 6 — Deploy & QR

**Việc cần làm:**
- Deploy bản chính thức lên Vercel, lấy URL cuối cùng.
- Tạo QR code trỏ đến URL đó (route `/`), xuất file ảnh QR chất lượng cao để in standee tại gian hàng.
- Test toàn bộ luồng end-to-end trên URL thật (không phải localhost): điện thoại → gửi → display → admin.

**MVP đạt khi:** Từ 1 điện thoại bất kỳ (không cùng mạng dev), quét QR thật → toàn bộ luồng hoạt động đúng trên URL Vercel.

---

## Nhóm 7 — Việc thêm nếu còn thời gian (post-MVP, không bắt buộc)

- Giới hạn spam (rate-limit theo IP/thiết bị nếu 1 người gửi liên tục).
- Hiệu ứng âm thanh nhẹ khi có ước mơ mới trên display.
- Thêm animation mượt hơn khi đèn lồng bay lên (dùng Framer Motion).
- Trang cảm ơn có thêm gợi ý "theo dõi fanpage FU-DEVER".

---

**Thứ tự khuyến nghị:** 0 → 1 → 2 → 3 → 4 → 5 → 6, vì nhóm 2/3/4 phụ thuộc nhóm 1, và nhóm 6 cần mọi thứ khác đã chạy ổn trước khi deploy chính thức.
