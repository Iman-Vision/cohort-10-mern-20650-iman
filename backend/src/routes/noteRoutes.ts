import { Router } from "express";
import { noteController } from "../controllers/noteController.js";
import { protect } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  createNoteSchema,
  updateNoteSchema,
  noteFilterSchema,
} from "../validations/noteValidation.js";

const router = Router();

// Protect all note routes with JWT auth
router.use(protect);

// 1. Trash listing (MUST be before /:id)
router.get("/trash", noteController.listTrash);

// 2. Specific trash actions (restore, permanent delete)
router.post("/:id/restore", noteController.restore);
router.delete("/:id/permanent", noteController.permanentDelete);

// 3. Standard CRUD routes
router.get("/", validateQuery(noteFilterSchema), noteController.list);
router.post("/", validateBody(createNoteSchema), noteController.create);
router.get("/:id", noteController.getById);
router.put("/:id", validateBody(updateNoteSchema), noteController.update);
router.delete("/:id", noteController.softDelete);

export default router;
