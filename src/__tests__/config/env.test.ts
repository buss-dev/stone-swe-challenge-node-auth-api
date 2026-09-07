import { loadEnv } from "../../config/env.js";

describe("configuração do ambiente", () => {
  it("usa os valores fornecidos pelo ambiente", () => {
    const result = loadEnv({
      PORT: "4000",
      AWS_REGION: "us-east-1",
      DYNAMODB_ENDPOINT: "http://localhost:9000",
      DYNAMODB_ACCESS_KEY_ID: "test-key",
      DYNAMODB_SECRET_ACCESS_KEY: "test-secret",
      USERS_TABLE_NAME: "test-users",
      PRODUCTS_TABLE_NAME: "test-products",
    });

    expect(result).toEqual({
      port: 4000,
      dynamodb: {
        region: "us-east-1",
        endpoint: "http://localhost:9000",
        accessKeyId: "test-key",
        secretAccessKey: "test-secret",
      },
      tables: {
        users: "test-users",
        products: "test-products",
      },
    });
  });

  it("rejeita uma porta inválida", () => {
    expect(() => loadEnv({ PORT: "aaa" })).toThrow(
      "PORT deve ser um número inteiro entre 1 e 65535",
    );
  });
});
