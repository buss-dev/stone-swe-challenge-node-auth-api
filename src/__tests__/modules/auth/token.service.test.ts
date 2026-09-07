import { TokenService } from "../../../modules/auth/token.service.js";

describe("TokenService", () => {
  const tokenService = new TokenService();

  it("cria um access token com a identidade do usuário", () => {
    const token = tokenService.createAccessToken("user-001");

    const payload = tokenService.verifyAccessToken(token);

    expect(payload.sub).toBe("user-001");
    expect(payload.jti).toEqual(expect.any(String));
    expect(payload.iat).toEqual(expect.any(Number));
    expect(payload.exp).toEqual(expect.any(Number));
  });

  it("rejeita um token inválido", () => {
    expect(() => {
      tokenService.verifyAccessToken("token-invalido");
    }).toThrow();
  });
});
