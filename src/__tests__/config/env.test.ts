import { loadEnv } from "../../config/env.js";

describe("configuração do ambiente", () => {
  it("converte as durações dos tokens para segundos", () => {
    const result = loadEnv({
      PORT: "4000",
      AWS_REGION: "us-east-1",
      DYNAMODB_ENDPOINT: "http://localhost:9000",
      DYNAMODB_ACCESS_KEY_ID: "test-key",
      DYNAMODB_SECRET_ACCESS_KEY: "test-secret",
      USERS_TABLE_NAME: "test-users",
      PRODUCTS_TABLE_NAME: "test-products",
      JWT_SECRET: "test-jwt-secret",
      JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS: "600",
      JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS: "172800",
    });

    expect(result.auth).toEqual({
      jwtSecret: "test-jwt-secret",
      accessTokenExpiresInSeconds: 600,
      refreshTokenExpiresInSeconds: 172800,
    });
  });

  it("rejeita uma porta inválida", () => {
    expect(() => loadEnv({ PORT: "aaa" })).toThrow(
      "PORT deve ser um número inteiro entre 1 e 65535",
    );
  });

  it("exige JWT_SECRET", () => {
    expect(() => loadEnv({})).toThrow("JWT_SECRET é obrigatória");
  });

  it("rejeita uma duração de access token inválida", () => {
    expect(() =>
      loadEnv({
        JWT_SECRET: "test-jwt-secret",
        JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS: "abc",
        JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS: "172800",
      }),
    ).toThrow(
      "JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS deve ser um inteiro positivo",
    );
  });

  it("usa os nomes das tabelas de autenticação fornecidos pelo ambiente", () => {
    const result = loadEnv({
      JWT_SECRET: "test-jwt-secret",
      REVOKED_TOKENS_TABLE_NAME: "test-revoked-tokens",
      REFRESH_TOKENS_TABLE_NAME: "test-refresh-tokens",
    });

    expect(result.tables).toEqual({
      users: "users",
      products: "products",
      revokedTokens: "test-revoked-tokens",
      refreshTokens: "test-refresh-tokens",
    });
  });
});
