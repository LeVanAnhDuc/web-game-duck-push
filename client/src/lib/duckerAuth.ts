import type { CallbackResult, DuckerConfig, PendingAuth } from "./duckerTypes";
import { DUCKER_CONFIG, DUCKER_PKCE_KEY, appRootPath } from "./duckerConfig";
import { challengeOf, randomUrlSafeToken } from "./pkce";

const CALLBACK_PARAMS = ["code", "state", "error", "error_description", "iss"];

export function redirectUri(): string {
  return new URL(appRootPath(), window.location.origin).toString();
}

function readPending(): PendingAuth | null {
  try {
    const raw = sessionStorage.getItem(DUCKER_PKCE_KEY);
    return raw ? (JSON.parse(raw) as PendingAuth) : null;
  } catch {
    return null;
  }
}

function clearPending(): void {
  try {
    sessionStorage.removeItem(DUCKER_PKCE_KEY);
  } catch {
    // sessionStorage bị chặn — coi như không có phiên chờ
  }
}

/**
 * Chặn bấm đúp: chỉ một lần đăng nhập đang bay. Chỉ hạ cờ khi KHÔNG chuyển trang;
 * nếu đã chuyển đi thì giữ nguyên — trừ khi trang được khôi phục từ bfcache (nút
 * Back từ Ducker ID), lúc đó cờ cũ vẫn là true và phải hạ xuống.
 */
let starting = false;

if (typeof window !== "undefined") {
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) starting = false;
  });
}

/** Dựng URL authorize rồi chuyển cả trang sang Ducker ID. */
export async function startLogin(config: DuckerConfig): Promise<void> {
  if (starting) return;
  starting = true;
  try {
    const verifier = randomUrlSafeToken();
    const state = randomUrlSafeToken();
    const pending: PendingAuth = {
      state,
      verifier,
      returnTo: window.location.pathname + window.location.search
    };
    try {
      sessionStorage.setItem(DUCKER_PKCE_KEY, JSON.stringify(pending));
    } catch {
      starting = false;
      return; // không cất được verifier thì đừng đi, sẽ kẹt ở callback
    }
    const url = new URL("/oauth/authorize", config.issuer);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", redirectUri());
    url.searchParams.set("scope", config.scope);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", await challengeOf(verifier));
    url.searchParams.set("code_challenge_method", "S256");
    window.location.assign(url.toString());
  } catch (error) {
    clearPending(); // đừng để verifier mồ côi nếu hỏng sau khi đã cất
    starting = false;
    throw error;
  }
}

/** Only a same-origin path may be fed to replaceState ("//evil" would throw at load). */
function isSafeReturnTo(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
}

/**
 * Đọc ?code / ?error rồi dọn ĐÚNG các tham số OAuth khỏi URL — tham số của game
 * (?level, ?seed, ?d) giữ nguyên. Code chỉ dùng được một lần, để lại trên URL thì F5
 * sẽ đem đổi lần nữa.
 */
export function consumeCallback(): CallbackResult | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const error = params.get("error");
  const state = params.get("state");
  if (!code && !error) return null;

  const pending = readPending();
  clearPending();
  for (const key of CALLBACK_PARAMS) params.delete(key);
  const query = params.toString();
  window.history.replaceState(
    window.history.state,
    "",
    window.location.pathname + (query ? `?${query}` : "") + window.location.hash
  );

  // returnTo is restored on success AND on error: redirect_uri is the bare app root,
  // so without it a cancelled sign-in would drop the game's params (?level, ?seed...).
  const returnTo = pending && isSafeReturnTo(pending.returnTo) ? pending.returnTo : undefined;
  if (error) return { error, returnTo };
  if (!pending || pending.state !== state) return { error: "state_mismatch" };
  return { code: code ?? undefined, verifier: pending.verifier, returnTo };
}

let captured: CallbackResult | null = null;
let didCapture = false;
/** URL sạch sau khi bắt callback; null nếu không có callback. */
let settledUrl: string | null = null;

function currentUrl(): string {
  return window.location.pathname + window.location.search + window.location.hash;
}

/** Chạy một lần khi module nạp trên trình duyệt, trước mọi code game đọc URL. */
export function captureCallback(): void {
  if (didCapture) return;
  didCapture = true;
  captured = consumeCallback();
  if (captured?.returnTo) {
    try {
      window.history.replaceState(window.history.state, "", captured.returnTo);
    } catch {
      // never let a bad returnTo blank the game at load
    }
  }
  if (captured) settledUrl = currentUrl();
}

/**
 * Sau hydrate, app router của Next ghi lại URL lúc hydrate (còn ?code&state) vào history,
 * có thể đè mất bước dọn ở captureCallback. Gọi lại khi mount để đặt về URL sạch,
 * không thì F5 sẽ đem một code đã dùng đi đổi lần nữa và tham số game có thể bị đè.
 */
export function settleCallbackUrl(): void {
  if (settledUrl === null) return;
  // Một lần duy nhất: remount sau này (điều hướng đi rồi về) không được ghi URL cũ đè sau lưng Next.
  const target = settledUrl;
  settledUrl = null;
  if (currentUrl() === target) return;
  try {
    window.history.replaceState(window.history.state, "", target);
  } catch {
    // best effort
  }
}

export function capturedCallback(): CallbackResult | null {
  return captured;
}

/** Chỉ dành cho test. */
export function resetCaptureForTests(): void {
  captured = null;
  didCapture = false;
  settledUrl = null;
  starting = false;
}

if (typeof window !== "undefined" && DUCKER_CONFIG) captureCallback();
