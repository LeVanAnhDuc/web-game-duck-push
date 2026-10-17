"use client";

import { LogIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useAccountMenu } from "@/hooks/useAccountMenu";
import { useDuckerAuth } from "@/hooks/useDuckerAuth";
import { initialOf } from "@/lib/initials";

/**
 * Đăng nhập Ducker ID — tuỳ chọn, chỉ định danh (không có lưu trữ/đồng bộ gì).
 *
 * Menu neo vào phần tử `relative` gần nhất (hàng nút ở header trang chủ), không neo vào nút avatar,
 * để ở 375px nó không tràn ra mép trái màn hình.
 * Đứng ở góc trên bên phải, đúng ô người dùng quen đọc là "tài khoản". Tính năng
 * đang "ship tối": cờ tắt hoặc thiếu biến thì component này trả về `null` và game
 * y hệt trước đây (ADR-0010). Màu avatar dùng đúng token primary / on-primary.
 */

const STRINGS = {
  signIn: "Đăng nhập",
  signingIn: "Đang đăng nhập…",
  menuLabel: "Tài khoản Ducker ID",
  openProfile: "Mở hồ sơ Ducker ID",
  signOut: "Đăng xuất"
} as const;

const ITEM_CLASS =
  "flex min-h-[44px] w-full cursor-pointer items-center rounded-[var(--radius-md)] px-3 text-left text-[14px] font-medium text-[var(--color-foreground)] transition-colors duration-[var(--motion-ui)] hover:bg-[var(--color-background)]";

export function AccountButton() {
  const auth = useDuckerAuth();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menu = useAccountMenu(triggerRef, menuRef);
  const signInRef = useRef<HTMLButtonElement>(null);
  const focusSignInNext = useRef(false);
  const [failedPicture, setFailedPicture] = useState<string | null>(null);

  const signedIn = auth.status === "signed-in" && auth.profile !== null;

  // Sau "Đăng xuất" nút mở menu biến mất; đưa tiêu điểm sang nút "Đăng nhập" ở cùng
  // chỗ để người dùng bàn phím không bị rơi về <body>.
  useEffect(() => {
    if (!signedIn && focusSignInNext.current) {
      focusSignInNext.current = false;
      signInRef.current?.focus();
    }
  }, [signedIn]);

  if (!auth.enabled) return null;

  if (!signedIn || auth.profile === null) {
    // `idle` (HTML tĩnh + lần vẽ đầu) cũng vẽ đúng nút này nhưng khoá, cùng kích thước:
    // không bấm được trước khi hydrate và header không xê dịch qua idle → loading → signed-out.
    const loading = auth.status === "loading";
    return (
      <Button
        ref={signInRef}
        variant="ghost"
        pending={loading}
        disabled={auth.status === "idle"}
        onClick={auth.signIn}
        className="flex-none cursor-pointer"
      >
        {/* Dưới `sm` chỉ còn biểu tượng (tên truy cập vẫn là chữ, sr-only) để hàng header không xuống dòng ở 375px. */}
        {loading ? null : <LogIn aria-hidden="true" size={20} className="sm:hidden" />}
        <span className="sr-only text-[14px] font-medium whitespace-nowrap sm:not-sr-only">
          {loading ? STRINGS.signingIn : STRINGS.signIn}
        </span>
      </Button>
    );
  }

  const { profile } = auth;
  const headline = profile.name?.trim() ? profile.name : profile.email;

  return (
    <div>
      <Button
        ref={triggerRef}
        variant="ghost"
        onClick={menu.toggle}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-label={STRINGS.menuLabel}
        className="flex-none cursor-pointer"
      >
        {profile.picture && failedPicture !== profile.picture ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh từ Ducker ID, static export không tối ưu ảnh
          <img
            src={profile.picture}
            alt=""
            width={32}
            height={32}
            referrerPolicy="no-referrer"
            onError={() => setFailedPicture(profile.picture ?? null)}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[14px] font-bold text-[var(--color-on-primary)]"
          >
            {initialOf(profile)}
          </span>
        )}
      </Button>
      {menu.open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={STRINGS.menuLabel}
          onBlur={menu.onMenuBlur}
          className="card overlay-in absolute top-full right-0 z-40 mt-2 flex w-64 max-w-[calc(100vw-2rem)] flex-col gap-1 p-2"
        >
          <div role="none" className="px-3 py-2">
            {headline ? (
              <p className="truncate text-[14px] font-medium text-[var(--color-card-foreground)]">{headline}</p>
            ) : null}
            {profile.name?.trim() && profile.email ? (
              <p className="truncate text-[13px] text-[var(--color-muted-foreground)]">{profile.email}</p>
            ) : null}
          </div>
          <a
            role="menuitem"
            href={auth.profileUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => menu.close(false)}
            className={ITEM_CLASS}
          >
            {STRINGS.openProfile}
          </a>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              menu.close(false);
              focusSignInNext.current = true;
              auth.signOut();
            }}
            className={ITEM_CLASS}
          >
            {STRINGS.signOut}
          </button>
        </div>
      ) : null}
    </div>
  );
}
