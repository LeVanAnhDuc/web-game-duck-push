# Tổng quan sản phẩm

> **Trả lời:** Sản phẩm này là gì, cho ai, và **KHÔNG** làm gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/v1-core
> **Cập nhật khi:** định vị đổi · thêm/bớt một Non-Goal · trần chi phí đổi

## 1. Một câu định vị

Duck Push là Sokoban chơi được ngay trên trình duyệt, với **màn chơi do máy sinh
và đã được solver kiểm định là giải được**, kèm số bước tối ưu để người chơi có đích mà đuổi — khác các bản
Sokoban web khác ở chỗ nguồn màn không cạn và độ khó là con số đo được, không phải nhãn dán.

## 2. Vấn đề đang giải

Sokoban trên web hầu hết là một tập màn cố định lấy từ các bộ sưu tập cũ: chơi hết là hết,
độ khó nhảy cóc, và không có gì để so — người chơi giải xong một màn không biết mình đi thừa
bao nhiêu bước. Ai muốn chơi tiếp phải đi tìm bộ màn khác.

## 3. Người dùng mục tiêu

Người chơi giải đố trên điện thoại hoặc máy tính, chơi từng đợt ngắn 5–15 phút, đã biết luật
Sokoban hoặc học được trong một màn. **Nhóm chính là người chơi trên điện thoại** — bố cục
375px được thiết kế trước, các bề rộng khác suy ra sau.

## 4. Non-Goals — dứt khoát không làm

- **Không có tài khoản, không đăng nhập.** Mọi tiến độ nằm trong `localStorage` của máy đó.
  Có tài khoản là có backend, có PII, có xoá dữ liệu — đổi hẳn bản chất dự án.
- **Không có bảng xếp hạng online.** Cùng lý do, cộng thêm việc chống gian lận một game
  chạy hoàn toàn phía client là bài toán không có lời giải sạch.
- **Không có trình soạn màn.** Nguồn màn của sản phẩm này là generator; một editor sẽ tự
  cạnh tranh với chính lý do generator tồn tại.
- **Không có gợi ý nước đi trong v1.** Solver hiện chỉ chạy từ trạng thái đầu lúc sinh màn.
  Gợi ý đòi solver chạy được từ trạng thái giữa ván với ngân sách chặt — một bài toán khác.
- **Không nhập màn từ bộ sưu tập ngoài** (Microban và các bộ tương tự). Bản quyền các bộ màn
  cũ không rõ ràng, và mỗi màn nhập vào là một màn không có số bước tối ưu do ta tự tính.
- **Không âm thanh trong v1.** Không thêm giá trị cho một game giải đố im lặng, và nó kéo
  theo cả một tầng cài đặt + tôn trọng chế độ im lặng của hệ điều hành.

## 5. Mô hình

| Câu hỏi | Trả lời |
| --- | --- |
| Ai trả tiền | Không ai — dự án học tập |
| Trả bằng gì | — |
| **Trần chi phí hạ tầng / tháng** | **0 đồng.** Ràng buộc này quyết định kiến trúc: xuất HTML tĩnh, host trên GitHub Pages, không server, không datastore, không tác vụ nền. |

## 6. Thế nào là thành công

1. Một người chơi mới giải xong màn đầu tiên **mà không cần đọc hướng dẫn** — luật tự lộ ra
   qua màn 1 và 2 của bậc Dễ.
2. Sinh một màn ngẫu nhiên trên điện thoại tầm trung xong **trong 1.5 giây** (NFR-PERF-06),
   nếu không thì tính năng đó coi như không tồn tại.
3. Mọi màn trong pack chiến dịch **giải được** và số bước tối ưu đi kèm **đúng** — kiểm bằng
   test chạy lại solver trên toàn pack, không bằng niềm tin.
