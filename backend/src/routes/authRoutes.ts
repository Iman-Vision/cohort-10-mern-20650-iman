import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../validations/authValidation.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/signup", authLimiter, validateBody(signupSchema), authController.signup);
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

export default router;
