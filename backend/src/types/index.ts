import type { Request } from 'express';

// User Type
export interface IUser {
  _id?: string;
  email: string;
  password: string;
  createdAt?: Date;
}

// Single Capture Type (can be screenshot OR text note)
export interface ICapture {
  _id?: string;
  userId: string;
  
  // Type of capture
  type:'screenshot' | 'text'; 
  
  // For screenshots
  imageUrl?: string;
  // For text notes  
  textContent?: string;
  
  createdAt?: Date;
}

// For authenticated requests
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}