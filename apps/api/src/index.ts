import express from 'express';
import cors from 'cors';
import http from 'http';
import { initSocket } from './socket';
import authRoutes from './routes/auth';
import pickupRoutes from './routes/pickups';
import driverRoutes from './routes/drivers';
import adminRoutes from './routes/admin';
import locationRoutes from './routes/locations';
import notificationRoutes from './routes/notifications';

const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(cors({ origin: '*' }));
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Drovora API' }));
app.use('/api/auth', authRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`\n🚀 Drovora API → http://localhost:${PORT}`));
