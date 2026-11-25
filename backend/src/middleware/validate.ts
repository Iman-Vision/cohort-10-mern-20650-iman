import type { Request, Response, NextFunction, RequestHandler } from "express";
import { type ZodType, ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export const validateBody = (schema: ZodType): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
          return `${path}${issue.message}`;
        });
        next(
          new AppError(
            `Validation error: ${errorMessages.join("; ")}`,
            400,
            "VALIDATION_ERROR",
            error.issues,
          ),
        );
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: ZodType): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
          return `${path}${issue.message}`;
        });
        next(
          new AppError(
            `Validation error: ${errorMessages.join("; ")}`,
            400,
            "VALIDATION_ERROR",
            error.issues,
          ),
        );
      } else {
        next(error);
      }
    }
  };
};
