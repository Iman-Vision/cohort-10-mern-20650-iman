import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository, type UserRepository } from "../repositories/userRepository.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../logger/index.js";
import type { SignupDTO, LoginDTO } from "../validations/authValidation.js";
import type { AuthenticatedUser, JwtPayload } from "../types/auth.js";

export interface AuthResult {
  user: AuthenticatedUser;
  token: string;
}

export class AuthService {
  private userRepo: UserRepository;

  constructor(userRepo: UserRepository = userRepository) {
    this.userRepo = userRepo;
  }

  public signToken(userId: string): string {
    return jwt.sign({ id: userId }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  public verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
  }

  public async signup(dto: SignupDTO): Promise<AuthResult> {
    try {
      const existingUser = await this.userRepo.findByEmail(dto.email);
      if (existingUser) {
        throw new AppError("A user with this email already exists", 409, "USER_ALREADY_EXISTS");
      }

      const salt = await bcryptjs.genSalt(12);
      const passwordHash = await bcryptjs.hash(dto.password, salt);

      const newUser = await this.userRepo.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
      });

      const token = this.signToken(newUser._id.toString());

      logger.info(
        { userId: newUser._id.toString(), email: newUser.email, event: "user.signup" },
        `User registered successfully: ${newUser.email}`,
      );

      return {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
        token,
      };
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  public async login(dto: LoginDTO): Promise<AuthResult> {
    try {
      const user = await this.userRepo.findByEmailWithPassword(dto.email);
      if (!user) {
        logger.warn(
          { email: dto.email, event: "user.login_failed" },
          `Failed login attempt for email: ${dto.email}`,
        );
        throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
      }

      const isPasswordValid = await bcryptjs.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        logger.warn(
          { email: dto.email, userId: user._id.toString(), event: "user.login_failed" },
          `Invalid password attempt for user: ${dto.email}`,
        );
        throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
      }

      const token = this.signToken(user._id.toString());

      logger.info(
        { userId: user._id.toString(), email: user.email, event: "user.login" },
        `User logged in successfully: ${user.email}`,
      );

      return {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        token,
      };
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  public async getCurrentUser(userId: string): Promise<AuthenticatedUser & { createdAt: Date }> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new AppError(
          "The user belonging to this token no longer exists",
          401,
          "USER_NOT_FOUND",
        );
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}

export const authService = new AuthService();
