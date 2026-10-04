import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exchangeCode, fetchProfile } from "@/lib/duckerRequests";

const config = {
  issuer: "http://localhost:3000",
  clientId: "game-client",
  scope: "openid",
  profileUrl: "http://localhost:3000/profile"
};

const fetchMock = vi.fn();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("duckerRequests", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("posts the token form without a client_secret and with an AbortSignal", async () => {
    fetchMock.mockResolvedValue(json({ access_token: "at-1" }));
    await expect(exchangeCode(config, "code-1", "verifier-1")).resolves.toEqual({ accessToken: "at-1" });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("http://localhost:3000/oauth/token");
    expect(init.method).toBe("POST");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const body = init.body as URLSearchParams;
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("code-1");
    expect(body.get("code_verifier")).toBe("verifier-1");
    expect(body.get("redirect_uri")).toBe(new URL("/", window.location.origin).toString());
    expect(body.get("client_id")).toBe("game-client");
    expect(body.has("client_secret")).toBe(false);
  });

  it("throws on a non-ok token response", async () => {
    fetchMock.mockResolvedValue(json({ error: "invalid_grant" }, 400));
    await expect(exchangeCode(config, "c", "v")).rejects.toThrow("token_exchange_failed_400");
  });

  it("throws when a 200 response has no string access_token", async () => {
    fetchMock.mockResolvedValue(json({ token_type: "Bearer" }));
    await expect(exchangeCode(config, "c", "v")).rejects.toThrow();
    fetchMock.mockResolvedValue(json({ access_token: 42 }));
    await expect(exchangeCode(config, "c", "v")).rejects.toThrow();
  });

  it("sends the bearer to userinfo with an AbortSignal and returns the profile", async () => {
    fetchMock.mockResolvedValue(json({ sub: "u1", name: "Đức" }));
    await expect(fetchProfile(config, "at-1")).resolves.toEqual({ sub: "u1", name: "Đức" });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("http://localhost:3000/oauth/userinfo");
    expect(init.headers.Authorization).toBe("Bearer at-1");
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("rejects a malformed profile and accepts a minimal one", async () => {
    fetchMock.mockResolvedValue(json(null));
    await expect(fetchProfile(config, "t")).rejects.toThrow("userinfo_invalid");
    fetchMock.mockResolvedValue(json({ sub: "u1", name: 42 }));
    await expect(fetchProfile(config, "t")).rejects.toThrow("userinfo_invalid");
    fetchMock.mockResolvedValue(json({ sub: "" }));
    await expect(fetchProfile(config, "t")).rejects.toThrow("userinfo_invalid");
    fetchMock.mockResolvedValue(json({ sub: "u1" }));
    await expect(fetchProfile(config, "t")).resolves.toEqual({ sub: "u1" });
  });

  it("throws on a non-ok userinfo response", async () => {
    fetchMock.mockResolvedValue(json({}, 401));
    await expect(fetchProfile(config, "bad")).rejects.toThrow("userinfo_failed_401");
  });
});
