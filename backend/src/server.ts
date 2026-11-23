import type { Server } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./logger/index.js";
import { connectDB, disconnectDB } from "./config/db.js";

let server: Server | undefined;
let isShuttingDown = false;
let exitStatusCode = 0;

// Retry connecting to MongoDB using bounded exponential backoff
const connectWithRetry = async (maxRetries = 5, initialDelayMs = 1000): Promise<void> => {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxRetries) {
    attempt++;
    try {
      await connectDB();
      return;
    } catch (dbError: unknown) {
      const err = dbError instanceof Error ? dbError : new Error(String(dbError));
      logger.warn(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed: ${err.message}. Retrying in ${delay}ms...`,
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 8000); // Bounded exponential backoff
      }
    }
  }

  logger.warn(
    "MongoDB could not connect after maximum retries. Server running; health check will report DB status.",
  );
};

const startServer = async (): Promise<void> => {
  try {
    // Start DB connection with retry in background so server listens immediately
    void connectWithRetry();

    server = app.listen(env.port, () => {
      logger.info(
        `🚀 Server started on port ${env.port} in [${env.nodeEnv}] mode. Health check at http://localhost:${env.port}/api/health`,
      );
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.fatal({ err }, `Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

void startServer();

// Unified, idempotent graceful shutdown with local try/catch around DB disconnect
const shutdown = (trigger: string, exitCode: number): void => {
  if (exitCode !== 0) {
    exitStatusCode = exitCode;
  }

  if (isShuttingDown) {
    logger.warn(`Shutdown already in progress. Retained failure exit code ${exitStatusCode} from ${trigger}.`);
    return;
  }
  isShuttingDown = true;

  logger.info(`Shutting down initiated by ${trigger} (exit code ${exitCode}). Closing HTTP server and database...`);

  // Enforce 10-second deadline for in-flight requests on signals and unhandled rejections
  const forceExitTimer = setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(exitStatusCode !== 0 ? exitStatusCode : 1);
  }, 10000);
  forceExitTimer.unref();

  const closeDatabase = async (): Promise<void> => {
    try {
      await disconnectDB();
    } catch (dbErr: unknown) {
      logger.error({ err: dbErr }, "Error while disconnecting database during shutdown");
    } finally {
      process.exit(exitStatusCode);
    }
  };

  if (server) {
    server.close((err?: Error) => {
      if (err) {
        logger.error({ err }, "Error occurred while closing HTTP server");
        exitStatusCode = 1;
      } else {
        logger.info("HTTP server closed.");
      }
      void closeDatabase();
    });
  } else {
    void closeDatabase();
  }
};

// Process-level uncaught exception handler
process.on("uncaughtException", (err: Error) => {
  logger.fatal({ err }, `Uncaught Exception thrown: ${err.message}. Shutting down...`);
  shutdown("uncaughtException", 1);
});

// Process-level unhandled promise rejection handler
process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal(
    { reason },
    `Unhandled Promise Rejection: ${reason instanceof Error ? reason.message : String(reason)}. Shutting down...`,
  );
  shutdown("unhandledRejection", 1);
});

// Graceful shutdown on termination signals
process.on("SIGTERM", () => shutdown("SIGTERM", 0));
process.on("SIGINT", () => shutdown("SIGINT", 0));
