import type { Request, Response, NextFunction } from "express";
import type { CookieOptions } from "express";
import { authService } from "../services/authService.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCookieOptions = (): CookieOptions => {
  const isProduction = env.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie("token", token, getCookieOptions());
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    path: "/",
  });
};

export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    // 1. Check httpOnly cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token as string;
    }
    // 2. Fallback to Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError(
        "You are not logged in. Please log in to get access.",
        401,
        "UNAUTHORIZED",
      );
    }

    // 3. Verify JWT signature
    let decoded;
    try {
      decoded = authService.verifyToken(token);
    } catch {
      throw new AppError("Invalid or expired session. Please log in again.", 401, "INVALID_TOKEN");
    }

    // 4. Verify user still exists
    const currentUser = await authService.getCurrentUser(decoded.id);

    // 5. Grant access: attach user to request
    req.user = currentUser;
    next();
  },
);
