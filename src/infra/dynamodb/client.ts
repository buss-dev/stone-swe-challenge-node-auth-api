import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { env } from "../../config/env.js";

export const dynamoDbClient = new DynamoDBClient({
  region: env.dynamodb.region,
  endpoint: env.dynamodb.endpoint,
  credentials: {
    accessKeyId: env.dynamodb.accessKeyId,
    secretAccessKey: env.dynamodb.secretAccessKey,
  },
});

export const dynamoDbDocumentClient =
  DynamoDBDocumentClient.from(dynamoDbClient);
