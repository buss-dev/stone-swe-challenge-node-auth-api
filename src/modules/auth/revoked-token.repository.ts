import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { env } from "../../config/env.js";
import { dynamoDbDocumentClient } from "../../infra/dynamodb/client.js";

export interface RevokedTokenRecord {
  jti: string;
  expiresAt: number;
  revokedAt: number;
}

export class RevokedTokenRepository {
  async save(record: RevokedTokenRecord): Promise<void> {
    await dynamoDbDocumentClient.send(
      new PutCommand({
        TableName: env.tables.revokedTokens,
        Item: record,
      }),
    );
  }

  async isRevoked(jti: string): Promise<boolean> {
    const response = await dynamoDbDocumentClient.send(
      new GetCommand({
        TableName: env.tables.revokedTokens,
        Key: {
          jti,
        },
      }),
    );

    return response.Item !== undefined;
  }
}

export const revokedTokenRepository = new RevokedTokenRepository();
