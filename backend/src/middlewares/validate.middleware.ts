import type { ZodTypeAny } from 'zod';
import type { Request, Response, NextFunction } from 'express';

type Key = 'body' | 'params' | 'query';

const makeValidator = (key: Key) => (schema: ZodTypeAny) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = schema.safeParse(req[key]);
  if (!result.success) {
    res.status(400).json({
      message: 'Validation failed',
      issues: result.error.format(),
    });
    return;
  }

  if (key !== 'query') {
    (req as Record<Key, unknown>)[key] = result.data;
  }
  next();
};

export const validateBody = makeValidator('body');
export const validateParams = makeValidator('params');
export const validateQuery = makeValidator('query');
