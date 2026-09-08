import request from "supertest";
import { jest } from "@jest/globals";

import { app } from "../../../app.js";
import { authService } from "../../../modules/auth/auth.service.js";
import { productsRepository } from "../../../modules/products/products.repository.js";

describe("Rotas de produtos", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("lista produtos para um access token válido", async () => {
    jest.spyOn(authService, "authenticateAccessToken").mockResolvedValueOnce({
      sub: "user-1",
      jti: "token-id",
      iat: 1_700_000_000,
      exp: 1_700_000_900,
    });

    jest.spyOn(productsRepository, "list").mockResolvedValueOnce({
      items: [
        {
          productId: "product-001",
          name: "Teclado",
          price: 200,
          listKey: "PRODUCT",
        },
      ],
      lastEvaluatedKey: {
        listKey: "PRODUCT",
        productId: "product-001",
      },
    });

    const response = await request(app)
      .get("/products")
      .set("Authorization", "Bearer access-token")
      .query({ limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.nextCursor).toEqual(expect.any(String));
  });

  it("rejeita acesso sem access token", async () => {
    const response = await request(app).get("/products");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Authorization Bearer token é obrigatório",
    });
  });

  it("rejeita um limite inválido", async () => {
    jest.spyOn(authService, "authenticateAccessToken").mockResolvedValueOnce({
      sub: "user-1",
      jti: "token-id",
      iat: 1_700_000_000,
      exp: 1_700_000_900,
    });

    const response = await request(app)
      .get("/products")
      .set("Authorization", "Bearer access-token")
      .query({ limit: 101 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "limit deve ser um inteiro entre 1 e 100",
    });
  });
});
