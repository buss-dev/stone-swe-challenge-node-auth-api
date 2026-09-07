import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { env } from "../../../config/env.js";
import {
  dynamoDbClient,
  dynamoDbDocumentClient,
} from "../../../infra/dynamodb/client.js";

describe("cliente do DynamoDB", () => {
  it("cria o cliente básico e o Document Client", () => {
    expect(dynamoDbClient).toBeInstanceOf(DynamoDBClient);
    expect(dynamoDbDocumentClient).toBeInstanceOf(DynamoDBDocumentClient);
  });

  it("configura a região do cliente", async () => {
    expect(await dynamoDbClient.config.region()).toBe(env.dynamodb.region);
  });

  it("configura o endpoint definido no ambiente", async () => {
    const endpointProvider = dynamoDbClient.config.endpoint;

    expect(endpointProvider).toBeDefined();

    if (endpointProvider === undefined) {
      throw new Error("O endpoint do DynamoDB não foi configurado");
    }

    const endpoint = await endpointProvider();
    const configuredEndpoint = new URL(env.dynamodb.endpoint);

    expect(endpoint.protocol).toBe(configuredEndpoint.protocol);
    expect(endpoint.hostname).toBe(configuredEndpoint.hostname);
    expect(Number(endpoint.port)).toBe(Number(configuredEndpoint.port));
  });
});
