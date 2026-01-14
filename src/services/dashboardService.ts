import { MealRequest, RequestStatus } from "../models/MealRequest";
import { User } from "../models/User";

export class DashboardService {
  static async getAnalyticsSummary() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    // 1. Total Registered Users (e.g., 5 users)
    const totalUsers = await User.countDocuments();

    // 2. Count UNIQUE Users who have future bookings (e.g., 2 users)
    const bookingUsersData = await MealRequest.distinct('employeeId', {
      date: { $gte: start },
      status: RequestStatus.PENDING
    });
    const bookingUsersCount = bookingUsersData.length;

    // 3. Monthly Forecast (Total bookings, e.g., 4 bookings)
    const forecast = await MealRequest.aggregate([
      { 
        $match: { 
          date: { $gte: start }, 
          status: RequestStatus.PENDING 
        } 
      },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$mealType"
          },
          totalBooked: { $sum: 1 } // Sums all rows (4 bookings)
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // 4. Today's Status
    const todayEnd = new Date(start);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
    const todayStats = await MealRequest.aggregate([
      { $match: { date: { $gte: start, $lt: todayEnd } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    return { 
      todayStats, 
      totalUsers, 
      bookingUsersCount, 
      forecast 
    };
  }

  static async getTodayStats() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(start);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    return await MealRequest.aggregate([
      { $match: { date: { $gte: start, $lt: todayEnd } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
  }

  // Method 2: Monthly Forecast (Fixes "getMonthlyForecast" error)
  static async getMonthlyForecast() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    return await MealRequest.aggregate([
      { 
        $match: { 
          date: { $gte: start }, 
          status: RequestStatus.PENDING 
        } 
      },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$mealType"
          },
          totalBooked: { $sum: 1 } 
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);
  }

  // Method 3: User-wise Breakdown
  static async getUserWiseBookings() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    return await MealRequest.aggregate([
      { $match: { date: { $gte: start }, status: RequestStatus.PENDING } },
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employeeId',
          firstName: { $first: '$employee.firstName' },
          lastName: { $first: '$employee.lastName' },
          username: { $first: '$employee.username' },
          bookings: {
            $push: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              type: "$mealType"
            }
          }
        }
      },
      { $sort: { firstName: 1 } }
    ]);
  }}