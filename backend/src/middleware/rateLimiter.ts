import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, _res: Response, next: NextFunction) => {
    next(
      new AppError(
        "Too many requests from this IP. Please try again after 15 minutes.",
        429,
        "RATE_LIMIT_EXCEEDED",
      ),
    );
  },
});
