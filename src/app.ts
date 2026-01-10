import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';

const app: Application = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json()); // Body parser

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => res.status(200).send('API is running'));

export default app;