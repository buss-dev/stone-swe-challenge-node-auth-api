import { Router } from "express";

import { env } from "../../config/env.js";
import { createRateLimit } from "../../middlewares/rate-limit.js";
import { authenticateAccessToken } from "../auth/auth.middleware.js";
import { productsController } from "./products.controller.js";

export const productsRouter = Router();

productsRouter.get(
  "/",
  createRateLimit(env.rateLimit),
  authenticateAccessToken,
  productsController.list,
);
