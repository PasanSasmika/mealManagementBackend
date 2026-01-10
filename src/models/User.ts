import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  role: { type: String, enum: ['EMPLOYEE', 'CANTEEN','MANAGER','SADMIN'], default: 'EMPLOYEE' }
}, { timestamps: true });

export const User = model('User', UserSchema);