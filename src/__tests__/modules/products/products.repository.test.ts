import { jest } from "@jest/globals";

import { dynamoDbDocumentClient } from "../../../infra/dynamodb/client.js";
import { ProductsRepository } from "../../../modules/products/products.repository.js";

describe("ProductsRepository", () => {
  const repository = new ProductsRepository();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("retorna os produtos e a chave da próxima página", async () => {
    const products = [
      {
        productId: "product-001",
        name: "Teclado",
        price: 200,
        listKey: "PRODUCT",
      },
      {
        productId: "product-002",
        name: "Mouse",
        price: 100,
        listKey: "PRODUCT",
      },
    ];

    const lastEvaluatedKey = {
      listKey: "PRODUCT",
      productId: "product-002",
    };

    const sendMock = jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValue({
        Items: products,
        LastEvaluatedKey: lastEvaluatedKey,
        $metadata: {},
      } as never);

    const result = await repository.list(2);

    expect(result).toEqual({
      items: products,
      lastEvaluatedKey,
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("retorna uma lista vazia quando não existem produtos", async () => {
    const sendMock = jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValue({
        Items: [],
        $metadata: {},
      } as never);

    const result = await repository.list(10);

    expect(result).toEqual({
      items: [],
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});
