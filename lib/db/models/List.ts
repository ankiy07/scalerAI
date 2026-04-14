import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IList extends Document {
  title: string;
  order: number;
  boardId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ListSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  },
  { timestamps: true }
);

// Index to quickly find lists per board and handle ordering
ListSchema.index({ boardId: 1, order: 1 });

const List: Model<IList> = mongoose.models.List || mongoose.model<IList>('List', ListSchema);

export default List;
