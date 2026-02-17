import mongoose, { Schema, Document } from 'mongoose';
import type { IUser } from '../types/index.js';

// Combine IUser interface with mongoose Document
interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true  // Auto-creates createdAt and updatedAt
});

export default mongoose.model<IUserDocument>('User', UserSchema);