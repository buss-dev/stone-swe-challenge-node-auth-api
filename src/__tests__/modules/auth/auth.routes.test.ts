import request from "supertest";
import { jest } from "@jest/globals";

import { app } from "../../../app.js";
import { authService } from "../../../modules/auth/auth.service.js";

describe("Rotas de autenticação", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("realiza login", async () => {
    jest.spyOn(authService, "login").mockResolvedValueOnce({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      refreshTokenExpiresAt: 1_700_604_800,
      user: {
        userId: "user-1",
        email: "user@example.com",
      },
    });

    const response = await request(app).post("/auth/login").send({
      email: "user@example.com",
      password: "password",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      refreshTokenExpiresAt: 1_700_604_800,
      user: {
        userId: "user-1",
        email: "user@example.com",
      },
    });
  });

  it("renova a sessão", async () => {
    jest.spyOn(authService, "refresh").mockResolvedValueOnce({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      refreshTokenExpiresAt: 1_800_604_800,
    });

    const response = await request(app).post("/auth/refresh").send({
      refreshToken: "refresh-token",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      refreshTokenExpiresAt: 1_800_604_800,
    });
  });

  it("encerra a sessão", async () => {
    jest.spyOn(authService, "logout").mockResolvedValueOnce();

    const response = await request(app)
      .post("/auth/logout")
      .set("Authorization", "Bearer access-token")
      .send({
        refreshToken: "refresh-token",
      });

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("rejeita login sem senha", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "user@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "password deve ser uma string não vazia",
    });
  });

  it("rejeita logout sem access token", async () => {
    const response = await request(app).post("/auth/logout").send({
      refreshToken: "refresh-token",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Authorization Bearer token é obrigatório",
    });
  });

  it("cria um usuário", async () => {
    jest.spyOn(authService, "register").mockResolvedValueOnce({
      userId: "user-001",
      email: "newuser@example.com",
    });

    const response = await request(app)
      .post("/auth/register")
      .send({
        email: " NewUser@Example.com ",
        password: "StrongPass1!",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      userId: "user-001",
      email: "newuser@example.com",
    });
  });

  it("retorna conflito quando o e-mail já está cadastrado", async () => {
    jest
      .spyOn(authService, "register")
      .mockRejectedValueOnce(new Error("E-mail já cadastrado"));

    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "user@example.com",
        password: "StrongPass1!",
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: "E-mail já cadastrado",
    });
  });

  it("retorna erro para senha fraca", async () => {
    jest
      .spyOn(authService, "register")
      .mockRejectedValueOnce(
        new Error(
          "Senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial",
        ),
      );

    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "user@example.com",
        password: "weak",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message:
        "Senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial",
    });
  });
});
