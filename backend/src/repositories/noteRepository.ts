import mongoose from "mongoose";
import { Note, type INote } from "../models/Note.js";
import type { CreateNoteDTO, NoteFilterQuery } from "../types/note.js";

type NoteFilter = Record<string, unknown>;

export class NoteRepository {
  public async create(
    userId: string,
    data: CreateNoteDTO & { plainText: string },
  ): Promise<INote> {
    const note = new Note({
      ...data,
      user: new mongoose.Types.ObjectId(userId),
    });
    return note.save();
  }

  public async findActiveByUser(
    userId: string,
    filters?: NoteFilterQuery,
  ): Promise<INote[]> {
    const query: NoteFilter = {
      user: new mongoose.Types.ObjectId(userId),
      deletedAt: null,
    };

    if (filters?.tag) {
      query.tags = filters.tag.trim().toLowerCase();
    }

    if (filters?.color) {
      query.color = filters.color;
    }

    if (typeof filters?.pinned === "boolean") {
      query.pinned = filters.pinned;
    }

    if (filters?.search && filters.search.trim().length > 0) {
      query.$text = { $search: filters.search.trim() };
    }

    return Note.find(query)
      .sort({ pinned: -1, updatedAt: -1 })
      .exec();
  }

  public async findTrashByUser(userId: string): Promise<INote[]> {
    return Note.find({
      user: new mongoose.Types.ObjectId(userId),
      deletedAt: { $ne: null },
    })
      .sort({ deletedAt: -1 })
      .exec();
  }

  public async findByIdAndUser(
    id: string,
    userId: string,
    includeTrash = false,
  ): Promise<INote | null> {
    const query: NoteFilter = {
      _id: new mongoose.Types.ObjectId(id),
      user: new mongoose.Types.ObjectId(userId),
    };

    if (!includeTrash) {
      query.deletedAt = null;
    }

    return Note.findOne(query).exec();
  }

  public async updateByIdAndUser(
    id: string,
    userId: string,
    update: Record<string, unknown>,
  ): Promise<INote | null> {
    return Note.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        user: new mongoose.Types.ObjectId(userId),
        deletedAt: null,
      },
      { $set: update },
      { new: true, runValidators: true },
    ).exec();
  }

  public async softDelete(id: string, userId: string): Promise<INote | null> {
    return Note.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        user: new mongoose.Types.ObjectId(userId),
        deletedAt: null,
      },
      { $set: { deletedAt: new Date() } },
      { new: true },
    ).exec();
  }

  public async restore(id: string, userId: string): Promise<INote | null> {
    return Note.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        user: new mongoose.Types.ObjectId(userId),
        deletedAt: { $ne: null },
      },
      { $set: { deletedAt: null } },
      { new: true },
    ).exec();
  }

  public async permanentlyDelete(id: string, userId: string): Promise<boolean> {
    const result = await Note.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      user: new mongoose.Types.ObjectId(userId),
    }).exec();

    return result.deletedCount > 0;
  }
}

export const noteRepository = new NoteRepository();
