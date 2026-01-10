import { Schema, model } from 'mongoose';

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  OTP_VERIFIED = 'OTP_VERIFIED',
  ISSUED = 'ISSUED'
}

const MealRequestSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mealType: { type: String, enum: MealType, required: true },
  date: { type: Date, required: true }, // The specific day selected (12, 13, 14, etc.)
  status: { type: String, enum: RequestStatus, default: RequestStatus.PENDING },
  otp: { type: String },
  paymentType: { type: String, default: 'NONE' }
}, { timestamps: true });

// Prevent duplicate requests for the same meal type on the same day by the same employee
MealRequestSchema.index({ employeeId: 1, mealType: 1, date: 1 }, { unique: true });

export const MealRequest = model('MealRequest', MealRequestSchema);