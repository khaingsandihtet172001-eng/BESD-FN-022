import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRouter, { handleError } from './user.router.js';

const app = express();

app.use(cors());
app.use(express.json());
app.get('/health', (request, response) => response.status(200).json({ status: 'ok' }));
app.use('/user', userRouter);
app.use('/users', userRouter);
app.use(handleError);

export default app;
