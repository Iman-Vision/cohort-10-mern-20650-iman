import type { Request, Response } from "express";
import { authService, type AuthService } from "../services/authService.js";
import { setAuthCookie, clearAuthCookie } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../logger/index.js";
import type { SignupDTO, LoginDTO } from "../validations/authValidation.js";

export class AuthController {
  private service: AuthService;

  constructor(service: AuthService = authService) {
    this.service = service;
  }

  public signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const signupData = req.body as SignupDTO;
    const { user, token } = await this.service.signup(signupData);

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user,
      },
    });
  });

  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const loginData = req.body as LoginDTO;
    const { user, token } = await this.service.login(loginData);

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user,
      },
    });
  });

  public logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const email = req.user?.email;

    clearAuthCookie(res);

    logger.info({ userId, email, event: "user.logout" }, `User logged out: ${email || "unknown"}`);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });

  public getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // req.user is populated by protect middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  });
}

export const authController = new AuthController();
