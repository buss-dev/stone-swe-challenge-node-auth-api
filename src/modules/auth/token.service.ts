import { randomUUID } from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { env } from "../../config/env.js";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}

export class TokenService {
  createAccessToken(userId: string): string {
    const options: SignOptions = {
      algorithm: "HS256",
      expiresIn: env.auth.accessTokenExpiresInSeconds,
      jwtid: randomUUID(),
    };

    return jwt.sign({ sub: userId }, env.auth.jwtSecret, options);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const payload = jwt.verify(token, env.auth.jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.jti !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      throw new Error("Access token inválido");
    }

    return payload as AccessTokenPayload;
  }
}

export const tokenService = new TokenService();
