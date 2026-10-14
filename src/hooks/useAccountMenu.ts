"use client";

import { useCallback, useEffect, useState, type FocusEvent, type RefObject } from "react";

/**
 * Hành vi của menu tài khoản — không có kiểu dáng.
 *
 * - Esc đóng và trả tiêu điểm về nút mở; bấm ra ngoài đóng mà không giành lại tiêu điểm.
 * - Mũi tên / Home / End di chuyển giữa các mục (vòng tròn).
 * - Tab đóng menu rồi để tiêu điểm đi tiếp theo thứ tự tự nhiên.
 * - `focusout` chỉ đóng khi tiêu điểm đi tới một phần tử NẰM NGOÀI cả menu lẫn nút mở.
 *   `relatedTarget === null` thì KHÔNG đóng: Safari không focus nút khi bấm, nên
 *   focusout bắn với null và menu sẽ đóng rồi mở lại ngay trong cùng cú bấm.
 */
export function useAccountMenu(
  triggerRef: RefObject<HTMLButtonElement | null>,
  menuRef: RefObject<HTMLDivElement | null>
) {
  const [open, setOpen] = useState(false);

  const close = useCallback(
    (refocus: boolean) => {
      setOpen(false);
      if (refocus) triggerRef.current?.focus();
    },
    [triggerRef]
  );

  useEffect(() => {
    if (!open) return;
    // Phase CAPTURE trên window, và chỉ khi menu đang mở: game nghe phím ở window (bubble),
    // nên nếu menu nghe ở document thì ArrowUp / Escape… vẫn lọt xuống game phía sau menu.
    // Mọi phím menu xử lý đều stopPropagation; menu đóng thì game nhận phím y như cũ.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close(true);
        return;
      }
      if (event.key === "Tab") {
        // Đưa tiêu điểm về nút mở TRƯỚC khi đóng: phần tử đang focus bị gỡ khỏi DOM thì
        // Tab sẽ bắt đầu lại từ đầu trang. Từ nút mở, Tab/Shift+Tab đi tiếp đúng chỗ.
        event.stopPropagation();
        triggerRef.current?.focus();
        setOpen(false);
        return;
      }
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement as HTMLElement);
      let next: number;
      if (event.key === "ArrowDown") next = (index + 1) % items.length;
      else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = items.length - 1;
      else return;
      event.stopPropagation();
      event.preventDefault();
      items[next]?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close(false);
    };
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer);
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close, triggerRef, menuRef]);

  const onMenuBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && !menuRef.current?.contains(next) && !triggerRef.current?.contains(next)) close(false);
    },
    [close, triggerRef, menuRef]
  );

  const toggle = useCallback(() => setOpen((value) => !value), []);

  return { open, toggle, close, onMenuBlur };
}
