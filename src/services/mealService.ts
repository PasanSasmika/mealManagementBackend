import { MealRequest, RequestStatus } from '../models/MealRequest';

export class MealService {
  // Step 1: Pre-book meals for the week
  static async createBulkRequests(employeeId: string, selections: any[]) {
    const requests = selections.flatMap(s => s.dates.map((d: string) => ({
      employeeId, mealType: s.mealType, date: new Date(d)
    })));
    return await MealRequest.insertMany(requests);
  }

  // Step 2: Employee arrives and clicks "Request" (Moves PENDING -> ACTIVE)
  static async activateTodaysMeal(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const request = await MealRequest.findOne({
      employeeId,
      date: { $gte: today, $lt: tomorrow },
      status: RequestStatus.PENDING
    });

    if (!request) throw new Error("No pre-booked meal found for today.");
    request.status = RequestStatus.ACTIVE;
    return await request.save();
  }

  // Step 3: Canteen views ACTIVE requests
  static async getCanteenQueue() {
    return await MealRequest.find({ status: RequestStatus.ACTIVE })
      .populate('employeeId', 'firstName lastName username');
  }

  // Step 4: Canteen Accept/Reject
  static async canteenResponse(requestId: string, action: 'ACCEPT' | 'REJECT') {
    const status = action === 'ACCEPT' ? RequestStatus.ACCEPTED : RequestStatus.REJECTED;
    const otp = action === 'ACCEPT' ? Math.floor(1000 + Math.random() * 9000).toString() : undefined;
    return await MealRequest.findByIdAndUpdate(requestId, { status, otp }, { new: true });
  }

  // Step 5: OTP Verification
  static async verifyOTP(requestId: string, inputOtp: string) {
    const request = await MealRequest.findById(requestId);
    if (request?.otp === inputOtp) {
      request.status = RequestStatus.OTP_VERIFIED;
      await request.save();
      return true;
    }
    return false;
  }


  static async selectPayment(requestId: string, paymentType: string) {
  const validTypes = ['PAY_NOW', 'NOT_PAY_NOW', 'FREE'];
  if (!validTypes.includes(paymentType)) {
    throw new Error("Invalid payment type selected");
  }

  return await MealRequest.findByIdAndUpdate(
    requestId,
    { paymentType },
    { new: true }
  );
}

/**
 * Step 6: Final Issue Decision
 * Canteen sees "OTP Verified" and "Payment Type" before clicking this
 */
static async finalizeMeal(requestId: string, issue: boolean) {
  const status = issue ? RequestStatus.ISSUED : RequestStatus.REJECTED;
  return await MealRequest.findByIdAndUpdate(
    requestId, 
    { status }, 
    { new: true }
  );
}
}