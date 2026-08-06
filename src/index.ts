import express from 'express';
import { connectDatabase } from './config/db.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Factory Management API is running.');
});
app.use('/api/users', userRoutes);

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
