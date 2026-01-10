import { Router } from 'express';
import * as mealCtrl from '../controllers/mealController';
import { authenticate } from '../middleware/authMiddleware';

const Mealrouter = Router();

Mealrouter.post('/request', authenticate, mealCtrl.requestMeals);

export default Mealrouter;