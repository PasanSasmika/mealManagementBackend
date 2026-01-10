import { Request, Response } from 'express';
import { MealService } from '../services/mealService';

export const requestMeals = async (req: any, res: Response) => {
  try {
    const employeeId = req.user.id; // From Auth Middleware
    const { selections } = req.body; 
    
    /* Expected selections format:
       [
         { "mealType": "BREAKFAST", "dates": ["2026-01-12", "2026-01-14"] },
         { "mealType": "LUNCH", "dates": ["2026-01-12", "2026-01-13"] }
       ]
    */

    const result = await MealService.createBulkRequests(employeeId, selections);
    res.status(201).json({ message: 'Requests saved successfully', count: result.length });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};