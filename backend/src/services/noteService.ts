import { noteRepository, type NoteRepository } from "../repositories/noteRepository.js";
import type { INote } from "../models/Note.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../logger/index.js";
import type {
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteFilterQuery,
  NoteResponse,
} from "../types/note.js";

export class NoteService {
  private repo: NoteRepository;

  constructor(repo: NoteRepository = noteRepository) {
    this.repo = repo;
  }

  /**
   * Strips HTML markup to extract clean plain text for full-text search indexing
   */
  public extractPlainText(htmlContent: string): string {
    if (!htmlContent) return "";

    return htmlContent
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  private formatNote(note: INote): NoteResponse {
    return {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      plainText: note.plainText,
      pinned: note.pinned,
      color: note.color,
      tags: note.tags,
      isShared: note.isShared,
      shareToken: note.shareToken,
      deletedAt: note.deletedAt ? note.deletedAt.toISOString() : null,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  public async createNote(
    userId: string,
    dto: CreateNoteDTO,
  ): Promise<NoteResponse> {
    const content = dto.content ?? "";
    const plainText = this.extractPlainText(content);

    const note = await this.repo.create(userId, {
      ...dto,
      content,
      plainText,
    });

    logger.info(
      { noteId: note._id.toString(), userId, event: "note.created" },
      `Note created: ${note.title}`,
    );

    return this.formatNote(note);
  }

  public async getNotes(
    userId: string,
    filters?: NoteFilterQuery,
  ): Promise<NoteResponse[]> {
    const notes = await this.repo.findActiveByUser(userId, filters);
    return notes.map((note) => this.formatNote(note));
  }

  public async getNoteById(
    id: string,
    userId: string,
  ): Promise<NoteResponse> {
    const note = await this.repo.findByIdAndUser(id, userId);
    if (!note) {
      throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    }

    return this.formatNote(note);
  }

  public async updateNote(
    id: string,
    userId: string,
    dto: UpdateNoteDTO,
  ): Promise<NoteResponse> {
    const updateData: Record<string, unknown> = { ...dto };

    if (dto.content !== undefined) {
      updateData.plainText = this.extractPlainText(dto.content);
    }

    const note = await this.repo.updateByIdAndUser(id, userId, updateData);
    if (!note) {
      throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    }

    logger.info(
      { noteId: note._id.toString(), userId, event: "note.updated" },
      `Note updated: ${note.title}`,
    );

    return this.formatNote(note);
  }

  public async softDeleteNote(id: string, userId: string): Promise<void> {
    const note = await this.repo.softDelete(id, userId);
    if (!note) {
      throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    }

    logger.info(
      { noteId: id, userId, event: "note.trashed" },
      `Note moved to trash: ${id}`,
    );
  }

  public async getTrashNotes(userId: string): Promise<NoteResponse[]> {
    const notes = await this.repo.findTrashByUser(userId);
    return notes.map((note) => this.formatNote(note));
  }

  public async restoreNote(
    id: string,
    userId: string,
  ): Promise<NoteResponse> {
    const note = await this.repo.restore(id, userId);
    if (!note) {
      throw new AppError(
        "Note not found in trash",
        404,
        "NOTE_NOT_IN_TRASH",
      );
    }

    logger.info(
      { noteId: id, userId, event: "note.restored" },
      `Note restored from trash: ${id}`,
    );

    return this.formatNote(note);
  }

  public async permanentlyDeleteNote(
    id: string,
    userId: string,
  ): Promise<void> {
    const success = await this.repo.permanentlyDelete(id, userId);
    if (!success) {
      throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    }

    logger.info(
      { noteId: id, userId, event: "note.deleted_permanently" },
      `Note permanently deleted: ${id}`,
    );
  }
}

export const noteService = new NoteService();
