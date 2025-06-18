import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { NotFoundError } from '../services/profile.service';
import { ForbiddenError } from '../services/bien.service';

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
  if (err instanceof ForbiddenError) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};


