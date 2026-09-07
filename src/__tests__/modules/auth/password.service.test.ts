import { PasswordService } from "../../../modules/auth/password.service.js";

describe("PasswordService", () => {
  const passwordService = new PasswordService();

  it("gera um hash diferente da senha original", async () => {
    const password = "senha-segura";

    const passwordHash = await passwordService.hash(password);

    expect(passwordHash).not.toBe(password);
    expect(passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it("aceita a senha correta", async () => {
    const password = "senha-segura";
    const passwordHash = await passwordService.hash(password);

    const result = await passwordService.compare(password, passwordHash);

    expect(result).toBe(true);
  });

  it("rejeita uma senha incorreta", async () => {
    const passwordHash = await passwordService.hash("senha-segura");

    const result = await passwordService.compare(
      "senha-incorreta",
      passwordHash,
    );

    expect(result).toBe(false);
  });
});
