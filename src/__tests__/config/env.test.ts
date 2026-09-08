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

  it("configures request limits from defaults and environment", () => {
    const defaults = loadEnv({ JWT_SECRET: "test-jwt-secret" });
    const configured = loadEnv({
      JWT_SECRET: "test-jwt-secret",
      RATE_LIMIT_MAX_REQUESTS: "12",
      RATE_LIMIT_WINDOW_SECONDS: "45",
    });

    expect(defaults.rateLimit).toEqual({
      maxRequests: 100,
      windowSeconds: 60,
    });
    expect(configured.rateLimit).toEqual({
      maxRequests: 12,
      windowSeconds: 45,
    });
    expect(defaults.trustProxyHops).toBe(0);
    expect(
      loadEnv({
        JWT_SECRET: "test-jwt-secret",
        TRUST_PROXY_HOPS: "2",
      }).trustProxyHops,
    ).toBe(2);
  });

  it("rejects an invalid request limit", () => {
    expect(() =>
      loadEnv({
        JWT_SECRET: "test-jwt-secret",
        RATE_LIMIT_MAX_REQUESTS: "0",
      }),
    ).toThrow("RATE_LIMIT_MAX_REQUESTS deve ser um inteiro positivo");
  });

  it("rejects a negative proxy hop count", () => {
    expect(() =>
      loadEnv({
        JWT_SECRET: "test-jwt-secret",
        TRUST_PROXY_HOPS: "-1",
      }),
    ).toThrow("TRUST_PROXY_HOPS deve ser um inteiro nao negativo");
  });
});
