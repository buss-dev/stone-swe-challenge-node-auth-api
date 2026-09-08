import type { ErrorRequestHandler } from "express";

import { HttpError } from "../shared/http-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
): void => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      message: error.message,
    });

    return;
  }

  if (
    error instanceof Error &&
    error.message === "E-mail já cadastrado"
  ) {
    response.status(409).json({
      message: error.message,
    });

    return;
  }

  if (
    error instanceof Error &&
    error.message.startsWith("Senha deve ter")
  ) {
    response.status(400).json({
      message: error.message,
    });

    return;
  }

  if (
    error instanceof Error &&
    [
      "Credenciais inválidas",
      "Refresh token inválido",
      "Access token revogado",
    ].includes(error.message)
  ) {
    response.status(401).json({
      message: error.message,
    });

    return;
  }

  if (
    error instanceof Error &&
    ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
      error.name,
    )
  ) {
    response.status(401).json({
      message: "Access token inválido",
    });

    return;
  }

  console.error(error);

  response.status(500).json({
    message: "Erro interno do servidor",
  });
};
