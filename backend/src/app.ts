import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { articleRouter } from './routes/article.routes';
import { operationRouter } from './routes/operation.routes';
import { activityRouter } from './routes/activity.routes';
import { logementRouter } from './routes/logement.routes';
import { fiscalRouter } from './routes/fiscal.routes';
import { amortissementRouter } from './routes/amortissement.routes';
import { cerfaRouter } from './routes/cerfa.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
}));

app.use(express.json());


app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

app.use('/api/v1/articles', articleRouter);
app.use('/api/v1/operations', operationRouter);
app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/logements', logementRouter);
app.use('/api/v1/fiscal', fiscalRouter);
app.use('/api/v1/amortissements', amortissementRouter);
app.use('/api/v1/cerfa', cerfaRouter);

app.use(errorHandler);

export default app;


