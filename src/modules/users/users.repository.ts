import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { env } from "../../config/env.js";
import { dynamoDbDocumentClient } from "../../infra/dynamodb/client.js";

export interface UserRecord {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export class UsersRepository {
  async create(user: UserRecord): Promise<void> {
    await dynamoDbDocumentClient.send(
      new PutCommand({
        TableName: env.tables.users,
        Item: user,
      }),
    );
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const response = await dynamoDbDocumentClient.send(
      new QueryCommand({
        TableName: env.tables.users,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
        Limit: 1,
      }),
    );

    const item = response.Items?.[0];

    return item ? (item as UserRecord) : null;
  }
}

export const usersRepository = new UsersRepository();
