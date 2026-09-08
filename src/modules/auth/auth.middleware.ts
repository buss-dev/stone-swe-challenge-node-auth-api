import type { NextFunction, Request, Response } from "express";

import { authService } from "./auth.service.js";
import { HttpError } from "../../shared/http-error.js";

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

export const authenticateAccessToken = async (
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken = getBearerToken(request);

    await authService.authenticateAccessToken(accessToken);

    next();
  } catch (error: unknown) {
    next(error);
  }
};
