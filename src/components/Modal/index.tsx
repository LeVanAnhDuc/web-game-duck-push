"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hộp thoại có bẫy tiêu điểm.
 *
 * Chỉ **lớp phủ báo thắng** được dùng cái này. Cảnh báo bế tắc thì tuyệt đối
 * không: hộp thoại chắn ngang đúng nút Hoàn tác mà người chơi đang với tới
 * (MASTER.md §Anti-Patterns).
 *
 * Ba việc bắt buộc của một hộp thoại đúng nghĩa: bẫy Tab bên trong, đóng bằng
 * Escape, và trả tiêu điểm về đúng chỗ cũ khi đóng — không có cái thứ ba thì
 * người dùng bàn phím bị ném về đầu trang sau mỗi lần thắng.
 */

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  labelledBy,
  children
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly labelledBy: string;
  readonly children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // `onClose` là hàm mới sau mỗi lần vẽ. Nếu để nó trong deps thì effect chạy lại
  // liên tục và mỗi lần lại kéo tiêu điểm về nút đầu tiên — giữ qua ref để effect
  // chỉ phụ thuộc đúng việc hộp thoại đang mở hay đóng.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      // Trả tiêu điểm về nơi đã mở hộp thoại, nếu nơi đó còn nằm trong trang.
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="overlay-in fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "color-mix(in oklab, var(--color-foreground) 45%, transparent)" }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="card w-full max-w-sm p-6"
        style={{ borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)" }}
      >
        {children}
      </div>
    </div>
  );
}
