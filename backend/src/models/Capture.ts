import mongoose, { Schema, Document } from 'mongoose';
import type { ICapture } from '../types/index.js';

// Combine ICapture interface with mongoose Document
interface ICaptureDocument extends Omit<ICapture, '_id'>, Document {}

const CaptureSchema = new Schema<ICaptureDocument>({
  userId: {
    type: String,
    required: true,
    ref: 'User'  // Creates relationship with User model
  },
  type: {
    type: String,
    required: true,
    enum: ['screenshot', 'text']  // Only allows these two values
  },
  imageUrl: {
    type: String,
    required: false  // Optional - only for screenshots
  },
  textContent: {
    type: String,
    required: false  // Optional - only for text notes
  }
}, {
  timestamps: true  // Auto-creates createdAt and updatedAt
});

export default mongoose.model<ICaptureDocument>('Capture', CaptureSchema);