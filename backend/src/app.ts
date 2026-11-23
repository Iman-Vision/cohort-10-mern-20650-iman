import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import { getDBStatus } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/auth.js";
import { authController } from "./controllers/authController.js";

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

// HTTP Request logging with Pino (registered before body parsers to log parser rejections)
app.use(requestLogger);

// Body and Cookie parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    success: true,
    message: "Notes API is running smoothly",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
    database: dbStatus,
  });
});

// Error testing endpoint (used to verify global error handler in T2)
app.get("/api/test-error", (_req: Request, _res: Response) => {
  throw new AppError("This is a deliberate test error", 400, "TEST_ERROR_TRIGGERED", {
    reason: "Testing global exception handler",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.get("/api/users/me", protect, authController.getMe);

// 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

export default app;
