// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { profileRouter } from './routes/profile.routes';
import { patientRouter } from './routes/patient.routes';
import { bilanRouter } from './routes/bilan.routes';
import { sectionRouter } from './routes/section.routes';
import { sectionExampleRouter } from './routes/sectionExample.routes';
import { errorHandler } from './middlewares/error.middleware';
import { requireAuth } from './middlewares/requireAuth';

dotenv.config();

const app = express();

const FRONTEND_PREFIX = process.env.FRONTEND_PREFIX ?? '';

type CorsOptions = Parameters<typeof cors>[0];

const corsOptions: CorsOptions = {
  origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // autorise si pas d'origin (ex: Postman) ou si l'origin commence par ton prefix
    if (!origin || origin.startsWith(FRONTEND_PREFIX)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} non autorisé par CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // CHANGEMENT
  allowedHeaders: ['Content-Type', 'Authorization'],             // CHANGEMENT
  credentials: true,                                             // inchangé
  maxAge: 600,                                                   // CHANGEMENT: cache preflight 10 min
  optionsSuccessStatus: 204                                      // CHANGEMENT: 204 pour OPTIONS
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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


app.use('/api/v1/patients', patientRouter);
app.use('/api/v1/bilans', bilanRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/sections', sectionRouter);
app.use('/api/v1/section-examples', sectionExampleRouter);

app.use(errorHandler);

export default app;


