import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  void _next;
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
