import { Request, Response, NextFunction } from 'express';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const clients: Map<string, RateLimitEntry> = new Map();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const entry = clients.get(clientIp);

    if (!entry || now > entry.resetTime) {
      clients.set(clientIp, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      next();
      return;
    }

    if (entry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'Too many requests',
        retryAfter,
      });
      return;
    }

    entry.count++;
    next();
  };
}
