import { createHash, randomBytes } from "node:crypto";

import { env } from "../../config/env.js";

export interface RefreshTokenData {
  token: string;
  tokenHash: string;
  expiresAt: number;
}

export class RefreshTokenService {
  create(): RefreshTokenData {
    const token = randomBytes(32).toString("base64url");
    const nowInSeconds = Math.floor(Date.now() / 1000);

    return {
      token,
      tokenHash: this.hash(token),
      expiresAt: nowInSeconds + env.auth.refreshTokenExpiresInSeconds,
    };
  }

  hash(token: string): string {
    return createHash("sha256").update(token, "utf8").digest("hex");
  }
}

export const refreshTokenService = new RefreshTokenService();
