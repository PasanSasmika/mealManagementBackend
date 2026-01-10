import { Schema, model } from 'mongoose';

export enum RequestStatus {
  PENDING = 'PENDING',       // Pre-booked by employee
  ACTIVE = 'ACTIVE',        // Employee clicked "Request" at the canteen
  ACCEPTED = 'ACCEPTED',    // Canteen clicked "Accept" (OTP generated)
  REJECTED = 'REJECTED',    // Canteen clicked "Reject"
  OTP_VERIFIED = 'OTP_VERIFIED',
  ISSUED = 'ISSUED'
}

const MealRequestSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mealType: { type: String, enum: ['BREAKFAST', 'LUNCH'], required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: RequestStatus, default: RequestStatus.PENDING },
  otp: { type: String },
  paymentType: { type: String, enum: ['PAY_NOW', 'NOT_PAY_NOW', 'FREE', 'NONE'], default: 'NONE' },
}, { timestamps: true });

export const MealRequest = model('MealRequest', MealRequestSchema);