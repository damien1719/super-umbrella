import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { articleRouter } from './routes/article.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

app.use('/api/v1/articles', articleRouter);

app.use(errorHandler);

export default app;


