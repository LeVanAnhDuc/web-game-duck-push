import type { Difficulty, DifficultyProfile, SolverBudget } from "../types";

/**
 * Khuôn của bốn bậc khó, và ngân sách solver ở hai nơi chạy (ADR-0003).
 *
 * Có **hai** bộ khuôn chứ không phải một, vì hai nơi chạy không so được với nhau:
 * script sinh pack chạy trong Node, có cả giây để nghĩ mỗi ứng viên; nút "màn ngẫu
 * nhiên" chạy trong Worker trong lúc người chơi đang nhìn cái spinner, và ~300ms là
 * hết kiên nhẫn (NFR-PERF-06). Cùng một bậc "khó", màn runtime **nhỏ và dễ hơn** màn
 * chiến dịch — đó là cái giá đã ghi trong ADR, không phải lỗi.
 *
 * Các con số dưới đây đã được chỉnh theo đo đạc thật, không phải theo cảm giác: xem
 * phần "compromise" trong báo cáo kèm nhánh này.
 */

export interface TunedProfile extends DifficultyProfile {
  /** Số ứng viên tối đa được dựng rồi vứt trước khi bỏ cuộc. */
  readonly maxAttempts: number;
}

/**
 * Bậc dễ vẫn dùng lưới 3×2 chứ không phải 2×2 như bản phác thảo.
 *
 * Lý do: khuôn runtime bắt buộc phải **nhỏ hơn hẳn** khuôn build ở mọi bậc, mà trần
 * bàn cờ runtime là 8×8 — tức đúng lưới 2×2. Nếu bậc dễ lúc build cũng là 2×2 thì hai
 * khuôn trùng nhau và cái ràng buộc ấy vỡ ngay ở bậc đầu tiên. Bàn 11×8 với 2 thùng
 * vẫn là màn dễ: nhiều chỗ trống chỉ làm người chơi đi bộ lâu hơn, không làm họ bí.
 */
const BUILD_PROFILES: Readonly<Record<Difficulty, DifficultyProfile>> = {
  easy: {
    difficulty: "easy",
    rooms: { cols: 3, rows: 2 },
    boxes: 2,
    minPushes: 6,
    maxPushes: 16,
    maxNodes: 20_000
  },
  medium: {
    difficulty: "medium",
    rooms: { cols: 3, rows: 2 },
    boxes: 3,
    minPushes: 14,
    maxPushes: 30,
    maxNodes: 60_000
  },
  hard: {
    difficulty: "hard",
    rooms: { cols: 3, rows: 3 },
    boxes: 4,
    minPushes: 22,
    maxPushes: 35,
    maxNodes: 90_000
  },
  expert: {
    difficulty: "expert",
    rooms: { cols: 3, rows: 3 },
    boxes: 5,
    minPushes: 36,
    maxPushes: 80,
    maxNodes: 260_000
  }
};

/** Mọi bậc runtime đều là lưới 2×2 — đúng trần 8×8 của ADR — chỉ khác số thùng. */
const RUNTIME_PROFILES: Readonly<Record<Difficulty, DifficultyProfile>> = {
  easy: {
    difficulty: "easy",
    rooms: { cols: 2, rows: 2 },
    boxes: 2,
    minPushes: 5,
    maxPushes: 14,
    maxNodes: 6_000
  },
  medium: {
    difficulty: "medium",
    rooms: { cols: 2, rows: 2 },
    boxes: 2,
    minPushes: 10,
    maxPushes: 24,
    maxNodes: 8_000
  },
  hard: {
    difficulty: "hard",
    rooms: { cols: 2, rows: 2 },
    boxes: 3,
    minPushes: 14,
    maxPushes: 34,
    maxNodes: 10_000
  },
  expert: {
    difficulty: "expert",
    rooms: { cols: 2, rows: 2 },
    boxes: 4,
    minPushes: 16,
    maxPushes: 36,
    maxNodes: 12_000
  }
};

const BUILD_ATTEMPTS: Readonly<Record<Difficulty, number>> = {
  easy: 60,
  medium: 90,
  hard: 120,
  expert: 240
};

/**
 * Ít lần thử hơn hẳn lúc build: người chơi đang chờ. Hạ chuẩn sớm (60% ngân sách) rồi
 * trả về một màn dễ hơn một chút vẫn tốt hơn nhiều so với một hộp báo lỗi.
 */
const RUNTIME_ATTEMPTS: Readonly<Record<Difficulty, number>> = {
  easy: 30,
  medium: 36,
  hard: 40,
  expert: 44
};

/** Khuôn chuẩn của một bậc — chính là khuôn build, không kèm số lần thử. */
export function profileFor(difficulty: Difficulty): DifficultyProfile {
  return BUILD_PROFILES[difficulty];
}

export function buildProfile(difficulty: Difficulty): TunedProfile {
  return { ...BUILD_PROFILES[difficulty], maxAttempts: BUILD_ATTEMPTS[difficulty] };
}

export function runtimeProfile(difficulty: Difficulty): TunedProfile {
  return { ...RUNTIME_PROFILES[difficulty], maxAttempts: RUNTIME_ATTEMPTS[difficulty] };
}

/**
 * Ngân sách lúc build. Rộng, nhưng **không vô hạn**: một ứng viên rối tới mức nghĩ
 * mãi không xong thì cũng là một ứng viên nên vứt, và mỗi giây nằm trong `maxMillis`
 * là một giây nhân với số ứng viên bị vứt của cả pack.
 *
 * Đo thật trên máy phát triển sau khi solver được viết lại bằng bảng tra và bộ quét
 * vùng không cấp phát: **29.000 nút/giây** ở bàn 11×11 với 4 thùng, **35.000** với 5
 * thùng (đo trên chính pack đã commit, 2026-09-04). Bản trước đó chạy 8.200 nút/giây,
 * và chính cái trần ấy từng ép bậc Rất khó xuống ngang bậc Khó. Bảng bậc khó phía
 * trên đọc thẳng từ hai con số này — đo lại trước khi sửa chúng.
 */
export function buildBudget(difficulty: Difficulty): SolverBudget {
  switch (difficulty) {
    case "easy":
      return { maxNodes: 60_000, maxMillis: 1_500 };
    case "medium":
      return { maxNodes: 150_000, maxMillis: 3_000 };
    case "hard":
      return { maxNodes: 140_000, maxMillis: 8_000 };
    case "expert":
      // Bậc này là bậc duy nhất cần ngân sách rộng thật: sàn 36 đẩy với 5 thùng nằm
      // sâu hơn hẳn mọi bậc khác. Đã thử hạ xuống 250.000 để tiết kiệm bộ nhớ — solver
      // timeout đúng trên những ứng viên sâu mà bậc này cần, nên lượt sinh không hội
      // tụ. Giữ 420.000, và nhớ rằng A* giữ toàn bộ tập đóng trong RAM: lượt sinh pack
      // bậc expert cần khoảng 2-3 GB rảnh, đừng chạy song song với Playwright.
      return { maxNodes: 420_000, maxMillis: 20_000 };
  }
}

/**
 * Ngân sách lúc chơi. `maxMillis` là 300 ở mọi bậc — người chơi không quan tâm màn
 * họ bấm ra là bậc nào, họ chỉ thấy cái spinner.
 *
 * `maxNodes` mới là cái trần thật sự chạm tới trước: solver chỉ xem đồng hồ mỗi ~1000
 * nút, nên để `maxMillis` một mình canh cửa là để một ứng viên xấu chạy quá giờ.
 */
export function runtimeBudget(difficulty: Difficulty): SolverBudget {
  switch (difficulty) {
    case "easy":
      return { maxNodes: 20_000, maxMillis: 300 };
    case "medium":
      return { maxNodes: 25_000, maxMillis: 300 };
    case "hard":
      return { maxNodes: 30_000, maxMillis: 300 };
    case "expert":
      return { maxNodes: 35_000, maxMillis: 300 };
  }
}

/**
 * Xếp bậc cho một màn *đã đo xong*: nhập vào ba con số của solver, ra một bậc.
 *
 * Điểm là tổng đơn điệu tăng theo cả ba đầu vào, và ngưỡng thì tăng dần — nhờ vậy
 * **thêm đẩy không bao giờ làm màn xuống bậc dễ hơn**. Nếu đổi công thức mà mất tính
 * đơn điệu ấy thì bảng xếp bậc trở nên vô nghĩa mà không có gì báo động.
 */
export function classify(input: {
  pushes: number;
  boxes: number;
  nodes: number;
}): Difficulty {
  const boxBonus = Math.max(0, input.boxes - 2) * 3;
  // Số nút nói lên độ rối — hai màn cùng số đẩy nhưng một cái bắt solver mở gấp trăm
  // lần thì cái đó khó hơn thật. Lấy log để nó là gia vị, không phải món chính.
  const nodeBonus = input.nodes > 0 ? Math.min(9, Math.log2(input.nodes + 1) * 0.45) : 0;
  const score = Math.max(0, input.pushes) + boxBonus + nodeBonus;

  if (score < 20) return "easy";
  if (score < 36) return "medium";
  if (score < 48) return "hard";
  return "expert";
}
