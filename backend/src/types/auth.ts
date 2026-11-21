import type { Request } from "express";

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

// Extend Express Request so req.user is typed everywhere
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
