import express from 'express';
import logger from '#config/logger';
import helmet from "helmet";
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  logger.info('Hello from acquisitions API!');
  res.status(200).send('Welcome to acquisitions API!');
});

export default app;
