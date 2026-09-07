import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { env } from "../../config/env.js";
import { dynamoDbDocumentClient } from "../../infra/dynamodb/client.js";

export interface ProductRecord {
  productId: string;
  name: string;
  price: number;
  listKey: string;
  [key: string]: unknown;
}

export interface ListProductsResult {
  items: ProductRecord[];
  lastEvaluatedKey?: Record<string, unknown>;
}

export class ProductsRepository {
  async list(
    limit: number,
    exclusiveStartKey?: Record<string, unknown>,
  ): Promise<ListProductsResult> {
    const response = await dynamoDbDocumentClient.send(
      new QueryCommand({
        TableName: env.tables.products,
        IndexName: "ProductListIndex",
        KeyConditionExpression: "listKey = :listKey",
        ExpressionAttributeValues: {
          ":listKey": "PRODUCT",
        },
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    const result: ListProductsResult = {
      items: (response.Items ?? []) as ProductRecord[],
    };

    if (response.LastEvaluatedKey !== undefined) {
      result.lastEvaluatedKey = response.LastEvaluatedKey;
    }

    return result;
  }
}

export const productsRepository = new ProductsRepository();
