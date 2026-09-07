"use client";

import clsx from "clsx";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Nút chuẩn của game. Luôn là `<button>` thật — không có `onClick` trên `div` ở
 * đâu trong dự án này, vì `div` không nhận tiêu điểm, không nghe Enter/Space và
 * trình đọc màn hình không đọc ra là bấm được.
 *
 * Kiểu dáng nằm trong `globals.css` (`.btn-primary`, `.btn-secondary`, `.btn-ghost`)
 * để bám sát bảng Component Specs của hệ thiết kế.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  /** Đang chờ: nút tự khoá và hiện vòng quay, chữ giữ nguyên để nút không nhảy. */
  readonly pending?: boolean;
  readonly children?: ReactNode;
}

const VARIANT_CLASS: Readonly<Record<ButtonVariant, string>> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost"
};

export function Button({
  variant = "secondary",
  pending = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled === true || pending}
      aria-busy={pending || undefined}
      className={clsx("btn", VARIANT_CLASS[variant], className)}
    >
      {pending ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
