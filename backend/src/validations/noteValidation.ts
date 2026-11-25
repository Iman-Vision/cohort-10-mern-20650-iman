import { z } from "zod";
import { ALLOWED_NOTE_COLORS } from "../models/Note.js";

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters"),
  content: z.string().optional().default(""),
  pinned: z.boolean().optional().default(false),
  color: z.enum(ALLOWED_NOTE_COLORS).optional().default("default"),
  tags: z
    .array(z.string().trim().min(1))
    .optional()
    .default([]),
});

export const updateNoteSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title cannot exceed 200 characters")
      .optional(),
    content: z.string().optional(),
    pinned: z.boolean().optional(),
    color: z.enum(ALLOWED_NOTE_COLORS).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const noteFilterSchema = z.object({
  tag: z.string().trim().optional(),
  color: z.enum(ALLOWED_NOTE_COLORS).optional(),
  pinned: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().trim().optional(),
});
