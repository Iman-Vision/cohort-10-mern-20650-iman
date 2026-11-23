import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { logger } from "../logger/index.js";
import { env } from "../config/env.js";

interface MongooseCastError extends Error {
  name: "CastError";
  path: string;
  value: unknown;
}

interface MongooseDuplicateKeyError extends Error {
  code: 11000;
  keyValue?: Record<string, unknown>;
}

interface MongooseValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, { message: string; path: string }>;
}

interface BodyParserError extends Error {
  status?: number;
  statusCode?: number;
  body?: string;
  type?: string;
}

const isBodyParserError = (error: unknown): error is BodyParserError => {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const candidate = error as Record<string, unknown>;
  const hasStatus = typeof candidate.status === "number" || typeof candidate.statusCode === "number";
  return hasStatus && typeof candidate.type === "string";
};

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred. Please try again later.";
  let details: unknown = undefined;

  // Handle our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // Body parser errors (malformed JSON or oversized body)
  else if (isBodyParserError(err)) {
    const parserStatus = err.status ?? err.statusCode ?? 400;
    statusCode = parserStatus;

    if (err.type === "entity.parse.failed" || parserStatus === 400) {
      statusCode = 400;
      code = "INVALID_JSON";
      message = "Request body contains invalid JSON.";
    } else if (err.type === "entity.too.large" || parserStatus === 413) {
      statusCode = 413;
      code = "PAYLOAD_TOO_LARGE";
      message = "Request payload exceeds allowed limit.";
    } else {
      code = "BAD_REQUEST";
      message = err.message || "Invalid request.";
    }
  }
  // Mongoose CastError (invalid ObjectId)
  else if (err.name === "CastError") {
    const castErr = err as MongooseCastError;
    statusCode = 400;
    code = "INVALID_ID";
    message = `Invalid value for field '${castErr.path}': ${String(castErr.value)}`;
  }
  // Mongoose duplicate key error (E11000)
  else if ((err as unknown as MongooseDuplicateKeyError).code === 11000) {
    const dupErr = err as unknown as MongooseDuplicateKeyError;
    statusCode = 409;
    code = "DUPLICATE_KEY";
    const field = dupErr.keyValue ? Object.keys(dupErr.keyValue)[0] : "field";
    message = `A record with this ${field} already exists.`;
  }
  // Mongoose ValidationError
  else if (err.name === "ValidationError") {
    const valErr = err as MongooseValidationError;
    statusCode = 400;
    code = "VALIDATION_ERROR";
    const messages = Object.values(valErr.errors).map((e) => e.message);
    message = `Validation failed: ${messages.join(", ")}`;
    details = messages;
  }
  // JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid authentication token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Authentication token expired. Please log in again.";
  }

  // Safe error logging (CWE-532): only log name, message, stack. Never log raw body.
  if (statusCode >= 500) {
    logger.error(
      {
        err: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
        method: req.method,
        url: req.originalUrl,
        requestId: req.id,
      },
      `Unhandled Exception: ${err.message}`,
    );
  } else {
    logger.warn(
      {
        code,
        message,
        method: req.method,
        url: req.originalUrl,
        requestId: req.id,
      },
      `Operational Error [${statusCode}]: ${message}`,
    );
  }

  // Response payload (stack trace exposed strictly in development mode)
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
      ...(env.nodeEnv === "development" && { stack: err.stack }),
    },
  });
};
