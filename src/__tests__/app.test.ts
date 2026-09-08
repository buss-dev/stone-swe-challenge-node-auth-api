import request from "supertest";

import { app, createApp } from "../app.js";

describe("GET /health", () => {
  it('deve retornar status 200 e { status: "ok" }', async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("GET /docs", () => {
  it("deve disponibilizar a documentação Swagger", async () => {
    const response = await request(app).get("/docs/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Swagger UI");
  });
});

describe("configura\u00e7\u00e3o de proxy", () => {
  it("n\u00e3o confia em headers encaminhados por padr\u00e3o", () => {
    expect(createApp().get("trust proxy")).toBe(0);
  });

  it("configura a quantidade expl\u00edcita de saltos de proxy", () => {
    expect(createApp({ trustProxyHops: 2 }).get("trust proxy")).toBe(2);
  });
});
