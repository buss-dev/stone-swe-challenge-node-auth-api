import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { jest } from "@jest/globals";

import { dynamoDbDocumentClient } from "../../../infra/dynamodb/client.js";
import { RevokedTokenRepository } from "../../../modules/auth/revoked-token.repository.js";

describe("RevokedTokenRepository", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("salva um token de acesso revogado", async () => {
    const send = jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValueOnce({} as never);

    const repository = new RevokedTokenRepository();

    await repository.save({
      jti: "token-id",
      expiresAt: 1_700_000_900,
      revokedAt: 1_700_000_100,
    });

    expect(send).toHaveBeenCalledWith(expect.any(PutCommand));

    const command = send.mock.calls[0]?.[0];

    expect(command).toMatchObject({
      input: {
        TableName: "revoked_tokens",
        Item: {
          jti: "token-id",
          expiresAt: 1_700_000_900,
          revokedAt: 1_700_000_100,
        },
      },
    });
  });

  it("identifica um token revogado", async () => {
    const send = jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValueOnce({
        Item: {
          jti: "token-id",
          expiresAt: 1_700_000_900,
          revokedAt: 1_700_000_100,
        },
      } as never);

    const repository = new RevokedTokenRepository();

    const result = await repository.isRevoked("token-id");

    expect(result).toBe(true);
    expect(send).toHaveBeenCalledWith(expect.any(GetCommand));

    const command = send.mock.calls[0]?.[0];

    expect(command).toMatchObject({
      input: {
        TableName: "revoked_tokens",
        Key: {
          jti: "token-id",
        },
      },
    });
  });

  it("identifica quando um token não está revogado", async () => {
    jest
      .spyOn(dynamoDbDocumentClient, "send")
      .mockResolvedValueOnce({} as never);

    const repository = new RevokedTokenRepository();

    const result = await repository.isRevoked("active-token");

    expect(result).toBe(false);
  });
});
