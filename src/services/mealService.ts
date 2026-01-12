import { MealRequest, RequestStatus } from '../models/MealRequest';

export class MealService {
  // Step 1: Pre-book meals for the week
  static async createBulkRequests(employeeId: string, selections: any[]) {
    const requests = selections.flatMap(s => s.dates.map((d: string) => {
      const dateObj = new Date(d);
      dateObj.setUTCHours(0, 0, 0, 0); // Force strict UTC Midnight
      
      return {
        employeeId,
        mealType: s.mealType,
        date: dateObj,
        status: RequestStatus.PENDING
      };
    }));
    return await MealRequest.insertMany(requests);
  }

  // Step 2: Employee arrives and clicks "Request" (Moves PENDING -> ACTIVE)
static async activateTodaysMeal(employeeId: string, shouldActivate: boolean) {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);
    
    // 1. If shouldActivate is true, move PENDING to ACTIVE
    if (shouldActivate) {
      const currentHour = new Date().getHours();
      const activeType = currentHour < 12 ? 'BREAKFAST' : 'LUNCH';

      await MealRequest.findOneAndUpdate(
        { 
          employeeId, 
          status: RequestStatus.PENDING, 
          mealType: activeType,
          date: { $gte: startOfToday, $lt: endOfToday } 
        },
        { $set: { status: RequestStatus.ACTIVE } }
      );
    }
    
    // 2. Always return all of today's meals so the frontend knows the current state
    return await MealRequest.find({
      employeeId,
      date: { $gte: startOfToday, $lt: endOfToday }
    });
}
  // Step 3: Canteen views ACTIVE requests
  static async getCanteenQueue() {
    const currentHour = new Date().getHours();
    const mealTypeToDisplay = currentHour < 12 ? 'BREAKFAST' : 'LUNCH';

    return await MealRequest.find({ 
        // Logic: Show requests that are either ACTIVE or already OTP_VERIFIED
        status: { $in: [RequestStatus.ACTIVE, RequestStatus.OTP_VERIFIED] },
        mealType: mealTypeToDisplay 
    }).populate('employeeId', 'firstName lastName username');
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
    // We update to a temporary status or keep as ACCEPTED
    // Let's keep it ACCEPTED so it stays in the employee's OTP screen
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
    { 
      paymentType, 
      status: RequestStatus.OTP_VERIFIED // Move to Verified ONLY after payment is picked
    },
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