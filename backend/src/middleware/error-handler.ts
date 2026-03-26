import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma errors
  if ((err as any).code === 'P2002') {
    return res.status(409).json({ error: 'Record already exists' });
  }
  if ((err as any).code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  res.status(500).json({ error: 'Internal server error' });
}
