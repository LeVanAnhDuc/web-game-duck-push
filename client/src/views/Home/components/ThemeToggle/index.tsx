"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/Button";
import { THEME_LABELS, useTheme } from "@/hooks/useTheme";
import type { ThemePreference } from "@/game/storage/types";

/**
 * Nút đổi giao diện: theo hệ thống → sáng → tối → theo hệ thống.
 *
 * **Có nhãn chữ nhìn thấy được, không chỉ biểu tượng.** Nút này đứng ở góc trên bên
 * phải — đúng ô mà người dùng web đã quen đọc là "tài khoản". Một persona trong lượt
 * review 2026-09 (F-04) quét vào đó, tin chắc đó là đăng nhập, bấm vào rồi hụt:
 * *"ủa vậy cái này với account là hai chuyện khác nhau à."* Lúc đó sản phẩm không có
 * tài khoản nào. Nay có đăng nhập Ducker ID TUỲ CHỌN (ADR-0010) — nhưng chỉ hiện khi
 * cờ tính năng bật, bản deploy vẫn chưa có. Nút "Đăng nhập" là nút riêng đứng cạnh
 * (`AccountButton`), nên nút này vẫn phải giữ nhãn chữ để hai việc không lẫn vào nhau:
 * đổi giao diện không phải là tài khoản. `aria-label` vốn đã đúng; nhãn chữ là cho
 * người nhìn bằng mắt.
 */

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
      <span className="text-[14px] font-medium">{THEME_LABELS[theme]}</span>
    </Button>
  );
}
