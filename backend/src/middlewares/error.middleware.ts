import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { NotFoundError } from '../services/profile.service';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    res.status(422).json({
      message: 'Validation error',
      errors: err.flatten(),
    });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({ message: 'Not Found' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};


