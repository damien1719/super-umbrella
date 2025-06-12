import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

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
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
