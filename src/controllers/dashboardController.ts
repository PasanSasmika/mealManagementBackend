// src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { User } from '../models/User'; 
import { MealRequest, RequestStatus } from '../models/MealRequest';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const today = await DashboardService.getTodayStats();
    const forecast = await DashboardService.getMonthlyForecast();
    const userWise = await DashboardService.getUserWiseBookings();
    const totalUsers = await User.countDocuments();
    
    const todayStart = new Date();
    todayStart.setUTCHours(0,0,0,0);

    const bookingUsersData = await MealRequest.distinct('employeeId', {
      date: { $gte: todayStart },
      status: RequestStatus.PENDING
    });

    res.json({ 
      today, 
      forecast, 
      userWise, 
      totalUsers, 
      bookingUsersCount: bookingUsersData.length 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};