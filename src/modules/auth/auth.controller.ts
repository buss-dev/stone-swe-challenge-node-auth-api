import type { NextFunction, Request, Response } from "express";

import { authService } from "./auth.service.js";
import { HttpError } from "../../shared/http-error.js";

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `${field} deve ser uma string não vazia`);
  }

  return value;
}

function getBearerToken(request: Request): string {
  const authorization = request.header("authorization");

  if (authorization === undefined) {
    throw new HttpError(401, "Authorization Bearer token é obrigatório");
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || token === undefined || token.trim() === "") {
    throw new HttpError(401, "Authorization Bearer token inválido");
  }

  return token;
}

export class AuthController {
  register = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = request.body as Record<string, unknown>;

      const email = requiredString(body.email, "email");
      const password = requiredString(body.password, "password");

      const result = await authService.register({
        email,
        password,
      });

      response.status(201).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  login = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = request.body as Record<string, unknown>;

      const email = requiredString(body.email, "email");
      const password = requiredString(body.password, "password");

      const result = await authService.login({
        email,
        password,
      });

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  refresh = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = request.body as Record<string, unknown>;
      const refreshToken = requiredString(body.refreshToken, "refreshToken");

      const result = await authService.refresh(refreshToken);

      response.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };

  logout = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const accessToken = getBearerToken(request);
      const body = request.body as Record<string, unknown>;
      const refreshToken = requiredString(body.refreshToken, "refreshToken");

      await authService.logout(accessToken, refreshToken);

      response.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}

export const authController = new AuthController();
