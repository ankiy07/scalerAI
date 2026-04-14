import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  avatarUrl: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
