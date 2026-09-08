import { PutCommand } from "@aws-sdk/lib-dynamodb";

import products from "./data/products.json" with { type: "json" };

import { env } from "../config/env.js";
import { dynamoDbDocumentClient } from "../infra/dynamodb/client.js";
import { passwordService } from "../modules/auth/password.service.js";

const seedUser = {
  userId: "user-001",
  email: "demo@example.com",
  password: "Password123!",
};

async function seed(): Promise<void> {
  const passwordHash = await passwordService.hash(seedUser.password);

  await dynamoDbDocumentClient.send(
    new PutCommand({
      TableName: env.tables.users,
      Item: {
        userId: seedUser.userId,
        email: seedUser.email,
        passwordHash,
      },
    }),
  );

  for (const product of products) {
    await dynamoDbDocumentClient.send(
      new PutCommand({
        TableName: env.tables.products,
        Item: product,
      }),
    );
  }

  console.log("Seed executado com sucesso.");
  console.log(`Usuário: ${seedUser.email}`);
  console.log(`Senha: ${seedUser.password}`);
  console.log(`Produtos inseridos: ${products.length}`);
}

seed().catch((error: unknown) => {
  console.error("Erro ao executar seed:", error);
  process.exitCode = 1;
});
