import type { AnyZodObject } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate = (schema: AnyZodObject) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('🔍 [validate] Validating request:', {
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params
  });
  
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    console.log('✅ [validate] Validation passed');
    next();
  } catch (err) {
    console.log('❌ [validate] Validation failed:', err);
    next(err);
  }
};
