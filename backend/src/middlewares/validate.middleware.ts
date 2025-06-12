import type { AnyZodObject } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate = (schema: AnyZodObject) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  } catch (err) {
    next(err);
  }
};
