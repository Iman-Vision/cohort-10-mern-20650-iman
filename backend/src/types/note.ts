import type { NoteColor } from "../models/Note.js";

export interface CreateNoteDTO {
  title: string;
  content?: string;
  pinned?: boolean;
  color?: NoteColor;
  tags?: string[];
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  pinned?: boolean;
  color?: NoteColor;
  tags?: string[];
}

export interface NoteFilterQuery {
  tag?: string;
  color?: NoteColor;
  pinned?: boolean;
  search?: string;
}

export interface NoteResponse {
  id: string;
  title: string;
  content: string;
  plainText: string;
  pinned: boolean;
  color: NoteColor;
  tags: string[];
  isShared: boolean;
  shareToken?: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
