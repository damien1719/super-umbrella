import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

export default app;
