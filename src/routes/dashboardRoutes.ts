import { Router } from 'express';
import * as dashboardCtrl from '../controllers/dashboardController';
import { authenticate } from '../middleware/authMiddleware';

const Dashboardrouter = Router();

// Management Analytics - Requires login
Dashboardrouter.get('/analytics', authenticate, dashboardCtrl.getAnalytics);

export default Dashboardrouter;