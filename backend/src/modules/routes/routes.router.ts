import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/error-handler';

export const routesRouter = Router();

// Middleware for protecting routes
routesRouter.use(authenticate);

// GET /api/routes
routesRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const agentId = req.query.agentId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (agentId) where.agentId = agentId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where,
        skip,
        take: limit,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          points: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.route.count({ where }),
    ]);

    const routesWithCount = routes.map((route) => ({
      ...route,
      pointsCount: route.points.length,
      points: undefined,
    }));

    res.json({
      data: routesWithCount,
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

// GET /api/routes/:id
routesRouter.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        points: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                latitude: true,
                longitude: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!route) {
      throw new AppError('Route not found', 404);
    }

    res.json(route);
  } catch (error) {
    next(error);
  }
});

// POST /api/routes
routesRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { agentId, date, points } = req.body;

    if (!agentId || !date) {
      throw new AppError('Agent ID and date are required', 400);
    }

    const route = await prisma.route.create({
      data: {
        agentId,
        date: new Date(date),
        points: {
          create: Array.isArray(points)
            ? points.map((point: any, index: number) => ({
                customerId: point.customerId,
                order: point.order || index + 1,
                plannedArrival: point.plannedArrival ? new Date(point.plannedArrival) : null,
                notes: point.notes || null,
              }))
            : [],
        },
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true },
        },
        points: {
          include: {
            customer: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res.status(201).json(route);
  } catch (error) {
    next(error);
  }
});

// PUT /api/routes/:id
routesRouter.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { date, status } = req.body;

    const updateData: any = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (status !== undefined) updateData.status = status;

    const route = await prisma.route.update({
      where: { id },
      data: updateData,
      include: {
        agent: { select: { id: true, name: true, email: true } },
        points: { include: { customer: { select: { id: true, name: true } } } },
      },
    });

    res.json(route);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routes/:id
routesRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.route.delete({
      where: { id },
    });

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/routes/:id/points
routesRouter.put('/:id/points', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    if (!Array.isArray(points)) {
      throw new AppError('Points must be an array', 400);
    }

    // Update order for each point
    await Promise.all(
      points.map((point: any) =>
        prisma.routePoint.update({
          where: { id: point.id },
          data: { order: point.order },
        })
      )
    );

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        points: {
          include: {
            customer: { select: { id: true, name: true } },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(route);
  } catch (error) {
    next(error);
  }
});
