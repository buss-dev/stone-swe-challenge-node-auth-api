import express from "express";
import swaggerUi from "swagger-ui-express";

import { errorHandler } from "./middlewares/error-handler.js";
import { env } from "./config/env.js";
import { openapiDocument } from "./docs/openapi.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { productsRouter } from "./modules/products/products.routes.js";

type AppOptions = {
  trustProxyHops?: number;
};

export function createApp({ trustProxyHops = env.trustProxyHops }: AppOptions = {}) {
  const app = express();

  app.set("trust proxy", trustProxyHops);

  app.use(express.json());

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/products", productsRouter);

  app.use(errorHandler);

  return app;
}

export const app = createApp();
