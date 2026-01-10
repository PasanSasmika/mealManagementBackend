import { MealRequest, MealType } from '../models/MealRequest';

interface MealSelection {
  mealType: MealType;
  dates: string[]; // Array of date strings like ["2026-01-12", "2026-01-13"]
}

export class MealService {
  static async createBulkRequests(employeeId: string, selections: MealSelection[]) {
    const requests = [];

    for (const selection of selections) {
      for (const dateStr of selection.dates) {
        requests.push({
          employeeId,
          mealType: selection.mealType,
          date: new Date(dateStr)
        });
      }
    }

    // insertMany handles the array of objects at once
    return await MealRequest.insertMany(requests);
  }
}