"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { THEME_LABELS, useTheme } from "@/hooks/useTheme";
import type { ThemePreference } from "@/game/storage/types";

/** Nút đổi giao diện: theo hệ thống → sáng → tối → theo hệ thống. */

const ICONS: Readonly<Record<ThemePreference, typeof Monitor>> = {
  system: Monitor,
  light: Sun,
  dark: Moon
};

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const Icon = ICONS[theme];

  return (
    <Button
      variant="ghost"
      onClick={cycleTheme}
      // Nút chỉ có biểu tượng nên nhãn phải nói cả trạng thái hiện tại lẫn việc bấm vào sẽ làm gì.
      aria-label={`Giao diện: ${THEME_LABELS[theme]}. Bấm để đổi.`}
      title={THEME_LABELS[theme]}
      className="cursor-pointer"
    >
      <Icon aria-hidden="true" size={20} />
    </Button>
  );
}
