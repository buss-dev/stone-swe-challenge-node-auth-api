import type { RequestHandler } from "express";

type RateLimitOptions = {
  maxRequests: number;
  windowSeconds: number;
  now?: () => number;
};

type RateLimitEntry = {
  count: number;
  windowStartedAt: number;
};

export function createRateLimit({
  maxRequests,
  windowSeconds,
  now = Date.now,
}: RateLimitOptions): RequestHandler {
  const requestsByIp = new Map<string, RateLimitEntry>();
  const windowMilliseconds = windowSeconds * 1_000;

  return (request, response, next) => {
    const currentTime = now();
    const clientIp = request.ip ?? request.socket.remoteAddress ?? "unknown";
    const existing = requestsByIp.get(clientIp);
    const entry =
      existing && currentTime < existing.windowStartedAt + windowMilliseconds
        ? existing
        : { count: 0, windowStartedAt: currentTime };

    entry.count += 1;
    requestsByIp.set(clientIp, entry);

    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil(
          (entry.windowStartedAt + windowMilliseconds - currentTime) / 1_000,
        ),
      );

      response.set("Retry-After", String(retryAfterSeconds));
      response.status(429).json({ message: "Muitas requisi\u00e7\u00f5es" });
      return;
    }

    next();
  };
}
