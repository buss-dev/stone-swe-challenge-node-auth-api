import { RefreshTokenService } from "../../../modules/auth/refresh-token.service.js";

describe("RefreshTokenService", () => {
  const refreshTokenService = new RefreshTokenService();

  it("gera um refresh token opaco com hash e expiração", () => {
    const result = refreshTokenService.create();

    expect(result.token).toEqual(expect.any(String));
    expect(result.token.length).toBeGreaterThan(0);

    expect(result.tokenHash).toEqual(expect.any(String));
    expect(result.tokenHash).not.toBe(result.token);

    expect(result.expiresAt).toEqual(expect.any(Number));
    expect(result.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("gera tokens diferentes a cada chamada", () => {
    const first = refreshTokenService.create();
    const second = refreshTokenService.create();

    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).not.toBe(second.tokenHash);
  });

  it("calcula sempre o mesmo hash para o mesmo token", () => {
    const token = "refresh-token-de-teste";

    const firstHash = refreshTokenService.hash(token);
    const secondHash = refreshTokenService.hash(token);

    expect(firstHash).toBe(secondHash);
  });

  it("calcula hashes diferentes para tokens diferentes", () => {
    const firstHash = refreshTokenService.hash("token-1");
    const secondHash = refreshTokenService.hash("token-2");

    expect(firstHash).not.toBe(secondHash);
  });
});
