# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Tân sinh viên K22 tại Đại học FPT Đà Nẵng tham gia trải nghiệm tại gian hàng FU-DEVER Club Day 2026; Ban chủ nhiệm và điều phối viên vận hành sự kiện (Admin).

## Product Purpose
Tạo trải nghiệm đáng nhớ "Deploy Ước Mơ" lên bầu trời đèn lồng kỹ thuật số theo thời gian thực (Real-time Display), tạo thiệp Dream Card cá nhân hóa để lưu giữ hoặc chia sẻ lên Story mạng xã hội, và thu hút sinh viên gia nhập CLB Lập trình FU-DEVER.

## Positioning
Trải nghiệm sự kiện tương tác thời gian thực giao thoa giữa không khí Trung Thu truyền thống (đèn lồng, trăng rằm, điều ước) và tinh thần "Deploy" công nghệ của lập trình viên FU-DEVER, hỗ trợ chạy mạng LAN local-first không phụ thuộc internet bên ngoài.

## Operating Context
Sự kiện FU-DEVER Club Day diễn ra ngày 12/09/2026 (08:15–12:00). Sinh viên quét mã QR trên standee bằng điện thoại di động tại gian hàng ngoài trời/sảnh lớn. Một laptop tại gian hàng đóng vai trò màn hình công khai (Public Display) và dashboard điều phối (Admin/Lucky Draw).

## Capabilities and Constraints
- Giao diện Form mobile-first: Nhập tên (cho phép ẩn danh), nội dung ước mơ, chọn tag chủ đề, checkbox điều khoản.
- Màn hình Display Night Sky: Hiệu ứng đèn lồng bay lên mượt mà theo thời gian thực (SSE), tích lũy ước mơ bồng bềnh, tối ưu hiệu năng chạy liên tục 4 giờ không giật lag.
- Bộ tạo Dream Card 9:16 bằng HTML Canvas: Tải ảnh chất lượng cao trực tiếp về máy điện thoại.
- Bảng điều khiển Admin & Vòng quay may mắn (Lucky Draw): Ẩn/hiện/xoá ước mơ cập nhật tức thì qua Realtime, xuất CSV dữ liệu.
- Khả năng phục hồi dữ liệu: Local JSON storage & Supabase sync.

## Brand Commitments
- Nhận diện thương hiệu: FU-DEVER (Software Engineering Club at FPT University Da Nang).
- Bảng màu: Night Sky `#12203A`, Lantern Red `#993C1D`/`#712B13`, Amber Gold `#FAC775`/`#FAEEDA`, Brand Blue `#0091EA`/`#85B7EB`.
- Mascot: Buggy the Ladybug.

## Evidence on Hand
- [spec-deploy-uoc-mo.md](file:///c:/Users/qnhat/deploy_uoc_mo_dever/spec-deploy-uoc-mo.md)
- [design-deploy-uoc-mo.md](file:///c:/Users/qnhat/deploy_uoc_mo_dever/design-deploy-uoc-mo.md)
- [task-list-deploy-uoc-mo.md](file:///c:/Users/qnhat/deploy_uoc_mo_dever/task-list-deploy-uoc-mo.md)
- Brand assets in `public/assets/`.

## Product Principles
1. **Frictionless Mobile Interaction**: Thao tác quét QR và gửi ước mơ hoàn tất trong vòng dưới 30 giây.
2. **Ultra-Stable Performance**: Display bay đèn lồng duy trì 60fps ổn định suốt 4 tiếng, không rò rỉ bộ nhớ.
3. **High Aesthetic Craft & Contrast**: Tương phản cao, chữ to rõ dễ đọc ngoài trời, typography tiếng Việt hoàn mỹ.
4. **Local Autonomy**: Vận hành trơn tru cả khi mạng trường bị nghẽn hoặc mất kết nối internet.

## Accessibility & Inclusion
Tuân thủ tiêu chuẩn WCAG AA/AAA (tương phản text >= 4.5:1), hỗ trợ touch target >= 44px, thông báo trạng thái rõ ràng, hỗ trợ `prefers-reduced-motion`.
