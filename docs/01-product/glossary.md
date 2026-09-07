# Thuật ngữ

> **Trả lời:** Khái niệm này gọi là gì trong code, và hiện ra sao trên UI?
> **Trạng thái:** 🟡 một phần — đã khoá tên cho các khái niệm đã có trong code
> **Cập nhật:** 2026-09-04 · commit feat/v1-core
> **Cập nhật khi:** xuất hiện một khái niệm nghiệp vụ mới trong code hoặc UI

| Thuật ngữ | Định nghĩa một câu | Tên trong code | Tên trên UI (VI) | Tên trên UI (EN) |
| --- | --- | --- | --- | --- |
| Màn | Một câu đố hoàn chỉnh: bàn cờ, vị trí thùng và đích, kèm số bước tối ưu | `Level` | Màn | Level |
| Bàn cờ | Phần tĩnh của màn — tường, sàn, đích. Không đổi trong suốt ván | `Board` | Bàn cờ | Board |
| Trạng thái | Phần động — người chơi ở đâu, các thùng ở đâu | `LevelState` | — (không hiện) | — |
| Thùng | Vật thể người chơi đẩy | `box` | Thùng | Crate |
| Đích | Ô mà thùng phải nằm lên | `goal` | Đích | Goal |
| Bước đi | Một lần người chơi dịch một ô, có đẩy hay không | `move` | Bước | Move |
| Lần đẩy | Một bước đi có làm thùng dịch chuyển. **Kỷ lục chấm theo cái này** | `push` | Đẩy | Push |
| Bế tắc | Thế mà một thùng không bao giờ về đích được nữa | `deadlock` | Kẹt | Stuck |
| Ô chết | Ô mà thùng đặt vào đó là hỏng vĩnh viễn, tính sẵn cho mỗi bàn cờ | `deadSquare` | — (không hiện) | — |
| Ván | Một lượt chơi một màn: lịch sử nước đi, bộ đếm, đồng hồ | `GameSession` | Ván | Session |
| Bậc khó | Bốn mức: `easy`/`medium`/`hard`/`expert` | `Difficulty` | Dễ · Vừa · Khó · Rất khó | Easy · Medium · Hard · Expert |
| Pack | Tập màn sinh sẵn của một bậc khó, commit vào repo | `LevelPack` | Chiến dịch | Campaign |
| Seed | Số sinh ra một màn; cùng seed cho đúng màn đó | `seed` | Seed | Seed |
| Kỷ lục | Kết quả tốt nhất của người chơi ở một màn | `LevelRecord` | Kỷ lục · KL | Record |
| Số đẩy tối ưu | Số lần đẩy ít nhất có thể, do solver tính lúc sinh màn | `optimalPushes` | Tối ưu | Optimal |
| Vệt đường đi | 12 ô gần nhất người chơi đã qua, mờ dần trên sàn | `trail` | Vệt đi | Trail |

**Tên bị cấm:**

- Dùng `box` trong code, **không** dùng `crate`/`block`/`cell` — dù UI tiếng Anh hiển thị
  "Crate" cho tự nhiên. Một khái niệm, một tên trong code.
- Dùng `move` cho một bước đi và `push` cho một lần đẩy. **Không bao giờ dùng `step` làm danh
  từ** — `step()` là tên hàm áp dụng luật, dùng lẫn sẽ không đọc được.
- Dùng `goal`, **không** dùng `target`/`dot`/`storage`.
- Dùng `deadlock` cho thế bế tắc và `deadSquare` cho ô chết. Hai khái niệm khác nhau: ô chết
  là thuộc tính của bàn cờ, bế tắc là thuộc tính của một trạng thái.
