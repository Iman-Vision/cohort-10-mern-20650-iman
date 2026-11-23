import mongoose, { Schema, type Document, type Model } from "mongoose";

export const ALLOWED_NOTE_COLORS = [
  "default",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
  "brown",
  "gray",
] as const;

export type NoteColor = (typeof ALLOWED_NOTE_COLORS)[number];

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  plainText: string;
  pinned: boolean;
  color: NoteColor;
  tags: string[];
  shareToken?: string | null;
  isShared: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Note must belong to a user"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      default: "",
    },
    plainText: {
      type: String,
      default: "",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      enum: {
        values: ALLOWED_NOTE_COLORS,
        message: "{VALUE} is not a valid note color",
      },
      default: "default",
    },
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) =>
        tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0),
    },
    shareToken: {
      type: String,
      default: null,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// 1. Dashboard listing index: user, active/trash, pinned first, then newest updated
noteSchema.index({ user: 1, deletedAt: 1, pinned: -1, updatedAt: -1 });

// 2. Tag filter index
noteSchema.index({ user: 1, tags: 1 });

// 3. Full-text search index across title and plain text content
noteSchema.index({ title: "text", plainText: "text" });

// 4. Unique partial index for public share tokens (excludes null and non-string values)
noteSchema.index(
  { shareToken: 1 },
  {
    unique: true,
    partialFilterExpression: { shareToken: { $type: "string" } },
  },
);

// 5. 30-day TTL index for soft-deleted notes: automatically permanently purged by Mongo after 30 days
noteSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });

export const Note: Model<INote> = mongoose.model<INote>("Note", noteSchema);
