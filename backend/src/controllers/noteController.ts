import type { Request, Response } from "express";
import { noteService, type NoteService } from "../services/noteService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type {
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteFilterQuery,
} from "../types/note.js";

const getIdParam = (req: Request): string => {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
};

export class NoteController {
  private service: NoteService;

  constructor(service: NoteService = noteService) {
    this.service = service;
  }

  public create = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const dto = req.body as CreateNoteDTO;
      const note = await this.service.createNote(userId, dto);

      res.status(201).json({
        success: true,
        message: "Note created successfully",
        data: { note },
      });
    },
  );

  public list = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const filters = req.query as unknown as NoteFilterQuery;
      const notes = await this.service.getNotes(userId, filters);

      res.status(200).json({
        success: true,
        count: notes.length,
        data: { notes },
      });
    },
  );

  public getById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const id = getIdParam(req);
      const note = await this.service.getNoteById(id, userId);

      res.status(200).json({
        success: true,
        data: { note },
      });
    },
  );

  public update = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const id = getIdParam(req);
      const dto = req.body as UpdateNoteDTO;
      const note = await this.service.updateNote(id, userId, dto);

      res.status(200).json({
        success: true,
        message: "Note updated successfully",
        data: { note },
      });
    },
  );

  public softDelete = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const id = getIdParam(req);
      await this.service.softDeleteNote(id, userId);

      res.status(200).json({
        success: true,
        message: "Note moved to trash successfully",
      });
    },
  );

  public listTrash = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const notes = await this.service.getTrashNotes(userId);

      res.status(200).json({
        success: true,
        count: notes.length,
        data: { notes },
      });
    },
  );

  public restore = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const id = getIdParam(req);
      const note = await this.service.restoreNote(id, userId);

      res.status(200).json({
        success: true,
        message: "Note restored successfully",
        data: { note },
      });
    },
  );

  public permanentDelete = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const id = getIdParam(req);
      await this.service.permanentlyDeleteNote(id, userId);

      res.status(200).json({
        success: true,
        message: "Note permanently deleted",
      });
    },
  );
}

export const noteController = new NoteController();
