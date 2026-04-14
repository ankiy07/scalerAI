import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  background: string;
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    background: { type: String, default: '#0079bf' }, // Default Trello blue
  },
  { timestamps: true }
);

const Board: Model<IBoard> = mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);

export default Board;
