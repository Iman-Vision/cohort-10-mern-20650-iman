import dotenv from "dotenv";

dotenv.config();

export interface EnvConfig {
  nodeEnv: "development" | "production" | "test";
  port: number;
  clientUrl: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  logLevel: string;
}

const validNodeEnvs = ["development", "production", "test"] as const;
const rawNodeEnv = process.env.NODE_ENV;
const nodeEnv: EnvConfig["nodeEnv"] =
  rawNodeEnv && validNodeEnvs.includes(rawNodeEnv as (typeof validNodeEnvs)[number])
    ? (rawNodeEnv as EnvConfig["nodeEnv"])
    : "production";

export const env: EnvConfig = {
  nodeEnv,
  port: parseInt(process.env.PORT || "5000", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongodbUri:
    process.env.MONGODB_URI ||
    "mongodb://admin:password123@localhost:27017/notes_db?authSource=admin",
  jwtSecret: process.env.JWT_SECRET || "default_jwt_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  logLevel: process.env.LOG_LEVEL || "info",
};
