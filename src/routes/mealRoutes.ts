import { Router } from 'express';
import * as mealCtrl from '../controllers/mealController';
import { authenticate } from '../middleware/authMiddleware';

const Mealrouter = Router();

// Employee Flows
Mealrouter.post('/book', authenticate, mealCtrl.requestMeals);
Mealrouter.post('/request-now', authenticate, mealCtrl.clickGetMeal); // "Get my meals" -> click Request
Mealrouter.post('/verify-otp', authenticate, mealCtrl.verifyOtp);

// Canteen Flows
Mealrouter.get('/dashboard', authenticate, mealCtrl.getCanteenDashboard);
Mealrouter.patch('/respond', authenticate, mealCtrl.respondToRequest);
Mealrouter.patch('/select-payment', authenticate, mealCtrl.choosePayment); 
Mealrouter.patch('/finalize', authenticate, mealCtrl.finalize);
Mealrouter.get('/my-meals', authenticate, mealCtrl.getMyMeals);

Mealrouter.delete('/cancel-tomorrow', authenticate, mealCtrl.cancelBooking);

export default Mealrouter;