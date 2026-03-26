import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/error-handler';

export const alertsRouter = Router();

// Middleware for protecting alerts routes
alertsRouter.use(authenticate);

// GET /api/alerts
alertsRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const userId = req.query.userId as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.alert.count({ where }),
    ]);

    res.json({
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/alerts/:id/read
alertsRouter.put('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

// PUT /api/alerts/:id/resolve
alertsRouter.put('/:id/resolve', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolution: resolution || null,
        resolvedAt: new Date(),
        resolvedBy: req.userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/alerts/:id
alertsRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.alert.delete({
      where: { id },
    });

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/alerts/mark-all-read
alertsRouter.put('/mark-all-read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.query.userId as string;

    const where: any = {
      status: 'UNREAD',
    };
    if (userId) where.userId = userId;

    const result = await prisma.alert.updateMany({
      where,
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    res.json({
      message: 'All alerts marked as read',
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
});
