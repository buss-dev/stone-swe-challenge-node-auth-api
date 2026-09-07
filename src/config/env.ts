function requiredEnv(source: NodeJS.ProcessEnv, name: string): string {
  const value = source[name];

  if (value === undefined || value.trim() === "") {
    throw new Error(`${name} é obrigatória`);
  }

  return value;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env) {
  const port = Number(source.PORT ?? "3000");

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("PORT deve ser um número inteiro entre 1 e 65535");
  }

  return {
    port,

    dynamodb: {
      region: source.AWS_REGION ?? "sa-east-1",
      endpoint: source.DYNAMODB_ENDPOINT ?? "http://localhost:8000",
      accessKeyId: source.DYNAMODB_ACCESS_KEY_ID ?? "local",
      secretAccessKey: source.DYNAMODB_SECRET_ACCESS_KEY ?? "local",
    },

    tables: {
      users: source.USERS_TABLE_NAME ?? "users",
      products: source.PRODUCTS_TABLE_NAME ?? "products",
    },

    auth: {
      jwtSecret: requiredEnv(source, "JWT_SECRET"),
      accessTokenExpiresIn: source.JWT_ACCESS_TOKEN_EXPIRES_IN ?? "15m",
      refreshTokenExpiresIn: source.JWT_REFRESH_TOKEN_EXPIRES_IN ?? "7d",
    },
  } as const;
}

export const env = loadEnv();
