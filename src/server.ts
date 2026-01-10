import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000; // Added || 5000
const server = app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});