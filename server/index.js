import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import emailRoutes from './routes/email.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminAuthRoutes from './routes/adminAuth.routes.js';
import paymentRoutes from './routes/payment.routes.js';

dotenv.config({ path: '../.env' }); // Load from root dir
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', emailRoutes);
app.use('/api', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api', paymentRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mailer API đang chạy tại http://localhost:${PORT}`);
});
