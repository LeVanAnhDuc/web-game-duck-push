# Quyết định kiến trúc (ADR)

> **Trả lời:** Sáu tháng sau — tại sao lại làm thế này?
> **Cập nhật khi:** chốt một quyết định kỹ thuật. Ghi **ngay trong phiên đó**.

## Mục lục

<!-- BEGIN:auto — bảng dưới do .claude/scripts/docs-regen.sh sinh từ các file ADR. Đừng sửa tay. -->
| ID | Tiêu đề | Ngày | Trạng thái |
| --- | --- | --- | --- |
| [ADR-0001](0001-design-tokens.md) | Bỏ hướng Pixel Art, dùng bảng màu thùng gỗ + Space Grotesk / IBM Plex Mono | 2026-09-04 | accepted |
| [ADR-0002](0002-static-export-and-dom-board.md) | Xuất HTML tĩnh bằng Next.js và vẽ bàn cờ bằng DOM, không dùng canvas | 2026-09-04 | accepted |
| [ADR-0003](0003-hybrid-level-generation.md) | Sinh màn kiểu lai: ghép phòng mẫu, đặt thùng bằng đi lùi, chấm bằng solver có ngân sách | 2026-09-04 | accepted |
| [ADR-0004](0004-push-space-astar-solver.md) | Solver A\* trên không gian đẩy, chuẩn hoá theo vùng người chơi | 2026-09-04 | accepted |
| [ADR-0005](0005-local-storage-only.md) | Lưu toàn bộ tiến độ trong `localStorage`, có `version`, hỏng thì bỏ | 2026-09-04 | accepted |
| [ADR-0006](0006-release-and-ci-pipeline.md) | Phát hành tự động từ chính commit subject, CI tách ba job | 2026-09-04 | accepted |
<!-- END:auto -->

Trạng thái: `accepted` · `superseded by ADR-00xx` · `deprecated`

## Cách thêm một ADR

1. Lấy số kế tiếp, tạo `NNNN-<slug-tieng-anh>.md` từ [`_template.md`](_template.md).
   Ví dụ: `0003-dung-prisma-thay-typeorm.md`.
2. Điền. Giữ trong khoảng 15–40 dòng.
3. Thêm một dòng vào bảng trên.

## Ba quy tắc

- **Một quyết định, một file.** File thứ hai bàn cùng chuyện nghĩa là quyết định đầu chưa dứt.
- **Append-only.** ADR đã `accepted` thì **không sửa nội dung**. Đổi ý thì viết ADR mới, ghi `supersedes ADR-0007`, và đổi ADR cũ sang `superseded by`.
- **Ghi ngay khi chốt**, không để cuối phiên. Ngữ cảnh của một phiên dài có thể bị nén trước khi phiên kết thúc, và lúc đó lý do đã mất.

## Khi nào cần ADR

Cần: chọn thư viện/framework/datastore · đổi ranh giới module · chọn cách xử lý một vấn đề mà có ≥ 2 phương án hợp lý · chấp nhận một hạn chế lâu dài.

Không cần: sửa bug · thêm chức năng theo đúng khuôn có sẵn · quyết định có thể đảo trong 10 phút.
