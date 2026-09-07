import { usersRepository } from "../users/users.repository.js";
import { passwordService } from "./password.service.js";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { revokedTokenRepository } from "./revoked-token.repository.js";
import { type AccessTokenPayload, tokenService } from "./token.service.js";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: number;
  user: {
    userId: string;
    email: string;
  };
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

export class AuthService {
  async login(input: LoginInput): Promise<LoginResult> {
    const user = await usersRepository.findByEmail(input.email);
    const passwordHash = user?.passwordHash;

    if (
      user === null ||
      typeof passwordHash !== "string" ||
      !(await passwordService.compare(input.password, passwordHash))
    ) {
      throw new Error("Credenciais inválidas");
    }

    const accessToken = tokenService.createAccessToken(user.userId);
    const refreshToken = refreshTokenService.create();
    const createdAt = Math.floor(Date.now() / 1000);

    await refreshTokenRepository.save({
      tokenHash: refreshToken.tokenHash,
      userId: user.userId,
      createdAt,
      expiresAt: refreshToken.expiresAt,
    });

    return {
      accessToken,
      refreshToken: refreshToken.token,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      user: {
        userId: user.userId,
        email: user.email,
      },
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    const tokenHash = refreshTokenService.hash(refreshToken);
    const storedToken = await refreshTokenRepository.findByHash(tokenHash);

    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (
      storedToken === null ||
      storedToken.revokedAt !== undefined ||
      storedToken.expiresAt <= nowInSeconds
    ) {
      throw new Error("Refresh token inválido");
    }

    const accessToken = tokenService.createAccessToken(storedToken.userId);
    const newRefreshToken = refreshTokenService.create();

    await refreshTokenRepository.revoke(
      storedToken.tokenHash,
      nowInSeconds,
      newRefreshToken.tokenHash,
    );

    await refreshTokenRepository.save({
      tokenHash: newRefreshToken.tokenHash,
      userId: storedToken.userId,
      createdAt: nowInSeconds,
      expiresAt: newRefreshToken.expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
      refreshTokenExpiresAt: newRefreshToken.expiresAt,
    };
  }

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    const payload = tokenService.verifyAccessToken(accessToken);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    await revokedTokenRepository.save({
      jti: payload.jti,
      expiresAt: payload.exp,
      revokedAt: nowInSeconds,
    });

    const tokenHash = refreshTokenService.hash(refreshToken);
    const storedToken = await refreshTokenRepository.findByHash(tokenHash);

    if (storedToken === null || storedToken.revokedAt !== undefined) {
      return;
    }

    await refreshTokenRepository.revoke(storedToken.tokenHash, nowInSeconds);
  }

  async authenticateAccessToken(
    accessToken: string,
  ): Promise<AccessTokenPayload> {
    const payload = tokenService.verifyAccessToken(accessToken);
    const revoked = await revokedTokenRepository.isRevoked(payload.jti);

    if (revoked) {
      throw new Error("Access token revogado");
    }

    return payload;
  }
}

export const authService = new AuthService();
