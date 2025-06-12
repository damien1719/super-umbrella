import { Request, Response, NextFunction } from 'express';

type AnySchema = { parse: (data: unknown) => unknown };

export const validate =
  (schema: AnySchema) =>
  (req: Request, res: Response, next: NextFunction) => {
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
