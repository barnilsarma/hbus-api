import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/db';
import purchaseRoutes from './routes/purchaseRoutes';
import userRoutes from './routes/userRoutes';
import locationRoutes from './routes/locationRoutes';
import itemRoutes from './routes/itemRoutes';
import dispatchRoutes from './routes/dispatchRoutes';
import bookingRoutes from './routes/bookingRoutes';
import stockRoutes from './routes/stockRoutes';
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(cors({origin: '*'}));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Factory Management API is running.'
  });
});
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/location',locationRoutes);
app.use('/api/dispatches', dispatchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api', stockRoutes);

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
