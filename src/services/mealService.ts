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
    // Logic: If before 12 PM, only show BREAKFAST. If after, only show LUNCH.
    const mealTypeToDisplay = currentHour < 12 ? 'BREAKFAST' : 'LUNCH';

    return await MealRequest.find({ 
        status: RequestStatus.ACTIVE,
        mealType: mealTypeToDisplay // Filter by current time window
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