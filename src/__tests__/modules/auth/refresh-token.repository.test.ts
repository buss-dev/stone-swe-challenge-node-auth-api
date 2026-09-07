import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { jest } from "@jest/globals";

import { dynamoDbDocumentClient } from "../../../infra/dynamodb/client.js";
import { RefreshTokenRepository } from "../../../modules/auth/refresh-token.repository.js";

describe("RefreshTokenRepository", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("busca um refresh token pelo hash", async () => {
    const record = {
      tokenHash: "hashed-token",
      userId: "user-1",
      createdAt: 1_700_000_000,
      expiresAt: 1_700_604_800,
    };

    const send = jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValueOnce({ Item: record } as never);

    const repository = new RefreshTokenRepository();

    const result = await repository.findByHash("hashed-token");

    expect(send).toHaveBeenCalledWith(expect.any(GetCommand));

    const command = send.mock.calls[0]?.[0];

    expect(command).toMatchObject({
      input: {
        TableName: "refresh_tokens",
        Key: {
          tokenHash: "hashed-token",
        },
      },
    });

    expect(result).toEqual(record);
  });

  it("salva apenas os dados persistíveis do refresh token", async () => {
    const send = jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValueOnce({} as never);

    const repository = new RefreshTokenRepository();

    await repository.save({
      tokenHash: "hashed-token",
      userId: "user-1",
      createdAt: 1_700_000_000,
      expiresAt: 1_700_604_800,
    });

    expect(send).toHaveBeenCalledWith(expect.any(PutCommand));

    const command = send.mock.calls[0]?.[0];

    expect(command).toMatchObject({
      input: {
        TableName: "refresh_tokens",
        Item: {
          tokenHash: "hashed-token",
          userId: "user-1",
          createdAt: 1_700_000_000,
          expiresAt: 1_700_604_800,
        },
      },
    });
  });

  it("marca um refresh token como revogado", async () => {
    const send = jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValueOnce({} as never);

    const repository = new RefreshTokenRepository();

    await repository.revoke("hashed-token", 1_700_000_100, "replacement-hash");

    expect(send).toHaveBeenCalledWith(expect.any(UpdateCommand));

    const command = send.mock.calls[0]?.[0];

    expect(command).toMatchObject({
      input: {
        TableName: "refresh_tokens",
        Key: {
          tokenHash: "hashed-token",
        },
        ExpressionAttributeValues: {
          ":revokedAt": 1_700_000_100,
          ":replacedByTokenHash": "replacement-hash",
        },
      },
    });
  });
});
