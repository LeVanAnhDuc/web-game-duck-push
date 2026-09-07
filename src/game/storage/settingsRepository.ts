import { readJson, writeJson } from "./safeStorage";
import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  STORAGE_VERSION,
  type Settings,
  type ThemePreference
} from "./types";

/**
 * Kho tuỳ chọn. Cùng kỷ luật kiểm dữ liệu như `progressRepository`: đọc vào mà
 * lệch hình dạng thì trả `DEFAULT_SETTINGS`, không vá từng trường.
 *
 * Vá từng trường nghe có vẻ thân thiện hơn nhưng lại giấu lỗi: một khối settings
 * ghi bởi phiên bản khác sẽ sống sót một nửa, và người chơi thấy giao diện đổi
 * ngẫu nhiên mà không hiểu vì sao. Về mặc định thì rõ ràng và sửa được bằng một
 * lần chỉnh trong menu.
 */

const THEMES: ReadonlySet<string> = new Set<ThemePreference>(["system", "light", "dark"]);

function isSettings(value: unknown): value is Settings {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== STORAGE_VERSION) return false;
  if (typeof candidate.theme !== "string" || !THEMES.has(candidate.theme)) return false;
  if (typeof candidate.showTrail !== "boolean") return false;
  if (typeof candidate.showDeadlockWarning !== "boolean") return false;
  return true;
}

export function loadSettings(): Settings {
  const raw = readJson(STORAGE_KEYS.settings);
  if (!isSettings(raw)) return DEFAULT_SETTINGS;
  return raw;
}

export function saveSettings(settings: Settings): boolean {
  return writeJson(STORAGE_KEYS.settings, settings);
}
