import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/db.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Factory Management API is running.'
  });
});

app.use('/api/users', userRoutes);
app.use('/api/purchases', purchaseRoutes);

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
