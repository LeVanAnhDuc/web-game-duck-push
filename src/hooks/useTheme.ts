"use client";

import { useCallback, useEffect } from "react";
import { useSettings } from "./useSettings";
import { settingsStore, writeSettings } from "./storageStore";
import type { ThemePreference } from "@/game/storage/types";

/**
 * Giao diện sáng/tối.
 *
 * `system` là mặc định và được thể hiện bằng cách **gỡ hẳn** `data-theme` khỏi
 * `<html>`, không phải bằng cách ghi `data-theme="system"` — CSS chỉ có luật cho
 * `light` và `dark`, còn `system` chính là "để `prefers-color-scheme` quyết định".
 */

const ORDER: readonly ThemePreference[] = ["system", "light", "dark"];

export const THEME_LABELS: Readonly<Record<ThemePreference, string>> = {
  system: "Theo hệ thống",
  light: "Nền sáng",
  dark: "Nền tối"
};

function applyTheme(theme: ThemePreference): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function useTheme(): {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  cycleTheme: () => void;
} {
  const theme = useSettings().theme;

  // Đồng bộ một chiều React → DOM. Đây đúng là việc của effect: đẩy trạng thái
  // ra một hệ thống bên ngoài, chứ không phải để tính lại state.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    // Đọc lại từ kho ngay lúc ghi: tuỳ chọn khác có thể vừa đổi ở nơi khác.
    writeSettings({ ...settingsStore.getSnapshot(), theme: next });
  }, []);

  const cycleTheme = useCallback(() => {
    const index = ORDER.indexOf(theme);
    setTheme(ORDER[(index + 1) % ORDER.length] ?? "system");
  }, [theme, setTheme]);

  return { theme, setTheme, cycleTheme };
}
