import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../../shared/http-error.js";
import { productsRepository } from "./products.repository.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseLimit(value: unknown): number {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new HttpError(
      400,
      `limit deve ser um inteiro entre 1 e ${MAX_LIMIT}`,
    );
  }

  return limit;
}

function decodeCursor(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, "cursor inválido");
  }

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(decoded);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error("Cursor inválido");
    }

    return parsed as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "cursor inválido");
  }
}

function encodeCursor(cursor: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export class ProductsController {
  list = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const limit = parseLimit(request.query.limit);
      const cursor = decodeCursor(request.query.cursor);

      const result = await productsRepository.list(limit, cursor);

      response.status(200).json({
        items: result.items,
        nextCursor:
          result.lastEvaluatedKey === undefined
            ? null
            : encodeCursor(result.lastEvaluatedKey),
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

export const productsController = new ProductsController();
