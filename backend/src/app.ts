// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { articleRouter } from './routes/article.routes';
import { operationRouter } from './routes/operation.routes';
import { activityRouter } from './routes/activity.routes';
import { logementRouter } from './routes/logement.routes';
import { bienRouter } from './routes/bien.routes';
import { fiscalRouter } from './routes/fiscal.routes';
import { profileRouter } from './routes/profile.routes';
import { amortissementRouter } from './routes/amortissement.routes';
import { cerfaRouter } from './routes/cerfa.routes';
import { fecRouter } from './routes/fec.routes';
import { reportRouter } from './routes/report.routes';
import { locationRouter } from './routes/location.routes';
import { locataireRouter } from './routes/locataire.routes';
import { documentRouter } from './routes/document.routes';
import { errorHandler } from './middlewares/error.middleware';
import { requireAuth } from './middlewares/requireAuth';

dotenv.config();

const app = express();

const FRONTEND_PREFIX = process.env.FRONTEND_PREFIX ?? '';

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // autorise si pas d'origin (ex : Postman) ou si l'origin commence bien par ton prefix
    if (!origin || origin.startsWith(FRONTEND_PREFIX)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} non autorisé par CORS`));
    }
  },
  credentials: true,      // si tu envoies des cookies
}));


//// DEBUGGING /////
// Middleware de logging pour afficher l'appel HTTP brut
/* app.use((req, res, next) => {
  console.log('\n🌐 === REQUÊTE HTTP BRUTE ===');
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Capturer le body brut
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    if (body) {
      console.log('Body brut:', body);
      try {
        const parsedBody = JSON.parse(body);
        console.log('Body parsé:', JSON.stringify(parsedBody, null, 2));
      } catch {
        console.log('Body non-JSON:', body);
      }
    }
    console.log('🌐 === FIN REQUÊTE ===\n');
  });
  
  next();
});
 */
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

app.use(requireAuth);

app.use('/api/v1/articles', articleRouter);
app.use('/api/v1/operations', operationRouter);
app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/locations', locationRouter);
app.use('/api/v1/locataires', locataireRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/logements', logementRouter);
app.use('/api/v1/profile/:profileId/biens', bienRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/fiscal', fiscalRouter);
app.use('/api/v1/fec', fecRouter);
app.use('/api/v1/amortissements', amortissementRouter);
app.use('/api/v1/cerfa', cerfaRouter);
app.use('/api/v1/reports', reportRouter);

app.use(errorHandler);

export default app;


