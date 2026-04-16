import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChecklistItem {
  text: string;
  isCompleted: boolean;
}

export interface ILabel {
  text: string;
  color: string;
}

export interface ICard extends Document {
  title: string;
  description: string;
  isArchived: boolean;
  order: number;
  listId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  labels: ILabel[];
  dueDate?: Date;
  members: mongoose.Types.ObjectId[];
  checklists: IChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const LabelSchema = new Schema({
  text: { type: String, required: true },
  color: { type: String, required: true },
}, { _id: false });

const ChecklistItemSchema = new Schema({
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
}, { _id: false });

const CardSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    isArchived: { type: Boolean, default: false },
    order: { type: Number, required: true },
    listId: { type: Schema.Types.ObjectId, ref: 'List', required: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    labels: [LabelSchema],
    dueDate: { type: Date },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    checklists: [ChecklistItemSchema],
  },
  { timestamps: true }
);

// Indexing for performance
CardSchema.index({ listId: 1, order: 1 });
CardSchema.index({ boardId: 1 });

const Card: Model<ICard> = mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema);

export default Card;
