import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/db';
import purchaseRoutes from './routes/purchaseRoutes';
import userRoutes from './routes/userRoutes';
import locationRoutes from './routes/locationRoutes';
import itemRoutes from './routes/itemRoutes';
import rawMaterialRoutes from './routes/rawMaterialRoutes';
import primaryRoutes from './routes/primaryRoutes';
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
app.use('/api/rawmaterials', rawMaterialRoutes);
app.use('/api/primaries', primaryRoutes);

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
