/**
 * Vỏ bọc `localStorage` **không bao giờ ném lỗi**.
 *
 * Lý do phải có tầng này: `localStorage` hỏng ở ba chỗ khác nhau, và chỉ chặn
 * một chỗ là chưa đủ.
 *   1. *Truy cập thuộc tính* — Safari ở chế độ riêng tư và Chrome khi người dùng
 *      chặn site data ném `SecurityError` ngay tại `window.localStorage`, trước
 *      khi kịp gọi hàm nào. Vì vậy phép đọc thuộc tính cũng nằm trong try/catch.
 *   2. *Ghi* — hết quota thì `setItem` ném `QuotaExceededError`.
 *   3. *Không có `window`* — Next.js dựng trang này trên server lúc build.
 *
 * Ván đang chơi quan trọng hơn việc lưu được hay không, nên mọi lỗi ở đây đều
 * biến thành `null`/`false` chứ không nổi lên trên.
 */

/** Khoá dùng để thử ghi; ghi xong xoá ngay. */
const PROBE_KEY = "sokoban:__probe__";

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    // Chính dòng này có thể ném — xem lý do (1) ở đầu file.
    const storage = window.localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

/**
 * Đọc và parse JSON. Trả `null` khi thiếu khoá, khi JSON hỏng, hay khi
 * `localStorage` không dùng được. Người gọi tự kiểm hình dạng dữ liệu — ở đây
 * chỉ bảo đảm "không nổ".
 */
export function readJson(key: string): unknown {
  const storage = getStorage();
  if (storage === null) return null;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    // `JSON.parse("null")` trả về null hợp lệ, nhưng với người gọi thì cũng là
    // "không có dữ liệu" — gộp hai trường hợp làm một cho đỡ phải kiểm hai lần.
    return parsed ?? null;
  } catch {
    return null;
  }
}

/** Ghi JSON. `false` nghĩa là không lưu được — người gọi vẫn chơi tiếp bình thường. */
export function writeJson(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (storage === null) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  const storage = getStorage();
  if (storage === null) return;
  try {
    storage.removeItem(key);
  } catch {
    // Xoá không được thì thôi; lần đọc sau sẽ tự loại dữ liệu hỏng.
  }
}

/**
 * Có ghi được thật hay không. Phải *thử ghi* chứ không chỉ kiểm sự tồn tại: có
 * trình duyệt cho đọc `localStorage` nhưng chặn mọi lệnh ghi.
 */
export function isAvailable(): boolean {
  const storage = getStorage();
  if (storage === null) return false;
  try {
    storage.setItem(PROBE_KEY, "1");
    storage.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}
