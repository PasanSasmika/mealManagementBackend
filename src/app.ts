import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Authrouter from './routes/authRoutes';
import Mealrouter from './routes/mealRoutes';

const app: Application = express();


app.use(helmet());
app.use(cors());
app.use(express.json()); 


app.use('/api/auth', Authrouter);
app.use('/api/meals',Mealrouter );

// Health Check
app.get('/health', (req, res) => res.status(200).send('API is running'));

export default app;