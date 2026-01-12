import { Request, Response } from 'express';
import { MealService } from '../services/mealService';

export const requestMeals = async (req: any, res: Response) => {
  const result = await MealService.createBulkRequests(req.user.id, req.body.selections);
  res.status(201).json(result);
};

export const clickGetMeal = async (req: any, res: Response) => {
  try {
    // If it's a POST request, we treat it as an action. 
    // If you use this for fetching too, check for a flag.
    const { action } = req.body; 
    const result = await MealService.activateTodaysMeal(req.user.id, action === true);
    res.json({ data: result });
  } catch (e: any) { res.status(404).json({ message: e.message }); }
};
export const getCanteenDashboard = async (req: Request, res: Response) => {
  const queue = await MealService.getCanteenQueue();
  res.json(queue);
};

export const respondToRequest = async (req: Request, res: Response) => {
  const { requestId, action } = req.body;
  const result = await MealService.canteenResponse(requestId, action);
  res.json(result);
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { requestId, otp } = req.body;
  const isMatch = await MealService.verifyOTP(requestId, otp);
  isMatch ? res.json({ message: "OTP Verified" }) : res.status(400).json({ message: "Invalid OTP" });
};

export const choosePayment = async (req: Request, res: Response) => {
  try {
    const { requestId, paymentType } = req.body;
    const result = await MealService.selectPayment(requestId, paymentType);
    res.json({ message: "Payment selection submitted", data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Canteen Final Issue/No Issue
export const finalize = async (req: Request, res: Response) => {
  try {
    const { requestId, issue } = req.body;
    const result = await MealService.finalizeMeal(requestId, issue);
    res.json({ 
      message: issue ? "Meal Issued Successfully" : "Meal Rejected", 
      status: result?.status 
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};