import express from 'express';
import logger from '#config/logger';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes';
import securityMiddleware from '#middleware/security.middleware';
import usersRoutes from '#routes/users.routes';


const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(securityMiddleware);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  logger.info('Hello from acquisitions API!');
  res.status(200).send('Welcome to acquisitions API!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' , timestamp: new Date().toISOString() , uptime: process.uptime() });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Acquisitions API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
