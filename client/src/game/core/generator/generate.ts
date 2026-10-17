import { randomLevelId } from "../level";
import { isSolved } from "../rules";
import { createRng } from "../rng";
import { solve } from "../solver";
import type {
  Difficulty,
  DifficultyProfile,
  GenerateOptions,
  GenerateResult,
  Level,
  LevelState,
  SolverBudget
} from "../types";
import { buildProfile, runtimeProfile } from "./difficulty";
import { lowerBoundPushes, placeBoxes } from "./reverse";
import { buildBoard } from "./rooms";

/**
 * Bước 3 và 4 của generator: chấm ứng viên bằng solver rồi lặp cho tới khi được màn
 * (ADR-0003).
 *
 * Vòng lặp ở đây **luôn có trần**. Sinh màn chạy trong Worker trong lúc người chơi
 * nhìn spinner; một vòng lặp "thử tới khi nào được" là một tab đứng hình mà không có
 * gì trong log nói tại sao.
 */

/** Trên ngưỡng này thì đây là ngân sách lúc build, dưới thì là ngân sách trong Worker. */
const RUNTIME_MILLIS_CEILING = 1_000;

/** Từ tỉ lệ ngân sách này trở đi mà vẫn tay trắng thì bắt đầu hạ chuẩn. */
const RELAX_AFTER = 0.6;

/** Số đẩy thật cao hơn cận dưới Manhattan chừng này — dùng để nới bộ lọc rẻ tiền. */
const BOUND_MARGIN = 4;

/**
 * Đích dồn thành cụm tới mức nào, theo bậc.
 *
 * Bậc dễ rải đích ra: mỗi thùng có đích riêng ở gần, quãng đường ngắn và nhìn là hiểu.
 * Bậc khó dồn đích lại thành phòng đích — đó là cách duy nhất đo được để đưa số đẩy
 * tối ưu lên khoảng của bậc (xem `chooseGoals` trong `reverse.ts`).
 */
const GOAL_CLUSTERING: Readonly<Record<Difficulty, number>> = {
  easy: 0.15,
  medium: 0.55,
  hard: 0.85,
  expert: 0.95
};

/**
 * `GenerateOptions` chỉ mang theo ngân sách, không mang theo khuôn — nên khuôn phải
 * suy ra từ ngân sách. Hai bộ ngân sách cách nhau cả một bậc độ lớn về `maxMillis`
 * (300 so với 1500 trở lên) nên phân biệt được chắc chắn, và cả hai nơi gọi đều lấy
 * ngân sách từ đúng `difficulty.ts` này chứ không tự chế số.
 */
function profileForBudget(options: GenerateOptions): DifficultyProfile & { maxAttempts: number } {
  return options.budget.maxMillis <= RUNTIME_MILLIS_CEILING
    ? runtimeProfile(options.difficulty)
    : buildProfile(options.difficulty);
}

/** Trộn seed gốc với số thứ tự lần thử — cùng seed vào, cùng loạt ứng viên ra. */
function attemptSeed(seed: number, attempt: number): number {
  let h = (seed ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (attempt + 0x85ebca6b), 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  return h === 0 ? 0x6d2b79f5 : h;
}

/**
 * Hạ chuẩn dần: bàn nhỏ lại, ít thùng đi, khoảng đẩy nới rộng ra.
 *
 * Trong trình duyệt, `null` nghĩa là người chơi bấm nút rồi nhận một thông báo lỗi.
 * Một màn dễ hơn dự kiến là kết quả tốt hơn hẳn, nên khi sắp hết lần thử thì nới chuẩn
 * chứ không giữ chuẩn rồi về tay không. `ratio` chạy từ 0 (vừa chạm mốc) tới 1 (lần
 * thử cuối cùng).
 */
function relaxProfile(profile: DifficultyProfile, ratio: number): DifficultyProfile {
  if (ratio <= 0) return profile;

  const steps = Math.ceil(ratio * 3);
  const boxes = Math.max(2, profile.boxes - (steps >= 2 ? 1 : 0));
  const cols = Math.max(2, profile.rooms.cols - (steps >= 3 ? 1 : 0));
  const rows = Math.max(2, profile.rooms.rows - (steps >= 3 ? 1 : 0));

  return {
    difficulty: profile.difficulty,
    rooms: { cols, rows },
    boxes,
    minPushes: Math.max(3, Math.round(profile.minPushes * (1 - 0.25 * steps))),
    maxPushes: Math.round(profile.maxPushes * (1 + 0.5 * steps)),
    maxNodes: Math.round(profile.maxNodes * (1 + steps))
  };
}

function toLevel(
  options: GenerateOptions,
  initial: LevelState,
  pushes: number,
  moves: number
): Level {
  return {
    // Script sinh pack ghi đè `id` bằng số thứ tự trong pack (`easy-01`); ở runtime
    // thì đây là mã màn ngẫu nhiên, cố ý mang chữ `r` để không bao giờ bị đọc nhầm
    // thành một màn chiến dịch có số thứ tự khổng lồ.
    id: randomLevelId(options.difficulty, options.seed),
    seed: options.seed,
    difficulty: options.difficulty,
    initial,
    optimalPushes: pushes,
    optimalMoves: moves
  };
}

/**
 * Ngân sách kéo lùi ban đầu, và cách nó tự chỉnh.
 *
 * Số bước kéo **không bằng** số đẩy tối ưu: đường kéo đi lòng vòng, còn solver tìm
 * đường thẳng nhất. Tỉ lệ giữa hai con số phụ thuộc hình dạng bản đồ nên không đoán
 * trước được — thay vì đoán, để nó tự dò: đẩy ra ít quá thì lần sau kéo xa hơn, nhiều
 * quá thì kéo gần lại. Sau vài lần thử là bám sát khoảng của bậc.
 */
function initialPullBudget(profile: DifficultyProfile): number {
  // Đo thật: khoảng một nửa số bước kéo sống sót thành bước đẩy trong lời giải tối ưu,
  // nên nhắm vào giữa khoảng của bậc thì phải kéo gấp đôi quãng ấy.
  return Math.max(4, profile.minPushes + profile.maxPushes);
}

export function generateLevel(options: GenerateOptions): GenerateResult | null {
  const base = profileForBudget(options);
  const maxAttempts = Math.max(1, options.maxAttempts);
  const budget: SolverBudget = options.budget;
  // `relaxFrom === maxAttempts` nghĩa là không lượt nào chạm tới vùng hạ chuẩn.
  const relaxFrom =
    options.allowRelax === false ? maxAttempts : Math.floor(maxAttempts * RELAX_AFTER);

  let pullBudget = initialPullBudget(base);
  // Trần độ sâu mà solver **thật sự** kham nổi trong ngân sách này. Bắt đầu ở trần của
  // bậc rồi tụt dần mỗi lần solver nghẹn: một cú `timeout` không nói màn vô nghiệm (bất
  // biến #15), nhưng nó nói rất rõ rằng ở độ sâu này ngân sách không đủ — và ứng viên
  // sâu tương đương tiếp theo cũng sẽ nghẹn y hệt. Không có nó thì bộ chỉnh ngân sách
  // kéo dao động: nghẹn thì hạ, ứng viên sau nông quá thì nâng, rồi lại nghẹn — mỗi
  // vòng dao động tốn trọn `maxMillis`.
  let depthCeiling = base.maxPushes;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const ratio =
      attempt < relaxFrom || maxAttempts <= relaxFrom
        ? 0
        : (attempt - relaxFrom + 1) / Math.max(1, maxAttempts - relaxFrom);
    const profile = relaxProfile(base, ratio);

    const rng = createRng(attemptSeed(options.seed, attempt));

    const board = buildBoard(rng, profile);
    if (board === null) continue;

    // Rung nhẹ quanh ngân sách kéo hiện tại: bộ tự chỉnh ở dưới bám rất sát mép dưới
    // của khoảng, nên không rung thì cả pack toàn màn `minPushes + 2`.
    const jittered = Math.max(4, Math.round((pullBudget * rng.range(75, 130)) / 100));
    const capped = Math.min(jittered, profile.maxPushes * 5);
    const initial = placeBoxes(rng, board, profile.boxes, capped, {
      clustering: GOAL_CLUSTERING[profile.difficulty]
    });
    // Đi lùi không kéo được cú nào thì thế cờ trả về vẫn là thế thắng — không phải
    // một màn, chỉ là một bàn cờ đã xong.
    if (initial === null || isSolved(initial)) continue;

    // Chặn trước khi gọi solver — đây là chỗ tiết kiệm lớn nhất của cả generator.
    // Solver ở bàn 11×11 với 4 thùng chỉ mở nổi vài nghìn nút mỗi giây, nên một ứng
    // viên hỏng mà vẫn đem đi chấm là hàng giây bốc hơi. `lowerBoundPushes` là cận
    // dưới **thật** của số đẩy tối ưu nên vế trên là kết luận chắc chắn. Vế dưới chỉ
    // là phỏng đoán, nhưng đo trên vài trăm ứng viên thì số đẩy thật luôn nằm khoảng
    // cận dưới + 4…8, nên hạ 4 là đủ rộng mà vẫn cắt được gần hết ứng viên nhạt.
    const bound = lowerBoundPushes(initial);
    if (bound > Math.min(profile.maxPushes, depthCeiling)) {
      pullBudget = Math.max(4, Math.round(pullBudget * 0.8));
      continue;
    }
    if (bound < profile.minPushes - BOUND_MARGIN) {
      pullBudget = Math.min(profile.maxPushes * 5, Math.round(pullBudget * 1.3) + 2);
      continue;
    }

    const result = solve(initial, budget);
    // `timeout` **không phải** `unsolvable` (bất biến #15). Cả hai đều dẫn tới việc
    // vứt ứng viên này, nhưng không cái nào cho phép kết luận gì về màn — nên ở đây
    // chỉ có một nhánh duy nhất: không phải `solved` thì thử cái khác.
    if (result.status !== "solved") {
      // Solver nghẹn thường là do kéo quá xa; lùi cả trần độ sâu lẫn ngân sách kéo.
      depthCeiling = Math.max(profile.minPushes, depthCeiling - 2);
      pullBudget = Math.max(4, Math.round(pullBudget * 0.85));
      continue;
    }

    if (result.pushes < profile.minPushes) {
      pullBudget = Math.min(profile.maxPushes * 5, Math.round(pullBudget * 1.35) + 2);
      continue;
    }
    if (result.pushes > profile.maxPushes) {
      pullBudget = Math.max(4, Math.round(pullBudget * 0.7));
      continue;
    }
    // Quá rối so với bậc: giải được nhưng người chơi bậc này sẽ không giải nổi.
    if (result.nodes > profile.maxNodes) continue;

    return {
      level: toLevel(options, initial, result.pushes, result.moves),
      attempts: attempt
    };
  }

  return null;
}
