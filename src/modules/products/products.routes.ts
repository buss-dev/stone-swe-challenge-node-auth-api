import { Router } from "express";

import { authenticateAccessToken } from "../auth/auth.middleware.js";
import { productsController } from "./products.controller.js";

export const productsRouter = Router();

productsRouter.get("/", authenticateAccessToken, productsController.list);
