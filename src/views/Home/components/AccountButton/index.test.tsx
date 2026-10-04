import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock("@/hooks/useDuckerAuth", () => ({ useDuckerAuth: () => auth.value }));

import { AccountButton } from "@/views/Home/components/AccountButton";

const base = {
  enabled: true,
  profileUrl: "http://localhost:3000/profile",
  signIn: vi.fn(),
  signOut: vi.fn()
};
const signedIn = {
  ...base,
  status: "signed-in",
  profile: { sub: "u1", name: "Lê Văn Anh Đức", email: "duc@ducker.id" }
};

let container: HTMLDivElement;
let root: Root;

function mount(): void {
  act(() => root.render(<AccountButton />));
}
function byName(name: string): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLElement>("button, a")).find(
      (el) => (el.getAttribute("aria-label") ?? el.textContent ?? "").trim() === name
    ) ?? null
  );
}
function press(el: HTMLElement, init: KeyboardEventInit): void {
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
  });
}
function openMenu(): HTMLElement {
  const trigger = byName("Tài khoản Ducker ID")!;
  act(() => trigger.click());
  return trigger;
}

beforeEach(() => {
  base.signIn.mockClear();
  base.signOut.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("AccountButton", () => {
  it("renders nothing when the feature is disabled", () => {
    auth.value = { ...base, enabled: false, status: "idle", profile: null };
    mount();
    expect(container.innerHTML).toBe("");
  });

  it("shows the sign-in button when signed out and starts login on click", () => {
    auth.value = { ...base, status: "signed-out", profile: null };
    mount();
    act(() => byName("Đăng nhập")!.click());
    expect(base.signIn).toHaveBeenCalledOnce();
  });

  it("disables the button while signing in", () => {
    auth.value = { ...base, status: "loading", profile: null };
    mount();
    expect((byName("Đang đăng nhập…") as HTMLButtonElement).disabled).toBe(true);
  });

  it("opens the menu with the profile link and sign out; Esc closes and refocuses the trigger", () => {
    auth.value = signedIn;
    mount();
    const trigger = openMenu();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.textContent).toContain("Lê Văn Anh Đức");
    expect(container.textContent).toContain("duc@ducker.id");
    const link = byName("Mở hồ sơ Ducker ID") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("http://localhost:3000/profile");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(document.activeElement).toBe(link);

    press(document.body, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on an outside pointerdown", () => {
    auth.value = signedIn;
    mount();
    const trigger = openMenu();
    act(() => {
      document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("calls signOut from the menu", () => {
    auth.value = signedIn;
    mount();
    openMenu();
    act(() => byName("Đăng xuất")!.click());
    expect(base.signOut).toHaveBeenCalledOnce();
  });

  it("puts focus on the sign-in button after signing out", () => {
    // signOut flips the mocked store the same way the real one does.
    const out = {
      ...base,
      status: "signed-out",
      profile: null
    };
    auth.value = {
      ...signedIn,
      signOut: () => {
        base.signOut();
        auth.value = out;
        act(() => root.render(<AccountButton />));
      }
    };
    mount();
    openMenu();
    act(() => byName("Đăng xuất")!.click());
    const signInButton = byName("Đăng nhập");
    expect(signInButton).not.toBeNull();
    expect(document.activeElement).toBe(signInButton);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("moves between items with the arrow keys, wrapping, and Home / End", () => {
    auth.value = signedIn;
    mount();
    openMenu();
    const link = byName("Mở hồ sơ Ducker ID")!;
    const out = byName("Đăng xuất")!;
    expect(document.activeElement).toBe(link);
    press(link, { key: "ArrowDown" });
    expect(document.activeElement).toBe(out);
    press(out, { key: "ArrowDown" });
    expect(document.activeElement).toBe(link);
    press(link, { key: "ArrowUp" });
    expect(document.activeElement).toBe(out);
    press(out, { key: "Home" });
    expect(document.activeElement).toBe(link);
    press(link, { key: "End" });
    expect(document.activeElement).toBe(out);
  });

  it("keeps menu keys away from a bubble-phase window listener (the game) only while open", () => {
    auth.value = signedIn;
    mount();
    const seen: string[] = [];
    const gameListener = (event: KeyboardEvent) => seen.push(event.key);
    window.addEventListener("keydown", gameListener);
    try {
      press(document.body, { key: "ArrowUp" });
      expect(seen).toEqual(["ArrowUp"]); // closed: the game gets its keys

      seen.length = 0;
      const trigger = openMenu();
      press(document.body, { key: "ArrowUp" });
      press(document.body, { key: "ArrowDown" });
      press(document.body, { key: "Escape" });
      expect(seen).toEqual([]);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");

      press(document.body, { key: "ArrowUp" });
      press(document.body, { key: "Escape" });
      expect(seen).toEqual(["ArrowUp", "Escape"]); // closed again
    } finally {
      window.removeEventListener("keydown", gameListener);
    }
  });

  it("closes on Tab without trapping focus", () => {
    auth.value = signedIn;
    mount();
    const trigger = openMenu();
    press(byName("Mở hồ sơ Ducker ID")!, { key: "Tab" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it("closes when focus moves to an element outside the menu and trigger", () => {
    auth.value = signedIn;
    mount();
    const trigger = openMenu();
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    act(() => outside.focus());
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    outside.remove();
  });

  it("stays open on a focusout with relatedTarget null (Safari trigger click)", () => {
    auth.value = signedIn;
    mount();
    const trigger = openMenu();
    const menu = container.querySelector('[role="menu"]')!;
    act(() => {
      menu.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("shows the email as the main line when there is no name, and no email line when there is no email", () => {
    auth.value = { ...base, status: "signed-in", profile: { sub: "u1", email: "duc@ducker.id" } };
    mount();
    openMenu();
    expect(container.querySelectorAll('[role="menu"] p')).toHaveLength(1);
    expect(container.querySelector('[role="menu"] p')?.textContent).toBe("duc@ducker.id");

    act(() => root.unmount());
    root = createRoot(container);
    auth.value = { ...base, status: "signed-in", profile: { sub: "u1", name: "Đức" } };
    mount();
    openMenu();
    expect(container.querySelectorAll('[role="menu"] p')).toHaveLength(1);
    expect(container.querySelector('[role="menu"] p')?.textContent).toBe("Đức");
  });

  it("shows the initial when there is no picture and the picture when there is one", () => {
    auth.value = signedIn;
    mount();
    expect(byName("Tài khoản Ducker ID")!.textContent).toBe("L");
    expect(container.querySelector("img")).toBeNull();

    auth.value = { ...signedIn, profile: { ...signedIn.profile, picture: "https://img.test/a.png" } };
    mount();
    expect(container.querySelector("img")?.getAttribute("src")).toBe("https://img.test/a.png");
  });
});
